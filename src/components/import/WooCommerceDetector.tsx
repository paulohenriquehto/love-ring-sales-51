import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, Zap } from 'lucide-react';
import type { CSVData } from '@/pages/ImportProducts';

interface WooCommerceDetectorProps {
  csvData: CSVData;
}

const WooCommerceDetector: React.FC<WooCommerceDetectorProps> = ({ csvData }) => {
  const detectWooCommerce = (): { isWooCommerce: boolean; confidence: number; detectedFields: string[]; compatibilityScore: number } => {
    const wooCommerceFields = [
      'name',
      'sku', 
      'regular price',
      'sale price',
      'categories',
      'tags',
      'stock',
      'stock status',
      'weight',
      'images',
      'type',
      'status',
      'tax status',
      'tax class',
      'shipping class',
      'featured?',
      'visibility',
      'description',
      'short description',
      'parent sku',
      'attributes',
      'manage stock?',
      'featured image'
    ];

    const headers = csvData.headers.map(h => h.toLowerCase().trim());
    const detectedFields: string[] = [];
    
    wooCommerceFields.forEach(field => {
      if (headers.some(h => h === field || h.includes(field.replace('?', '')))) {
        detectedFields.push(field);
      }
    });

    const confidence = (detectedFields.length / wooCommerceFields.length) * 100;
    const isWooCommerce = confidence > 30; // Se mais de 30% dos campos WooCommerce foram detectados
    const compatibilityScore = Math.min(95, confidence + (detectedFields.includes('name') ? 5 : 0));

    return { isWooCommerce, confidence, detectedFields, compatibilityScore };
  };

  const analysis = detectWooCommerce();

  if (!analysis.isWooCommerce) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Package className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100">
                Export WooCommerce Detectado!
              </h4>
              <Badge variant="secondary" className="bg-orange-500 text-white">
                {Math.round(analysis.compatibilityScore)}% Compatível
              </Badge>
            </div>
            
            <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
              Detectamos que este CSV é um export do WooCommerce. Nosso sistema tem {analysis.compatibilityScore}% de compatibilidade 
              com os campos identificados e fará o mapeamento automático dos dados.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Campos Detectados ({analysis.detectedFields.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {analysis.detectedFields.slice(0, 8).map((field, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-800">
                      {field}
                    </Badge>
                  ))}
                  {analysis.detectedFields.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{analysis.detectedFields.length - 8} mais
                    </Badge>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Otimizações Aplicadas
                  </span>
                </div>
                <ul className="text-xs text-orange-800 dark:text-orange-200 space-y-1">
                  <li>✓ Mapeamento automático de campos</li>
                  <li>✓ Processamento de variantes WooCommerce</li>
                  <li>✓ Validação de preços e estoque</li>
                  <li>✓ Tratamento de status e visibilidade</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WooCommerceDetector;