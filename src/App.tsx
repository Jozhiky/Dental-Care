import React, { useState } from 'react';
import { SidebarLayout } from './components/layout/SidebarLayout';
import { PatientSummaryCard } from './components/dashboard/PatientSummaryCard';
import { ToothMetricsHeader } from './components/dashboard/ToothMetricsHeader';
import { MintDenDashboard } from './components/dashboard/MintDenDashboard';
import { PediatricOdontogram } from './components/odontogram/PediatricOdontogram';
import { AppointmentManager } from './components/dashboard/AppointmentManager';
import { EruptionTracker } from './components/dashboard/EruptionTracker';
import { TreatmentPlanBuilder } from './components/dashboard/TreatmentPlanBuilder';
import { ClinicalRecordView } from './components/clinical/ClinicalRecordView';
import { ClinicalHistoryTimeline } from './components/clinical/ClinicalHistoryTimeline';
import { RightPanelWidget } from './components/dashboard/RightPanelWidget';
import { ToothMagnifierDrawer } from './components/odontogram/ToothMagnifierDrawer';
import { CommandPalette } from './components/common/CommandPalette';
import { ToothData, ToothSurface, ClinicalConditionType, PediatricPatient } from './types/odontogram';

const SAMPLE_PATIENT: PediatricPatient = {
  id: 'pat-101',
  fullName: 'Mateo Silva Gómez',
  birthDate: '2019-04-12',
  ageYears: 7,
  guardianName: 'Sofía Gómez (Mamá)',
  guardianPhone: '+51 987 654 321',
  cariesRisk: 'MEDIO',
  medicalAlerts: ['Alergia a la Penicilina', 'Respirador Bucal Nocturno', 'Baja Frecuencia de Cepillado'],
  lastVisit: '2026-06-15',
  nextAppointment: 'Mañana, 09:00 AM',
};

const SAMPLE_TEETH_MAP: Record<number, ToothData> = {
  55: { number: 55, isDeciduous: true, name: 'Segundo Molar Leche', surfaces: { vestibular: 'SANO', palatino: 'SANO', mesial: 'SANO', distal: 'SANO', oclusal: 'SELLANTE' } },
  54: { number: 54, isDeciduous: true, name: 'Primer Molar Leche', surfaces: { vestibular: 'SANO', palatino: 'SANO', mesial: 'SANO', distal: 'SANO', oclusal: 'CARIES' } },
  16: { number: 16, isDeciduous: false, name: 'Primer Molar Permanente', surfaces: { vestibular: 'SANO', palatino: 'SANO', mesial: 'SANO', distal: 'SANO', oclusal: 'SANO' } },
  74: { number: 74, isDeciduous: true, name: 'Primer Molar Leche', surfaces: { vestibular: 'SANO', palatino: 'SANO', mesial: 'SANO', distal: 'SANO', oclusal: 'SANO' }, generalCondition: 'CORONA_ACERO' },
  85: { number: 85, isDeciduous: true, name: 'Segundo Molar Leche', surfaces: { vestibular: 'SANO', palatino: 'SANO', mesial: 'SANO', distal: 'SANO', oclusal: 'SELLANTE' } },
};

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'odontogram' | 'appointments' | 'patient' | 'history'>('dashboard');
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [selectedToothNum, setSelectedToothNum] = useState<number | null>(null);
  const [teethData, setTeethData] = useState<Record<number, ToothData>>(SAMPLE_TEETH_MAP);

  const handleCommandSelect = (actionId: string, param?: number) => {
    if (actionId === 'open_cmd') {
      setIsCmdOpen(true);
    } else if (actionId === 'select_tooth' && param) {
      setSelectedToothNum(param);
    } else if (actionId === 'nav-odontogram') {
      setActiveTab('odontogram');
    } else if (actionId === 'nav-patient') {
      setActiveTab('patient');
    } else if (actionId === 'nav-appointments') {
      setActiveTab('appointments');
    } else if (actionId === 'action-print') {
      window.print();
    }
  };

  const handleApplyConditionToTooth = (toothNumber: number, surface: ToothSurface, condition: ClinicalConditionType) => {
    setTeethData((prev) => {
      const tooth = prev[toothNumber] || {
        number: toothNumber,
        isDeciduous: toothNumber >= 51 && toothNumber <= 85,
        name: `Diente ${toothNumber}`,
        surfaces: { vestibular: 'SANO', palatino: 'SANO', mesial: 'SANO', distal: 'SANO', oclusal: 'SANO' },
      };

      return {
        ...prev,
        [toothNumber]: {
          ...tooth,
          surfaces: {
            ...tooth.surfaces,
            [surface]: condition,
          },
        },
      };
    });
  };

  const handleApplyWholeToothCondition = (toothNumber: number, condition: ClinicalConditionType) => {
    setTeethData((prev) => {
      const tooth = prev[toothNumber] || {
        number: toothNumber,
        isDeciduous: toothNumber >= 51 && toothNumber <= 85,
        name: `Diente ${toothNumber}`,
        surfaces: { vestibular: 'SANO', palatino: 'SANO', mesial: 'SANO', distal: 'SANO', oclusal: 'SANO' },
      };

      return {
        ...prev,
        [toothNumber]: {
          ...tooth,
          generalCondition: condition === 'SANO' ? undefined : condition,
        },
      };
    });
    setSelectedToothNum(null);
  };

  const selectedToothData = selectedToothNum
    ? teethData[selectedToothNum] || {
        number: selectedToothNum,
        isDeciduous: selectedToothNum >= 51 && selectedToothNum <= 85,
        name: `Diente FDI ${selectedToothNum}`,
        surfaces: { vestibular: 'SANO', palatino: 'SANO', mesial: 'SANO', distal: 'SANO', oclusal: 'SANO' },
      }
    : null;

  return (
    <SidebarLayout
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      activePatient={SAMPLE_PATIENT}
      onOpenCmd={() => setIsCmdOpen(true)}
    >
      {/* Patient Hero Summary Card */}
      <PatientSummaryCard patient={SAMPLE_PATIENT} />

      {/* Denty ai Top Row Tooth Metrics Header with Radial Progress Rings */}
      <ToothMetricsHeader />

      {/* Main Grid: Center Workspace (8 Cols) + Right Health GPT & Schedule (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Center Main View (8 Cols) */}
        <div className="lg:col-span-8 space-y-3">
          {activeTab === 'dashboard' && (
            <div className="space-y-3">
              <MintDenDashboard patient={SAMPLE_PATIENT} onSelectPatient={() => {}} />
              <PediatricOdontogram />
            </div>
          )}

          {activeTab === 'odontogram' && (
            <div className="space-y-3">
              <EruptionTracker childAge={SAMPLE_PATIENT.ageYears} />
              <PediatricOdontogram />
              <TreatmentPlanBuilder />
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-3">
              <AppointmentManager />
            </div>
          )}

          {activeTab === 'patient' && (
            <div className="space-y-3">
              <ClinicalRecordView patient={SAMPLE_PATIENT} />
              <TreatmentPlanBuilder />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <ClinicalHistoryTimeline />
            </div>
          )}
        </div>

        {/* Right Assistant Panel (4 Cols) Inspired by Denty ai / MintDen */}
        <div className="lg:col-span-4 space-y-3 no-print">
          <RightPanelWidget />
        </div>
      </div>

      {/* Tooth Magnifier Drawer */}
      <ToothMagnifierDrawer
        tooth={selectedToothData}
        onClose={() => setSelectedToothNum(null)}
        onApplyCondition={handleApplyConditionToTooth}
        onApplyWholeTooth={handleApplyWholeToothCondition}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onSelectAction={handleCommandSelect}
      />
    </SidebarLayout>
  );
};
