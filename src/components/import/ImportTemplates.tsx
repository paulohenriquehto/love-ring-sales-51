import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Sparkles, Package, Shirt, Watch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportTemplatesProps {
  onClose: () => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  category: string;
  fileName: string;
  sampleData: string[][];
  headers: string[];
}

const ImportTemplates: React.FC<ImportTemplatesProps> = ({ onClose }) => {
  const { toast } = useToast();

  const templates: Template[] = [
    {
      id: 'woocommerce',
      name: 'WooCommerce (Compatibilidade Total)',
      description: 'Template específico para importação direta de exports do WooCommerce com todos os campos suportados',
      icon: Package,
      category: 'WooCommerce',
      fileName: 'template-woocommerce.csv',
      headers: ['Name', 'SKU', 'Description', 'Short description', 'Regular price', 'Sale price', 'Categories', 'Tags', 'Stock', 'Stock status', 'Weight', 'Images', 'Featured image', 'Type', 'Status', 'Tax status', 'Tax class', 'Shipping class', 'Featured?', 'Visibility', 'Attributes'],
      sampleData: [
        ['Produto WooCommerce 1', 'WOO001', 'Descrição completa do produto', 'Descrição curta', '99.90', '79.90', 'Categoria A', 'tag1,tag2', '50', 'instock', '0.5', 'https://example.com/img1.jpg,https://example.com/img2.jpg', 'https://example.com/featured.jpg', 'simple', 'publish', 'taxable', '', '', '1', 'visible', 'Size: M | Color: Blue'],
        ['Produto Variável WooCommerce', 'WOO002-VAR', 'Produto com variações', 'Produto variável', '149.90', '', 'Categoria B', 'variavel', '0', 'instock', '0.8', 'https://example.com/var1.jpg', 'https://example.com/var-main.jpg', 'variable', 'publish', 'taxable', '', '', '0', 'visible', 'Size: P,M,G | Color: Red,Blue,Green'],
      ]
    },
    {
      id: 'jewelry',
      name: 'Joias e Bijuterias',
      description: 'Template completo para produtos de joalheria com variantes de material e tamanho',
      icon: Sparkles,
      category: 'Popular',
      fileName: 'template-joias.csv',
      headers: ['product_name', 'sku', 'description', 'regular_price', 'weight', 'category', 'stock_quantity', 'images', 'size', 'color', 'material'],
      sampleData: [
        ['Anel de Ouro 18k', 'ANL001', 'Anel em ouro 18k polido', '299.99', '15.5', 'Anéis', '10', 'https://example.com/anel1.jpg', '16', 'Dourado', 'Ouro 18k'],
        ['Pulseira Prata 925', 'PUL001', 'Pulseira elegante em prata', '129.90', '25.8', 'Pulseiras', '15', 'https://example.com/pulseira1.jpg', 'M', 'Prateado', 'Prata 925'],
      ]
    },
    {
      id: 'clothing',
      name: 'Roupas e Vestuário',
      description: 'Template para roupas com variantes de tamanho, cor e tecido',
      icon: Shirt,
      category: 'Moda',
      fileName: 'template-roupas.csv',
      headers: ['product_name', 'sku', 'description', 'regular_price', 'category', 'stock_quantity', 'images', 'size', 'color', 'material', 'brand'],
      sampleData: [
        ['Camiseta Básica', 'CAM001', 'Camiseta 100% algodão', '39.90', 'Camisetas', '50', 'https://example.com/camiseta1.jpg', 'M', 'Azul', 'Algodão', 'Marca X'],
        ['Calça Jeans', 'CAL001', 'Calça jeans slim fit', '89.90', 'Calças', '30', 'https://example.com/calca1.jpg', '42', 'Azul', 'Jeans', 'Marca Y'],
      ]
    },
    {
      id: 'electronics',
      name: 'Eletrônicos',
      description: 'Template para produtos eletrônicos com especificações técnicas',
      icon: Watch,
      category: 'Tecnologia',
      fileName: 'template-eletronicos.csv',
      headers: ['product_name', 'sku', 'description', 'regular_price', 'weight', 'category', 'stock_quantity', 'images', 'brand', 'model', 'warranty'],
      sampleData: [
        ['Smartwatch Pro', 'SW001', 'Smartwatch com GPS e monitor cardíaco', '299.90', '45.5', 'Relógios', '20', 'https://example.com/watch1.jpg', 'TechBrand', 'Pro 2024', '12 meses'],
        ['Fone Bluetooth', 'FON001', 'Fone sem fio com cancelamento de ruído', '199.90', '25.0', 'Áudio', '35', 'https://example.com/fone1.jpg', 'AudioTech', 'Noise X', '6 meses'],
      ]
    },
    {
      id: 'general',
      name: 'Produtos Gerais',
      description: 'Template básico para qualquer tipo de produto',
      icon: Package,
      category: 'Básico',
      fileName: 'template-geral.csv',
      headers: ['product_name', 'sku', 'description', 'regular_price', 'category', 'stock_quantity', 'images'],
      sampleData: [
        ['Produto Exemplo 1', 'PROD001', 'Descrição do produto exemplo', '49.90', 'Categoria A', '20', 'https://example.com/produto1.jpg'],
        ['Produto Exemplo 2', 'PROD002', 'Descrição do produto exemplo 2', '79.90', 'Categoria B', '15', 'https://example.com/produto2.jpg'],
      ]
    }
  ];

  const generateCSV = (template: Template): string => {
    const csvContent = [
      template.headers.join(','),
      ...template.sampleData.map(row => 
        row.map(cell => `"${cell}"`).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const downloadTemplate = (template: Template) => {
    try {
      const csvContent = generateCSV(template);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', template.fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      toast({
        title: "Template baixado",
        description: `O template "${template.name}" foi baixado com sucesso`,
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o template",
        variant: "destructive",
      });
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'WooCommerce': return 'bg-orange-500';
      case 'Popular': return 'bg-blue-500';
      case 'Moda': return 'bg-purple-500';
      case 'Tecnologia': return 'bg-green-500';
      case 'Básico': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Templates de Importação
          </DialogTitle>
          <DialogDescription>
            Baixe templates prontos para facilitar a importação dos seus produtos. 
            Cada template inclui exemplos e todas as colunas necessárias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Card key={template.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-primary/10`}>
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <Badge 
                            variant="secondary" 
                            className={`text-white text-xs ${getCategoryColor(template.category)}`}
                          >
                            {template.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Colunas incluídas:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.headers.slice(0, 6).map((header, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {header.replace('_', ' ')}
                          </Badge>
                        ))}
                        {template.headers.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.headers.length - 6} mais
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-muted-foreground">
                        {template.sampleData.length} produtos de exemplo
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => downloadTemplate(template)}
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Como usar os templates
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>1. <strong>Baixe</strong> o template mais adequado ao seu tipo de produto</li>
                    <li>2. <strong>Abra</strong> o arquivo CSV no Excel ou Google Sheets</li>
                    <li>3. <strong>Substitua</strong> os dados de exemplo pelos seus produtos</li>
                    <li>4. <strong>Salve</strong> o arquivo como CSV (UTF-8)</li>
                    <li>5. <strong>Importe</strong> através da página de importação</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTemplates;