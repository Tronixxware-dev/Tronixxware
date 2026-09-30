'use client';

import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { DoubleSide } from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, useTexture } from '@react-three/drei';

// Laid out on a deliberate 2-row x 5-column grid (world units) so no two
// cards' bounding boxes touch, even accounting for their float bob. Order
// matches HERO_IMAGES: phone, laptop, earbuds, watch, macbook, ps5, vr,
// speaker1, speaker2, speaker3. The SAME grid is used on desktop and mobile —
// only posScale/meshScale/camera differ per breakpoint — so the arrangement
// is identical, just scaled to fit the box.
const SLOTS = [
  { pos: [7.5, 1.7, -0.5], size: [1.7, 1.7], scaleMul: 1, float: { speed: 1.8, rotationIntensity: 0.5, floatIntensity: 0.8 }, amp: 0.5, speedMul: 0.4, offset: 0.25, sign: 1 },
  { pos: [-7.5, 1.7, -0.6], size: [2.3, 2.3], scaleMul: 0.65, float: { speed: 1.3, rotationIntensity: 0.35, floatIntensity: 0.6 }, amp: 0.35, speedMul: 0.3, offset: -0.35, sign: -1 },
  { pos: [0, -1.7, -0.2], size: [1.4, 1.4], scaleMul: 0.9, float: { speed: 2.1, rotationIntensity: 0.6, floatIntensity: 0.95 }, amp: 0.4, speedMul: 0.35, offset: 0.15, sign: 1 },
  { pos: [0, 1.7, -0.4], size: [1.5, 1.5], scaleMul: 0.85, float: { speed: 2.4, rotationIntensity: 0.7, floatIntensity: 1.05 }, amp: 0.5, speedMul: 0.6, offset: 1, sign: 1 },
  { pos: [-3.75, 1.7, -0.5], size: [1.7, 1.7], scaleMul: 0.9, float: { speed: 1.6, rotationIntensity: 0.4, floatIntensity: 0.65 }, amp: 0.4, speedMul: 0.32, offset: 0.6, sign: 1 },
  { pos: [3.75, 1.7, -0.6], size: [1.6, 1.6], scaleMul: 1.05, float: { speed: 1.9, rotationIntensity: 0.45, floatIntensity: 0.75 }, amp: 0.45, speedMul: 0.38, offset: 0.9, sign: -1 },
  { pos: [3.75, -1.7, -0.5], size: [1.4, 1.4], scaleMul: 0.75, float: { speed: 2.2, rotationIntensity: 0.55, floatIntensity: 0.9 }, amp: 0.4, speedMul: 0.42, offset: 1.2, sign: 1 },
  { pos: [7.5, -1.7, -0.7], size: [1.4, 1.4], scaleMul: 0.75, float: { speed: 1.7, rotationIntensity: 0.5, floatIntensity: 0.7 }, amp: 0.45, speedMul: 0.28, offset: 1.5, sign: -1 },
  { pos: [-3.75, -1.7, -0.5], size: [1.3, 1.3], scaleMul: 1.2, float: { speed: 2.0, rotationIntensity: 0.5, floatIntensity: 0.85 }, amp: 0.4, speedMul: 0.5, offset: 0.3, sign: 1 },
  { pos: [-7.5, -1.7, -0.8], size: [1.4, 1.4], scaleMul: 0.8, float: { speed: 1.5, rotationIntensity: 0.4, floatIntensity: 0.65 }, amp: 0.5, speedMul: 0.34, offset: 1.8, sign: 1 },
];

class CardBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('One hero image failed to render — skipping just that card.', error);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function FloatCard({ imageUrl, slot, posScaleX, posScaleY, meshScale }) {
  const ref = useRef(null);
  const texture = useTexture(imageUrl);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = Math.sin(t * slot.speedMul + slot.offset) * slot.amp * slot.sign;
  });

  const position = [slot.pos[0] * posScaleX, slot.pos[1] * posScaleY, slot.pos[2]];

  return (
    <Float speed={slot.float.speed} rotationIntensity={slot.float.rotationIntensity} floatIntensity={slot.float.floatIntensity}>
      <mesh ref={ref} position={position} scale={meshScale * slot.scaleMul}>
        <planeGeometry args={slot.size} />
        <meshBasicMaterial map={texture} side={DoubleSide} toneMapped={false} transparent alphaTest={0.1} />
      </mesh>
    </Float>
  );
}

function PointerRig() {
  useFrame((state) => {
    state.camera.position.x += (state.pointer.x * 0.5 - state.camera.position.x) * 0.05;
    state.camera.position.y += (state.pointer.y * 0.25 - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function HeroScene({ images }) {
  const [isSmall, setIsSmall] = useState(false);

  useEffect(() => {
    const check = () => setIsSmall(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Same SLOTS grid on every breakpoint — only spread and size shrink for
  // mobile's narrower box, plus the camera pulls back with a wider fov so
  // nothing at the grid's outer columns/rows clips against the box edges.
  // Mobile's width is the tight dimension (5 columns in a narrow box), but
  // its height has slack, so X and Y spread are scaled independently:
  // posScaleX stays tight (columns fit the width), posScaleY is opened up to
  // use the extra vertical room — that combination is what lets meshScale
  // (the actual image size) go up without anything touching.
  const posScaleX = isSmall ? 0.535 : 1;
  const posScaleY = isSmall ? 0.65 : 1;
  const meshScale = isSmall ? 1.1 : 1.9;
  const visibleImages = (images || []).filter(Boolean).slice(0, SLOTS.length);

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={isSmall ? [1, 1.2] : [1, 1.6]}
        camera={{ position: [0, 0, isSmall ? 5.5 : 6.0], fov: isSmall ? 58 : 56 }}
        gl={{ alpha: true, antialias: true }}
      >
        <PointerRig />
        <Suspense fallback={null}>
          {visibleImages.map((url, i) => (
            <CardBoundary key={`hero-card-${i}`}>
              <FloatCard imageUrl={url} slot={SLOTS[i]} posScaleX={posScaleX} posScaleY={posScaleY} meshScale={meshScale} />
            </CardBoundary>
          ))}
          <Sparkles count={isSmall ? 18 : 40} scale={6} size={2.2} speed={0.35} color="#67e8f9" />
        </Suspense>
      </Canvas>
    </div>
  );
}