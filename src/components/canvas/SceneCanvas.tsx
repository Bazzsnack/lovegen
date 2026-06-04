'use client';

import React, { Suspense, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Preload, Environment as DreiEnvironment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

import { FallingParticles } from './FallingParticles';
import { ThemeConfig, PageConfig } from '@/lib/types';
import { THEME_CONFIGS } from '@/lib/constants';

interface SceneCanvasProps {
  pageData: PageConfig;
}

function SceneEffects({ theme }: { theme: ThemeConfig }) {
  return (
    <EffectComposer disableNormalPass>
      <Bloom 
        luminanceThreshold={0.2} 
        luminanceSmoothing={0.9} 
        intensity={1.5} 
        mipmapBlur 
      />
      <Vignette eskil={false} offset={0.1} darkness={1.1} />
      <Noise opacity={0.03} />
    </EffectComposer>
  );
}

function CustomEnvironment({ theme }: { theme: ThemeConfig }) {
  return (
    <>
      <color attach="background" args={[theme.background[0]]} />
      <fog attach="fog" args={[theme.background[0], 10, 40]} />
      <ambientLight intensity={0.5} color={theme.lightColor} />
      <pointLight position={[10, 10, 10]} intensity={1} color={theme.accent} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={theme.particleGlow} />
    </>
  );
}

// Custom camera controller to slowly rotate by default
function CameraController() {
  const controlsRef = useRef<any>(null);
  
  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = true;
      controlsRef.current.autoRotateSpeed = 0.5;
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      maxDistance={30}
      minDistance={5}
      maxPolarAngle={Math.PI / 1.5} // Don't let them look from perfectly underneath
    />
  );
}

export function SceneCanvas({ pageData }: SceneCanvasProps) {
  const theme = THEME_CONFIGS[pageData.theme as keyof typeof THEME_CONFIGS] || THEME_CONFIGS['rose-petal'];

  return (
    <div className="w-full h-full absolute inset-0 bg-black touch-none">
      <Canvas
        camera={{ position: [0, 0, 15], fov: 45 }}
        gl={{ 
          antialias: false, // Turn off for performance, we use postprocessing
          alpha: false,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping
        }}
        dpr={[1, 2]} // Limit pixel ratio for performance
      >
        <Suspense fallback={null}>
          <CustomEnvironment theme={theme} />
          <CameraController />
          
          <FallingParticles pageData={pageData} theme={theme} />

          <SceneEffects theme={theme} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
