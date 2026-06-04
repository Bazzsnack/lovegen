'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Image as DreiImage, useTexture } from '@react-three/drei';
import { PageConfig, ThemeConfig, ParticleState } from '@/lib/types';

interface FallingParticlesProps {
  pageData: PageConfig;
  theme: ThemeConfig;
}

export function FallingParticles({ pageData, theme }: FallingParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  // Configuration based on speed and density
  const speedFactor = pageData.particle_speed === 'slow' ? 0.5 : pageData.particle_speed === 'fast' ? 2 : 1;
  const countFactor = pageData.particle_density === 'sparse' ? 0.5 : pageData.particle_density === 'dense' ? 2 : 1;

  // Generate initial state for particles
  const particles = useMemo(() => {
    const items: ParticleState[] = [];
    const totalItems = Math.floor(40 * countFactor);
    
    // Mix images, texts, and decorations
    for (let i = 0; i < totalItems; i++) {
      let type: 'image' | 'text' | 'decoration' = 'decoration';
      let content = '';

      // 20% images, 20% text, 60% decoration
      const rand = Math.random();
      if (rand < 0.2 && pageData.image_urls.length > 0) {
        type = 'image';
        content = pageData.image_urls[Math.floor(Math.random() * pageData.image_urls.length)];
      } else if (rand < 0.4 && pageData.phrases.length > 0) {
        type = 'text';
        content = pageData.phrases[Math.floor(Math.random() * pageData.phrases.length)];
      }

      items.push({
        id: `particle-${i}`,
        type,
        content,
        position: [
          (Math.random() - 0.5) * 20, // X
          Math.random() * 30 - 15,    // Y (start randomly spread out)
          (Math.random() - 0.5) * 20  // Z
        ],
        velocity: [
          (Math.random() - 0.5) * 0.02 * speedFactor,
          -(Math.random() * 0.05 + 0.02) * speedFactor, // Fall downwards
          (Math.random() - 0.5) * 0.02 * speedFactor
        ],
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
        rotationSpeed: [
          (Math.random() - 0.5) * 0.02 * speedFactor,
          (Math.random() - 0.5) * 0.02 * speedFactor,
          (Math.random() - 0.5) * 0.02 * speedFactor
        ],
        scale: type === 'image' ? (Math.random() * 1.5 + 1) : type === 'text' ? (Math.random() * 0.5 + 0.8) : (Math.random() * 0.3 + 0.1),
        opacity: Math.random() * 0.5 + 0.5,
        lifetime: 0,
        maxY: 20 // Reset point
      });
    }
    return items;
  }, [pageData, speedFactor, countFactor]);

  // Animate all particles
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // We update children properties directly for performance instead of React state
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;

      // Update position
      child.position.x += p.velocity[0];
      child.position.y += p.velocity[1];
      child.position.z += p.velocity[2];

      // Update rotation
      child.rotation.x += p.rotationSpeed[0];
      child.rotation.y += p.rotationSpeed[1];
      child.rotation.z += p.rotationSpeed[2];

      // Float back up if they fall too low
      if (child.position.y < -15) {
        child.position.y = p.maxY;
        child.position.x = (Math.random() - 0.5) * 20;
        child.position.z = (Math.random() - 0.5) * 20;
      }
      
      // Floating sine wave effect
      child.position.x += Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.01 * speedFactor;
    });
  });

  // Fonts mapping
  const fontUrl = pageData.font_pairing === 'dancing-inter' 
    ? 'https://fonts.gstatic.com/s/dancingscript/v24/IfsqHeXqQ-fM8Qd2L80TbwKx3DStC3t5wA.woff' // Approximate
    : 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKdFvXDXbtM.woff';

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => {
        if (p.type === 'image') {
          return (
            <mesh key={p.id} position={new THREE.Vector3(...p.position)} scale={p.scale}>
              <DreiImage url={p.content} transparent opacity={p.opacity} />
            </mesh>
          );
        } else if (p.type === 'text') {
          return (
            <Text 
              key={p.id} 
              position={new THREE.Vector3(...p.position)} 
              scale={p.scale}
              color={theme.accent}
              font={fontUrl}
              maxWidth={5}
              textAlign="center"
              fillOpacity={p.opacity}
              outlineWidth={0.02}
              outlineColor={theme.background[0]}
            >
              {p.content}
            </Text>
          );
        } else {
          // Decoration (small glowing sphere)
          return (
            <mesh key={p.id} position={new THREE.Vector3(...p.position)} scale={p.scale}>
              <sphereGeometry args={[0.5, 16, 16]} />
              <meshStandardMaterial 
                color={theme.particleGlow} 
                emissive={theme.particleGlow} 
                emissiveIntensity={2} 
                transparent 
                opacity={p.opacity * 0.8} 
              />
            </mesh>
          );
        }
      })}
    </group>
  );
}
