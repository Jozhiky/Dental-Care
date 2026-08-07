import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Cpu, Sparkles } from 'lucide-react';
import { DentalImageItem, ReconstructionConfig } from '../../types/dental3d';

interface ImageUploaderProps {
  images: DentalImageItem[];
  onAddImages: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
  onStartReconstruction: () => void;
  config: ReconstructionConfig;
  onChangeConfig: (newConfig: ReconstructionConfig) => void;
  isProcessing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onAddImages,
  onRemoveImage,
  onStartReconstruction,
  config,
  onChangeConfig,
  isProcessing,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddImages(e.target.files);
    }
  };

  return (
    <div className="clean-card p-4 space-y-4 bg-white border border-slate-200/90 rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-xs font-black text-slate-900 font-outfit uppercase tracking-wider flex items-center gap-2">
          <Upload className="w-4 h-4 text-[#1A7B82]" />
          Carga de Fotografía Dental
        </h3>
        <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
          Formatos soportados: JPG, JPEG, PNG, WebP.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-slate-200 hover:border-[#1A7B82] bg-slate-50/60 hover:bg-[#E6F4F1]/30 p-5 rounded-2xl cursor-pointer text-center transition-all group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] text-[#1A7B82] flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
          <ImageIcon className="w-5 h-5" />
        </div>
        <span className="text-xs font-bold text-slate-800 block">
          Haz clic o arrastra fotos dentales aquí
        </span>
        <span className="text-[10px] text-slate-400 block mt-1">
          Foto frontal, lateral u oclusal de la arcada
        </span>
      </div>

      {/* Loaded Images List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-[140px]">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Imágenes Cargadas ({images.length})
        </span>

        {images.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs font-medium italic bg-slate-50 rounded-xl border border-slate-100">
            No hay imágenes seleccionadas
          </div>
        ) : (
          images.map((img) => (
            <div
              key={img.id}
              className="flex items-center gap-3 p-2 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 transition-all"
            >
              <img
                src={img.previewUrl}
                alt="preview"
                className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-slate-800 truncate block">
                  {img.file.name}
                </span>
                <span className="text-[10px] font-bold text-[#1A7B82] bg-[#E6F4F1] px-2 py-0.5 rounded-md inline-block mt-0.5">
                  {img.cameraAngle === 'frontal'
                    ? 'Vista Frontal'
                    : img.cameraAngle === 'lateral_left'
                    ? 'Lateral Izquierda'
                    : img.cameraAngle === 'lateral_right'
                    ? 'Lateral Derecha'
                    : 'Vista Oclusal'}
                </span>
              </div>
              <button
                onClick={() => onRemoveImage(img.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                title="Eliminar imagen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Quality Settings */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2">
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-[#1A7B82]" /> Calidad de Malla 3D
        </span>
        <div className="grid grid-cols-3 gap-1.5">
          {(['low', 'medium', 'high'] as const).map((res) => (
            <button
              key={res}
              onClick={() => onChangeConfig({ ...config, resolution: res })}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                config.resolution === res
                  ? 'bg-[#1A7B82] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {res === 'low' ? 'Baja' : res === 'medium' ? 'Media' : 'Alta'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Trigger Button */}
      <button
        onClick={onStartReconstruction}
        disabled={images.length === 0 || isProcessing}
        className={`w-full py-3 px-4 rounded-xl text-xs font-black text-white transition-all flex items-center justify-center gap-2 shadow-md ${
          images.length === 0 || isProcessing
            ? 'bg-slate-300 cursor-not-allowed shadow-none'
            : 'bg-[#1A7B82] hover:bg-[#0F766E] active:scale-[0.99]'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        {isProcessing ? 'Procesando Reconstrucción...' : 'Generar Dentadura 3D'}
      </button>
    </div>
  );
};
