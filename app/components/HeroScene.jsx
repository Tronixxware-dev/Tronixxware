'use client';

import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { DoubleSide } from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, useTexture } from '@react-three/drei';

// Laid out on a deliberate 2-row x 5-column grid (world units) so no two
// cards' bounding boxes touch, even accounting for their float bob. Order
// matches HERO_IMAGES: phone, laptop, earbuds, watch, macbook, ps5, vr,
// speaker1, speaker2, speaker3. This is the DESKTOP grid (all 10 items).
const SLOTS = [
  { pos: [7.5, 1.7, -0.5], size: [1.7, 1.7], scaleMul: 1, float: { speed: 1.8, rotationIntensity: 0.5, floatIntensity: 0.8 }, amp: 0.5, speedMul: 0.4, offset: 0.25, sign: 1 },
  { pos: [-7.5, 1.7, -0.6], size: [2.3, 2.3], scaleMul: 0.82, float: { speed: 1.3, rotationIntensity: 0.35, floatIntensity: 0.6 }, amp: 0.35, speedMul: 0.3, offset: -0.35, sign: -1 },
  { pos: [0, -1.7, -0.2], size: [1.4, 1.4], scaleMul: 1.15, float: { speed: 2.1, rotationIntensity: 0.6, floatIntensity: 0.95 }, amp: 0.4, speedMul: 0.35, offset: 0.15, sign: 1 },
  { pos: [0, 1.7, -0.4], size: [1.5, 1.5], scaleMul: 0.85, float: { speed: 2.4, rotationIntensity: 0.7, floatIntensity: 1.05 }, amp: 0.5, speedMul: 0.6, offset: 1, sign: 1 },
  { pos: [3.75, -1.7, -0.5], size: [1.7, 1.7], scaleMul: 0.9, float: { speed: 1.6, rotationIntensity: 0.4, floatIntensity: 0.65 }, amp: 0.4, speedMul: 0.32, offset: 0.6, sign: 1 },
  { pos: [3.75, 1.7, -0.6], size: [1.6, 1.6], scaleMul: 1.3, float: { speed: 1.9, rotationIntensity: 0.45, floatIntensity: 0.75 }, amp: 0.45, speedMul: 0.38, offset: 0.9, sign: -1 },
  { pos: [-3.75, 1.7, -0.5], size: [1.4, 1.4], scaleMul: 0.75, float: { speed: 2.2, rotationIntensity: 0.55, floatIntensity: 0.9 }, amp: 0.4, speedMul: 0.42, offset: 1.2, sign: 1 },
  { pos: [7.5, -1.7, -0.7], size: [1.4, 1.4], scaleMul: 0.75, float: { speed: 1.7, rotationIntensity: 0.5, floatIntensity: 0.7 }, amp: 0.45, speedMul: 0.28, offset: 1.5, sign: -1 },
  { pos: [-3.75, -1.7, -0.5], size: [1.3, 1.3], scaleMul: 1.2, float: { speed: 2.0, rotationIntensity: 0.5, floatIntensity: 0.85 }, amp: 0.4, speedMul: 0.5, offset: 0.3, sign: 1 },
  { pos: [-7.5, -1.7, -0.8], size: [1.4, 1.4], scaleMul: 0.8, float: { speed: 1.5, rotationIntensity: 0.4, floatIntensity: 0.65 }, amp: 0.5, speedMul: 0.34, offset: 1.8, sign: 1 },
];

// Mobile shows only 8 of the 10 items (watch and the blue speaker are
// dropped — see HIDDEN_ON_MOBILE below), so it gets its own clean 2x4 grid
// instead of inheriting gaps from the desktop 2x5 layout. Keyed by the same
// index into HERO_IMAGES/SLOTS, carrying just a replacement [x, y, z] — the
// rest of each item's look (size/float/etc.) still comes from SLOTS[i].
const MOBILE_POS = {
  1: [-3.53, 1.55, -0.6], // laptop
  4: [1.285, -1.55, -0.5], // macbook
  5: [1.285, 1.55, -0.6], // ps5
  0: [3.855, 1.55, -0.5], // phone
  8: [-3.855, -1.55, -0.5], // speaker2
  2: [-1.285, -1.55, -0.2], // earbuds
  6: [-1.285, 1.55, -0.5], // vr
  7: [3.855, -1.55, -0.7], // speaker1
};

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

// Marquee motion: each card drifts continuously along X at its row's speed
// and direction, wrapping around once it drifts past trackHalf so the loop
// is seamless (the wrap happens off-screen, past the visible frustum edge).
// Y and Z stay fixed — only X is animated here; Float still adds a bit of
// organic bob/tilt on top so the row doesn't look robotic.
function FloatCard({ imageUrl, slot, baseX, y, z, meshScale, rowDirection, rowSpeed, trackHalf }) {
  const ref = useRef(null);
  const texture = useTexture(imageUrl);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const span = trackHalf * 2;
    const raw = baseX + rowDirection * rowSpeed * t;
    const wrapped = (((raw + trackHalf) % span) + span) % span - trackHalf;
    ref.current.position.x = wrapped;
  });

  return (
    <Float speed={slot.float.speed} rotationIntensity={slot.float.rotationIntensity * 0.4} floatIntensity={slot.float.floatIntensity * 0.4}>
      <mesh ref={ref} position={[baseX, y, z]} scale={meshScale * slot.scaleMul}>
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

  // Desktop uses the shared 2x5 SLOTS grid as-is. Mobile uses its own 2x4
  // grid (MOBILE_POS) sized for the 8 items it actually shows, which is why
  // it can run a noticeably bigger meshScale without anything overlapping.
  const meshScale = isSmall ? 1.7 : 1.9;
  // Top row drifts right, bottom row drifts left — a slow announcement-strip
  // marquee. trackHalf is set past the visible frustum edge on each
  // breakpoint so every card's wrap-around happens off-screen.
  const rowSpeed = isSmall ? 0.3 : 0.45;
  const trackHalf = isSmall ? 6.2 : 11;
  // Watch (slot 3) and the blue speaker (slot 9) are hidden on mobile only —
  // desktop still shows the full set.
  const HIDDEN_ON_MOBILE = [3, 9];
  const visibleImages = (images || [])
    .filter(Boolean)
    .slice(0, SLOTS.length)
    .map((url, i) => ({ url, i }))
    .filter(({ i }) => !(isSmall && HIDDEN_ON_MOBILE.includes(i)));

  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={isSmall ? [1, 1.2] : [1, 1.6]}
        camera={{ position: [0, 0, isSmall ? 5.9 : 6.0], fov: isSmall ? 62 : 56 }}
        gl={{ alpha: true, antialias: true }}
      >
        <PointerRig />
        <Suspense fallback={null}>
          {visibleImages.map(({ url, i }) => {
            const [baseX, y, z] = isSmall ? MOBILE_POS[i] : SLOTS[i].pos;
            const rowDirection = y > 0 ? 1 : -1; // top row right, bottom row left
            return (
              <CardBoundary key={`hero-card-${i}`}>
                <FloatCard
                  imageUrl={url}
                  slot={SLOTS[i]}
                  baseX={baseX}
                  y={y}
                  z={z}
                  meshScale={meshScale}
                  rowDirection={rowDirection}
                  rowSpeed={rowSpeed}
                  trackHalf={trackHalf}
                />
              </CardBoundary>
            );
          })}
          <Sparkles count={isSmall ? 18 : 40} scale={6} size={2.2} speed={0.35} color="#67e8f9" />
        </Suspense>
      </Canvas>
    </div>
  );
}