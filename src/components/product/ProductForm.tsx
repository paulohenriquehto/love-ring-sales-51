import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import ProductImageUpload from './ProductImageUpload';
import VariantManager from './VariantManager';
import { Loader2 } from 'lucide-react';
import { useFonts } from '@/contexts/FontContext';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU é obrigatório'),
  base_price: z.coerce.number().min(0, 'Preço deve ser positivo'),
  category_id: z.string().optional(),
  supplier_id: z.string().optional(),
  weight: z.coerce.number().optional(),
  // Personalização
  supports_engraving: z.boolean().default(false),
  max_characters: z.coerce.number().min(1).max(100).optional(),
  price_adjustment: z.coerce.number().min(0).optional(),
  available_fonts: z.array(z.string()).optional(),
});

interface ProductFormProps {
  product?: any;
  onProductSaved: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onProductSaved }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [productId, setProductId] = useState(product?.id);
  const [engravingConfig, setEngravingConfig] = useState<any>(null);
  const { fontOptions } = useFonts();

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      sku: product?.sku || '',
      base_price: product?.base_price || 0,
      category_id: product?.category_id || '',
      supplier_id: product?.supplier_id || '',
      weight: product?.weight || 0,
      supports_engraving: engravingConfig?.supports_engraving || false,
      max_characters: engravingConfig?.max_characters || 30,
      price_adjustment: engravingConfig?.price_adjustment || 0,
      available_fonts: engravingConfig?.available_fonts || [],
    },
  });

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    if (product?.id) {
      loadEngravingConfig(product.id);
    }
  }, [product?.id]);

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name');
    
    setCategories(data || []);
  };

  const loadSuppliers = async () => {
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .eq('active', true)
      .order('name');
    
    setSuppliers(data || []);
  };

  const loadEngravingConfig = async (productId: string) => {
    const { data } = await supabase
      .from('product_engraving_config')
      .select('*')
      .eq('product_id', productId)
      .single();
    
    if (data) {
      setEngravingConfig(data);
      form.reset({
        ...form.getValues(),
        supports_engraving: data.supports_engraving,
        max_characters: data.max_characters,
        price_adjustment: data.price_adjustment,
        available_fonts: data.available_fonts || [],
      });
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    
    try {
      const { supports_engraving, max_characters, price_adjustment, available_fonts, ...productData } = data;
      
      // Clean UUID fields - convert empty strings to null
      const cleanedProductData = {
        ...productData,
        supplier_id: productData.supplier_id === '' ? null : productData.supplier_id,
        category_id: productData.category_id === '' ? null : productData.category_id,
      };
      
      let currentProductId = productId;
      
      if (product) {
        // Update product
        const { error } = await supabase
          .from('products')
          .update(cleanedProductData)
          .eq('id', product.id);
        
        if (error) throw error;
        currentProductId = product.id;
      } else {
        // Create new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(cleanedProductData)
          .select()
          .single();
        
        if (error) throw error;
        
        setProductId(newProduct.id);
        currentProductId = newProduct.id;
      }
      
      // Handle engraving configuration
      const engravingData = {
        product_id: currentProductId,
        supports_engraving,
        max_characters: max_characters || 30,
        price_adjustment: price_adjustment || 0,
        available_fonts: available_fonts || [],
      };
      
      if (engravingConfig) {
        // Update existing config
        const { error: engravingError } = await supabase
          .from('product_engraving_config')
          .update(engravingData)
          .eq('product_id', currentProductId);
        
        if (engravingError) throw engravingError;
      } else {
        // Create new config
        const { error: engravingError } = await supabase
          .from('product_engraving_config')
          .insert(engravingData);
        
        if (engravingError) throw engravingError;
      }
      
      toast({
        title: product ? "Produto atualizado!" : "Produto criado!",
        description: product 
          ? "As informações do produto foram atualizadas com sucesso."
          : "O novo produto foi criado com sucesso.",
      });
      
      onProductSaved();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Básico</TabsTrigger>
              <TabsTrigger value="images" disabled={!productId}>Imagens</TabsTrigger>
              <TabsTrigger value="variants" disabled={!productId}>Variantes</TabsTrigger>
              <TabsTrigger value="inventory" disabled={!productId}>Estoque</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Produto</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Anel de Ouro 18k" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sku"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: AN-OURO-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição detalhada do produto..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="base_price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço Base (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Peso (g)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" placeholder="0.0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category: any) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornecedor</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um fornecedor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier: any) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Personalização</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="supports_engraving"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Ativar Personalização
                          </FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Permite que os clientes personalizem este produto com gravação
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch('supports_engraving') && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="max_characters"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Máximo de Caracteres</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="30"
                                  min="1"
                                  max="100"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="price_adjustment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ajuste de Preço (R$)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="0.00"
                                  min="0"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="available_fonts"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fontes Disponíveis</FormLabel>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                              {fontOptions.map((font) => (
                                <div key={font.value} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={font.value}
                                    checked={field.value?.includes(font.value) || false}
                                    onCheckedChange={(checked) => {
                                      const currentFonts = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentFonts, font.value]);
                                      } else {
                                        field.onChange(currentFonts.filter((f: string) => f !== font.value));
                                      }
                                    }}
                                  />
                                  <label 
                                    htmlFor={font.value}
                                    className={`text-sm cursor-pointer ${font.className}`}
                                  >
                                    {font.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {product ? 'Atualizar Produto' : 'Criar Produto'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="images">
              {productId && <ProductImageUpload productId={productId} />}
            </TabsContent>

            <TabsContent value="variants">
              {productId && <VariantManager productId={productId} />}
            </TabsContent>

            <TabsContent value="inventory">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Estoque</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    O estoque é criado automaticamente quando você adiciona variantes do produto.
                    Use a aba "Variantes" para configurar as opções do produto.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
};

export default ProductForm;