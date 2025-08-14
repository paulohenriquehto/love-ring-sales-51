import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SymbolForm } from "./SymbolForm";
import { CategoryForm } from "./CategoryForm";
import { supabase } from "@/integrations/supabase/client";
import { EngravingCategory, EngravingSymbol } from "@/types/engraving";
import { toast } from "sonner";

export function SymbolManager() {
  const [categories, setCategories] = useState<EngravingCategory[]>([]);
  const [symbols, setSymbols] = useState<EngravingSymbol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [editingSymbol, setEditingSymbol] = useState<EngravingSymbol | null>(null);
  const [editingCategory, setEditingCategory] = useState<EngravingCategory | null>(null);
  const [symbolDialogOpen, setSymbolDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesResult, symbolsResult] = await Promise.all([
        supabase
          .from("engraving_categories")
          .select("*")
          .order("sort_order"),
        supabase
          .from("engraving_symbols")
          .select("*")
          .order("name")
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (symbolsResult.error) throw symbolsResult.error;

      setCategories(categoriesResult.data || []);
      setSymbols(symbolsResult.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar símbolos e categorias");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSymbol = async (symbolId: string) => {
    if (!confirm("Tem certeza que deseja excluir este símbolo?")) return;

    try {
      const { error } = await supabase
        .from("engraving_symbols")
        .delete()
        .eq("id", symbolId);

      if (error) throw error;

      setSymbols(symbols.filter(s => s.id !== symbolId));
      toast.success("Símbolo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir símbolo:", error);
      toast.error("Erro ao excluir símbolo");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta categoria? Todos os símbolos desta categoria também serão excluídos.")) return;

    try {
      const { error } = await supabase
        .from("engraving_categories")
        .delete()
        .eq("id", categoryId);

      if (error) throw error;

      setCategories(categories.filter(c => c.id !== categoryId));
      setSymbols(symbols.filter(s => s.category_id !== categoryId));
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria");
    }
  };

  const filteredSymbols = symbols.filter(symbol => {
    const matchesSearch = symbol.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || symbol.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || "Sem categoria";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Símbolos</h2>
        
        <div className="flex gap-2">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                onClick={() => setEditingCategory(null)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              <CategoryForm
                category={editingCategory}
                onSaved={() => {
                  loadData();
                  setCategoryDialogOpen(false);
                  setEditingCategory(null);
                }}
                onCancel={() => {
                  setCategoryDialogOpen(false);
                  setEditingCategory(null);
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={symbolDialogOpen} onOpenChange={setSymbolDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingSymbol(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Símbolo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSymbol ? 'Editar Símbolo' : 'Novo Símbolo'}
                </DialogTitle>
              </DialogHeader>
              <SymbolForm
                symbol={editingSymbol}
                categories={categories}
                onSaved={() => {
                  loadData();
                  setSymbolDialogOpen(false);
                  setEditingSymbol(null);
                }}
                onCancel={() => {
                  setSymbolDialogOpen(false);
                  setEditingSymbol(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="symbols" className="w-full">
        <TabsList>
          <TabsTrigger value="symbols">Símbolos</TabsTrigger>
          <TabsTrigger value="categories">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="symbols" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar símbolos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="all">Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSymbols.map(symbol => (
              <Card key={symbol.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{symbol.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {getCategoryName(symbol.category_id)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingSymbol(symbol);
                          setSymbolDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSymbol(symbol.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-center h-16 border border-border rounded-lg bg-muted/20">
                      {symbol.image_url ? (
                        <img 
                          src={symbol.image_url} 
                          alt={symbol.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <span className="text-2xl">{symbol.unicode_char}</span>
                      )}
                    </div>
                    <div className="text-sm text-center">
                      <p className="text-muted-foreground">Ajuste de preço:</p>
                      <p className="font-medium">
                        {symbol.price_adjustment > 0 
                          ? `+R$ ${symbol.price_adjustment.toFixed(2)}`
                          : 'Gratuito'
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSymbols.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum símbolo encontrado</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span>{category.icon}</span>
                        {category.name}
                      </CardTitle>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setCategoryDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Ordem: {category.sort_order}</p>
                    <p>
                      Símbolos: {symbols.filter(s => s.category_id === category.id).length}
                    </p>
                    <Badge variant={category.active ? "default" : "secondary"}>
                      {category.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma categoria encontrada</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}