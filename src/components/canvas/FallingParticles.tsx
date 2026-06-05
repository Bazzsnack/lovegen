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

  // Kurangi jadi 60 agar text dan foto tidak terlalu penuh
  const totalItems = 60; 

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
      
      // Distribusi: 20% Teks, 15% Gambar, 65% Hati
      if (rand < 0.20) {
        type = 'text';
      } else if (rand < 0.35 && images.length > 0) {
        type = 'image';
        content = images[Math.floor(Math.random() * images.length)];
      } else {
        type = 'decoration'; 
      }

      const isText = type === 'text';
      const isHeart = type === 'decoration';
      
      const rotX = isHeart ? Math.random() * Math.PI : 0;
      const rotY = isHeart ? Math.random() * Math.PI : 0;
      const rotZ = isText ? 0 : (Math.random() - 0.5) * 0.4;

      items.push({
        id: `particle-${i}`,
        type,
        content,
        position: [
          (Math.random() - 0.5) * 60, // Lebar
          Math.random() * 80 - 40,    // Tinggi
          (Math.random() - 0.5) * 50 - 10 // Kedalaman (Z)
        ],
        velocity: [
          isHeart ? (Math.random() - 0.5) * 0.02 : 0, 
          isHeart ? (Math.random() * 0.04 + 0.03) : -(Math.random() * 0.06 + 0.08), // Dipercepat!
          0 
        ],
        rotation: [rotX, rotY, rotZ],
        rotationSpeed: [
          isHeart ? (Math.random() - 0.5) * 0.02 : 0, 
          isHeart ? (Math.random() - 0.5) * 0.02 : 0, 
          0
        ],
        scale: type === 'image' 
          ? (Math.random() * 2.0 + 1.2) // Foto diperbesar
          : type === 'text' 
            ? (Math.random() * 1.5 + 1.0) // Teks
            : (Math.random() * 0.5 + 0.3), // Hati
        opacity: type === 'image' ? 1.0 : Math.random() * 0.5 + 0.5,
        lifetime: Math.random() * 100, 
        maxY: 40 
      });
    }
    return items;
  }, [pageData]);

  // Animasi
  useFrame((state) => {
    if (!groupRef.current) return;
    
    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;

      child.position.y += p.velocity[1]; 
      
      const swayFactor = p.type === 'decoration' ? 0.01 : 0.002;
      child.position.x += Math.sin(state.clock.elapsedTime * 0.5 + p.lifetime) * swayFactor;
      
      if (p.type === 'decoration') {
        child.rotation.x += p.rotationSpeed[0];
        child.rotation.y += p.rotationSpeed[1];
        
        if (child.position.y > 40) {
          child.position.y = -40;
          child.position.x = (Math.random() - 0.5) * 60; 
        }
      } else {
        if (child.position.y < -40) {
          child.position.y = 40;
          child.position.x = (Math.random() - 0.5) * 60; 
        }
      }

      // Efek Fade In / Fade Out di ujung layar (Y > 30 atau Y < -30)
      const edgeDist = Math.abs(child.position.y);
      let currentOpacity = p.opacity;
      if (edgeDist > 30) {
        currentOpacity = p.opacity * Math.max(0, 1 - (edgeDist - 30) / 10);
      }
      
      child.traverse((obj: any) => {
        if (obj.material) {
          // Khusus untuk Text dari Drei, ada fillOpacity dan outlineOpacity
          if (obj.material.uniforms && obj.material.uniforms.uFillOpacity !== undefined) {
             obj.material.fillOpacity = currentOpacity;
             obj.material.outlineOpacity = currentOpacity;
          } else {
             obj.material.opacity = currentOpacity;
          }
          obj.material.transparent = true;
        }
      });
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p) => {
        if (p.type === 'image') {
          return (
            <group key={p.id} position={new THREE.Vector3(...p.position)} rotation={new THREE.Euler(...p.rotation)}>
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
              <Text 
                fontSize={p.scale}
                color="#ffffff"
                outlineWidth={0.05 * p.scale}
                outlineBlur={0.2 * p.scale}
                outlineColor={theme?.particleGlow || '#ff66b2'}
                font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
                anchorX="center"
                anchorY="middle"
                material-toneMapped={false}
              >
                {p.content}
              </Text>
            </group>
          );
        } else {
          return (
            <group key={p.id} position={new THREE.Vector3(...p.position)} rotation={new THREE.Euler(...p.rotation)}>
              <mesh geometry={heartGeometry} scale={p.scale}>
                <meshStandardMaterial 
                  color={theme?.accent || "#ff0000"} 
                  emissive={theme?.particleGlow || '#ff66b2'}
                  emissiveIntensity={0.8}
                  transparent 
                  opacity={p.opacity} 
                />
              </mesh>
            </group>
          );
        }
      })}
    </group>
  );
}
