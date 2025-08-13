import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Type, Plus } from "lucide-react";
import { FontList } from "./FontList";
import { FontForm } from "./FontForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface CustomFont {
  id: string;
  name: string;
  font_family: string;
  google_fonts_url: string;
  css_class_name: string;
  active: boolean;
}

export function FontManager() {
  const [fonts, setFonts] = useState<CustomFont[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadFonts = async () => {
    try {
      const { data, error } = await supabase
        .from("custom_fonts")
        .select("*")
        .order("name");

      if (error) throw error;
      setFonts(data || []);
    } catch (error) {
      console.error("Erro ao carregar fontes:", error);
      toast.error("Erro ao carregar fontes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFonts();
  }, []);

  const handleToggleFont = async (fontId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from("custom_fonts")
        .update({ active })
        .eq("id", fontId);

      if (error) throw error;
      
      setFonts(prev => prev.map(font => 
        font.id === fontId ? { ...font, active } : font
      ));
      
      toast.success(`Fonte ${active ? "ativada" : "desativada"} com sucesso`);
    } catch (error) {
      console.error("Erro ao atualizar fonte:", error);
      toast.error("Erro ao atualizar fonte");
    }
  };

  const handleFontAdded = (newFont: CustomFont) => {
    setFonts(prev => [...prev, newFont]);
    setDialogOpen(false);
    toast.success("Fonte adicionada com sucesso");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            Gerenciamento de Fontes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando fontes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5" />
          Gerenciamento de Fontes
        </CardTitle>
        <CardDescription>
          Gerencie as fontes disponíveis para gravação de produtos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {fonts.filter(f => f.active).length} fontes ativas de {fonts.length} total
          </p>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Fonte
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Fonte</DialogTitle>
              </DialogHeader>
              <FontForm onFontAdded={handleFontAdded} />
            </DialogContent>
          </Dialog>
        </div>

        <FontList 
          fonts={fonts} 
          onToggleFont={handleToggleFont}
        />
      </CardContent>
    </Card>
  );
}