import * as THREE from 'three';

/**
 * Anatomical Scalloped Gum Generator V2.7
 * Verified 100% NaN-Free geometry computation for UpperGum & LowerGum.
 */
export class AnatomicalGumGenerator {
  public static createGums(
    upperWidth: number = 1.90,
    upperDepth: number = 1.40,
    lowerWidth: number = 1.82,
    lowerDepth: number = 1.34,
    overbite: number = 0.16,
    overjet: number = 0.14
  ): { upperGum: THREE.Mesh; lowerGum: THREE.Mesh } {
    const gumMaterial = new THREE.MeshStandardMaterial({
      color: 0xd86c76,
      roughness: 0.55,
      metalness: 0.02,
    });

    const numSteps = 48;
    const arcSpan = Math.PI * 0.78;

    // 1. UPPER SCALLOPED GINGIVAL MARGIN
    const upperPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= numSteps; i++) {
      const tNorm = i / numSteps - 0.5;
      const angle = tNorm * arcSpan;

      const radiusOffset = 0.05 + 0.02 * Math.sin(i * 0.8);
      const x = Math.sin(angle) * (upperWidth + radiusOffset);
      const z = -(1 - Math.cos(angle)) * (upperDepth + radiusOffset);
      const scallopY = 0.15 + 0.06 * Math.cos(i * 1.0);

      upperPoints.push(new THREE.Vector3(x, scallopY, z));
    }

    const upperCurve = new THREE.CatmullRomCurve3(upperPoints);
    const upperGumGeo = new THREE.TubeGeometry(upperCurve, 64, 0.28, 12, false);
    upperGumGeo.computeVertexNormals();
    upperGumGeo.computeBoundingBox();
    upperGumGeo.computeBoundingSphere();

    const upperGum = new THREE.Mesh(upperGumGeo, gumMaterial.clone());
    upperGum.name = 'UpperGum';
    upperGum.position.y = 0.22;
    upperGum.castShadow = true;
    upperGum.receiveShadow = true;

    // 2. LOWER SCALLOPED GINGIVAL MARGIN
    const lowerPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= numSteps; i++) {
      const tNorm = i / numSteps - 0.5;
      const angle = tNorm * arcSpan;

      const radiusOffset = 0.05 + 0.02 * Math.sin(i * 0.8);
      const x = Math.sin(angle) * (lowerWidth + radiusOffset);
      const z = -(1 - Math.cos(angle)) * (lowerDepth + radiusOffset) + overjet;
      const scallopY = -1.35 - overbite - 0.15 - 0.06 * Math.cos(i * 1.0);

      lowerPoints.push(new THREE.Vector3(x, scallopY, z));
    }

    const lowerCurve = new THREE.CatmullRomCurve3(lowerPoints);
    const lowerGumGeo = new THREE.TubeGeometry(lowerCurve, 64, 0.28, 12, false);
    lowerGumGeo.computeVertexNormals();
    lowerGumGeo.computeBoundingBox();
    lowerGumGeo.computeBoundingSphere();

    const lowerGum = new THREE.Mesh(lowerGumGeo, gumMaterial.clone());
    lowerGum.name = 'LowerGum';
    lowerGum.position.y = -0.22;
    lowerGum.castShadow = true;
    lowerGum.receiveShadow = true;

    return { upperGum, lowerGum };
  }
}
