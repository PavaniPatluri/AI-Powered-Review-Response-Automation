import os
import secrets
import jwt
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json,
)
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    UserVerificationRequirement,
    AuthenticatorAttachment,
    COSEAlgorithmIdentifier,
)
from webauthn.helpers import bytes_to_base64url, base64url_to_bytes

# Temporary in-memory session store for challenges (In production, use Redis or DB)
AUTH_SESSIONS = {}

JWT_SECRET = os.getenv("JWT_SECRET", "neural-nexus-top-secret-key-2026")
RP_ID = os.getenv("RP_ID", "localhost")
RP_NAME = "Review Catalyst Nexus"

class AuthService:
    def __init__(self, db_bridge):
        self.db = db_bridge

    def create_session(self, email: str, challenge: bytes) -> str:
        session_id = secrets.token_urlsafe(32)
        AUTH_SESSIONS[session_id] = {
            "email": email,
            "challenge": bytes_to_base64url(challenge),
            "expires": datetime.now() + timedelta(minutes=5)
        }
        return session_id

    def get_session(self, session_id: str) -> Optional[Dict]:
        session = AUTH_SESSIONS.get(session_id)
        if not session:
            return None
        if datetime.now() > session["expires"]:
            del AUTH_SESSIONS[session_id]
            return None
        return session

    async def get_registration_options(self, email: str):
        # Check if user exists, if not create a temporary entry or use defaults
        user = await self.db.get_by_id("users", email) # Simplified lookup by email for now
        if not user:
            # Fallback for the demo: let them register anyway or use admin
            user_id = secrets.token_bytes(16)
            username = email
        else:
            user_id = base64url_to_bytes(user["id"])
            username = user["email"]

        options = generate_registration_options(
            rp_id=RP_ID,
            rp_name=RP_NAME,
            user_id=user_id,
            user_name=username,
            attestation="none",
            authenticator_selection=AuthenticatorSelectionCriteria(
                user_verification=UserVerificationRequirement.PREFERRED,
            ),
            supported_pub_key_algs=[COSEAlgorithmIdentifier.ECDSA_SHA_256],
        )
        
        session_id = self.create_session(email, options.challenge)
        return options_to_json(options), session_id

    async def verify_registration(self, emailAddress: str, response: Dict, session_id: str):
        session = self.get_session(session_id)
        if not session or session["email"] != emailAddress:
            raise Exception("Invalid or expired session")

        verification = verify_registration_response(
            credential=response,
            expected_challenge=base64url_to_bytes(session["challenge"]),
            expected_origin=f"http://{RP_ID}:5173", # Update with your frontend URL
            expected_rp_id=RP_ID,
        )

        # Store the credential in DB
        # Note: In a real app, you'd match the user properly
        user = await self.db._request("GET", "users", f"?email=eq.{emailAddress}&select=*")
        if not user:
            # Create user if doesn't exist (for demo/first time)
            user_data = [{"email": emailAddress, "display_name": emailAddress.split('@')[0]}]
            res = await self.db.upsert("users", user_data)
            user = res[0]
        else:
            user = user[0]

        credential_data = [{
            "id": verification.credential_id,
            "user_id": user["id"],
            "public_key": bytes_to_base64url(verification.credential_public_key),
            "sign_count": verification.sign_count,
            "transports": response.get("response", {}).get("transports", [])
        }]
        await self.db.upsert("webauthn_credentials", credential_data)
        
        del AUTH_SESSIONS[session_id]
        return True

    async def get_login_options(self, email: str):
        user = await self.db._request("GET", "users", f"?email=eq.{email}&select=*")
        if not user:
            raise Exception("User not found")
        
        user = user[0]
        # Get allowed credentials
        creds = await self.db._request("GET", "webauthn_credentials", f"?user_id=eq.{user['id']}&select=*")
        if not creds:
             raise Exception("No biometric credentials found for this user")

        allowed_credentials = [
            {"id": c["id"], "type": "public-key"} for c in creds
        ]

        options = generate_authentication_options(
            rp_id=RP_ID,
            allow_credentials=allowed_credentials,
            user_verification=UserVerificationRequirement.PREFERRED,
        )

        session_id = self.create_session(email, options.challenge)
        return options_to_json(options), session_id

    async def verify_login(self, email: str, response: Dict, session_id: str):
        session = self.get_session(session_id)
        if not session or session["email"] != email:
            raise Exception("Invalid or expired session")

        # Get the stored credential
        cred_id = response["id"]
        cred = await self.db.get_by_id("webauthn_credentials", cred_id)
        if not cred:
            raise Exception("Credential not found")

        verification = verify_authentication_response(
            credential=response,
            expected_challenge=base64url_to_bytes(session["challenge"]),
            expected_origin=f"http://{RP_ID}:5173", # Update with your frontend URL
            expected_rp_id=RP_ID,
            credential_public_key=base64url_to_bytes(cred["public_key"]),
            credential_current_sign_count=cred["sign_count"],
        )

        # Update sign count
        await self.db.update("webauthn_credentials", cred_id, {"sign_count": verification.new_sign_count})
        
        # Generate JWT
        token = jwt.encode({
            "sub": email,
            "exp": datetime.utcnow() + timedelta(days=7),
            "iat": datetime.utcnow()
        }, JWT_SECRET, algorithm="HS256")

        del AUTH_SESSIONS[session_id]
        
        # Fetch user details
        user = await self.db._request("GET", "users", f"?email=eq.{email}&select=*")
        
        return token, user[0] if user else None

auth_service = None # Initialized in main.py
