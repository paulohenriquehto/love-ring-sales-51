import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SymbolImageUpload } from "./SymbolImageUpload";
import { supabase } from "@/integrations/supabase/client";
import { EngravingSymbol, EngravingCategory } from "@/types/engraving";
import { toast } from "sonner";

interface SymbolFormProps {
  symbol?: EngravingSymbol | null;
  categories: EngravingCategory[];
  onSaved: () => void;
  onCancel: () => void;
}

export function SymbolForm({ symbol, categories, onSaved, onCancel }: SymbolFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    unicode_char: "",
    price_adjustment: 0,
    active: true,
    image_url: "",
    svg_content: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (symbol) {
      setFormData({
        name: symbol.name || "",
        category_id: symbol.category_id || "",
        unicode_char: symbol.unicode_char || "",
        price_adjustment: symbol.price_adjustment || 0,
        active: symbol.active ?? true,
        image_url: (symbol as any).image_url || "",
        svg_content: (symbol as any).svg_content || ""
      });
    }
  }, [symbol]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.category_id) {
      toast.error("Nome e categoria são obrigatórios");
      return;
    }

    setIsSubmitting(true);

    try {
      const symbolData = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        unicode_char: formData.unicode_char || null,
        price_adjustment: formData.price_adjustment,
        active: formData.active,
        image_url: formData.image_url || null,
        svg_content: formData.svg_content || null
      };

      if (symbol) {
        // Update existing symbol
        const { error } = await supabase
          .from("engraving_symbols")
          .update(symbolData)
          .eq("id", symbol.id);

        if (error) throw error;
        toast.success("Símbolo atualizado com sucesso!");
      } else {
        // Create new symbol
        const { error } = await supabase
          .from("engraving_symbols")
          .insert([symbolData]);

        if (error) throw error;
        toast.success("Símbolo criado com sucesso!");
      }

      onSaved();
    } catch (error) {
      console.error("Erro ao salvar símbolo:", error);
      toast.error("Erro ao salvar símbolo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
  };

  const handleImageRemoved = () => {
    setFormData(prev => ({ ...prev, image_url: "" }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Nome do símbolo"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select 
            value={formData.category_id} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="unicode_char">Caractere Unicode</Label>
          <Input
            id="unicode_char"
            value={formData.unicode_char}
            onChange={(e) => setFormData(prev => ({ ...prev, unicode_char: e.target.value }))}
            placeholder="♥ ★ ⚽ etc."
          />
          <p className="text-xs text-muted-foreground">
            Caractere usado como fallback se não houver imagem
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_adjustment">Ajuste de Preço (R$)</Label>
          <Input
            id="price_adjustment"
            type="number"
            step="0.01"
            min="0"
            value={formData.price_adjustment}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              price_adjustment: parseFloat(e.target.value) || 0 
            }))}
            placeholder="0.00"
          />
        </div>
      </div>

      <SymbolImageUpload
        symbolId={symbol?.id}
        currentImageUrl={formData.image_url}
        onImageUploaded={handleImageUploaded}
        onImageRemoved={handleImageRemoved}
      />

      <div className="space-y-2">
        <Label htmlFor="svg_content">Conteúdo SVG (Opcional)</Label>
        <Textarea
          id="svg_content"
          value={formData.svg_content}
          onChange={(e) => setFormData(prev => ({ ...prev, svg_content: e.target.value }))}
          placeholder="<svg>...</svg>"
          className="font-mono text-sm"
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          Código SVG para renderização vetorial (opcional)
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
        />
        <Label htmlFor="active">Símbolo ativo</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : (symbol ? "Atualizar" : "Criar")}
        </Button>
      </div>
    </form>
  );
}