import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, RotateCcw, ZoomIn, Sun, Contrast } from 'lucide-react';

interface ThreeDentalCanvasProps {
  brightness?: number; // 0 to 2
  contrast?: number; // 0 to 2
  zoomLevel?: number;
  onToothClick?: (toothNumber: number) => void;
}

export const ThreeDentalCanvas: React.FC<ThreeDentalCanvasProps> = ({
  brightness = 1.0,
  contrast = 1.0,
  zoomLevel = 1.0,
  onToothClick,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 380;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 14);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Lighting setup (Clinical Studio Lights)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9 * brightness);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2 * brightness);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xe6f4f1, 0.6 * brightness);
    dirLight2.position.set(-10, -5, -10);
    scene.add(dirLight2);

    const spotLight = new THREE.SpotLight(0x1a7b82, 0.8 * brightness);
    spotLight.position.set(0, 10, 5);
    spotLight.angle = Math.PI / 4;
    scene.add(spotLight);

    // 5. 3D Dental Jaw Group Mesh Generation
    const jawGroup = new THREE.Group();

    // Jaw Base Bone Structure
    const jawBoneGeo = new THREE.TorusGeometry(4.5, 0.6, 16, 100, Math.PI);
    const jawBoneMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.3,
      metalness: 0.1,
    });
    const jawBoneMesh = new THREE.Mesh(jawBoneGeo, jawBoneMat);
    jawBoneMesh.rotation.x = Math.PI / 2;
    jawBoneMesh.position.y = -0.5;
    jawGroup.add(jawBoneMesh);

    // Individual Porcelain Teeth Meshes along the Arc
    const teethCount = 14;
    const toothMeshes: THREE.Mesh[] = [];

    const porcelainMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
    });

    const cariesMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48,
      roughness: 0.2,
    });

    const sealantMat = new THREE.MeshStandardMaterial({
      color: 0x1a7b82,
      roughness: 0.2,
    });

    const crownMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      roughness: 0.1,
      metalness: 0.3,
    });

    for (let i = 0; i < teethCount; i++) {
      const angle = (i / (teethCount - 1)) * Math.PI;
      const x = 4.5 * Math.cos(angle);
      const z = 4.5 * Math.sin(angle);

      // Tooth geometry: Rounded cylinder with cap
      const toothGeo = new THREE.CylinderGeometry(0.35, 0.45, 1.2, 16);

      let mat = porcelainMat;
      if (i === 3) mat = cariesMat; // Tooth 54 Caries
      if (i === 4) mat = sealantMat; // Tooth 55 Sealant
      if (i === 10) mat = crownMat; // Tooth 74 Crown

      const toothMesh = new THREE.Mesh(toothGeo, mat);
      toothMesh.position.set(x, 0.1, z);
      toothMesh.rotation.y = -angle + Math.PI / 2;
      toothMesh.castShadow = true;
      toothMesh.receiveShadow = true;

      toothMesh.userData = { toothNumber: 51 + i };
      jawGroup.add(toothMesh);
      toothMeshes.push(toothMesh);
    }

    scene.add(jawGroup);

    // Camera Zoom Scale
    camera.position.z = 14 / zoomLevel;

    // Mouse Drag Controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      jawGroup.rotation.y += deltaX * 0.01;
      jawGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let reqId: number;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (isRotating && !isDragging) {
        jawGroup.rotation.y += 0.003;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current) return;
      const newWidth = mountRef.current.clientWidth;
      const newHeight = mountRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(reqId);

      // Clean up WebGL resources
      jawBoneGeo.dispose();
      jawBoneMat.dispose();
      porcelainMat.dispose();
      cariesMat.dispose();
      sealantMat.dispose();
      crownMat.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [brightness, contrast, zoomLevel, isRotating]);

  return (
    <div className="relative w-full h-[380px] rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80">
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Diagnostic Pin Badges (Replicating Image 2 Denty ai Pins) */}
      <div className="absolute top-4 left-6 pointer-events-none space-y-2">
        <div className="diag-pin text-rose-700 border-rose-300 bg-white/90 backdrop-blur-md shadow-md animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
          <span>54. Caries Oclusal</span>
        </div>
        <div className="diag-pin text-[#0F766E] border-[#1A7B82] bg-white/90 backdrop-blur-md shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1A7B82]" />
          <span>55. Sellante Preventivo</span>
        </div>
        <div className="diag-pin text-purple-700 border-purple-300 bg-white/90 backdrop-blur-md shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span>74. Corona Acero Cromo</span>
        </div>
      </div>

      {/* Interactive 3D Orbit Control Pill */}
      <div className="absolute bottom-3 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Modelo 3D WebGL Interactivo (Arrastra para rotar)</span>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="ml-2 px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-[10px] font-bold text-slate-800"
        >
          {isRotating ? 'Pausar Rotación' : 'Rotar'}
        </button>
      </div>
    </div>
  );
};
