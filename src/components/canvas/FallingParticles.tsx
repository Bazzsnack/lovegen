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
// HEART SHAPE GEOMETRY (Flat 2D for confetti look)
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

  const geometry = new THREE.ShapeGeometry(shape);
  
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

  // Kepadatan menengah agar terlihat penuh tapi tidak nutupin layar
  const totalItems = 120; 

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
      
      // Distribusi: 45% Teks (agar jadi lautan kata), 15% Gambar, 40% Hati
      if (rand < 0.45) {
        type = 'text';
      } else if (rand < 0.60 && images.length > 0) {
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
          (Math.random() - 0.5) * 100, // Lebar dibuat sangat luas
          Math.random() * 100 - 50,    // Tinggi
          (Math.random() - 0.5) * 60 - 15 // Kedalaman ekstrem (Z)
        ],
        velocity: [
          isHeart ? (Math.random() - 0.5) * 0.02 : 0, 
          isHeart ? (Math.random() * 0.04 + 0.03) : -(Math.random() * 0.05 + 0.07),
          0 
        ],
        rotation: [rotX, rotY, rotZ],
        rotationSpeed: [
          isHeart ? (Math.random() - 0.5) * 0.03 : 0, 
          isHeart ? (Math.random() - 0.5) * 0.03 : 0, 
          isHeart ? (Math.random() - 0.5) * 0.02 : 0
        ],
        scale: type === 'image' 
          ? (Math.random() * 2.5 + 1.0) // Foto standar ke besar
          : type === 'text' 
            ? (Math.pow(Math.random(), 2) * 4.0 + 0.6) // Teks: Mayoritas kecil, tapi ada beberapa RAKSASA (depth of field)
            : (Math.random() * 1.5 + 0.5), // Hati lebih besar seperti kelopak/confetti
        opacity: type === 'image' ? 1.0 : (type === 'text' ? Math.random() * 0.5 + 0.5 : Math.random() * 0.7 + 0.3),
        lifetime: Math.random() * 100, 
        maxY: 50 
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
      
      const swayFactor = p.type === 'decoration' ? 0.015 : 0.003;
      child.position.x += Math.sin(state.clock.elapsedTime * 0.5 + p.lifetime) * swayFactor;
      
      if (p.type === 'decoration') {
        child.rotation.x += p.rotationSpeed[0];
        child.rotation.y += p.rotationSpeed[1];
        child.rotation.z += p.rotationSpeed[2];
        
        if (child.position.y > 50) {
          child.position.y = -50;
          child.position.x = (Math.random() - 0.5) * 100; 
        }
      } else {
        if (child.position.y < -50) {
          child.position.y = 50;
          child.position.x = (Math.random() - 0.5) * 100; 
        }
      }

      // Efek Fade In / Fade Out di ujung layar (Y > 40 atau Y < -40)
      const edgeDist = Math.abs(child.position.y);
      let currentOpacity = p.opacity;
      if (edgeDist > 40) {
        currentOpacity = p.opacity * Math.max(0, 1 - (edgeDist - 40) / 10);
      }
      
      child.traverse((obj: any) => {
        if (obj.material) {
          // Khusus untuk Text dari Drei, materialnya custom
          if (obj.textRenderInfo) { 
             // Troika text mesh
             obj.fillOpacity = currentOpacity;
             obj.outlineOpacity = currentOpacity * 0.9;
          } else if (obj.material.uniforms && obj.material.uniforms.uFillOpacity) {
             obj.material.uniforms.uFillOpacity.value = currentOpacity;
             if (obj.material.uniforms.uOutlineOpacity) {
                obj.material.uniforms.uOutlineOpacity.value = currentOpacity * 0.9;
             }
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
                outlineWidth={0.02 * p.scale} // Tipiskan outline dasar agar tidak kaku
                outlineBlur={0.6 * p.scale}   // Pertahankan blur agar soft dan lembut
                outlineColor={theme?.particleGlow || '#ff66b2'}
                outlineOpacity={0.9}
                font="/font/sweet_apricot.ttf"
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
              {/* Efek Glow Putih untuk Hati */}
              <mesh position={[0, 0, -0.1]}>
                <circleGeometry args={[0.8 * p.scale, 16]} />
                <meshBasicMaterial 
                  color="#ffffff" 
                  transparent 
                  opacity={p.opacity * 0.4} 
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              
              <mesh geometry={heartGeometry} scale={p.scale}>
                <meshStandardMaterial 
                  color={theme?.accent || "#ff0000"} 
                  emissive={theme?.accent || '#ff0000'}
                  emissiveIntensity={0.6}
                  transparent 
                  opacity={p.opacity} 
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          );
        }
      })}
    </group>
  );
}
