"use client"

import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, MeshDistortMaterial, Sphere, Text } from "@react-three/drei"
import { useRef, Suspense } from "react"
import type { Mesh, Group } from "three"

function Microphone() {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.15
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} position={[0, 0, 0]} scale={1.2}>
        {/* Microphone Head */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        
        {/* Microphone Grill Pattern */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.82, 16, 16]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.8}
            roughness={0.3}
            wireframe
          />
        </mesh>

        {/* Microphone Body */}
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.25, 0.3, 1.8, 32]} />
          <meshStandardMaterial
            color="#1e293b"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Red Accent Ring */}
        <mesh position={[0, 0.9, 0]}>
          <torusGeometry args={[0.35, 0.05, 16, 32]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Base */}
        <mesh position={[0, -0.7, 0]}>
          <cylinderGeometry args={[0.5, 0.6, 0.3, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      </group>
    </Float>
  )
}

function SoundWaves() {
  const wavesRef = useRef<Group>(null)

  useFrame((state) => {
    if (wavesRef.current) {
      wavesRef.current.children.forEach((child, i) => {
        const mesh = child as Mesh
        mesh.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2 + i * 0.5) * 0.1)
      })
    }
  })

  return (
    <group ref={wavesRef} position={[2.5, 1.5, -1]}>
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[i * 0.4, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.3 + i * 0.2, 0.02, 16, 32, Math.PI]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.3 - i * 0.05}
            transparent
            opacity={0.8 - i * 0.15}
          />
        </mesh>
      ))}
    </group>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<Group>(null)

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <group ref={particlesRef}>
      {[...Array(30)].map((_, i) => {
        const theta = (i / 30) * Math.PI * 2
        const radius = 3 + Math.random() * 2
        const y = (Math.random() - 0.5) * 4
        return (
          <Float key={i} speed={1 + Math.random()} floatIntensity={0.5}>
            <mesh position={[Math.cos(theta) * radius, y, Math.sin(theta) * radius]}>
              <sphereGeometry args={[0.02 + Math.random() * 0.03, 8, 8]} />
              <meshStandardMaterial
                color={i % 3 === 0 ? "#ef4444" : "#64748b"}
                emissive={i % 3 === 0 ? "#ef4444" : "#475569"}
                emissiveIntensity={0.3}
              />
            </mesh>
          </Float>
        )
      })}
    </group>
  )
}

function GlowingSphere() {
  return (
    <Sphere args={[1.5, 64, 64]} position={[-3, 0, -2]}>
      <MeshDistortMaterial
        color="#1e3a5f"
        emissive="#ef4444"
        emissiveIntensity={0.1}
        roughness={0.4}
        metalness={0.8}
        distort={0.3}
        speed={2}
      />
    </Sphere>
  )
}

function BroadcastText() {
  return (
    <Float speed={1.5} floatIntensity={0.3}>
      <Text
        font="/fonts/Geist_Bold.json"
        position={[-2.5, -1.8, 0]}
        fontSize={0.3}
        color="#ef4444"
        anchorX="left"
        anchorY="middle"
      >
        ON AIR
      </Text>
    </Float>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ef4444" />
      <pointLight position={[5, -5, -5]} intensity={0.3} color="#f97316" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.8}
        color="#ffffff"
        castShadow
      />

      <Microphone />
      <SoundWaves />
      <FloatingParticles />
      <GlowingSphere />
      <BroadcastText />

      <Environment preset="night" />
    </>
  )
}

export default function BroadcastScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
