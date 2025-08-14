import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface SymbolImageUploadProps {
  symbolId?: string;
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  onImageRemoved: () => void;
}

export function SymbolImageUpload({ 
  symbolId, 
  currentImageUrl, 
  onImageUploaded, 
  onImageRemoved 
}: SymbolImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setIsUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `symbol-${symbolId || timestamp}.${fileExt}`;
      const filePath = `symbols/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      toast.success("Imagem enviada com sucesso!");

    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao enviar a imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl) return;

    try {
      // Extract file path from URL
      const url = new URL(currentImageUrl);
      const filePath = url.pathname.split('/').slice(-2).join('/');
      
      // Remove from storage
      await supabase.storage
        .from('product-images')
        .remove([filePath]);

      onImageRemoved();
      toast.success("Imagem removida com sucesso!");

    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast.error("Erro ao remover a imagem");
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium">Imagem do Símbolo</Label>
      
      {currentImageUrl ? (
        <div className="relative">
          <div className="border border-border rounded-lg p-4 bg-background">
            <img 
              src={currentImageUrl} 
              alt="Símbolo" 
              className="w-16 h-16 object-contain mx-auto"
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0"
            onClick={handleRemoveImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center space-y-2">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <p>Arraste uma imagem aqui ou</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                disabled={isUploading}
                onClick={() => document.getElementById('symbol-image-input')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Enviando...' : 'Selecionar arquivo'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Input
        id="symbol-image-input"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground">
        Formatos aceitos: PNG, JPG, GIF, SVG. Tamanho máximo: 2MB
      </p>
    </div>
  );
}