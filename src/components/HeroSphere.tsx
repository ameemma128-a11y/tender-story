import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { MeshDistortMaterial, Sphere, Float, Environment } from "@react-three/drei";
import * as THREE from "three";

const DarkOrb = () => {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.15;
      ref.current.rotation.x += dt * 0.05;
    }
  });
  return (
    <Float speed={1.2} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={ref} args={[1.6, 128, 128]}>
        <MeshDistortMaterial
          color="#1a0405"
          roughness={0.15}
          metalness={0.85}
          distort={0.35}
          speed={1.4}
          emissive="#8B0000"
          emissiveIntensity={0.45}
        />
      </Sphere>
      {/* Inner glow shell */}
      <Sphere args={[1.85, 64, 64]}>
        <meshBasicMaterial color="#C41E3A" transparent opacity={0.06} />
      </Sphere>
    </Float>
  );
};

export const HeroSphere = () => {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.15} />
        <pointLight position={[5, 3, 5]} intensity={2.5} color="#C41E3A" />
        <pointLight position={[-5, -2, -3]} intensity={1.5} color="#8B0000" />
        <pointLight position={[0, 0, 6]} intensity={0.8} color="#C9A84C" />
        <DarkOrb />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
};
