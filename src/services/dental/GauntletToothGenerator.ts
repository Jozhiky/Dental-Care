import * as THREE from 'three';

export type ToothCategory = 'incisor_central' | 'incisor_lateral' | 'canine' | 'premolar' | 'molar';

/**
 * Gauntlet Tooth Generator
 * Generates solid, 100% visible, anatomically shaped 3D teeth using MeshStandardMaterial.
 */
export class GauntletToothGenerator {
  /**
   * Creates a single Tooth 3D Group containing Crown + Neck + Root
   */
  public static createTooth(category: ToothCategory, isLower: boolean): THREE.Group {
    const toothGroup = new THREE.Group();

    let width = 0.85;
    let height = 1.0;
    let depth = 0.55;
    let rootLength = 1.1;

    switch (category) {
      case 'incisor_central':
        width = isLower ? 0.65 : 0.85;
        height = 1.1;
        depth = 0.45;
        rootLength = 1.2;
        break;
      case 'incisor_lateral':
        width = isLower ? 0.60 : 0.72;
        height = 1.0;
        depth = 0.42;
        rootLength = 1.1;
        break;
      case 'canine':
        width = 0.80;
        height = 1.2;
        depth = 0.65;
        rootLength = 1.35;
        break;
      case 'premolar':
        width = 0.85;
        height = 0.95;
        depth = 0.80;
        rootLength = 1.1;
        break;
      case 'molar':
        width = 1.20;
        height = 0.90;
        depth = 1.10;
        rootLength = 1.05;
        break;
    }

    // Material 1: Crown (Bright white porcelain/enamel)
    const crownMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.18,
      metalness: 0.05,
    });

    // Material 2: Root (Warm off-white dentin)
    const rootMat = new THREE.MeshStandardMaterial({
      color: 0xeeddbb,
      roughness: 0.45,
      metalness: 0.02,
    });

    // CROWN GEOMETRY
    const crownGeo = new THREE.BoxGeometry(width, height, depth, 12, 12, 12);
    const pos = crownGeo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const normY = (v.y + height / 2) / height;

      // Neck constriction at base
      if (normY < 0.25) {
        const factor = 0.78 + normY * 0.85;
        v.x *= factor;
        v.z *= factor;
      }

      // Anatomical shape modifications
      if (category === 'canine') {
        if (normY > 0.65) {
          const dist = Math.abs(v.x / (width / 2));
          v.y += (1 - dist) * 0.18;
        }
      } else if (category === 'incisor_central' || category === 'incisor_lateral') {
        if (normY > 0.75) {
          v.z *= 0.35; // Chisel edge
        }
      } else if (category === 'molar') {
        if (normY > 0.70) {
          v.y += Math.sin(v.x * 6.0) * 0.05 + Math.cos(v.z * 6.0) * 0.05;
        }
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }
    crownGeo.computeVertexNormals();

    const crownMesh = new THREE.Mesh(crownGeo, crownMat);
    crownMesh.name = 'Crown';
    crownMesh.position.y = height / 2;
    crownMesh.castShadow = true;
    crownMesh.receiveShadow = true;
    toothGroup.add(crownMesh);

    // ROOT GEOMETRY
    const rootGeo = new THREE.CylinderGeometry(width * 0.32, 0.05, rootLength, 10, 6);
    const rootMesh = new THREE.Mesh(rootGeo, rootMat);
    rootMesh.name = 'Root';
    rootMesh.position.y = -rootLength / 2;
    rootMesh.castShadow = true;
    toothGroup.add(rootMesh);

    return toothGroup;
  }
}
