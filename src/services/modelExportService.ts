import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export class ModelExportService {
  /**
   * Export scene/group as binary GLB retaining separate nodes & materials
   */
  public static exportToGLB(object: THREE.Object3D, filename: string = 'Modelo_Dental_3D.glb'): void {
    const exporter = new GLTFExporter();
    exporter.parse(
      object,
      (gltf) => {
        const output = gltf as ArrayBuffer;
        const blob = new Blob([output], { type: 'application/octet-stream' });
        ModelExportService.downloadBlob(blob, filename);
      },
      (error) => {
        console.error('Error al exportar a GLB:', error);
      },
      { binary: true }
    );
  }

  /**
   * Export scene/group as Wavefront OBJ format
   */
  public static exportToOBJ(object: THREE.Object3D, filename: string = 'Modelo_Dental_3D.obj'): void {
    const exporter = new OBJExporter();
    const result = exporter.parse(object);
    const blob = new Blob([result], { type: 'text/plain' });
    ModelExportService.downloadBlob(blob, filename);
  }

  /**
   * Export scene/group as STL format (useful for 3D Printing)
   */
  public static exportToSTL(object: THREE.Object3D, filename: string = 'Modelo_Dental_3D.stl'): void {
    const exporter = new STLExporter();
    const result = exporter.parse(object, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    ModelExportService.downloadBlob(blob, filename);
  }

  private static downloadBlob(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
}
