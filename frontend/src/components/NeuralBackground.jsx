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

const NeuralBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    // Subtle mouse tracking for the entire canvas
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
        zIndex: 0, /* ensure it acts as a background */
        pointerEvents: 'none', /* Let clicks pass through to UI */
        opacity: 0.6 /* Subtle cinema feel */
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ pointerEvents: 'auto' }} // Re-enable pointer events for Canvas if we need raycasting later
        onMouseMove={handleMouseMove}
      >
        <ambientLight intensity={0.5} />
        {/* Abstract Particle Layers */}
        <NeuralParticles count={3000} radius={6} color="#6366f1" />
        <NeuralParticles count={1500} radius={8} color="#8b5cf6" />
        <NeuralParticles count={1000} radius={12} color="#06b6d4" />
        
        {/* Subtle camera movement tied to mouse */}
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
