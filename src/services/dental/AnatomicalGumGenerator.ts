import * as THREE from 'three';

export interface GumArchConfig {
  halfWidth: number;
  depth: number;
  frontOffsetZ: number;
  cervicalYCenter: number;
  cervicalYPosterior: number;
  radius: number;
}

/**
 * Anatomical gingival ridge used by the generic 3D odontogram.
 *
 * The gum follows exactly the same parabolic X/Z path used by the teeth. It is
 * intentionally a compact gingival ridge instead of a large solid pink mass,
 * so the crowns remain readable while the cervical/root area is visually
 * covered. Roots stay available in the tooth groups for future X-Ray modes.
 */
export class AnatomicalGumGenerator {
  private static createArchGum(
    name: string,
    config: GumArchConfig,
    material: THREE.Material,
  ): THREE.Mesh {
    const points: THREE.Vector3[] = [];
    const steps = 72;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps * 2 - 1;
      const posteriorFactor = Math.pow(Math.abs(t), 1.45);

      const x = t * config.halfWidth;
      const z = -config.depth * t * t + config.frontOffsetZ;
      const y = THREE.MathUtils.lerp(
        config.cervicalYCenter,
        config.cervicalYPosterior,
        posteriorFactor,
      );

      points.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const geometry = new THREE.TubeGeometry(
      curve,
      120,
      config.radius,
      18,
      false,
    );

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  }

  public static createGums(
    upperConfig: GumArchConfig,
    lowerConfig: GumArchConfig,
  ): { upperGum: THREE.Mesh; lowerGum: THREE.Mesh } {
    const gumMaterial = new THREE.MeshStandardMaterial({
      color: 0xce7c88,
      roughness: 0.68,
      metalness: 0.0,
    });

    const upperGum = AnatomicalGumGenerator.createArchGum(
      'UpperGum',
      upperConfig,
      gumMaterial.clone(),
    );

    const lowerGum = AnatomicalGumGenerator.createArchGum(
      'LowerGum',
      lowerConfig,
      gumMaterial.clone(),
    );

    gumMaterial.dispose();

    return { upperGum, lowerGum };
  }
}
