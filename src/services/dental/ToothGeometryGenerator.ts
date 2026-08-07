import * as THREE from 'three';
import { ToothCategory, ToothStatus } from '../../types/dental';

/**
 * Procedural 3D Tooth Geometry & Material Generator
 * Creates realistic 3D geometries for crowns + roots + cusps per tooth type.
 */
export class ToothGeometryGenerator {
  /**
   * Generates a 3D Group containing the Crown + Root(s) for a tooth definition.
   */
  public static createToothMesh(category: ToothCategory, isLower: boolean): THREE.Group {
    const toothGroup = new THREE.Group();

    // Dimensions by category
    let crownWidth = 0.85;
    let crownHeight = 1.0;
    let crownDepth = 0.55;
    let rootLength = 1.1;
    let numRoots = 1;

    switch (category) {
      case 'incisor_central':
        crownWidth = isLower ? 0.65 : 0.88;
        crownHeight = 1.15;
        crownDepth = 0.45;
        rootLength = 1.25;
        numRoots = 1;
        break;
      case 'incisor_lateral':
        crownWidth = isLower ? 0.62 : 0.72;
        crownHeight = 1.05;
        crownDepth = 0.42;
        rootLength = 1.18;
        numRoots = 1;
        break;
      case 'canine':
        crownWidth = 0.82;
        crownHeight = 1.25;
        crownDepth = 0.68;
        rootLength = 1.45;
        numRoots = 1;
        break;
      case 'premolar':
        crownWidth = 0.86;
        crownHeight = 0.98;
        crownDepth = 0.82;
        rootLength = 1.15;
        numRoots = 1;
        break;
      case 'molar':
        crownWidth = 1.22;
        crownHeight = 0.92;
        crownDepth = 1.12;
        rootLength = 1.10;
        numRoots = isLower ? 2 : 3;
        break;
    }

    // 1. CROWN GEOMETRY
    const crownGeo = new THREE.BoxGeometry(crownWidth, crownHeight, crownDepth, 16, 16, 16);
    const pos = crownGeo.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const normY = (v.y + crownHeight / 2) / crownHeight; // 0 = cervical neck, 1 = incisal/oclusal tip

      // Cervical neck constriction
      if (normY < 0.25) {
        const factor = 0.76 + normY * 0.9;
        v.x *= factor;
        v.z *= factor;
      }

      // Category-specific sculpting
      if (category === 'canine') {
        if (normY > 0.65) {
          const distFromCenter = Math.abs(v.x / (crownWidth / 2));
          v.y += (1 - distFromCenter) * 0.20; // pointed cusp
        }
      } else if (category === 'incisor_central' || category === 'incisor_lateral') {
        if (normY > 0.75) {
          v.z *= 0.35; // Chisel incisal edge
        }
      } else if (category === 'molar') {
        if (normY > 0.70) {
          // 4 Oclusal cusps
          const cx = Math.sin(v.x * 6.0) * 0.06;
          const cz = Math.cos(v.z * 6.0) * 0.06;
          v.y += cx + cz;
        }
      } else if (category === 'premolar') {
        if (normY > 0.70) {
          // Bicuspid ridges
          const cz = Math.abs(v.z / (crownDepth / 2));
          v.y += (1 - cz) * 0.08;
        }
      }

      pos.setXYZ(i, v.x, v.y, v.z);
    }
    crownGeo.computeVertexNormals();

    const crownMesh = new THREE.Mesh(crownGeo, ToothGeometryGenerator.getEnamelMaterial());
    crownMesh.name = 'Crown';
    crownMesh.position.y = crownHeight / 2;
    toothGroup.add(crownMesh);

    // 2. ROOT(S) GEOMETRY
    const rootDir = isLower ? -1 : -1; // Roots extend downwards relative to crown neck

    if (numRoots === 1) {
      const rootGeo = new THREE.CylinderGeometry(
        crownWidth * 0.35,
        0.05,
        rootLength,
        12,
        8
      );
      const rootMesh = new THREE.Mesh(rootGeo, ToothGeometryGenerator.getRootMaterial());
      rootMesh.name = 'Root';
      rootMesh.position.y = -rootLength / 2;
      toothGroup.add(rootMesh);
    } else if (numRoots === 2) {
      const rootOffset = crownWidth * 0.22;
      for (let r = 0; r < 2; r++) {
        const rootGeo = new THREE.CylinderGeometry(
          crownWidth * 0.24,
          0.04,
          rootLength,
          10,
          6
        );
        const rootMesh = new THREE.Mesh(rootGeo, ToothGeometryGenerator.getRootMaterial());
        rootMesh.name = `Root_${r + 1}`;
        rootMesh.position.set((r === 0 ? -1 : 1) * rootOffset, -rootLength / 2, 0);
        rootMesh.rotation.z = (r === 0 ? 0.08 : -0.08);
        toothGroup.add(rootMesh);
      }
    } else { // 3 roots for upper molars
      const rootOffsets = [
        { x: -crownWidth * 0.2, z: crownDepth * 0.2 },
        { x: crownWidth * 0.2, z: crownDepth * 0.2 },
        { x: 0, z: -crownDepth * 0.22 },
      ];
      rootOffsets.forEach((off, idx) => {
        const rootGeo = new THREE.CylinderGeometry(
          crownWidth * 0.20,
          0.04,
          rootLength,
          10,
          6
        );
        const rootMesh = new THREE.Mesh(rootGeo, ToothGeometryGenerator.getRootMaterial());
        rootMesh.name = `Root_${idx + 1}`;
        rootMesh.position.set(off.x, -rootLength / 2, off.z);
        toothGroup.add(rootMesh);
      });
    }

    return toothGroup;
  }

  /**
   * Returns enamel material for healthy tooth crown
   */
  public static getEnamelMaterial(): THREE.MeshPhysicalMaterial {
    return new THREE.MeshPhysicalMaterial({
      color: 0xfbfbf8,
      roughness: 0.16,
      metalness: 0.04,
      clearcoat: 0.85,
      clearcoatRoughness: 0.1,
      reflectivity: 0.9,
      transmission: 0.04,
      ior: 1.52,
    });
  }

  /**
   * Returns dentin/root material
   */
  public static getRootMaterial(): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: 0xe6dfcc,
      roughness: 0.5,
      metalness: 0.02,
    });
  }

  /**
   * Applies visual status overlays/materials based on clinical condition
   */
  public static applyStatusMaterial(group: THREE.Group, status: ToothStatus): void {
    const crown = group.getObjectByName('Crown') as THREE.Mesh;
    if (!crown) return;

    switch (status) {
      case 'healthy':
        crown.material = ToothGeometryGenerator.getEnamelMaterial();
        crown.visible = true;
        group.visible = true;
        break;

      case 'caries': {
        const cariesMat = ToothGeometryGenerator.getEnamelMaterial();
        cariesMat.color.setHex(0x78350f); // Dark brown lesion mark
        crown.material = cariesMat;
        crown.visible = true;
        group.visible = true;
        break;
      }

      case 'restoration': {
        const resMat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8, // Amalgam/silver composite
          roughness: 0.3,
          metalness: 0.6,
        });
        crown.material = resMat;
        crown.visible = true;
        group.visible = true;
        break;
      }

      case 'crown': {
        const crownMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b, // Gold/Ceramic prosthetic crown
          roughness: 0.2,
          metalness: 0.8,
        });
        crown.material = crownMat;
        crown.visible = true;
        group.visible = true;
        break;
      }

      case 'rootCanal': {
        const rcMat = ToothGeometryGenerator.getEnamelMaterial();
        rcMat.color.setHex(0x38bdf8); // Cyan access mark
        crown.material = rcMat;
        crown.visible = true;
        group.visible = true;
        break;
      }

      case 'implant': {
        const impMat = new THREE.MeshStandardMaterial({
          color: 0x64748b, // Titanium implant post
          roughness: 0.25,
          metalness: 0.85,
        });
        crown.material = impMat;
        crown.visible = true;
        group.visible = true;
        break;
      }

      case 'missing':
        group.visible = false;
        break;
    }
  }
}
