import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Stars, MeshWobbleMaterial } from '@react-three/drei';
import * as THREE from 'three';

const PulseSphere = ({ intensity = 50 }) => {
  const mesh = useRef();
  
  // Map intensity (0-100) to various visual parameters
  const speed = 1 + (intensity / 50);
  const distortion = 0.2 + (intensity / 200);
  const color = intensity > 75 ? "#34d399" : (intensity > 50 ? "#6366f1" : "#f87171");
  const emissive = intensity > 75 ? "#059669" : (intensity > 50 ? "#4f46e5" : "#dc2626");

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (mesh.current) {
      mesh.current.rotation.x = t * (0.1 * speed);
      mesh.current.rotation.y = t * (0.2 * speed);
      // Pulse scale
      const s = 1 + Math.sin(t * (1.5 * speed)) * 0.05;
      mesh.current.scale.set(s, s, s);
    }
  });

  return (
    <Sphere ref={mesh} args={[1, 64, 64]}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={distortion}
        speed={speed}
        roughness={0.2}
        metalness={0.8}
        emissive={emissive}
        emissiveIntensity={0.8}
      />
    </Sphere>
  );
};

const DataLines = ({ intensity = 50 }) => {
  const count = Math.floor(10 + (intensity / 5));
  const lines = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      pos: [Math.random() * 4 - 2, Math.random() * 4 - 2, Math.random() * 4 - 2],
      scale: Math.random() * 0.5 + 0.1
    }));
  }, [count]);

  return lines.map((l, i) => (
    <Float key={i} speed={3} rotationIntensity={2} floatIntensity={2}>
      <mesh position={l.pos}>
        <boxGeometry args={[0.015, 0.015, l.scale]} />
        <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={2} />
      </mesh>
    </Float>
  ));
};

const DashboardCore = ({ intensity = 50 }) => {
  return (
    <div style={{ width: '100%', height: '400px', cursor: 'grab' }}>
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#6366f1" />
        <pointLight position={[-10, -10, -10]} intensity={1.5} color="#ec4899" />
        
        <Stars radius={100} depth={50} count={7000} factor={4} saturation={0} fade speed={2} />
        
        <PulseSphere intensity={intensity} />
        <DataLines intensity={intensity} />
        
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
          <planeGeometry args={[15, 15]} />
          <MeshDistortMaterial
            transparent
            opacity={0.15}
            color="#1e293b"
            distort={0.3}
            speed={1.5}
          />
        </mesh>
      </Canvas>
    </div>
  );
};

export default DashboardCore;
