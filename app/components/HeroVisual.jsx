'use client';

import dynamic from 'next/dynamic';
import { Component, useEffect, useState } from 'react';

function FallbackDevices() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-10 top-16 h-24 w-16 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 backdrop-blur-sm animate-[float-slow_6s_ease-in-out_infinite]" />
      <div className="absolute right-40 top-40 h-32 w-24 rounded-2xl border border-cyan-300/30 bg-cyan-400/10 backdrop-blur-sm animate-[float-slower_8s_ease-in-out_infinite]" />
      <div className="absolute right-72 top-10 h-14 w-14 rounded-full border border-cyan-300/30 bg-cyan-400/10 backdrop-blur-sm animate-[float-slow_7s_ease-in-out_infinite]" />
      <div className="absolute right-6 bottom-10 h-10 w-10 rounded-full border border-cyan-300/30 bg-cyan-400/10 backdrop-blur-sm animate-[float-slower_9s_ease-in-out_infinite]" />
    </div>
  );
}

const HeroScene = dynamic(() => import('./HeroScene'), {
  ssr: false,
  loading: () => <FallbackDevices />,
});

class SceneErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.warn('Hero 3D scene failed, showing static fallback instead.', error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export default function HeroVisual({ images }) {
  const [ready, setReady] = useState(false);
  const [use3D, setUse3D] = useState(true);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setUse3D(!reduceMotion);
    setReady(true);
  }, []);

  if (!ready || !use3D || !images || images.length === 0) {
    return <FallbackDevices />;
  }

  return (
    <SceneErrorBoundary fallback={<FallbackDevices />}>
      <HeroScene images={images} />
    </SceneErrorBoundary>
  );
}