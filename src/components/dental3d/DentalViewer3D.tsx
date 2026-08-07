import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export type CameraPreset = 'frontal' | 'superior' | 'inferior' | 'lateral_right' | 'lateral_left' | 'reset';

interface DentalViewer3DProps {
  teethCount?: number;
  activeCameraPreset?: CameraPreset;
}

export const DentalViewer3D: React.FC<DentalViewer3DProps> = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 600;
    const height = mountRef.current.clientHeight || 450;

    // 1. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Scene with Slate Contrast
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // 3. Perspective Camera explicitly looking at (0,0,0)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(2, 4, 5);
    scene.add(dirLight);

    // 6. FASE 1 DIAGNOSTIC WHITE CUBE (1, 1, 1) AT (0, 0, 0)
    const cubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const cubeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.2,
      metalness: 0.1,
    });
    const testCube = new THREE.Mesh(cubeGeo, cubeMat);
    testCube.name = 'FASE1_TestCube';
    testCube.position.set(0, 0, 0);
    scene.add(testCube);

    // 7. Grid Helper
    const grid = new THREE.GridHelper(10, 20, 0x38bdf8, 0x334155);
    grid.position.y = -1.5;
    scene.add(grid);

    // 8. Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Diagnostic Assertions
    console.log('[FASE 1 DIAGNOSTIC ASSERTIONS]:');
    console.log('1. Canvas Mounted:', !!mountRef.current);
    console.log('2. Canvas Width:', width);
    console.log('3. Canvas Height:', height);
    console.log('4. Renderer Active:', !!renderer.domElement);
    console.log('5. Camera Position:', camera.position.x, camera.position.y, camera.position.z);
    console.log('6. Scene Children Count:', scene.children.length);
    console.log('7. TestCube Added:', !!scene.getObjectByName('FASE1_TestCube'));
    console.log('8. TestCube Position:', testCube.position.x, testCube.position.y, testCube.position.z);

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w > 0 && h > 0) {
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden flex flex-col bg-slate-900 rounded-2xl border border-slate-800">
      <div ref={mountRef} className="w-full h-full flex-1 min-h-0 cursor-grab active:cursor-grabbing" />
    </div>
  );
};
