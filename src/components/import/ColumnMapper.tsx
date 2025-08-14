import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertCircle, ArrowRight, CheckCircle, Settings, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import WooCommerceDetector from './WooCommerceDetector';
import type { CSVData, ColumnMapping, ImportConfig } from '@/pages/ImportProducts';

interface ColumnMapperProps {
  csvData: CSVData;
  onMappingComplete: (config: ImportConfig) => void;
}

// Available mapping options - Complete WooCommerce compatibility
const MAPPING_OPTIONS = {
  // Basic product fields
  id: 'ID do Produto',
  product_id: 'ID do Produto (External)',
  external_id: 'ID Externo',
  name: 'Nome do Produto',
  sku: 'SKU',
  type: 'Tipo de Produto',
  
  // Descriptions
  description: 'Descrição',
  short_description: 'Descrição Curta',
  purchase_note: 'Nota de Compra',
  
  // Pricing
  base_price: 'Preço Base',
  regular_price: 'Preço Regular',
  sale_price: 'Preço Promocional',
  sale_price_start: 'Início Promoção',
  sale_price_end: 'Fim Promoção',
  
  // Stock management
  stock_quantity: 'Quantidade em Estoque',
  manage_stock: 'Gerenciar Estoque',
  stock_status: 'Status do Estoque',
  in_stock: 'Em Estoque',
  low_stock_amount: 'Quantidade Baixa em Estoque',
  sold_individually: 'Vendido Individualmente',
  
  // Physical properties
  weight: 'Peso (kg)',
  length: 'Comprimento (cm)',
  width: 'Largura (cm)',
  height: 'Altura (cm)',
  
  // Organization
  category: 'Categoria',
  tags: 'Tags',
  shipping_class: 'Classe de Envio',
  
  // Media
  images: 'URLs das Imagens',
  featured_image: 'Imagem Principal',
  
  // Status and visibility
  status: 'Status',
  published: 'Publicado',
  visibility: 'Visibilidade',
  featured: 'Produto em Destaque',
  is_featured: 'É Destaque',
  
  // Position and ordering
  position: 'Posição',
  menu_order: 'Ordem no Menu',
  
  // Tax settings
  tax_status: 'Status Fiscal',
  tax_class: 'Classe Fiscal',
  
  // Product relationships
  parent_sku: 'SKU do Produto Pai',
  grouped_products: 'Produtos Agrupados',
  upsells: 'Vendas Cruzadas',
  cross_sells: 'Produtos Relacionados',
  
  // Variants and attributes
  size: 'Tamanho',
  color: 'Cor',
  material: 'Material',
  attributes: 'Atributos',
  swatches_attributes: 'Atributos de Amostras',
  
  // Attribute 1 fields
  attribute_1_name: 'Nome do Atributo 1',
  attribute_1_values: 'Valores do Atributo 1',
  attribute_1_visible: 'Atributo 1 Visível',
  attribute_1_global: 'Atributo 1 Global',
  attribute_1_default: 'Valor Padrão do Atributo 1',
  
  // Attribute 2 fields
  attribute_2_name: 'Nome do Atributo 2',
  attribute_2_values: 'Valores do Atributo 2',
  attribute_2_visible: 'Atributo 2 Visível',
  attribute_2_global: 'Atributo 2 Global',
  
  // Digital product fields
  downloadable: 'Baixável',
  virtual: 'Virtual',
  download_limit: 'Limite de Download',
  download_expiry: 'Expiração de Download',
  
  // External product fields
  external_url: 'URL Externa',
  button_text: 'Texto do Botão',
  
  // Meta fields
  meta_title: 'Título SEO',
  meta_description: 'Descrição SEO',
  meta_cartflows_redirect_flow_id: 'Meta: CartFlows Redirect Flow ID',
  meta_cartflows_add_to_cart_text: 'Meta: CartFlows Add to Cart Text',
  
  // System
  ignore: 'Ignorar',
};

// Intelligent required fields - accepts base_price OR regular_price for WooCommerce compatibility
const REQUIRED_FIELDS = ['name'];
const PRICE_FIELDS = ['base_price', 'regular_price'];

const ColumnMapper: React.FC<ColumnMapperProps> = ({ csvData, onMappingComplete }) => {
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update' | 'error'>('skip');
  const [categoryCreation, setCategoryCreation] = useState(true);
  const [materialCreation, setMaterialCreation] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  // Enhanced auto-mapping with WooCommerce intelligence
  useEffect(() => {
    const autoMapping: ColumnMapping = {};
    
    csvData.headers.forEach(header => {
      const lowerHeader = header.toLowerCase().trim();
      
      // WooCommerce exact field mappings (Complete CSV compatibility)
      if (lowerHeader === 'id') {
        autoMapping[header] = 'id';
      } else if (lowerHeader === 'name' || lowerHeader === 'product name') {
        autoMapping[header] = 'name';
      } else if (lowerHeader === 'sku') {
        autoMapping[header] = 'sku';
      } else if (lowerHeader === 'type') {
        autoMapping[header] = 'type';
      } else if (lowerHeader === 'description') {
        autoMapping[header] = 'description';
      } else if (lowerHeader === 'short description') {
        autoMapping[header] = 'short_description';
      } else if (lowerHeader === 'purchase note') {
        autoMapping[header] = 'purchase_note';
      } else if (lowerHeader === 'regular price') {
        autoMapping[header] = 'regular_price';
      } else if (lowerHeader === 'sale price') {
        autoMapping[header] = 'sale_price';
      } else if (lowerHeader === 'date sale price starts') {
        autoMapping[header] = 'sale_price_start';
      } else if (lowerHeader === 'date sale price ends') {
        autoMapping[header] = 'sale_price_end';
      } else if (lowerHeader === 'stock' || lowerHeader === 'stock quantity') {
        autoMapping[header] = 'stock_quantity';
      } else if (lowerHeader === 'in stock?' || lowerHeader === 'stock status') {
        autoMapping[header] = 'stock_status';
      } else if (lowerHeader === 'low stock amount') {
        autoMapping[header] = 'low_stock_amount';
      } else if (lowerHeader === 'sold individually?') {
        autoMapping[header] = 'sold_individually';
      } else if (lowerHeader === 'weight (kg)') {
        autoMapping[header] = 'weight';
      } else if (lowerHeader === 'length (cm)') {
        autoMapping[header] = 'length';
      } else if (lowerHeader === 'width (cm)') {
        autoMapping[header] = 'width';
      } else if (lowerHeader === 'height (cm)') {
        autoMapping[header] = 'height';
      } else if (lowerHeader === 'images' || lowerHeader === 'image gallery') {
        autoMapping[header] = 'images';
      } else if (lowerHeader === 'featured image') {
        autoMapping[header] = 'featured_image';
      } else if (lowerHeader === 'categories') {
        autoMapping[header] = 'category';
      } else if (lowerHeader === 'tags') {
        autoMapping[header] = 'tags';
      } else if (lowerHeader === 'shipping class') {
        autoMapping[header] = 'shipping_class';
      } else if (lowerHeader === 'published') {
        autoMapping[header] = 'published';
      } else if (lowerHeader === 'is featured?') {
        autoMapping[header] = 'is_featured';
      } else if (lowerHeader === 'visibility in catalog') {
        autoMapping[header] = 'visibility';
      } else if (lowerHeader === 'tax status') {
        autoMapping[header] = 'tax_status';
      } else if (lowerHeader === 'tax class') {
        autoMapping[header] = 'tax_class';
      } else if (lowerHeader === 'position') {
        autoMapping[header] = 'position';
      } else if (lowerHeader === 'grouped products') {
        autoMapping[header] = 'grouped_products';
      } else if (lowerHeader === 'upsells') {
        autoMapping[header] = 'upsells';
      } else if (lowerHeader === 'swatches attributes') {
        autoMapping[header] = 'swatches_attributes';
      } else if (lowerHeader === 'attribute 1 name') {
        autoMapping[header] = 'attribute_1_name';
      } else if (lowerHeader === 'attribute 1 value(s)') {
        autoMapping[header] = 'attribute_1_values';
      } else if (lowerHeader === 'attribute 1 visible') {
        autoMapping[header] = 'attribute_1_visible';
      } else if (lowerHeader === 'attribute 1 global') {
        autoMapping[header] = 'attribute_1_global';
      } else if (lowerHeader === 'attribute 1 default') {
        autoMapping[header] = 'attribute_1_default';
      } else if (lowerHeader === 'attribute 2 name') {
        autoMapping[header] = 'attribute_2_name';
      } else if (lowerHeader === 'attribute 2 value(s)') {
        autoMapping[header] = 'attribute_2_values';
      } else if (lowerHeader === 'attribute 2 visible') {
        autoMapping[header] = 'attribute_2_visible';
      } else if (lowerHeader === 'attribute 2 global') {
        autoMapping[header] = 'attribute_2_global';
      } else if (lowerHeader === 'meta: cartflows_redirect_flow_id') {
        autoMapping[header] = 'meta_cartflows_redirect_flow_id';
      } else if (lowerHeader === 'meta: cartflows_add_to_cart_text') {
        autoMapping[header] = 'meta_cartflows_add_to_cart_text';
      }
      
      // Legacy mappings for backward compatibility
      else if (lowerHeader === 'weight') {
        autoMapping[header] = 'weight';
      } else if (lowerHeader === 'type' || lowerHeader === 'product type') {
        autoMapping[header] = 'type';
      } else if (lowerHeader === 'status') {
        autoMapping[header] = 'status';
      } else if (lowerHeader === 'featured' || lowerHeader === 'featured?') {
        autoMapping[header] = 'featured';
      } else if (lowerHeader === 'visibility') {
        autoMapping[header] = 'visibility';
      } else if (lowerHeader === 'parent sku' || lowerHeader === 'parent') {
        autoMapping[header] = 'parent_sku';
      } else if (lowerHeader === 'attributes') {
        autoMapping[header] = 'attributes';
      } else if (lowerHeader === 'manage stock?' || lowerHeader === 'manage stock') {
        autoMapping[header] = 'manage_stock';
      } else if (lowerHeader === 'external url') {
        autoMapping[header] = 'external_url';
      } else if (lowerHeader === 'button text') {
        autoMapping[header] = 'button_text';
      } else if (lowerHeader === 'cross-sells') {
        autoMapping[header] = 'cross_sells';
      } else if (lowerHeader === 'meta: _yoast_wpseo_title' || lowerHeader === 'seo title') {
        autoMapping[header] = 'meta_title';
      } else if (lowerHeader === 'meta: _yoast_wpseo_metadesc' || lowerHeader === 'seo description') {
        autoMapping[header] = 'meta_description';
      }
      
      // Attribute mappings (for variants)
      else if (lowerHeader.includes('attribute') || lowerHeader.includes('pa_')) {
        if (lowerHeader.includes('size') || lowerHeader.includes('tamanho')) {
          autoMapping[header] = 'size';
        } else if (lowerHeader.includes('color') || lowerHeader.includes('cor')) {
          autoMapping[header] = 'color';
        } else if (lowerHeader.includes('material')) {
          autoMapping[header] = 'material';
        } else {
          autoMapping[header] = 'attributes';
        }
      }
      
      // Fallback patterns for common variations
      else if (lowerHeader.includes('nome') && lowerHeader.includes('produto')) {
        autoMapping[header] = 'name';
      } else if (lowerHeader.includes('preço') && lowerHeader.includes('regular')) {
        autoMapping[header] = 'regular_price';
      } else if (lowerHeader.includes('preço') && lowerHeader.includes('promocional')) {
        autoMapping[header] = 'sale_price';
      } else if (lowerHeader.includes('estoque')) {
        autoMapping[header] = 'stock_quantity';
      } else if (lowerHeader.includes('categoria')) {
        autoMapping[header] = 'category';
      } else if (lowerHeader.includes('descrição')) {
        autoMapping[header] = 'description';
      } else if (lowerHeader.includes('peso')) {
        autoMapping[header] = 'weight';
      } else if (lowerHeader.includes('imagem') || lowerHeader.includes('foto')) {
        autoMapping[header] = 'images';
      }
    });

    setMapping(autoMapping);
  }, [csvData.headers]);

  const handleMappingChange = (csvColumn: string, targetField: string | null) => {
    setMapping(prev => ({
      ...prev,
      [csvColumn]: targetField === 'none' ? null : targetField,
    }));
  };

  const validateMapping = (): boolean => {
    const mappedFields = Object.values(mapping).filter(Boolean);
    const missingRequired = REQUIRED_FIELDS.filter(field => !mappedFields.includes(field));
    
    // Check if at least one price field is mapped (WooCommerce compatibility)
    const hasPriceField = PRICE_FIELDS.some(field => mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      toast({
        title: "Campos obrigatórios não mapeados",
        description: `Os seguintes campos são obrigatórios: ${missingRequired.map(f => MAPPING_OPTIONS[f as keyof typeof MAPPING_OPTIONS]).join(', ')}`,
        variant: "destructive",
      });
      return false;
    }
    
    if (!hasPriceField) {
      toast({
        title: "Campo de preço obrigatório",
        description: "É necessário mapear pelo menos um campo de preço: 'Preço Base' ou 'Preço Regular'",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleContinue = () => {
    if (!validateMapping()) return;

    const config: ImportConfig = {
      mapping,
      duplicateHandling,
      categoryCreation,
      materialCreation,
    };

    onMappingComplete(config);
  };

  const getMappingStatus = () => {
    const mapped = Object.values(mapping).filter(v => v && v !== 'ignore').length;
    const mappedFields = Object.values(mapping).filter(Boolean);
    const required = REQUIRED_FIELDS.filter(field => mappedFields.includes(field)).length;
    const hasPriceField = PRICE_FIELDS.some(field => mappedFields.includes(field));
    const totalRequired = REQUIRED_FIELDS.length + (hasPriceField ? 0 : 1);
    const actualRequired = required + (hasPriceField ? 1 : 0);
    
    return { mapped, required: actualRequired, total: csvData.headers.length, totalRequired };
  };

  const status = getMappingStatus();

  return (
    <div className="space-y-6">
      <WooCommerceDetector csvData={csvData} />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Mapeamento de Colunas
          </CardTitle>
          <CardDescription>
            Configure como as colunas do CSV serão importadas para o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Badge variant={status.required === status.totalRequired ? "default" : "destructive"}>
                {status.required}/{status.totalRequired} campos obrigatórios
              </Badge>
              <Badge variant="outline">
                {status.mapped}/{status.total} colunas mapeadas
              </Badge>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              {showPreview ? 'Ocultar' : 'Visualizar'} Preview
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Mapeamento das Colunas</h3>
              <ScrollArea className="h-80">
                <div className="space-y-3">
                  {csvData.headers.map((header, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{header}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {csvData.rows[0]?.[index] || 'Sem dados'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="w-48">
                        <Select
                          value={mapping[header] || 'none'}
                          onValueChange={(value) => handleMappingChange(header, value || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar campo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Não mapear</SelectItem>
                            <SelectItem value="ignore">Ignorar</SelectItem>
                            <Separator />
                            {Object.entries(MAPPING_OPTIONS).map(([key, label]) => {
                              if (key === 'ignore') return null;
                              const isRequired = REQUIRED_FIELDS.includes(key);
                              return (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    {label}
                                    {isRequired && (
                                      <Badge variant="destructive" className="text-xs">
                                        Obrigatório
                                      </Badge>
                                    )}
                                  </div>
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Configurações de Importação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="category-creation">
                      Criar categorias automaticamente
                    </Label>
                    <Switch
                      id="category-creation"
                      checked={categoryCreation}
                      onCheckedChange={setCategoryCreation}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="material-creation">
                      Criar materiais automaticamente
                    </Label>
                    <Switch
                      id="material-creation"
                      checked={materialCreation}
                      onCheckedChange={setMaterialCreation}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tratamento de Duplicatas (por SKU)</Label>
                    <Select value={duplicateHandling} onValueChange={(value: any) => setDuplicateHandling(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Pular duplicatas</SelectItem>
                        <SelectItem value="update">Atualizar existentes</SelectItem>
                        <SelectItem value="error">Parar com erro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                      Campos Obrigatórios
                    </h4>
                    <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                      {REQUIRED_FIELDS.map(field => (
                        <li key={field} className="flex items-center gap-2">
                          {Object.values(mapping).includes(field) ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                          {MAPPING_OPTIONS[field as keyof typeof MAPPING_OPTIONS]}
                        </li>
                      ))}
                      <li className="flex items-center gap-2">
                        {PRICE_FIELDS.some(field => Object.values(mapping).includes(field)) ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                        Preço (Base ou Regular)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>Preview dos Dados</CardTitle>
            <CardDescription>
              Visualização das primeiras 5 linhas com o mapeamento atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    {csvData.headers.map((header, index) => (
                      <TableHead key={index} className="min-w-[150px]">
                        <div>
                          <div className="font-medium">{header}</div>
                          <div className="text-xs text-muted-foreground">
                            {mapping[header] ? 
                              MAPPING_OPTIONS[mapping[header] as keyof typeof MAPPING_OPTIONS] || mapping[header] : 
                              'Não mapeado'
                            }
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.rows.slice(0, 5).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex} className="min-w-[150px]">
                          <div className="truncate" title={cell}>
                            {cell || '-'}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Voltar
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={status.required < status.totalRequired}
        >
          Continuar para Importação
        </Button>
      </div>
    </div>
  );
};

export default ColumnMapper;