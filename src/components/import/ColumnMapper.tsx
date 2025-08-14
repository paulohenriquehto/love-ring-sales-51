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
import type { CSVData, ColumnMapping, ImportConfig } from '@/pages/ImportProducts';

interface ColumnMapperProps {
  csvData: CSVData;
  onMappingComplete: (config: ImportConfig) => void;
}

// Available mapping options
const MAPPING_OPTIONS = {
  // Product fields
  name: 'Nome do Produto',
  sku: 'SKU',
  description: 'Descrição',
  base_price: 'Preço Base',
  weight: 'Peso (kg)',
  
  // Category and classification
  category: 'Categoria',
  
  // Stock
  stock_quantity: 'Quantidade em Estoque',
  
  // Images
  images: 'URLs das Imagens',
  
  // Variants
  size: 'Tamanho',
  color: 'Cor',
  material: 'Material',
  width: 'Largura',
  
  // WooCommerce specific
  type: 'Tipo de Produto',
  status: 'Status',
  regular_price: 'Preço Regular',
  sale_price: 'Preço Promocional',
  
  // Ignore
  ignore: 'Ignorar',
};

const REQUIRED_FIELDS = ['name', 'base_price'];

const ColumnMapper: React.FC<ColumnMapperProps> = ({ csvData, onMappingComplete }) => {
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update' | 'error'>('skip');
  const [categoryCreation, setCategoryCreation] = useState(true);
  const [materialCreation, setMaterialCreation] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

  // Auto-map columns based on similarity
  useEffect(() => {
    const autoMapping: ColumnMapping = {};
    
    csvData.headers.forEach(header => {
      const lowerHeader = header.toLowerCase().trim();
      
      // Common mappings
      if (lowerHeader.includes('name') && lowerHeader.includes('product')) {
        autoMapping[header] = 'name';
      } else if (lowerHeader === 'sku' || lowerHeader === 'código') {
        autoMapping[header] = 'sku';
      } else if (lowerHeader.includes('description') || lowerHeader.includes('descrição')) {
        autoMapping[header] = 'description';
      } else if (lowerHeader.includes('price') && (lowerHeader.includes('regular') || lowerHeader.includes('base'))) {
        autoMapping[header] = 'base_price';
      } else if (lowerHeader.includes('price') && !lowerHeader.includes('sale')) {
        autoMapping[header] = 'base_price';
      } else if (lowerHeader.includes('weight') || lowerHeader.includes('peso')) {
        autoMapping[header] = 'weight';
      } else if (lowerHeader.includes('categor')) {
        autoMapping[header] = 'category';
      } else if (lowerHeader.includes('stock') || lowerHeader.includes('estoque')) {
        autoMapping[header] = 'stock_quantity';
      } else if (lowerHeader.includes('image') || lowerHeader.includes('foto')) {
        autoMapping[header] = 'images';
      } else if (lowerHeader.includes('size') || lowerHeader.includes('tamanho')) {
        autoMapping[header] = 'size';
      } else if (lowerHeader.includes('color') || lowerHeader.includes('cor')) {
        autoMapping[header] = 'color';
      } else if (lowerHeader.includes('material')) {
        autoMapping[header] = 'material';
      } else if (lowerHeader.includes('width') || lowerHeader.includes('largura')) {
        autoMapping[header] = 'width';
      }
    });

    setMapping(autoMapping);
  }, [csvData.headers]);

  const handleMappingChange = (csvColumn: string, targetField: string | null) => {
    setMapping(prev => ({
      ...prev,
      [csvColumn]: targetField,
    }));
  };

  const validateMapping = (): boolean => {
    const mappedFields = Object.values(mapping).filter(Boolean);
    const missingRequired = REQUIRED_FIELDS.filter(field => !mappedFields.includes(field));
    
    if (missingRequired.length > 0) {
      toast({
        title: "Campos obrigatórios não mapeados",
        description: `Os seguintes campos são obrigatórios: ${missingRequired.map(f => MAPPING_OPTIONS[f as keyof typeof MAPPING_OPTIONS]).join(', ')}`,
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
    const required = REQUIRED_FIELDS.filter(field => Object.values(mapping).includes(field)).length;
    return { mapped, required, total: csvData.headers.length };
  };

  const status = getMappingStatus();

  return (
    <div className="space-y-6">
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
              <Badge variant={status.required === REQUIRED_FIELDS.length ? "default" : "destructive"}>
                {status.required}/{REQUIRED_FIELDS.length} campos obrigatórios
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
                          value={mapping[header] || ''}
                          onValueChange={(value) => handleMappingChange(header, value || null)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar campo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Não mapear</SelectItem>
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
          disabled={status.required < REQUIRED_FIELDS.length}
        >
          Continuar para Importação
        </Button>
      </div>
    </div>
  );
};

export default ColumnMapper;