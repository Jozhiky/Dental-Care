// FDI Tooth Notation Standards
export type ToothNumber = number;

// 5 Clinical Surfaces per Tooth
export type ToothSurface = 'vestibular' | 'palatino' | 'mesial' | 'distal' | 'oclusal';

// Clinical Diagnostic & Treatment States
export type ClinicalConditionType =
  | 'SANO'
  | 'CARIES'
  | 'OBTURADO'
  | 'SELLANTE'
  | 'PULPECTOMIA'
  | 'CORONA_ACERO'
  | 'EXTRACCION_INDICADA'
  | 'AUSENTE';

export interface SurfaceState {
  surface: ToothSurface;
  condition: ClinicalConditionType;
  notes?: string;
}

export interface ToothData {
  number: ToothNumber;
  isDeciduous: boolean;
  name: string;
  surfaces: Record<ToothSurface, ClinicalConditionType>;
  generalCondition?: ClinicalConditionType; // Used for whole tooth state e.g. Ausente, Corona, Extracción
  notes?: string;
}

export type DentitionMode = 'MIXTA' | 'DECIDUA' | 'PERMANENTE';

export interface TreatmentHistoryItem {
  id: string;
  timestamp: string;
  toothNumber: ToothNumber;
  surface?: ToothSurface;
  condition: ClinicalConditionType;
  dentistName: string;
  notes?: string;
}

// Patient Data Contract
export interface PediatricPatient {
  id: string;
  fullName: string;
  birthDate: string;
  ageYears: number;
  guardianName: string;
  guardianPhone: string;
  cariesRisk: 'BAJO' | 'MEDIO' | 'ALTO';
  medicalAlerts: string[];
  lastVisit: string;
  nextAppointment?: string;
  photoUrl?: string;
}

// Appointment Data Contract
export interface ClinicalAppointment {
  id: string;
  patientId: string;
  patientName: string;
  time: string;
  date: string;
  type: 'Valoración Inicial' | 'Profilaxis & Sellantes' | 'Operatoria (Caries)' | 'Pulpectomía' | 'Ortopedia Preventiva';
  status: 'PENDIENTE' | 'EN_SILLON' | 'FINALIZADA' | 'CANCELADA';
  dentist: string;
  notes: string;
}
