// Global Dental & 3D Odontogram Types

export type ToothArch = 'upper' | 'lower';
export type ToothQuadrant = 1 | 2 | 3 | 4;
export type ToothCategory = 'incisor_central' | 'incisor_lateral' | 'canine' | 'premolar' | 'molar';

export type ToothStatus =
  | 'healthy'
  | 'caries'
  | 'restoration'
  | 'crown'
  | 'missing'
  | 'rootCanal'
  | 'implant';

export interface ToothDefinition {
  fdiCode: string;          // e.g. "11", "16", "46"
  name: string;             // e.g. "Primer Molar Superior Derecho"
  shortName: string;        // e.g. "1º Molar Sup. Der."
  arch: ToothArch;
  quadrant: ToothQuadrant;
  position: number;         // 1 to 8 in quadrant
  category: ToothCategory;
  status: ToothStatus;
  notes?: string;
}

export interface DentalArchConfig {
  upperArchWidth: number;   // Parabola width
  upperArchDepth: number;   // Parabola depth
  lowerArchWidth: number;
  lowerArchDepth: number;
  overbite: number;         // Vertical overlap (mm)
  overjet: number;          // Horizontal overlap (mm)
  explodedFactor: number;   // 0 (normal) to 1 (full exploded view)
}

export interface CameraPreset {
  id: 'frontal' | 'posterior' | 'superior' | 'inferior' | 'lateral_left' | 'lateral_right' | 'reset';
  label: string;
}
