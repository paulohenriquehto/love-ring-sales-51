import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Edit, Eye, Package, Filter, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface ProductListProps {
  onEditProduct: (product: any) => void;
  onProductDeleted?: () => void;
}

const ProductList: React.FC<ProductListProps> = ({ onEditProduct, onProductDeleted }) => {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories (name),
        suppliers (name),
        product_images (image_url, is_primary),
        product_variants (id, size, color, material_id)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
    
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('name');
    
    setCategories(data || []);
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter((product: any) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((product: any) => product.category_id === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const getPrimaryImage = (product: any) => {
    const primaryImage = product.product_images?.find((img: any) => img.is_primary);
    return primaryImage?.image_url || '/placeholder.svg';
  };

  const getVariantCount = (product: any) => {
    return product.product_variants?.length || 0;
  };

  const handleDeleteProduct = async (product: any) => {
    try {
      // Usar função de exclusão física em cascata
      const { error } = await supabase.rpc('delete_product_cascade', {
        product_id: product.id
      });

      if (error) {
        if (error.message.includes('exists in order history')) {
          toast({
            variant: "destructive",
            title: "Não é possível excluir",
            description: "Este produto está presente no histórico de pedidos e não pode ser excluído permanentemente.",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Produto excluído permanentemente",
        description: `${product.name} e todos os dados relacionados foram removidos do sistema.`,
      });

      // Recarregar a lista de produtos
      loadProducts();
      onProductDeleted?.();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: "Não foi possível excluir o produto. Tente novamente.",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, SKU ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-64">
              <Select value={selectedCategory || undefined} onValueChange={(value) => setSelectedCategory(value || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(searchTerm || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
            </h3>
            <p className="text-muted-foreground">
              {products.length === 0 
                ? 'Clique em "Novo Produto" para começar.'
                : 'Tente ajustar os filtros de busca.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product: any) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square relative bg-muted">
                <img
                  src={getPrimaryImage(product)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {getVariantCount(product) > 0 && (
                  <Badge className="absolute top-2 right-2" variant="secondary">
                    {getVariantCount(product)} variante{getVariantCount(product) !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{product.sku}</Badge>
                    {product.categories && (
                      <Badge variant="secondary">{product.categories.name}</Badge>
                    )}
                  </div>
                  
                  <p className="text-2xl font-bold text-primary">
                    R$ {product.base_price?.toFixed(2)}
                  </p>
                  
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEditProduct(product)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>⚠️ Exclusão Permanente</AlertDialogTitle>
                        <AlertDialogDescription>
                          <div className="space-y-3">
                            <p>
                              Tem certeza que deseja <strong>excluir permanentemente</strong> o produto <strong>{product.name}</strong>?
                            </p>
                            
                            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                              <strong>SKU:</strong> {product.sku} • <strong>{getVariantCount(product)} variante{getVariantCount(product) !== 1 ? 's' : ''}</strong>
                            </div>
                            
                            <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                              <p className="text-sm font-medium text-destructive">
                                ⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!
                              </p>
                              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                                <li>• O produto será removido permanentemente do banco de dados</li>
                                <li>• Todas as imagens, variantes e configurações serão excluídas</li>
                                <li>• Esta ação não pode ser desfeita</li>
                                <li>• Produtos em pedidos existentes não podem ser excluídos</li>
                              </ul>
                            </div>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteProduct(product)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir Permanentemente
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;