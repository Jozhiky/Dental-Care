import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { INITIAL_32_TEETH } from '../../data/teeth/teethData';
import {
  AnatomicalToothGenerator,
  AnatomicalToothType,
} from '../../services/dental/AnatomicalToothGenerator';
import { ToothDefinition } from '../../types/dental';

export type CameraPreset =
  | 'frontal'
  | 'superior'
  | 'inferior'
  | 'lateral_right'
  | 'lateral_left'
  | 'reset';

interface DentalViewer3DProps {
  teethCount?: number;
  activeCameraPreset?: CameraPreset;
}

const UPPER_ARCH_ORDER = [
  '18', '17', '16', '15', '14', '13', '12', '11',
  '21', '22', '23', '24', '25', '26', '27', '28',
];

const LOWER_ARCH_ORDER = [
  '48', '47', '46', '45', '44', '43', '42', '41',
  '31', '32', '33', '34', '35', '36', '37', '38',
];

const UPPER_PROGRESSIVE_ORDER = [
  '11', '21', '12', '22', '13', '23', '14', '24',
  '15', '25', '16', '26', '17', '27', '18', '28',
];

const LOWER_PROGRESSIVE_ORDER = [
  '41', '31', '42', '32', '43', '33', '44', '34',
  '45', '35', '46', '36', '47', '37', '48', '38',
];

function toAnatomicalType(tooth: ToothDefinition): AnatomicalToothType {
  if (tooth.category === 'incisor_central') return 'incisor_central';
  if (tooth.category === 'incisor_lateral') return 'incisor_lateral';
  if (tooth.category === 'canine') return 'canine';

  if (tooth.category === 'premolar') {
    return tooth.position === 4 ? 'premolar_1' : 'premolar_2';
  }

  if (tooth.position === 6) return 'molar_1';
  if (tooth.position === 7) return 'molar_2';
  return 'molar_3';
}

function selectedTeethForCount(teethCount: number): ToothDefinition[] {
  const byFdi = new Map(INITIAL_32_TEETH.map((tooth) => [tooth.fdiCode, tooth]));

  if (teethCount >= 32) {
    return [...UPPER_PROGRESSIVE_ORDER, ...LOWER_PROGRESSIVE_ORDER]
      .map((fdi) => byFdi.get(fdi))
      .filter((tooth): tooth is ToothDefinition => Boolean(tooth));
  }

  return UPPER_PROGRESSIVE_ORDER.slice(0, Math.max(1, teethCount))
    .map((fdi) => byFdi.get(fdi))
    .filter((tooth): tooth is ToothDefinition => Boolean(tooth));
}

function addToothToArch(model: THREE.Group, tooth: ToothDefinition) {
  const isLower = tooth.arch === 'lower';
  const archOrder = isLower ? LOWER_ARCH_ORDER : UPPER_ARCH_ORDER;
  const archIndex = archOrder.indexOf(tooth.fdiCode);

  if (archIndex < 0) return;

  const t = archIndex / (archOrder.length - 1) * 2 - 1;
  const angle = t * 1.12;
  const halfWidth = isLower ? 3.15 : 3.35;
  const depth = isLower ? 2.05 : 2.20;

  const x = Math.sin(angle) * halfWidth;
  const z = -(1 - Math.cos(angle)) * depth;
  const y = isLower ? -0.62 : 0.62;

  const toothGroup = AnatomicalToothGenerator.createTooth(
    toAnatomicalType(tooth),
    isLower,
  );

  toothGroup.name = `Tooth_${tooth.fdiCode}`;
  toothGroup.userData = {
    fdiCode: tooth.fdiCode,
    toothName: tooth.name,
    arch: tooth.arch,
  };

  toothGroup.position.set(x, y, z);
  toothGroup.rotation.y = -angle;

  // The generator is naturally oriented like a mandibular tooth:
  // crown +Y, root -Y. Upper teeth must point their crowns downward.
  if (!isLower) {
    toothGroup.rotation.z = Math.PI;
  }

  model.add(toothGroup);
}

export const DentalViewer3D: React.FC<DentalViewer3DProps> = ({
  teethCount = 32,
  activeCameraPreset = 'reset',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = Math.max(mount.clientWidth, 1);
    const height = Math.max(mount.clientHeight, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 2;
    controls.maxDistance = 30;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.25));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4, 6, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.25);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    const model = new THREE.Group();
    model.name = 'GauntletDentalModel';

    selectedTeethForCount(teethCount).forEach((tooth) => {
      addToothToArch(model, tooth);
    });

    scene.add(model);

    model.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const boxIsFinite = [
      box.min.x, box.min.y, box.min.z,
      box.max.x, box.max.y, box.max.z,
    ].every(Number.isFinite);

    if (!boxIsFinite || box.isEmpty()) {
      console.error('[DentalViewer3D] Invalid model bounds', { box, teethCount });
      center.set(0, 0, 0);
      size.set(4, 4, 4);
    }

    const maxDim = Math.max(size.x, size.y, size.z, 1);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const distance = (maxDim / (2 * Math.tan(fov / 2))) * 1.35;

    const setCameraPreset = (preset: CameraPreset) => {
      camera.up.set(0, 1, 0);

      switch (preset) {
        case 'frontal':
          camera.position.set(center.x, center.y, center.z + distance);
          break;
        case 'superior':
          camera.position.set(center.x, center.y + distance, center.z + 0.01);
          camera.up.set(0, 0, -1);
          break;
        case 'inferior':
          camera.position.set(center.x, center.y - distance, center.z + 0.01);
          camera.up.set(0, 0, 1);
          break;
        case 'lateral_right':
          camera.position.set(center.x + distance, center.y, center.z);
          break;
        case 'lateral_left':
          camera.position.set(center.x - distance, center.y, center.z);
          break;
        case 'reset':
        default:
          camera.position.set(
            center.x + distance * 0.42,
            center.y + distance * 0.24,
            center.z + distance * 0.92,
          );
          break;
      }

      controls.target.copy(center);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      controls.update();
    };

    setCameraPreset(activeCameraPreset);

    const grid = new THREE.GridHelper(12, 24, 0x38bdf8, 0x334155);
    grid.position.y = Number.isFinite(box.min.y) ? box.min.y - 0.25 : -2.5;
    scene.add(grid);

    console.info('[DentalViewer3D] Gauntlet render', {
      requestedTeeth: teethCount,
      renderedTeeth: model.children.length,
      boundsFinite: boxIsFinite,
      cameraPreset: activeCameraPreset,
    });

    let animationFrame = 0;
    const animate = () => {
      animationFrame = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const nextWidth = Math.max(mountRef.current.clientWidth, 1);
      const nextHeight = Math.max(mountRef.current.clientHeight, 1);
      renderer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      });

      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [teethCount, activeCameraPreset]);

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden flex flex-col bg-slate-900 rounded-2xl border border-slate-800">
      <div
        ref={mountRef}
        className="w-full h-full flex-1 min-h-0 cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
