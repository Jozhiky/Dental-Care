import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { INITIAL_32_TEETH } from '../../data/teeth/teethData';
import {
  AnatomicalToothGenerator,
  AnatomicalToothType,
} from '../../services/dental/AnatomicalToothGenerator';
import { AnatomicalGumGenerator } from '../../services/dental/AnatomicalGumGenerator';
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

const ARCH_CONFIG = {
  upper: {
    halfWidth: 6.0,
    depth: 2.65,
    frontOffsetZ: 0.08,
    scale: 0.82,
    occlusalY: 0.055,
    gumCenterY: 1.00,
    gumPosteriorY: 0.83,
    gumRadius: 0.34,
  },
  lower: {
    halfWidth: 5.7,
    depth: 2.45,
    frontOffsetZ: 0,
    scale: 0.80,
    occlusalY: -0.055,
    gumCenterY: -0.90,
    gumPosteriorY: -0.81,
    gumRadius: 0.33,
  },
} as const;

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

function crownHeightForType(type: AnatomicalToothType, isLower: boolean): number {
  switch (type) {
    case 'incisor_central':
      return isLower ? 1.05 : 1.15;
    case 'incisor_lateral':
      return isLower ? 1.00 : 1.05;
    case 'canine':
      return 1.25;
    case 'premolar_1':
      return 0.98;
    case 'premolar_2':
      return 0.96;
    case 'molar_1':
      return 0.94;
    case 'molar_2':
      return 0.90;
    case 'molar_3':
      return 0.85;
  }
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

function addToothToArch(archGroup: THREE.Group, tooth: ToothDefinition) {
  const isLower = tooth.arch === 'lower';
  const archOrder = isLower ? LOWER_ARCH_ORDER : UPPER_ARCH_ORDER;
  const archIndex = archOrder.indexOf(tooth.fdiCode);

  if (archIndex < 0) return;

  const config = isLower ? ARCH_CONFIG.lower : ARCH_CONFIG.upper;
  const t = archIndex / (archOrder.length - 1) * 2 - 1;
  const type = toAnatomicalType(tooth);

  const x = t * config.halfWidth;
  const z = -config.depth * t * t + config.frontOffsetZ;

  // Place crowns against a shared occlusal reference instead of aligning every
  // cervical margin to one Y value. This keeps short molars and tall canines in
  // a much more believable upper/lower relationship.
  const crownHeight = crownHeightForType(type, isLower) * config.scale;
  const posteriorCurve = 0.035 * Math.pow(Math.abs(t), 1.6);
  const y = isLower
    ? config.occlusalY - crownHeight - posteriorCurve
    : config.occlusalY + crownHeight + posteriorCurve;

  const toothGroup = AnatomicalToothGenerator.createTooth(type, isLower);

  toothGroup.name = `Tooth_${tooth.fdiCode}`;
  toothGroup.userData = {
    fdiCode: tooth.fdiCode,
    toothName: tooth.name,
    arch: tooth.arch,
  };

  // Keep roots in the scene graph for a future X-Ray/root toggle, but do not
  // expose them in the normal odontogram view. Clinically the gingiva should
  // cover this region, and the previous screenshots were dominated by roots.
  toothGroup.traverse((object) => {
    if (object instanceof THREE.Mesh && object.name.startsWith('Root')) {
      object.visible = false;
    }
  });

  toothGroup.position.set(x, y, z);
  toothGroup.scale.setScalar(config.scale);

  const tangentDz = -2 * config.depth * t;
  toothGroup.rotation.y = Math.atan2(tangentDz, config.halfWidth);

  if (!isLower) {
    toothGroup.rotation.z = Math.PI;
  }

  archGroup.add(toothGroup);
}

function finiteBox(box: THREE.Box3): boolean {
  return [
    box.min.x, box.min.y, box.min.z,
    box.max.x, box.max.y, box.max.z,
  ].every(Number.isFinite) && !box.isEmpty();
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
    controls.maxDistance = 40;

    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.25));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
    keyLight.position.set(4, 6, 8);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.15);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    const model = new THREE.Group();
    model.name = 'GauntletDentalModel';

    const upperAssembly = new THREE.Group();
    upperAssembly.name = 'UpperAssembly';
    const lowerAssembly = new THREE.Group();
    lowerAssembly.name = 'LowerAssembly';

    const upperArch = new THREE.Group();
    upperArch.name = 'UpperDentalArch';
    const lowerArch = new THREE.Group();
    lowerArch.name = 'LowerDentalArch';

    upperAssembly.add(upperArch);
    lowerAssembly.add(lowerArch);
    model.add(upperAssembly, lowerAssembly);

    const selectedTeeth = selectedTeethForCount(teethCount);
    selectedTeeth.forEach((tooth) => {
      addToothToArch(tooth.arch === 'lower' ? lowerArch : upperArch, tooth);
    });

    let upperGum: THREE.Mesh | null = null;
    let lowerGum: THREE.Mesh | null = null;

    // Only show gingiva once the full 32-piece base has passed the progressive
    // render test. Smaller counts remain clean diagnostic views.
    if (teethCount >= 32) {
      const gums = AnatomicalGumGenerator.createGums(
        {
          halfWidth: ARCH_CONFIG.upper.halfWidth,
          depth: ARCH_CONFIG.upper.depth,
          frontOffsetZ: ARCH_CONFIG.upper.frontOffsetZ,
          cervicalYCenter: ARCH_CONFIG.upper.gumCenterY,
          cervicalYPosterior: ARCH_CONFIG.upper.gumPosteriorY,
          radius: ARCH_CONFIG.upper.gumRadius,
        },
        {
          halfWidth: ARCH_CONFIG.lower.halfWidth,
          depth: ARCH_CONFIG.lower.depth,
          frontOffsetZ: ARCH_CONFIG.lower.frontOffsetZ,
          cervicalYCenter: ARCH_CONFIG.lower.gumCenterY,
          cervicalYPosterior: ARCH_CONFIG.lower.gumPosteriorY,
          radius: ARCH_CONFIG.lower.gumRadius,
        },
      );

      upperGum = gums.upperGum;
      lowerGum = gums.lowerGum;
      upperAssembly.add(upperGum);
      lowerAssembly.add(lowerGum);
    }

    scene.add(model);
    model.updateMatrixWorld(true);

    const fullBox = new THREE.Box3().setFromObject(model);
    const fullBoxFinite = finiteBox(fullBox);

    const gridSize = fullBoxFinite
      ? Math.max(14, Math.ceil(fullBox.getSize(new THREE.Vector3()).x + 4))
      : 16;
    const grid = new THREE.GridHelper(gridSize, gridSize * 2, 0x38bdf8, 0x334155);
    grid.position.y = fullBoxFinite ? fullBox.min.y - 0.35 : -2.5;
    scene.add(grid);

    const cameraDistanceFor = (box: THREE.Box3, preset: CameraPreset) => {
      const size = box.getSize(new THREE.Vector3());
      const verticalFov = THREE.MathUtils.degToRad(camera.fov);
      const tanHalfFov = Math.tan(verticalFov / 2);

      let screenWidth = size.x;
      let screenHeight = size.y;
      let depthAxis = size.z;

      if (preset === 'superior' || preset === 'inferior') {
        screenWidth = size.x;
        screenHeight = size.z;
        depthAxis = size.y;
      } else if (preset === 'lateral_left' || preset === 'lateral_right') {
        screenWidth = size.z;
        screenHeight = size.y;
        depthAxis = size.x;
      }

      const distanceForHeight = screenHeight / (2 * tanHalfFov);
      const distanceForWidth = screenWidth / (2 * tanHalfFov * Math.max(camera.aspect, 0.1));

      return Math.max(distanceForHeight, distanceForWidth, 1) * 1.12 + depthAxis * 0.38;
    };

    const setCameraPreset = (preset: CameraPreset) => {
      upperAssembly.visible = true;
      lowerAssembly.visible = true;

      let focusObject: THREE.Object3D = model;

      if (preset === 'superior') {
        lowerAssembly.visible = false;
        focusObject = upperAssembly;
      } else if (preset === 'inferior') {
        upperAssembly.visible = false;
        focusObject = lowerAssembly;
      }

      focusObject.updateMatrixWorld(true);
      const focusBox = new THREE.Box3().setFromObject(focusObject);
      const safeBox = finiteBox(focusBox) ? focusBox : fullBox;
      const center = safeBox.getCenter(new THREE.Vector3());
      const distance = cameraDistanceFor(safeBox, preset);

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
            center.y + distance * 0.26,
            center.z + distance * 0.88,
          );
          break;
      }

      controls.target.copy(center);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      controls.update();
    };

    setCameraPreset(activeCameraPreset);

    console.info('[DentalViewer3D] Gauntlet render', {
      requestedTeeth: teethCount,
      renderedTeeth: selectedTeeth.length,
      upperRendered: upperArch.children.length,
      lowerRendered: lowerArch.children.length,
      gumsVisible: teethCount >= 32,
      rootsVisible: false,
      boundsFinite: fullBoxFinite,
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
