'use client';

import { Canvas } from '@react-three/fiber';
import {
  Suspense,
  Component,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Inline GLSL ─────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uScrollY;

  varying vec2 vUv;

  // ── 3D Simplex Noise (Ashima Arts) ──────────────────────────────────
  vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    // Permutations
    i = mod289(i);
    vec4 p = permute(
      permute(
        permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    float n_ = 0.142857142857; // 1.0/7.0
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float scrollTurbulence = 1.0 + uScrollY * 0.5;

    // Primary noise layer
    float noise1 = snoise(vec3(vUv * 2.5 * scrollTurbulence, uTime * 0.12));

    // Secondary slower layer influenced by mouse
    float noise2 = snoise(vec3((vUv * 1.2 + uMouse * 0.3) * scrollTurbulence, uTime * 0.06));

    float depth = noise1 * 0.6 + noise2 * 0.4;

    // Colors
    vec3 baseColor = vec3(0.008, 0.039, 0.098);   // #020A19
    vec3 accentColor = vec3(0.0, 0.961, 0.831);   // #00F5D4

    // Subtle accent blend
    vec3 color = mix(baseColor, accentColor, depth * 0.08);

    // Contour lines
    float contour = abs(fract(depth * 8.0) - 0.5);
    if (contour < 0.015) {
      color = mix(color, accentColor, 0.12);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── ShaderPlane ─────────────────────────────────────────────────────
function ShaderPlane() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0.5, 0.5));
  const scrollRef = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uScrollY: { value: 0 },
    }),
    [],
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current.set(
      e.clientX / window.innerWidth,
      1.0 - e.clientY / window.innerHeight,
    );
  }, []);

  const handleScroll = useCallback(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollRef.current = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleMouseMove, handleScroll]);

  useFrame((_state, delta) => {
    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value += delta;
    materialRef.current.uniforms.uMouse.value.lerp(mouseRef.current, 0.05);
    materialRef.current.uniforms.uScrollY.value +=
      (scrollRef.current - materialRef.current.uniforms.uScrollY.value) * 0.05;
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// ─── Error Boundary ──────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WebGLErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

// ─── BackgroundScene ─────────────────────────────────────────────────
export default function BackgroundScene() {
  return (
    <WebGLErrorBoundary>
      <Canvas
        gl={{ antialias: false, alpha: true }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
        }}
        camera={{ position: [0, 0, 1] }}
      >
        <Suspense fallback={null}>
          <ShaderPlane />
        </Suspense>
      </Canvas>
    </WebGLErrorBoundary>
  );
}
