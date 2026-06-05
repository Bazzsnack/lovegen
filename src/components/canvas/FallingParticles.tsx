'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Html } from '@react-three/drei';
import { PageConfig, ThemeConfig, ParticleState } from '@/lib/types';

interface FallingParticlesProps {
  pageData: PageConfig;
  theme: ThemeConfig;
}

// ------------------------------------------------------------------
// HEART SHAPE GEOMETRY
// ------------------------------------------------------------------
const createHeartGeometry = () => {
  const shape = new THREE.Shape();
  const x = 0, y = 0;
  // Heart math
  shape.moveTo(x + 5, y + 5);
  shape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
  shape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
  shape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
  shape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
  shape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
  shape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 1,
    bevelThickness: 1
  });
  
  // Center and normalize scale
  geometry.computeBoundingBox();
  const centerOffset = -0.5 * (geometry.boundingBox!.max.x - geometry.boundingBox!.min.x);
  geometry.translate(centerOffset, -10, 0); // rough centering
  geometry.scale(0.05, -0.05, 0.05); // flip Y and scale down
  
  return geometry;
};

const heartGeometry = createHeartGeometry();

// ------------------------------------------------------------------
// IMAGE PARTICLE WITH PROXY
// ------------------------------------------------------------------
function ImageParticle({ url, position, scale, opacity }: { 
  url: string; position: [number, number, number]; scale: number; opacity: number;
}) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    // Use proxy to avoid CORS issues
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    
    loader.load(
      proxyUrl,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      (err) => console.error("Error loading image through proxy:", err)
    );
  }, [url]);

  if (!texture) return null;

  return (
    <mesh position={position} scale={scale}>
      <planeGeometry args={[3, 3]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        opacity={opacity}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ------------------------------------------------------------------
// MAIN COMPONENT
// ------------------------------------------------------------------
export function FallingParticles({ pageData, theme }: FallingParticlesProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Ditambah menjadi 100 agar lebih ramai dengan love
  const totalItems = 100; 

  const particles = useMemo(() => {
    const items: ParticleState[] = [];
    
    const subtitle = pageData.subtitle || "I Love You";
    const images = pageData.image_urls && pageData.image_urls.length > 0 
      ? pageData.image_urls 
      : [];

    for (let i = 0; i < totalItems; i++) {
      let type: 'image' | 'text' | 'decoration' = 'text';
      let content = subtitle;

      const rand = Math.random();
      
      // Distribusi: 25% Teks, 45% Gambar, 30% Hati (diperbanyak)
      if (rand < 0.25) {
        type = 'text';
      } else if (rand < 0.70 && images.length > 0) {
        type = 'image';
        content = images[Math.floor(Math.random() * images.length)];
      } else {
        type = 'decoration'; 
      }

      // POSISI RAPI: Membagi ke dalam beberapa 'jalur' agar tidak menumpuk
      const isText = type === 'text';
      const isHeart = type === 'decoration';
      
      // Rotasi sangat minim, hampir lurus sempurna
      const rotX = isText ? 0 : 0;
      const rotY = isText ? 0 : 0;
      const rotZ = isText ? 0 : (Math.random() - 0.5) * 0.2; // Sedikit miring untuk foto

      items.push({
        id: `particle-${i}`,
        type,
        content,
        // Tersebar rapi secara horizontal dan kedalaman
        position: [
          (Math.random() - 0.5) * 50, // Lebar
          Math.random() * 80 - 40,    // Tinggi (Mulai dari atas)
          (Math.random() - 0.5) * 40 - 10 // Kedalaman (Z)
        ],
        // Teks dan Foto jatuh lurus merata, SEDANGKAN Hati melayang ke atas (flutter)
        velocity: [
          isHeart ? (Math.random() - 0.5) * 0.01 : 0, 
          isHeart ? (Math.random() * 0.02 + 0.01) : -0.04, // Hati naik, teks & foto turun lebih cepat (-0.04)
          0 
        ],
        rotation: [rotX, rotY, rotZ],
        // Putaran ditiadakan agar stabil dan rapi
        rotationSpeed: [0, 0, 0],
        scale: type === 'image' 
          ? (Math.random() * 1.5 + 0.8) // Foto
          : type === 'text' 
            ? (Math.random() * 0.3 + 0.3) // Teks
            : (Math.random() * 0.2 + 0.2), // Hati (Dikecilkan)
        opacity: type === 'image' ? 1.0 : Math.random() * 0.5 + 0.5, // Opacity foto selalu 100% (tidak pudar)
        lifetime: Math.random() * 100, 
        maxY: 40 
      });
    }
    return items;
  }, [pageData]);

  // Animasi berjatuhan SANGAT RAPI (Smooth Waterfall)
  useFrame((state) => {
    if (!groupRef.current) return;
    
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;

      // Pergerakan vertikal
      child.position.y += p.velocity[1]; 
      
      // Ayunan super halus hanya untuk bernapas sedikit, hati mengayun lebih kuat
      const swayFactor = p.type === 'decoration' ? 0.005 : 0.001;
      child.position.x += Math.sin(state.clock.elapsedTime * 0.2 + p.lifetime) * swayFactor;

      // Jika sudah sampai ujung, reset posisi
      if (p.type === 'decoration') {
        // Hati melayang ke atas, reset ke bawah jika melebihi atas
        if (child.position.y > 40) {
          child.position.y = -40;
          child.position.x = (Math.random() - 0.5) * 50; 
        }
      } else {
        // Teks dan foto jatuh ke bawah, reset ke atas jika melebihi bawah
        if (child.position.y < -40) {
          child.position.y = 40;
          child.position.x = (Math.random() - 0.5) * 50; 
        }
      }
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p) => {
        if (p.type === 'image') {
          return (
            <group key={p.id} position={new THREE.Vector3(...p.position)}>
              <ImageParticle 
                url={p.content} 
                position={[0, 0, 0]} 
                scale={p.scale} 
                opacity={p.opacity}
              />
            </group>
          );
        } else if (p.type === 'text') {
          return (
            <group key={p.id} position={new THREE.Vector3(...p.position)}>
              <Html 
                transform 
                distanceFactor={15}
                scale={p.scale * 2}
              >
                <div style={{
                  fontFamily: 'Nabana, cursive',
                  color: '#ffffff', // Warna font tetap putih
                  textShadow: `0 0 10px ${theme?.particleGlow || 'rgba(255,102,178,0.8)'}, 0 0 20px ${theme?.particleGlow || 'rgba(255,102,178,0.6)'}, 0 0 30px ${theme?.particleGlow || 'rgba(255,102,178,0.4)'}`,
                  whiteSpace: 'nowrap',
                  fontSize: '2.5rem', 
                  pointerEvents: 'none',
                  userSelect: 'none'
                }}>
                  {p.content}
                </div>
              </Html>
            </group>
          );
        } else {
          // Heart decoration berterbangan menggunakan SVG 2D
          return (
            <group key={p.id} position={new THREE.Vector3(...p.position)} rotation={new THREE.Euler(...p.rotation)}>
              <Html 
                transform 
                distanceFactor={15}
                scale={p.scale * 1.2}
              >
                <div style={{
                  pointerEvents: 'none',
                  userSelect: 'none',
                  opacity: p.opacity
                }}>
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill={theme?.accent || "#ff0000"} 
                    style={{ 
                      filter: `drop-shadow(0px 0px 12px ${theme?.particleGlow || 'rgba(255,102,178, 1)'})`, 
                    }}
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
              </Html>
            </group>
          );
        }
      })}
    </group>
  );
}
