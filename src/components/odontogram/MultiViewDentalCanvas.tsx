import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';

// ============================================================
//  DENTAL VIEWS — each view anchored to a yaw/pitch angle (degrees)
// ============================================================
const DENTAL_VIEWS = [
  { src: '/assets/images/dental_view_frontal.jpg',       yaw:   0, pitch:   0, label: 'Frontal' },
  { src: '/assets/images/3d_dentition_scan.jpg',          yaw: -28, pitch:  10, label: 'Oblicua' },
  { src: '/assets/images/dental_view_lateral_right.jpg', yaw:  90, pitch:   0, label: 'Lateral Der.' },
  { src: '/assets/images/dental_view_lateral_left.jpg',  yaw: -90, pitch:   0, label: 'Lateral Izq.' },
  { src: '/assets/images/dental_view_occlusal_top.jpg',  yaw:   0, pitch: -55, label: 'Oclusal' },
];

// ============================================================
//  GLSL SHADERS — cross-fade + parallax + vignette
// ============================================================
const vertexShader = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */`
  uniform sampler2D textureA;
  uniform sampler2D textureB;
  uniform float     blend;
  uniform vec2      parallaxOffset;

  varying vec2 vUv;

  void main() {
    // Subtle parallax shift between textures based on camera offset
    vec2 uvA = vUv + parallaxOffset * 0.04;
    vec2 uvB = vUv - parallaxOffset * 0.04;

    // Clamp UVs to avoid edge artifacts
    uvA = clamp(uvA, 0.002, 0.998);
    uvB = clamp(uvB, 0.002, 0.998);

    vec4 colA = texture2D(textureA, uvA);
    vec4 colB = texture2D(textureB, uvB);

    // Cross-fade blend
    vec4 blended = mix(colA, colB, clamp(blend, 0.0, 1.0));

    // Soft vignette to give depth feeling
    vec2 center = vUv - 0.5;
    float vignette = 1.0 - dot(center, center) * 1.6;
    blended.rgb *= clamp(vignette, 0.3, 1.0);

    // Subtle brightness lift for porcelain look
    blended.rgb += vec3(0.02);

    gl_FragColor = blended;
  }
`;

// ============================================================
//  HELPER: angular distance between two yaw/pitch pairs
// ============================================================
function angularDistance(y1: number, p1: number, y2: number, p2: number): number {
  const dy = y1 - y2;
  const dp = p1 - p2;
  return Math.sqrt(dy * dy + dp * dp);
}

// ============================================================
//  MAIN COMPONENT
// ============================================================
interface MultiViewDentalCanvasProps {
  height?: number;
}

export const MultiViewDentalCanvas: React.FC<MultiViewDentalCanvasProps> = ({
  height = 420,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const texturesRef = useRef<THREE.Texture[]>([]);
  const animFrameRef = useRef<number>(0);

  // Orbit state
  const yawRef = useRef(-28);    // start at oblique angle
  const pitchRef = useRef(10);
  const targetYawRef = useRef(-28);
  const targetPitchRef = useRef(10);
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  const [currentLabel, setCurrentLabel] = useState('Oblicua');
  const [isDragging, setIsDragging] = useState(false);
  const [hint, setHint] = useState(true);

  // ---- LOAD ALL TEXTURES -----------------------------------
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    let loaded = 0;
    const textures: THREE.Texture[] = new Array(DENTAL_VIEWS.length);

    DENTAL_VIEWS.forEach((view, i) => {
      loader.load(view.src, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        textures[i] = tex;
        loaded++;
        if (loaded === DENTAL_VIEWS.length) {
          texturesRef.current = textures;
          initScene(textures);
        }
      });
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      texturesRef.current.forEach((t) => t.dispose());
      rendererRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- INIT THREE.JS SCENE ---------------------------------
  const initScene = useCallback((textures: THREE.Texture[]) => {
    if (!mountRef.current) return;

    const W = mountRef.current.clientWidth;
    const H = height;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xf8fafc, 1);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.z = 2.2;
    cameraRef.current = camera;

    // Geometry — large plane for the dental image canvas
    const geometry = new THREE.PlaneGeometry(3.6, 2.4, 1, 1);

    // Uniforms for shader
    const uniforms = {
      textureA:       { value: textures[1] },   // oblique (default)
      textureB:       { value: textures[0] },   // frontal
      blend:          { value: 0.0 },
      parallaxOffset: { value: new THREE.Vector2(0, 0) },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // Render loop
    let blendA = 1;      // index of textureA in DENTAL_VIEWS
    let blendB = 0;      // index of textureB in DENTAL_VIEWS
    let blendFactor = 0; // 0 = fully A, 1 = fully B

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      // Smooth orbit
      yawRef.current += (targetYawRef.current - yawRef.current) * 0.08;
      pitchRef.current += (targetPitchRef.current - pitchRef.current) * 0.08;

      const yaw = yawRef.current;
      const pitch = pitchRef.current;

      // Find 2 nearest views
      const distances = DENTAL_VIEWS.map((v, i) => ({
        i,
        d: angularDistance(yaw, pitch, v.yaw, v.pitch),
      })).sort((a, b) => a.d - b.d);

      const nearestIdx = distances[0].i;
      const secondIdx = distances[1].i;

      // Blend ratio based on distances
      const dNearest = distances[0].d;
      const dSecond = distances[1].d;
      const totalD = dNearest + dSecond;
      const rawBlend = totalD > 0 ? dNearest / totalD : 0;

      // Swap textures if needed
      if (nearestIdx !== blendA) {
        // Nearest changed — promote second to A, set new nearest as B target
        if (nearestIdx === blendB) {
          // flip: B is now A
          uniforms.textureA.value = uniforms.textureB.value;
          blendA = blendB;
          uniforms.textureB.value = textures[nearestIdx];
          blendB = nearestIdx;
          blendFactor = 1 - blendFactor;
        } else {
          uniforms.textureA.value = textures[nearestIdx];
          blendA = nearestIdx;
        }
        setCurrentLabel(DENTAL_VIEWS[nearestIdx].label);
      }
      if (secondIdx !== blendB) {
        uniforms.textureB.value = textures[secondIdx];
        blendB = secondIdx;
      }

      // Parallax offset — proportional to angle offset from nearest view
      const nearestView = DENTAL_VIEWS[nearestIdx];
      const dx = (yaw - nearestView.yaw) / 90;
      const dy = (pitch - nearestView.pitch) / 60;
      (uniforms.parallaxOffset.value as THREE.Vector2).set(dx, dy);

      // Apply blend
      uniforms.blend.value += (rawBlend - uniforms.blend.value) * 0.12;

      // Slight mesh tilt for 3D feel
      mesh.rotation.y = (yaw / 90) * 0.12;
      mesh.rotation.x = (pitch / 60) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const ro = new ResizeObserver(() => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      renderer.setSize(w, H);
      camera.aspect = w / H;
      camera.updateProjectionMatrix();
    });
    ro.observe(mountRef.current);
    return () => ro.disconnect();
  }, [height]);

  // ---- MOUSE / TOUCH EVENTS --------------------------------
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    setHint(false);
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    targetYawRef.current = Math.max(-100, Math.min(100, targetYawRef.current - dx * 0.55));
    targetPitchRef.current = Math.max(-65, Math.min(25, targetPitchRef.current - dy * 0.35));
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
  }, []);

  // ---- RENDER ----------------------------------------------
  return (
    <div className="relative w-full select-none" style={{ height }}>
      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full rounded-3xl overflow-hidden"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />

      {/* Drag Hint */}
      {hint && (
        <div className="absolute inset-0 flex items-end justify-center pb-8 pointer-events-none">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-slate-200 shadow-lg text-xs font-bold text-slate-600 animate-pulse">
            <span>🖱️</span> Arrastra para rotar en 3D
          </div>
        </div>
      )}

      {/* Current View Label */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full border border-slate-200 shadow-md">
          <span className="text-xs font-black text-[#1A7B82]">● </span>
          <span className="text-xs font-bold text-slate-800">{currentLabel}</span>
        </div>
      </div>

      {/* Rotation Axis Indicator */}
      <div className="absolute top-4 right-4 pointer-events-none flex flex-col gap-1">
        <div className="px-2 py-1 bg-white/80 backdrop-blur-md rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500">
          ↔ Yaw · ↕ Pitch
        </div>
      </div>
    </div>
  );
};
