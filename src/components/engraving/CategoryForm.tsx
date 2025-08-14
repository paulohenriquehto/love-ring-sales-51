import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { EngravingCategory } from "@/types/engraving";
import { toast } from "sonner";

interface CategoryFormProps {
  category?: EngravingCategory | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function CategoryForm({ category, onSaved, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    icon: "",
    description: "",
    sort_order: 0,
    active: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        icon: category.icon || "",
        description: (category as any).description || "",
        sort_order: category.sort_order || 0,
        active: category.active ?? true
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryData = {
        name: formData.name.trim(),
        icon: formData.icon || "📁",
        description: formData.description || null,
        sort_order: formData.sort_order,
        active: formData.active
      };

      if (category) {
        // Update existing category
        const { error } = await supabase
          .from("engraving_categories")
          .update(categoryData)
          .eq("id", category.id);

        if (error) throw error;
        toast.success("Categoria atualizada com sucesso!");
      } else {
        // Create new category
        const { error } = await supabase
          .from("engraving_categories")
          .insert([categoryData]);

        if (error) throw error;
        toast.success("Categoria criada com sucesso!");
      }

      onSaved();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error("Erro ao salvar categoria");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nome da categoria"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="icon">Ícone</Label>
        <Input
          id="icon"
          value={formData.icon}
          onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
          placeholder="♥ ⚽ 📁 etc."
        />
        <p className="text-xs text-muted-foreground">
          Emoji ou caractere que representa a categoria
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Descrição da categoria"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sort_order">Ordem de Exibição</Label>
        <Input
          id="sort_order"
          type="number"
          min="0"
          value={formData.sort_order}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            sort_order: parseInt(e.target.value) || 0 
          }))}
          placeholder="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="active"
          checked={formData.active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
        />
        <Label htmlFor="active">Categoria ativa</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : (category ? "Atualizar" : "Criar")}
        </Button>
      </div>
    </form>
  );
}