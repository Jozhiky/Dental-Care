import { ToothDefinition, ToothCategory } from '../../types/dental';

export const INITIAL_32_TEETH: ToothDefinition[] = [
  // ------------------------------------------------------------
  // CUADRANTE 1: Maxilar Superior Derecho (18 -> 11)
  // ------------------------------------------------------------
  { fdiCode: '18', name: 'Tercer Molar Superior Derecho', shortName: '3º Molar S.D.', arch: 'upper', quadrant: 1, position: 8, category: 'molar', status: 'healthy' },
  { fdiCode: '17', name: 'Segundo Molar Superior Derecho', shortName: '2º Molar S.D.', arch: 'upper', quadrant: 1, position: 7, category: 'molar', status: 'healthy' },
  { fdiCode: '16', name: 'Primer Molar Superior Derecho', shortName: '1º Molar S.D.', arch: 'upper', quadrant: 1, position: 6, category: 'molar', status: 'caries' },
  { fdiCode: '15', name: 'Segundo Premolar Superior Derecho', shortName: '2º Premolar S.D.', arch: 'upper', quadrant: 1, position: 5, category: 'premolar', status: 'healthy' },
  { fdiCode: '14', name: 'Primer Premolar Superior Derecho', shortName: '1º Premolar S.D.', arch: 'upper', quadrant: 1, position: 4, category: 'premolar', status: 'healthy' },
  { fdiCode: '13', name: 'Canino Superior Derecho', shortName: 'Canino S.D.', arch: 'upper', quadrant: 1, position: 3, category: 'canine', status: 'healthy' },
  { fdiCode: '12', name: 'Incisivo Lateral Superior Derecho', shortName: 'Inc. Lat. S.D.', arch: 'upper', quadrant: 1, position: 2, category: 'incisor_lateral', status: 'healthy' },
  { fdiCode: '11', name: 'Incisivo Central Superior Derecho', shortName: 'Inc. Cent. S.D.', arch: 'upper', quadrant: 1, position: 1, category: 'incisor_central', status: 'restoration' },

  // ------------------------------------------------------------
  // CUADRANTE 2: Maxilar Superior Izquierdo (21 -> 28)
  // ------------------------------------------------------------
  { fdiCode: '21', name: 'Incisivo Central Superior Izquierdo', shortName: 'Inc. Cent. S.I.', arch: 'upper', quadrant: 2, position: 1, category: 'incisor_central', status: 'healthy' },
  { fdiCode: '22', name: 'Incisivo Lateral Superior Izquierdo', shortName: 'Inc. Lat. S.I.', arch: 'upper', quadrant: 2, position: 2, category: 'incisor_lateral', status: 'healthy' },
  { fdiCode: '23', name: 'Canino Superior Izquierdo', shortName: 'Canino S.I.', arch: 'upper', quadrant: 2, position: 3, category: 'canine', status: 'healthy' },
  { fdiCode: '24', name: 'Primer Premolar Superior Izquierdo', shortName: '1º Premolar S.I.', arch: 'upper', quadrant: 2, position: 4, category: 'premolar', status: 'healthy' },
  { fdiCode: '25', name: 'Segundo Premolar Superior Izquierdo', shortName: '2º Premolar S.I.', arch: 'upper', quadrant: 2, position: 5, category: 'premolar', status: 'healthy' },
  { fdiCode: '26', name: 'Primer Molar Superior Izquierdo', shortName: '1º Molar S.I.', arch: 'upper', quadrant: 2, position: 6, category: 'molar', status: 'crown' },
  { fdiCode: '27', name: 'Segundo Molar Superior Izquierdo', shortName: '2º Molar S.I.', arch: 'upper', quadrant: 2, position: 7, category: 'molar', status: 'healthy' },
  { fdiCode: '28', name: 'Tercer Molar Superior Izquierdo', shortName: '3º Molar S.I.', arch: 'upper', quadrant: 2, position: 8, category: 'molar', status: 'healthy' },

  // ------------------------------------------------------------
  // CUADRANTE 4: Mandíbula Inferior Derecha (48 -> 41)
  // ------------------------------------------------------------
  { fdiCode: '48', name: 'Tercer Molar Inferior Derecho', shortName: '3º Molar I.D.', arch: 'lower', quadrant: 4, position: 8, category: 'molar', status: 'healthy' },
  { fdiCode: '47', name: 'Segundo Molar Inferior Derecho', shortName: '2º Molar I.D.', arch: 'lower', quadrant: 4, position: 7, category: 'molar', status: 'healthy' },
  { fdiCode: '46', name: 'Primer Molar Inferior Derecho', shortName: '1º Molar I.D.', arch: 'lower', quadrant: 4, position: 6, category: 'molar', status: 'implant' },
  { fdiCode: '45', name: 'Segundo Premolar Inferior Derecho', shortName: '2º Premolar I.D.', arch: 'lower', quadrant: 4, position: 5, category: 'premolar', status: 'healthy' },
  { fdiCode: '44', name: 'Primer Premolar Inferior Derecho', shortName: '1º Premolar I.D.', arch: 'lower', quadrant: 4, position: 4, category: 'premolar', status: 'healthy' },
  { fdiCode: '43', name: 'Canino Inferior Derecho', shortName: 'Canino I.D.', arch: 'lower', quadrant: 4, position: 3, category: 'canine', status: 'healthy' },
  { fdiCode: '42', name: 'Incisivo Lateral Inferior Derecho', shortName: 'Inc. Lat. I.D.', arch: 'lower', quadrant: 4, position: 2, category: 'incisor_lateral', status: 'healthy' },
  { fdiCode: '41', name: 'Incisivo Central Inferior Derecho', shortName: 'Inc. Cent. I.D.', arch: 'lower', quadrant: 4, position: 1, category: 'incisor_central', status: 'healthy' },

  // ------------------------------------------------------------
  // CUADRANTE 3: Mandíbula Inferior Izquierda (31 -> 38)
  // ------------------------------------------------------------
  { fdiCode: '31', name: 'Incisivo Central Inferior Izquierdo', shortName: 'Inc. Cent. I.I.', arch: 'lower', quadrant: 3, position: 1, category: 'incisor_central', status: 'healthy' },
  { fdiCode: '32', name: 'Incisivo Lateral Inferior Izquierdo', shortName: 'Inc. Lat. I.I.', arch: 'lower', quadrant: 3, position: 2, category: 'incisor_lateral', status: 'healthy' },
  { fdiCode: '33', name: 'Canino Inferior Izquierdo', shortName: 'Canino I.I.', arch: 'lower', quadrant: 3, position: 3, category: 'canine', status: 'healthy' },
  { fdiCode: '34', name: 'Primer Premolar Inferior Izquierdo', shortName: '1º Premolar I.I.', arch: 'lower', quadrant: 3, position: 4, category: 'premolar', status: 'healthy' },
  { fdiCode: '35', name: 'Segundo Premolar Inferior Izquierdo', shortName: '2º Premolar I.I.', arch: 'lower', quadrant: 3, position: 5, category: 'premolar', status: 'healthy' },
  { fdiCode: '36', name: 'Primer Molar Inferior Izquierdo', shortName: '1º Molar I.I.', arch: 'lower', quadrant: 3, position: 6, category: 'molar', status: 'rootCanal' },
  { fdiCode: '37', name: 'Segundo Molar Inferior Izquierdo', shortName: '2º Molar I.I.', arch: 'lower', quadrant: 3, position: 7, category: 'molar', status: 'healthy' },
  { fdiCode: '38', name: 'Tercer Molar Inferior Izquierdo', shortName: '3º Molar I.I.', arch: 'lower', quadrant: 3, position: 8, category: 'molar', status: 'missing' },
];
