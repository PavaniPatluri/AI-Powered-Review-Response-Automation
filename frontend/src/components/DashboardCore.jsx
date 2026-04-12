import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

const GlowingPearl = ({ intensity = 50 }) => {
  const mesh = useRef();
  const aura = useRef();
  
  // Map intensity (0-100) to visual parameters
  const speed = 0.4 + (intensity / 200);
  const color = "#a78bfa"; // Lavender
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.1;
      // Very subtle float
      mesh.current.position.y = Math.sin(t * 0.5) * 0.1;
    }
    if (aura.current) {
      // Pulse animation for the aura
      const s = 1.3 + Math.sin(t * speed) * 0.15;
      aura.current.scale.set(s, s, s);
      aura.current.rotation.z = -t * 0.05;
    }
  });

  return (
    <group>
      {/* The Core Pearl */}
      <Sphere ref={mesh} args={[1, 64, 64]}>
        <meshPhysicalMaterial
          color={color}
          transmission={0.8}
          thickness={0.5}
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={1.5}
          emissive={color}
          emissiveIntensity={0.4}
        />
      </Sphere>
      
      {/* The Volumetric Aura */}
      <Sphere ref={aura} args={[1, 32, 32]}>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </Sphere>
    </group>
  );
};

const DriftingOrbs = ({ intensity = 50 }) => {
  const count = 15;
  const orbs = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      pos: [Math.random() * 8 - 4, Math.random() * 8 - 4, Math.random() * 8 - 4],
      speed: Math.random() * 0.5 + 0.2,
      size: Math.random() * 0.08 + 0.02
    }));
  }, [count]);

  return orbs.map((o, i) => (
    <Float key={i} speed={o.speed * 2} rotationIntensity={1} floatIntensity={2}>
      <mesh position={o.pos}>
        <sphereGeometry args={[o.size, 16, 16]} />
        <meshStandardMaterial 
          color="#c4b5fd" 
          emissive="#c4b5fd" 
          emissiveIntensity={1.5} 
          transparent 
          opacity={0.6}
        />
      </mesh>
    </Float>
  ));
};

const DashboardCore = ({ intensity = 50 }) => {
  return (
    <div style={{ width: '100%', height: '420px', cursor: 'grab', filter: 'drop-shadow(0 0 40px rgba(167, 139, 250, 0.2))' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#a78bfa" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#818cf8" />
        
        <Stars radius={120} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
        
        <GlowingPearl intensity={intensity} />
        <DriftingOrbs intensity={intensity} />
        
        {/* Soft Ground Reflection */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.5, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial
            transparent
            opacity={0.05}
            color="#a78bfa"
          />
        </mesh>
      </Canvas>
    </div>
  );
};

export default DashboardCore;
