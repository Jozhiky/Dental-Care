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
 * Lightweight gingiva for the generic 3D odontogram.
 *
 * Instead of placing one thick tube directly through the tooth centres, each
 * arch is represented by two smaller rounded ridges: a facial/buccal ridge and
 * a palatal/lingual ridge. This keeps the occlusal surfaces visible from above
 * while still covering the cervical/root zone in frontal and lateral views.
 */
export class AnatomicalGumGenerator {
  private static buildRidgePoints(
    config: GumArchConfig,
    lateralOffset: number,
    yOffset: number,
  ): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const steps = 72;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps * 2 - 1;
      const posteriorFactor = Math.pow(Math.abs(t), 1.45);

      const baseX = t * config.halfWidth;
      const baseZ = -config.depth * t * t + config.frontOffsetZ;

      const tangentX = config.halfWidth;
      const tangentZ = -2 * config.depth * t;
      const tangentLength = Math.max(Math.hypot(tangentX, tangentZ), 1e-6);

      // Positive offset points to the facial/buccal side: forward at the
      // incisors and progressively lateral toward the posterior segments.
      const normalX = -tangentZ / tangentLength;
      const normalZ = tangentX / tangentLength;

      const x = baseX + normalX * lateralOffset;
      const z = baseZ + normalZ * lateralOffset;
      const y = THREE.MathUtils.lerp(
        config.cervicalYCenter,
        config.cervicalYPosterior,
        posteriorFactor,
      ) + yOffset;

      points.push(new THREE.Vector3(x, y, z));
    }

    return points;
  }

  private static createRoundedRidge(
    name: string,
    points: THREE.Vector3[],
    radius: number,
    material: THREE.Material,
  ): THREE.Group {
    const ridgeGroup = new THREE.Group();
    ridgeGroup.name = name;

    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const geometry = new THREE.TubeGeometry(curve, 120, radius, 16, false);
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    const ridge = new THREE.Mesh(geometry, material);
    ridge.name = `${name}_Ridge`;
    ridge.castShadow = true;
    ridge.receiveShadow = true;
    ridgeGroup.add(ridge);

    // TubeGeometry has flat open ends. Small spherical caps avoid the sharp
    // pink cut-planes that were obvious in lateral views.
    const firstCapGeometry = new THREE.SphereGeometry(radius, 16, 10);
    const firstCap = new THREE.Mesh(firstCapGeometry, material);
    firstCap.name = `${name}_Cap_Start`;
    firstCap.position.copy(points[0]);
    firstCap.castShadow = true;

    const lastCapGeometry = new THREE.SphereGeometry(radius, 16, 10);
    const lastCap = new THREE.Mesh(lastCapGeometry, material);
    lastCap.name = `${name}_Cap_End`;
    lastCap.position.copy(points[points.length - 1]);
    lastCap.castShadow = true;

    ridgeGroup.add(firstCap, lastCap);
    return ridgeGroup;
  }

  private static createArchGum(
    name: string,
    config: GumArchConfig,
    material: THREE.Material,
  ): THREE.Mesh {
    // Keep Mesh as the public container type for backwards compatibility with
    // DentalViewer3D. The parent geometry is intentionally empty; all visible
    // gingiva lives in the child facial/lingual ridges.
    const archMesh = new THREE.Mesh(new THREE.BufferGeometry(), material);
    archMesh.name = name;

    const facialOffset = Math.max(config.radius * 1.55, 0.42);
    const lingualOffset = -Math.max(config.radius * 1.10, 0.30);

    const facialPoints = AnatomicalGumGenerator.buildRidgePoints(
      config,
      facialOffset,
      0,
    );
    const lingualPoints = AnatomicalGumGenerator.buildRidgePoints(
      config,
      lingualOffset,
      0,
    );

    const facialRadius = Math.max(config.radius * 0.54, 0.16);
    const lingualRadius = Math.max(config.radius * 0.38, 0.11);

    archMesh.add(
      AnatomicalGumGenerator.createRoundedRidge(
        `${name}_Facial`,
        facialPoints,
        facialRadius,
        material,
      ),
      AnatomicalGumGenerator.createRoundedRidge(
        `${name}_Lingual`,
        lingualPoints,
        lingualRadius,
        material,
      ),
    );

    return archMesh;
  }

  public static createGums(
    upperConfig: GumArchConfig,
    lowerConfig: GumArchConfig,
  ): { upperGum: THREE.Mesh; lowerGum: THREE.Mesh } {
    const upperMaterial = new THREE.MeshStandardMaterial({
      color: 0xce7c88,
      roughness: 0.72,
      metalness: 0.0,
    });

    const lowerMaterial = upperMaterial.clone();

    const upperGum = AnatomicalGumGenerator.createArchGum(
      'UpperGum',
      upperConfig,
      upperMaterial,
    );

    const lowerGum = AnatomicalGumGenerator.createArchGum(
      'LowerGum',
      lowerConfig,
      lowerMaterial,
    );

    return { upperGum, lowerGum };
  }
}
