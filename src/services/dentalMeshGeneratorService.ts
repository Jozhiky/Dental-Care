import * as THREE from 'three';
import { DentalTooth, ReconstructionConfig, ToothType } from '../types/dental3d';

/**
 * Dental Mesh Generator Service
 * Creates individual 3D geometries for each detected tooth based on anatomical profile,
 * assembles them along a 3D parabolic dental arch curve, and builds an independent GumMesh.
 */
export class DentalMeshGeneratorService {
  /**
   * Generates individual 3D meshes for each tooth and an independent GumMesh.
   * Returns a Three.js Group containing all separate node objects.
   */
  public static createDentalArchModel(
    teeth: DentalTooth[],
    config: ReconstructionConfig
  ): {
    archGroup: THREE.Group;
    toothMeshes: Map<string, THREE.Mesh>;
    gumMesh: THREE.Mesh | null;
  } {
    const archGroup = new THREE.Group();
    archGroup.name = 'DentalArchGroup';

    const toothMeshes = new Map<string, THREE.Mesh>();
    const totalTeeth = teeth.length;

    // Parabolic arch parameters
    const archRadius = 2.2 * config.archCurvature;
    const archAngleSpan = Math.PI * 0.75; // 135 degrees arc

    const toothMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfdfdfc,
      roughness: 0.15,
      metalness: 0.04,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.05, // subtle translucency like real enamel
      ior: 1.5,
    });

    const gumMaterial = new THREE.MeshStandardMaterial({
      color: 0xdb6b75, // Soft dental pink/coral
      roughness: 0.55,
      metalness: 0.05,
    });

    // 1. Build Individual Tooth Meshes along Arch
    const toothPositions: THREE.Vector3[] = [];

    teeth.forEach((t, idx) => {
      // Position along arch arc (-0.5 to +0.5)
      const tNorm = totalTeeth > 1 ? idx / (totalTeeth - 1) - 0.5 : 0;
      const angle = tNorm * archAngleSpan;

      // Parabolic curve: X = R * sin(angle), Z = -R * (1 - cos(angle))
      const x = Math.sin(angle) * archRadius;
      const z = - (1 - Math.cos(angle)) * archRadius * 0.95;
      const y = Math.sin(tNorm * Math.PI) * 0.12; // Slight natural arch height curve

      const pos = new THREE.Vector3(x, y, z);
      toothPositions.push(pos);

      // Create custom geometry per tooth type
      const toothGeo = DentalMeshGeneratorService.createToothGeometry(t.toothType, config);
      const mesh = new THREE.Mesh(toothGeo, toothMaterial.clone());

      mesh.name = `Tooth_${t.fdiCode || t.id}`;
      mesh.userData = { toothId: t.id, fdiCode: t.fdiCode, type: t.toothType, toothData: t };
      mesh.position.copy(pos);

      // Orient tooth facing outward along curve tangent
      mesh.rotation.y = -angle + (t.rotation || 0);

      // Scale based on detected bounding box proportion
      const baseScale = 0.42;
      const aspectW = Math.max(0.7, Math.min(1.3, t.width / 50));
      const aspectH = Math.max(0.7, Math.min(1.3, t.height / 60));
      mesh.scale.set(baseScale * aspectW, baseScale * aspectH, baseScale * (t.toothType === 'molar' ? 1.4 : 1.0));

      archGroup.add(mesh);
      toothMeshes.set(t.id, mesh);
    });

    // 2. Build Independent Gum Mesh (Ribbon along dental arch base)
    let gumMesh: THREE.Mesh | null = null;
    if (config.enableGum && toothPositions.length > 2) {
      const gumGeo = DentalMeshGeneratorService.createGumGeometry(toothPositions, archRadius);
      gumMesh = new THREE.Mesh(gumGeo, gumMaterial);
      gumMesh.name = 'GumMesh';
      gumMesh.position.y = -0.35; // Positioned right under tooth necks
      archGroup.add(gumMesh);
    }

    return { archGroup, toothMeshes, gumMesh };
  }

  /**
   * Generates specific anatomical 3D geometry based on tooth type:
   * Incisors (flat chisel), Canines (pointed cusp), Premolars (dual cusp), Molars (wide multi-cusp).
   */
  private static createToothGeometry(type: ToothType, config: ReconstructionConfig): THREE.BufferGeometry {
    let width = 0.8;
    let height = 1.1;
    let depth = 0.6;

    switch (type) {
      case 'incisor_central':
        width = 0.85;
        height = 1.15;
        depth = 0.45;
        break;
      case 'incisor_lateral':
        width = 0.72;
        height = 1.05;
        depth = 0.42;
        break;
      case 'canine':
        width = 0.82;
        height = 1.25;
        depth = 0.65;
        break;
      case 'premolar':
        width = 0.90;
        height = 1.00;
        depth = 0.85;
        break;
      case 'molar':
        width = 1.25;
        height = 0.95;
        depth = 1.15;
        break;
    }

    // Base rounded box geometry
    const segments = config.resolution === 'high' ? 24 : config.resolution === 'medium' ? 16 : 10;
    const geometry = new THREE.BoxGeometry(width, height, depth, segments, segments, segments);

    // Sculpt anatomical crown contours by perturbing vertices
    const posAttr = geometry.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);

      const normY = (vertex.y + height / 2) / height; // 0 (root/neck) to 1 (incisal/oclusal edge)

      // Narrowing towards root neck
      if (normY < 0.3) {
        const neckFactor = 0.75 + normY * 0.8;
        vertex.x *= neckFactor;
        vertex.z *= neckFactor;
      }

      // Anatomical shape modifications by type
      if (type === 'canine') {
        // Pointed central cusp at top center
        if (normY > 0.7) {
          const centerDist = Math.abs(vertex.x / (width / 2));
          vertex.y += (1 - centerDist) * 0.18;
        }
      } else if (type === 'incisor_central' || type === 'incisor_lateral') {
        // Flat incisal edge with slight bevel curvature
        if (normY > 0.8) {
          vertex.z *= 0.4; // thin incisal edge
        }
      } else if (type === 'molar' || type === 'premolar') {
        // Oclusal cusps and grooves
        if (normY > 0.75) {
          const cx = Math.sin(vertex.x * 6) * 0.05;
          const cz = Math.cos(vertex.z * 6) * 0.05;
          vertex.y += (cx + cz);
        }
      }

      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    geometry.computeVertexNormals();
    return geometry;
  }

  /**
   * Generates a smooth 3D ribbon mesh representing soft tissue gum arch underneath the teeth.
   */
  private static createGumGeometry(toothPositions: THREE.Vector3[], archRadius: number): THREE.BufferGeometry {
    const curvePoints = toothPositions.map((p) => new THREE.Vector3(p.x, p.y, p.z));

    // Extend endpoints for complete arch coverage
    if (curvePoints.length > 1) {
      const first = curvePoints[0];
      const second = curvePoints[1];
      const startExt = first.clone().add(first.clone().sub(second).multiplyScalar(0.4));
      curvePoints.unshift(startExt);

      const last = curvePoints[curvePoints.length - 1];
      const prevLast = curvePoints[curvePoints.length - 2];
      const endExt = last.clone().add(last.clone().sub(prevLast).multiplyScalar(0.4));
      curvePoints.push(endExt);
    }

    const curve = new THREE.CatmullRomCurve3(curvePoints);
    const tubeGeometry = new THREE.TubeGeometry(curve, 48, 0.45, 12, false);

    // Flatten bottom of gum tube for a realistic base shape
    const posAttr = tubeGeometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      if (v.y < -0.2) {
        v.y = -0.2;
      }
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }

    tubeGeometry.computeVertexNormals();
    return tubeGeometry;
  }
}
