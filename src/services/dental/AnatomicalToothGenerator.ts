import * as THREE from 'three';

export type AnatomicalToothType =
  | 'incisor_central'
  | 'incisor_lateral'
  | 'canine'
  | 'premolar_1'
  | 'premolar_2'
  | 'molar_1'
  | 'molar_2'
  | 'molar_3';

/**
 * Safe power function to prevent NaN when base is slightly negative due to floating-point imprecision.
 */
function safePow(base: number, exponent: number): number {
  if (isNaN(base) || base <= 0) return 0;
  return Math.pow(base, exponent);
}

/**
 * Anatomical Tooth Generator V2.7 (NaN-Free Verified)
 * Robust vertex transformation with strict numerical clamping against NaN/Infinity.
 */
export class AnatomicalToothGenerator {
  public static createTooth(type: AnatomicalToothType, isLower: boolean): THREE.Group {
    const toothGroup = new THREE.Group();

    // Dimensions
    let w = 0.86;
    let h = 1.10;
    let d = 0.52;
    let rootLength = 1.25;
    let rootCount = 1;

    switch (type) {
      case 'incisor_central':
        w = isLower ? 0.64 : 0.88;
        h = isLower ? 1.05 : 1.15;
        d = 0.46;
        rootLength = 1.30;
        rootCount = 1;
        break;

      case 'incisor_lateral':
        w = isLower ? 0.60 : 0.74;
        h = isLower ? 1.00 : 1.05;
        d = 0.43;
        rootLength = 1.20;
        rootCount = 1;
        break;

      case 'canine':
        w = 0.82;
        h = 1.25;
        d = 0.68;
        rootLength = 1.50;
        rootCount = 1;
        break;

      case 'premolar_1':
        w = 0.85;
        h = 0.98;
        d = 0.82;
        rootLength = 1.15;
        rootCount = isLower ? 1 : 2;
        break;

      case 'premolar_2':
        w = 0.88;
        h = 0.96;
        d = 0.84;
        rootLength = 1.15;
        rootCount = 1;
        break;

      case 'molar_1':
        w = 1.26;
        h = 0.94;
        d = 1.16;
        rootLength = 1.10;
        rootCount = isLower ? 2 : 3;
        break;

      case 'molar_2':
        w = 1.18;
        h = 0.90;
        d = 1.10;
        rootLength = 1.05;
        rootCount = isLower ? 2 : 3;
        break;

      case 'molar_3':
        w = 1.10;
        h = 0.85;
        d = 1.04;
        rootLength = 0.98;
        rootCount = isLower ? 2 : 3;
        break;
    }

    // Material 1: Porcelain Enamel (Warm ivory #F6F3EC)
    const crownMaterial = new THREE.MeshStandardMaterial({
      color: 0xf6f3ec,
      roughness: 0.20,
      metalness: 0.02,
    });

    // Material 2: Dentin Root (Warm off-white #E5D5B8)
    const rootMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5d5b8,
      roughness: 0.50,
      metalness: 0.01,
    });

    // 1. CROWN GEOMETRY (24x24x24 segments)
    const crownGeo = new THREE.BoxGeometry(w, h, d, 24, 24, 24);
    const pos = crownGeo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);

      // Normalized height strictly clamped to [0, 1] to prevent float underflow/overflow
      const rawNormY = (v.y + h / 2) / h;
      const normY = Math.max(0, Math.min(1, Number.isFinite(rawNormY) ? rawNormY : 0));

      // A. Smooth Cervical Tapering (Neck Constriction)
      if (normY < 0.35) {
        const neckTaper = 0.74 + 0.26 * safePow(normY / 0.35, 1.2);
        v.x *= neckTaper;
        v.z *= neckTaper;
      }

      // B. Smooth Corner Rounding
      const normX = Math.max(-1, Math.min(1, v.x / (w / 2)));
      const normZ = Math.max(-1, Math.min(1, v.z / (d / 2)));
      const cornerDist = Math.pow(normX, 4) + Math.pow(normZ, 4);
      if (cornerDist > 0.8) {
        const roundFactor = 1 - 0.08 * (cornerDist - 0.8);
        v.x *= roundFactor;
        v.z *= roundFactor;
      }

      // C. Convex Labial / Vestibular Bulge
      if (v.z > 0) {
        const labialBulge = Math.sin(normY * Math.PI) * 0.05 * (1 - Math.pow(normX, 2));
        v.z += Math.max(0, labialBulge);
      }

      // D. Type-Specific Sculpting
      if (type === 'incisor_central' || type === 'incisor_lateral') {
        if (normY > 0.65) {
          const edgeCompress = 1 - 0.75 * safePow((normY - 0.65) / 0.35, 1.2);
          v.z *= Math.max(0.22, edgeCompress);
        }
        if (normY > 0.85) {
          v.y += Math.sin(normX * Math.PI) * 0.02;
        }
      } else if (type === 'canine') {
        if (normY > 0.55) {
          const cuspDist = Math.min(1, Math.abs(normX));
          v.y += (1 - safePow(cuspDist, 1.5)) * 0.22;
        }
        if (v.z > 0 && Math.abs(normX) < 0.5) {
          v.z += 0.03 * Math.sin(normY * Math.PI);
        }
      } else if (type === 'premolar_1' || type === 'premolar_2') {
        if (normY > 0.60) {
          const relZ = normZ;
          const buccalCusp = Math.exp(-Math.pow(relZ - 0.55, 2) * 5) * 0.12;
          const lingualCusp = Math.exp(-Math.pow(relZ + 0.55, 2) * 5) * 0.09;
          const centralGroove = Math.exp(-Math.pow(relZ, 2) * 12) * -0.06;
          v.y += (buccalCusp + lingualCusp + centralGroove);
        }
      } else if (type === 'molar_1' || type === 'molar_2' || type === 'molar_3') {
        if (normY > 0.58) {
          const relX = normX;
          const relZ = normZ;

          const cuspMB = Math.exp(-Math.pow(relX - 0.45, 2) * 4 - Math.pow(relZ - 0.45, 2) * 4) * 0.13;
          const cuspDB = Math.exp(-Math.pow(relX + 0.45, 2) * 4 - Math.pow(relZ - 0.45, 2) * 4) * 0.11;
          const cuspML = Math.exp(-Math.pow(relX - 0.45, 2) * 4 - Math.pow(relZ + 0.45, 2) * 4) * 0.12;
          const cuspDL = Math.exp(-Math.pow(relX + 0.45, 2) * 4 - Math.pow(relZ + 0.45, 2) * 4) * 0.10;
          const centralDip = Math.exp(-Math.pow(relX, 2) * 6 - Math.pow(relZ, 2) * 6) * -0.08;

          v.y += (cuspMB + cuspDB + cuspML + cuspDL + centralDip);
        }
      }

      // Assert all vertex components are finite numbers before storing
      const safeX = Number.isFinite(v.x) ? v.x : 0;
      const safeY = Number.isFinite(v.y) ? v.y : 0;
      const safeZ = Number.isFinite(v.z) ? v.z : 0;

      pos.setXYZ(i, safeX, safeY, safeZ);
    }

    crownGeo.computeVertexNormals();
    crownGeo.computeBoundingBox();
    crownGeo.computeBoundingSphere();

    const crownMesh = new THREE.Mesh(crownGeo, crownMaterial);
    crownMesh.name = 'Crown';
    crownMesh.position.y = h / 2;
    crownMesh.castShadow = true;
    crownMesh.receiveShadow = true;
    toothGroup.add(crownMesh);

    // 2. ROOT GEOMETRIES (1, 2, or 3 roots)
    if (rootCount === 1) {
      const rootGeo = new THREE.CylinderGeometry(w * 0.32, 0.04, rootLength, 14, 10);
      rootGeo.computeVertexNormals();
      rootGeo.computeBoundingBox();
      rootGeo.computeBoundingSphere();
      const rootMesh = new THREE.Mesh(rootGeo, rootMaterial);
      rootMesh.name = 'Root';
      rootMesh.position.y = -rootLength / 2;
      rootMesh.castShadow = true;
      toothGroup.add(rootMesh);
    } else if (rootCount === 2) {
      const rootOffset = w * 0.22;
      for (let r = 0; r < 2; r++) {
        const rootGeo = new THREE.CylinderGeometry(w * 0.22, 0.04, rootLength, 12, 8);
        rootGeo.computeVertexNormals();
        rootGeo.computeBoundingBox();
        rootGeo.computeBoundingSphere();
        const rootMesh = new THREE.Mesh(rootGeo, rootMaterial);
        rootMesh.name = `Root_${r + 1}`;
        rootMesh.position.set((r === 0 ? -1 : 1) * rootOffset, -rootLength / 2, 0);
        rootMesh.rotation.z = (r === 0 ? 0.09 : -0.09);
        rootMesh.castShadow = true;
        toothGroup.add(rootMesh);
      }
    } else if (rootCount === 3) {
      const rootOffsets = [
        { x: -w * 0.22, z: d * 0.20 },
        { x: w * 0.22, z: d * 0.20 },
        { x: 0, z: -d * 0.22 },
      ];
      rootOffsets.forEach((off, rIdx) => {
        const rootGeo = new THREE.CylinderGeometry(w * 0.18, 0.04, rootLength, 12, 8);
        rootGeo.computeVertexNormals();
        rootGeo.computeBoundingBox();
        rootGeo.computeBoundingSphere();
        const rootMesh = new THREE.Mesh(rootGeo, rootMaterial);
        rootMesh.name = `Root_${rIdx + 1}`;
        rootMesh.position.set(off.x, -rootLength / 2, off.z);
        rootMesh.castShadow = true;
        toothGroup.add(rootMesh);
      });
    }

    return toothGroup;
  }
}
