import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import { Float, Environment } from "@react-three/drei";
import * as THREE from "three";

// Two silhouetted figures drifting in warm amber haze — evoking lovers lost in a story.
const Silhouette = ({ x, scale = 1, delay = 0 }: { x: number; scale?: number; delay?: number }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime + delay;
      ref.current.position.y = Math.sin(t * 0.35) * 0.15;
      ref.current.rotation.y = Math.sin(t * 0.2) * 0.08;
    }
  });
  return (
    <group ref={ref} position={[x, -0.4, 0]} scale={scale}>
      {/* Head */}
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#1a0f0a" roughness={1} metalness={0} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.55, 0]}>
        <capsuleGeometry args={[0.45, 1.1, 8, 16]} />
        <meshStandardMaterial color="#15090a" roughness={1} metalness={0} />
      </mesh>
      {/* Subtle amber rim light from behind */}
      <pointLight position={[0, 1, -1.5]} intensity={1.2} color="#C9A84C" distance={4} />
    </group>
  );
};

// Slow-drifting amber bloom particles
const EmberDust = () => {
  const ref = useRef<THREE.Points>(null);
  const count = 80;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
  }
  useFrame((_, dt) => {
    if (ref.current) {
      ref.current.rotation.y += dt * 0.02;
      ref.current.position.y += dt * 0.05;
      if (ref.current.position.y > 1.5) ref.current.position.y = -1.5;
    }
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#C9A84C" size={0.06} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
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
        {/* Warm candlelight from behind silhouettes */}
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0.5, -3]} intensity={5} color="#C17B2F" distance={10} />
        <pointLight position={[2, 2, 2]} intensity={1.2} color="#C9A84C" />
        <pointLight position={[-2, -1, 3]} intensity={0.6} color="#6B1E2E" />

        <Float speed={0.6} rotationIntensity={0.1} floatIntensity={0.3}>
          <Silhouette x={-0.95} scale={1} delay={0} />
        </Float>
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.4}>
          <Silhouette x={0.95} scale={1.05} delay={1.4} />
        </Float>

        <EmberDust />
        <Environment preset="sunset" />
      </Suspense>
    </Canvas>
  );
};
