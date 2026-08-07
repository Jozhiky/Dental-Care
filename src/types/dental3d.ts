// Types for 3D Dental Reconstruction Engine

export type ToothType = 'incisor_central' | 'incisor_lateral' | 'canine' | 'premolar' | 'molar';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface DentalTooth {
  id: string;
  index: number;
  fdiCode?: string;
  toothType: ToothType;
  boundingBox: BoundingBox;
  contour: Point2D[];
  center: Point2D;
  width: number;
  height: number;
  rotation: number;
  confidence: number;
  positionInArch: number; // 0 to N-1 along dental arch curve
  visible: boolean;
  selected?: boolean;
  cropCanvas?: HTMLCanvasElement;
}

export interface DentalImageItem {
  id: string;
  file: File;
  previewUrl: string;
  cameraAngle: 'frontal' | 'lateral_left' | 'lateral_right' | 'occlusal_top' | 'occlusal_bottom';
  confidence: number;
  width: number;
  height: number;
}

export interface DentalImageSet {
  images: DentalImageItem[];
  primaryImageId: string;
}

export interface ReconstructionConfig {
  resolution: 'low' | 'medium' | 'high'; // 32, 64, 128
  archCurvature: number; // 0.5 to 1.5
  toothDepthFactor: number; // extrusion depth
  enableGum: boolean;
  enableIndividualTeeth: boolean;
  smoothingPasses: number;
  bevelRadius: number;
}

export type ProcessingStep =
  | 'idle'
  | 'analyzing'
  | 'segmenting_teeth'
  | 'extracting_contours'
  | 'generating_geometries'
  | 'assembling_arch'
  | 'building_gum'
  | 'completed'
  | 'error';

export interface ProcessingStatus {
  step: ProcessingStep;
  progress: number; // 0 to 100
  message: string;
  teethCount: number;
}

export interface SelectedToothInfo {
  tooth: DentalTooth;
  dimensionsMm: { width: number; height: number; depth: number };
  conditionEstimate: string;
}
