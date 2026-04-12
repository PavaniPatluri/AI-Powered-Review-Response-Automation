import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Generate random points in a sphere
const generatePoints = (count, radius) => {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    
    // Spread them within the volume, slightly concentrated in the center
    const r = radius * Math.cbrt(Math.random());
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
};

const NeuralParticles = ({ count = 4000, radius = 10, color = "#6366f1" }) => {
  const pointsRef = useRef();
  
  // Memoize geometry generation
  const sphere = useMemo(() => generatePoints(count, radius), [count, radius]);

  useFrame((state, delta) => {
    // Slow drift rotation
    if (pointsRef.current) {
      pointsRef.current.rotation.x -= delta / 10;
      pointsRef.current.rotation.y -= delta / 15;
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={pointsRef} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color={color}
          size={0.05}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

const NeuralBackground = ({ score = 80 }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Map score to cinematic palette
  const aurora = score > 70 ? "#a78bfa" : score > 40 ? "#6366f1" : "#f59e0b";
  const glow = score > 70 ? "#22d3ee" : score > 40 ? "#818cf8" : "#f87171";

  const handleMouseMove = (e) => {
    setMousePos({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: -(e.clientY / window.innerHeight) * 2 + 1,
    });
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 0,
        pointerEvents: 'none',
        opacity: 0.6
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ pointerEvents: 'auto' }}
        onMouseMove={handleMouseMove}
      >
        <ambientLight intensity={0.5} />
        {/* Intelligence Reactive Particle Layers */}
        <NeuralParticles count={3000} radius={6} color={aurora} />
        <NeuralParticles count={1500} radius={8} color={glow} />
        <NeuralParticles count={1000} radius={12} color="#0b0b1a" />
        
        <CameraRig mouse={mousePos} />
      </Canvas>
    </div>
  );
};

// Helper component for mouse-responsive camera pan
const CameraRig = ({ mouse }) => {
  useFrame((state) => {
    state.camera.position.x += (mouse.x * 2 - state.camera.position.x) * 0.02;
    state.camera.position.y += (mouse.y * 2 - state.camera.position.y) * 0.02;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
};

export default NeuralBackground;
