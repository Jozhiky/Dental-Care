import * as THREE from 'three';
import { DentalArchConfig } from '../../types/dental';

/**
 * Procedural Gum 3D Geometry Generator
 * Builds separate UpperGum and LowerGum meshes following parabolic dental arches.
 */
export class GumGeometryGenerator {
  public static createGums(config: DentalArchConfig): {
    upperGum: THREE.Mesh;
    lowerGum: THREE.Mesh;
  } {
    const gumMaterial = new THREE.MeshStandardMaterial({
      color: 0xd9777f, // Natural pink/coral soft tissue
      roughness: 0.55,
      metalness: 0.04,
      bumpScale: 0.02,
    });

    // 1. Upper Gum Ribbon
    const upperPoints: THREE.Vector3[] = [];
    const arcSpan = Math.PI * 0.8;
    const numPoints = 24;

    for (let i = 0; i <= numPoints; i++) {
      const tNorm = i / numPoints - 0.5;
      const angle = tNorm * arcSpan;
      const x = Math.sin(angle) * (config.upperArchWidth + 0.08);
      const z = -(1 - Math.cos(angle)) * (config.upperArchDepth + 0.08);
      const y = 0.48; // Base cervical level of upper teeth
      upperPoints.push(new THREE.Vector3(x, y, z));
    }

    const upperCurve = new THREE.CatmullRomCurve3(upperPoints);
    const upperGumGeo = new THREE.TubeGeometry(upperCurve, 48, 0.42, 12, false);
    const upperGum = new THREE.Mesh(upperGumGeo, gumMaterial.clone());
    upperGum.name = 'UpperGum';

    // 2. Lower Gum Ribbon
    const lowerPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= numPoints; i++) {
      const tNorm = i / numPoints - 0.5;
      const angle = tNorm * arcSpan;
      const x = Math.sin(angle) * (config.lowerArchWidth + 0.08);
      const z = -(1 - Math.cos(angle)) * (config.lowerArchDepth + 0.08);
      const y = -1.25 - config.overbite * 0.08 - 0.48;
      lowerPoints.push(new THREE.Vector3(x, y, z + config.overjet * 0.08));
    }

    const lowerCurve = new THREE.CatmullRomCurve3(lowerPoints);
    const lowerGumGeo = new THREE.TubeGeometry(lowerCurve, 48, 0.42, 12, false);
    const lowerGum = new THREE.Mesh(lowerGumGeo, gumMaterial.clone());
    lowerGum.name = 'LowerGum';

    return { upperGum, lowerGum };
  }
}
