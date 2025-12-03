import { useRef } from 'react';
import { Upload } from 'lucide-react';

function ImageUpload({ onImageLoad }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const loadImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        onImageLoad(img, { w: img.width, h: img.height });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex justify-center">
      <div
        className="w-full max-w-2xl border-4 border-dashed border-slate-600 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-800/50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <Upload className="mx-auto mb-4 text-slate-400" size={64} />
        <h3 className="text-xl font-semibold mb-2">Upload Match Footage</h3>
        <p className="text-slate-400 mb-4">
          Drag and drop an image here, or click to select
        </p>
        <p className="text-sm text-slate-500">
          Supports: JPG, PNG, GIF, WebP
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}

export default ImageUpload;

