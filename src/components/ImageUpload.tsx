import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  className?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  folder = 'general',
  label = 'Imagen (opcional)',
  className = '',
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(value || '');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: 'Tipo de archivo no válido',
        description: 'Solo se permiten imágenes JPG, PNG y WEBP.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tamaño
    if (file.size > MAX_SIZE) {
      toast({
        title: 'Archivo muy grande',
        description: 'El tamaño máximo permitido es 5MB.',
        variant: 'destructive',
      });
      return;
    }

    if (!user) {
      toast({
        title: 'Error',
        description: 'Debes iniciar sesión para subir imágenes.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/${folder}/${Date.now()}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(data.path);

      const publicUrl = urlData.publicUrl;
      
      setPreview(publicUrl);
      onChange(publicUrl);

      toast({
        title: 'Imagen subida',
        description: 'La imagen se ha subido correctamente.',
      });
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Error al subir imagen',
        description: error.message || 'No se pudo subir la imagen.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      // Limpiar input para permitir subir el mismo archivo de nuevo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (value && user) {
      try {
        // Extraer el path del archivo de la URL
        const urlParts = value.split('/images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('images').remove([filePath]);
        }
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }
    
    setPreview('');
    onChange('');
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {preview ? (
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleButtonClick}
              disabled={uploading}
              className="h-8 gap-1"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Cambiar
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleButtonClick}
          className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
            </>
          ) : (
            <>
              <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">Haz clic para seleccionar una imagen</p>
              <p className="text-xs text-muted-foreground">JPG, PNG o WEBP (máx. 5MB)</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
