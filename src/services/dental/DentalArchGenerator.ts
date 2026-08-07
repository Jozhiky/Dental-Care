import * as THREE from 'three';
import { ToothDefinition, DentalArchConfig } from '../../types/dental';
import { ToothGeometryGenerator } from './ToothGeometryGenerator';

/**
 * Dental Arch Generator Service
 * Assembles all 32 teeth into realistic Upper (Maxilla) & Lower (Mandible) parabolic arches
 * with physiological spatial occlusion (Overbite & Overjet) and Exploded View support.
 */
export class DentalArchGenerator {
  /**
   * Generates complete 3D scene Group containing:
   * Upper Arch (16 teeth) + Lower Arch (16 teeth)
   */
  public static build3DDentalModel(
    teeth: ToothDefinition[],
    config: DentalArchConfig
  ): {
    fullModelGroup: THREE.Group;
    toothMeshMap: Map<string, THREE.Group>;
  } {
    const fullModelGroup = new THREE.Group();
    fullModelGroup.name = 'Full3DDentalModel';

    const toothMeshMap = new Map<string, THREE.Group>();

    // Separate teeth by arch
    const upperTeeth = teeth.filter((t) => t.arch === 'upper');
    const lowerTeeth = teeth.filter((t) => t.arch === 'lower');

    // 1. UPPER ARCH (MAXILLA)
    const upperGroup = new THREE.Group();
    upperGroup.name = 'UpperDentalArch';

    DentalArchGenerator.arrangeTeethOnArch(
      upperTeeth,
      upperGroup,
      toothMeshMap,
      config.upperArchWidth,
      config.upperArchDepth,
      0, // Y base
      false, // isLower = false
      config.explodedFactor
    );
    fullModelGroup.add(upperGroup);

    // 2. LOWER ARCH (MANDIBLE)
    const lowerGroup = new THREE.Group();
    lowerGroup.name = 'LowerDentalArch';

    // Apply Overbite (vertical displacement) & Overjet (horizontal displacement)
    const lowerY = -1.25 - config.overbite * 0.08;
    const lowerZ = config.overjet * 0.08;

    lowerGroup.position.set(0, lowerY, lowerZ);

    DentalArchGenerator.arrangeTeethOnArch(
      lowerTeeth,
      lowerGroup,
      toothMeshMap,
      config.lowerArchWidth,
      config.lowerArchDepth,
      0,
      true, // isLower = true
      config.explodedFactor
    );
    fullModelGroup.add(lowerGroup);

    return { fullModelGroup, toothMeshMap };
  }

  /**
   * Arranges teeth along a 3D parabolic arch curve
   */
  private static arrangeTeethOnArch(
    archTeeth: ToothDefinition[],
    archGroup: THREE.Group,
    toothMeshMap: Map<string, THREE.Group>,
    archWidth: number,
    archDepth: number,
    baseY: number,
    isLower: boolean,
    explodedFactor: number
  ): void {
    const count = archTeeth.length;
    const arcSpan = Math.PI * 0.78; // 140 deg arc

    archTeeth.forEach((tooth, idx) => {
      // Create procedural 3D tooth mesh group
      const tooth3D = ToothGeometryGenerator.createToothMesh(tooth.category, isLower);
      tooth3D.name = `Tooth_${tooth.fdiCode}`;
      tooth3D.userData = { fdiCode: tooth.fdiCode, toothDef: tooth };

      // Apply initial status material
      ToothGeometryGenerator.applyStatusMaterial(tooth3D, tooth.status);

      // Arc position (-0.5 to +0.5)
      const tNorm = count > 1 ? idx / (count - 1) - 0.5 : 0;
      const angle = tNorm * arcSpan;

      // Parabola formula: X = W * sin(angle), Z = -D * (1 - cos(angle))
      const x = Math.sin(angle) * archWidth;
      const z = -(1 - Math.cos(angle)) * archDepth;
      const y = baseY + Math.sin(tNorm * Math.PI) * 0.08; // Curve of Spee

      // Exploded View offset along radial normal
      const radialNormal = new THREE.Vector3(Math.sin(angle), 0.2, -Math.cos(angle)).normalize();
      const explodeOffset = radialNormal.multiplyScalar(explodedFactor * 0.9);

      tooth3D.position.set(x + explodeOffset.x, y + explodeOffset.y, z + explodeOffset.z);

      // Rotate tooth facing outward tangent to parabolic curve
      tooth3D.rotation.y = -angle;

      // If lower tooth, invert Y rotation/orientation so crown faces up towards upper teeth
      if (isLower) {
        tooth3D.rotation.z = Math.PI; // Flip upside down so crown points up
      }

      archGroup.add(tooth3D);
      toothMeshMap.set(tooth.fdiCode, tooth3D);
    });
  }
}
