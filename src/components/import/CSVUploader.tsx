import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CSVData } from '@/pages/ImportProducts';

interface CSVUploaderProps {
  onUpload: (data: CSVData) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onUpload }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const parseCSV = useCallback((text: string): { headers: string[]; rows: string[][] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) throw new Error('CSV vazio');

    // Detect delimiter (comma or semicolon)
    const firstLine = lines[0];
    const commaCount = (firstLine.match(/,/g) || []).length;
    const semicolonCount = (firstLine.match(/;/g) || []).length;
    const delimiter = semicolonCount > commaCount ? ';' : ',';

    const parseRow = (row: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
          if (inQuotes && row[i + 1] === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      result.push(current.trim());
      return result;
    };

    const headers = parseRow(lines[0]);
    const rows = lines.slice(1).map(parseRow);

    return { headers, rows };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 80));
      }, 100);

      const text = await file.text();
      clearInterval(progressInterval);
      setUploadProgress(90);

      const { headers, rows } = parseCSV(text);
      
      // Validate minimum requirements
      if (headers.length === 0) {
        throw new Error('CSV deve ter pelo menos uma coluna');
      }

      if (rows.length === 0) {
        throw new Error('CSV deve ter pelo menos uma linha de dados');
      }

      setUploadProgress(100);

      const csvData: CSVData = {
        headers,
        rows,
        fileName: file.name,
        totalRows: rows.length,
      };

      setTimeout(() => {
        onUpload(csvData);
        toast({
          title: "Upload concluído",
          description: `${rows.length} produtos encontrados no arquivo ${file.name}`,
        });
      }, 500);

    } catch (error) {
      console.error('Erro ao processar CSV:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setUploadProgress(0);
      }, 1000);
    }
  }, [parseCSV, onUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
  });

  if (isProcessing) {
    return (
      <Card className="p-8">
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2">Processando arquivo...</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Analisando estrutura do CSV
            </p>
            <Progress value={uploadProgress} className="w-64" />
            <p className="text-xs text-muted-foreground mt-2">
              {uploadProgress}% concluído
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card 
        {...getRootProps()} 
        className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <CardContent className="flex flex-col items-center space-y-4 p-0">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold mb-2">
              {isDragActive ? 'Solte o arquivo aqui' : 'Selecione ou arraste um arquivo CSV'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Suporta arquivos CSV do WooCommerce e outras plataformas
            </p>
            <Button variant="outline" type="button">
              Selecionar Arquivo
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="font-medium">Formatos Suportados</h4>
              <p className="text-sm text-muted-foreground">CSV, TSV</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <h4 className="font-medium">Tamanho Máximo</h4>
              <p className="text-sm text-muted-foreground">10MB por arquivo</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="font-medium">Encoding</h4>
              <p className="text-sm text-muted-foreground">UTF-8 recomendado</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
              Dicas para melhor importação
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Certifique-se de que as colunas essenciais estão presentes: Nome, Preço, SKU</li>
              <li>• URLs de imagens devem ser válidas e acessíveis</li>
              <li>• Categorias inexistentes serão criadas automaticamente</li>
              <li>• Variações de produto são detectadas automaticamente</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CSVUploader;