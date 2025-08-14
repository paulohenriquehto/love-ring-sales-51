import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CSVUploader from '@/components/import/CSVUploader';
import ColumnMapper from '@/components/import/ColumnMapper';
import ImportProgress from '@/components/import/ImportProgress';
import ImportResults from '@/components/import/ImportResults';
import ImportHistory from '@/components/import/ImportHistory';
import { Upload, Settings, Activity, FileCheck, History } from 'lucide-react';

export interface CSVData {
  headers: string[];
  rows: string[][];
  fileName: string;
  totalRows: number;
}

export interface ColumnMapping {
  [csvColumn: string]: string | null;
}

export interface ImportConfig {
  mapping: ColumnMapping;
  duplicateHandling: 'skip' | 'update' | 'error';
  categoryCreation: boolean;
  materialCreation: boolean;
}

const ImportProducts = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [importConfig, setImportConfig] = useState<ImportConfig | null>(null);
  const [importId, setImportId] = useState<string | null>(null);

  const handleCSVUpload = (data: CSVData) => {
    setCsvData(data);
    setActiveTab('mapping');
  };

  const handleMappingComplete = (config: ImportConfig) => {
    setImportConfig(config);
    setActiveTab('progress');
  };

  const handleImportComplete = (id: string) => {
    setImportId(id);
    setActiveTab('results');
  };

  const handleNewImport = () => {
    setCsvData(null);
    setImportConfig(null);
    setImportId(null);
    setActiveTab('upload');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Importação de Produtos</h1>
        <p className="text-muted-foreground mt-2">
          Importe produtos do WooCommerce ou outras plataformas via arquivo CSV
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="mapping" disabled={!csvData} className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Mapeamento
          </TabsTrigger>
          <TabsTrigger value="progress" disabled={!importConfig} className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Progresso
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!importId} className="flex items-center gap-2">
            <FileCheck className="w-4 h-4" />
            Resultados
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload do Arquivo CSV
                </CardTitle>
                <CardDescription>
                  Selecione o arquivo CSV exportado do WooCommerce ou outra plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CSVUploader onUpload={handleCSVUpload} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mapping" className="space-y-4">
            {csvData && (
              <ColumnMapper 
                csvData={csvData} 
                onMappingComplete={handleMappingComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {csvData && importConfig && (
              <ImportProgress 
                csvData={csvData}
                config={importConfig}
                onImportComplete={handleImportComplete}
              />
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {importId && (
              <ImportResults 
                importId={importId}
                onNewImport={handleNewImport}
              />
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <ImportHistory />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default ImportProducts;