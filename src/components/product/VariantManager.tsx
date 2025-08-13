import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VariantManagerProps {
  productId: string;
}

const VariantManager: React.FC<VariantManagerProps> = ({ productId }) => {
  const [variants, setVariants] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    size: '',
    color: '',
    width: '',
    material_id: '',
    price_adjustment: 0,
  });

  useEffect(() => {
    loadVariants();
    loadMaterials();
  }, [productId]);

  const loadVariants = async () => {
    const { data } = await supabase
      .from('product_variants')
      .select(`
        *,
        materials (name)
      `)
      .eq('product_id', productId)
      .eq('active', true);
    
    setVariants(data || []);
  };

  const loadMaterials = async () => {
    const { data } = await supabase
      .from('materials')
      .select('*')
      .eq('active', true)
      .order('name');
    
    setMaterials(data || []);
  };

  const resetForm = () => {
    setFormData({
      size: '',
      color: '',
      width: '',
      material_id: '',
      price_adjustment: 0,
    });
    setEditingVariant(null);
  };

  const openForm = (variant = null) => {
    if (variant) {
      setFormData({
        size: variant.size || '',
        color: variant.color || '',
        width: variant.width || '',
        material_id: variant.material_id || '',
        price_adjustment: variant.price_adjustment || 0,
      });
      setEditingVariant(variant);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const saveVariant = async () => {
    try {
      const variantData = {
        product_id: productId,
        ...formData,
        price_adjustment: parseFloat(formData.price_adjustment.toString()) || 0,
      };

      if (editingVariant) {
        const { error } = await supabase
          .from('product_variants')
          .update(variantData)
          .eq('id', editingVariant.id);
        
        if (error) throw error;
        
        toast({
          title: "Variante atualizada!",
          description: "A variante foi atualizada com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('product_variants')
          .insert(variantData);
        
        if (error) throw error;
        
        toast({
          title: "Variante criada!",
          description: "A nova variante foi criada com sucesso.",
        });
      }
      
      setIsFormOpen(false);
      resetForm();
      loadVariants();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteVariant = async (variantId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta variante?')) return;
    
    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ active: false })
        .eq('id', variantId);
      
      if (error) throw error;
      
      toast({
        title: "Variante removida",
        description: "A variante foi removida com sucesso.",
      });
      
      loadVariants();
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
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Variantes do Produto
          </span>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openForm()}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Variante
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingVariant ? 'Editar Variante' : 'Nova Variante'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="size">Tamanho</Label>
                    <Input
                      id="size"
                      placeholder="Ex: P, M, G, 16, 18..."
                      value={formData.size}
                      onChange={(e) => setFormData({...formData, size: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      placeholder="Ex: Dourado, Prateado..."
                      value={formData.color}
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Largura</Label>
                    <Input
                      id="width"
                      placeholder="Ex: 5mm, 8mm..."
                      value={formData.width}
                      onChange={(e) => setFormData({...formData, width: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="material">Material</Label>
                    <Select value={formData.material_id} onValueChange={(value) => setFormData({...formData, material_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material: any) => (
                          <SelectItem key={material.id} value={material.id}>
                            {material.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="price_adjustment">Ajuste de Preço (R$)</Label>
                  <Input
                    id="price_adjustment"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price_adjustment}
                    onChange={(e) => setFormData({...formData, price_adjustment: parseFloat(e.target.value) || 0})}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Valor adicional ou desconto para esta variante
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={saveVariant}>
                    {editingVariant ? 'Atualizar' : 'Criar'} Variante
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {variants.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma variante criada ainda.</p>
            <p className="text-sm">Clique em "Nova Variante" para começar.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {variants.map((variant: any) => (
              <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    {variant.size && <Badge variant="outline">Tamanho: {variant.size}</Badge>}
                    {variant.color && <Badge variant="outline">Cor: {variant.color}</Badge>}
                    {variant.width && <Badge variant="outline">Largura: {variant.width}</Badge>}
                    {variant.materials && (
                      <Badge variant="secondary">Material: {variant.materials.name}</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    SKU: {variant.sku_variant}
                    {variant.price_adjustment !== 0 && (
                      <span className="ml-2">
                        Ajuste: {variant.price_adjustment > 0 ? '+' : ''}R$ {variant.price_adjustment}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openForm(variant)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteVariant(variant.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VariantManager;