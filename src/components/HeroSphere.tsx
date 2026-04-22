import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { Float, Environment, RoundedBox, Text3D, Center } from "@react-three/drei";
import * as THREE from "three";

// Floating glowing book — symbol of creativity & storytelling
const FloatingBook = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.25;
      ref.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.15;
    }
  });
  return (
    <group ref={ref}>
      {/* Book cover */}
      <RoundedBox args={[2.2, 2.8, 0.35]} radius={0.04} smoothness={4}>
        <meshStandardMaterial color="#1a1530" roughness={0.35} metalness={0.6} emissive="#7c3aed" emissiveIntensity={0.25} />
      </RoundedBox>
      {/* Spine glow strip */}
      <mesh position={[-1.1, 0, 0]}>
        <boxGeometry args={[0.05, 2.6, 0.4]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      {/* Front emblem */}
      <mesh position={[0, 0, 0.18]}>
        <ringGeometry args={[0.35, 0.42, 64]} />
        <meshBasicMaterial color="#a78bfa" />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <circleGeometry args={[0.12, 32]} />
        <meshBasicMaterial color="#c4b5fd" />
      </mesh>
    </group>
  );
};

// Orbiting geometric shapes
const OrbitingShapes = () => {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y -= dt * 0.15;
  });
  return (
    <group ref={ref}>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={0.5}>
        <mesh position={[2.6, 0.8, 0]}>
          <icosahedronGeometry args={[0.28, 0]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.6} roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={1.2} floatIntensity={0.7}>
        <mesh position={[-2.8, -0.4, 0.5]}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.4} roughness={0.4} />
        </mesh>
      </Float>
      <Float speed={1.8} rotationIntensity={0.8} floatIntensity={0.6}>
        <mesh position={[2.2, -1.2, -0.8]}>
          <tetrahedronGeometry args={[0.26, 0]} />
          <meshStandardMaterial color="#a78bfa" emissive="#a78bfa" emissiveIntensity={0.5} roughness={0.3} />
        </mesh>
      </Float>
      <Float speed={1} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh position={[-2.4, 1.4, -0.3]}>
          <torusGeometry args={[0.25, 0.08, 16, 32]} />
          <meshStandardMaterial color="#c4b5fd" emissive="#7c3aed" emissiveIntensity={0.4} roughness={0.4} />
        </mesh>
      </Float>
    </group>
  );
};

export const HeroSphere = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 4, 5]} intensity={2.5} color="#a78bfa" />
        <pointLight position={[-5, -3, -3]} intensity={1.5} color="#7c3aed" />
        <pointLight position={[0, 0, 6]} intensity={1.2} color="#f59e0b" />
        <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
          <FloatingBook />
        </Float>
        <OrbitingShapes />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
};
