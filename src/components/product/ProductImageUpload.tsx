import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Upload, X, Star, StarOff, Image as ImageIcon } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface ProductImageUploadProps {
  productId: string;
}

const ProductImageUpload: React.FC<ProductImageUploadProps> = ({ productId }) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadImages();
  }, [productId]);

  const loadImages = async () => {
    const { data } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('display_order');
    
    setImages(data || []);
  };

  const uploadImages = async (files: FileList) => {
    setUploading(true);
    
    try {
      const uploadPromises = Array.from(files).map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}-${index}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        return {
          product_id: productId,
          image_url: publicUrl,
          alt_text: file.name,
          display_order: images.length + index,
          is_primary: images.length === 0 && index === 0,
        };
      });
      
      const newImages = await Promise.all(uploadPromises);
      
      const { error } = await supabase
        .from('product_images')
        .insert(newImages);
      
      if (error) throw error;
      
      toast({
        title: "Imagens enviadas!",
        description: `${files.length} imagem(ns) foram adicionadas com sucesso.`,
      });
      
      loadImages();
    } catch (error: any) {
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImages(e.target.files);
    }
  };

  const deleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const filePath = imageUrl.split('/product-images/')[1];
      
      // Delete from storage
      await supabase.storage
        .from('product-images')
        .remove([filePath]);
      
      // Delete from database
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida com sucesso.",
      });
      
      loadImages();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const setPrimaryImage = async (imageId: string) => {
    try {
      // Remove primary flag from all images
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
      
      // Set new primary image
      const { error } = await supabase
        .from('product_images')
        .update({ is_primary: true })
        .eq('id', imageId);
      
      if (error) throw error;
      
      toast({
        title: "Imagem principal definida",
        description: "A imagem principal foi atualizada.",
      });
      
      loadImages();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const onDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const reorderedImages = Array.from(images);
    const [removed] = reorderedImages.splice(result.source.index, 1);
    reorderedImages.splice(result.destination.index, 0, removed);
    
    // Update display order
    const updates = reorderedImages.map((img: any, index) => ({
      id: img.id,
      display_order: index,
    }));
    
    try {
      for (const update of updates) {
        await supabase
          .from('product_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }
      
      setImages(reorderedImages);
      
      toast({
        title: "Ordem atualizada",
        description: "A ordem das imagens foi atualizada.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Imagens do Produto
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="image-upload">Adicionar Imagens</Label>
          <Input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="mt-2"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Selecione uma ou mais imagens. A primeira será definida como principal.
          </p>
        </div>

        {images.length > 0 && (
          <div>
            <Label>Imagens Atuais (arraste para reordenar)</Label>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-3 gap-4 mt-2"
                  >
                    {images.map((image: any, index) => (
                      <Draggable key={image.id} draggableId={image.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative group border rounded-lg p-2"
                          >
                            <img
                              src={image.image_url}
                              alt={image.alt_text}
                              className="w-full h-32 object-cover rounded"
                            />
                            
                            <div className="absolute top-2 right-2 flex gap-1">
                              {image.is_primary && (
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Principal
                                </Badge>
                              )}
                            </div>
                            
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => setPrimaryImage(image.id)}
                                disabled={image.is_primary}
                              >
                                {image.is_primary ? (
                                  <StarOff className="h-4 w-4" />
                                ) : (
                                  <Star className="h-4 w-4" />
                                )}
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteImage(image.id, image.image_url)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {uploading && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Upload className="h-4 w-4 animate-pulse" />
            Enviando imagens...
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductImageUpload;