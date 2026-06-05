'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Preload, Stars } from '@react-three/drei';
import * as THREE from 'three';

import { FallingParticles } from './FallingParticles';
import { ThemeConfig, PageConfig } from '@/lib/types';
import { THEME_CONFIGS } from '@/lib/constants';

interface SceneCanvasProps {
  pageData: PageConfig;
}

function CustomEnvironment({ theme }: { theme: ThemeConfig }) {
  return (
    <>
      <color attach="background" args={['#000000']} />
      <fog attach="fog" args={['#000000', 10, 40]} />
      <ambientLight intensity={0.6} color={theme.lightColor} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color={theme.accent} />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color={theme.particleGlow} />
      <pointLight position={[0, 15, 0]} intensity={0.5} color="#ffffff" />
    </>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial color="#e84393" emissive="#e84393" emissiveIntensity={1} />
    </mesh>
  );
}

export function SceneCanvas({ pageData }: SceneCanvasProps) {
  const theme = THEME_CONFIGS[pageData.theme as keyof typeof THEME_CONFIGS] || THEME_CONFIGS['classic-romance'];

  return (
    <div className="w-full h-full absolute inset-0 bg-black touch-none">
      <Canvas
        camera={{ position: [0, 0, 25], fov: 65 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
        }}
      >
        <Suspense fallback={<LoadingFallback />}>
          <CustomEnvironment theme={theme} />
          <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
          
          <OrbitControls 
            autoRotate
            autoRotateSpeed={0.3}
            enablePan={false}
            enableZoom={true}
            maxDistance={100}
            minDistance={5}
          />
          
          <FallingParticles pageData={pageData} theme={theme} />
          
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
