import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Department } from '@/types/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const DepartmentManager = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget_limit: ''
  });
  const { toast } = useToast();

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar departamentos",
        description: "Tente novamente mais tarde."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const departmentData = {
        name: formData.name,
        description: formData.description,
        budget_limit: formData.budget_limit ? parseFloat(formData.budget_limit) : null
      };

      if (editingDepartment) {
        const { error } = await supabase
          .from('departments')
          .update(departmentData)
          .eq('id', editingDepartment.id);

        if (error) throw error;

        toast({
          title: "Departamento atualizado",
          description: "As alterações foram salvas com sucesso."
        });
      } else {
        const { error } = await supabase
          .from('departments')
          .insert([departmentData]);

        if (error) throw error;

        toast({
          title: "Departamento criado",
          description: "O novo departamento foi adicionado com sucesso."
        });
      }

      setFormData({ name: '', description: '', budget_limit: '' });
      setEditingDepartment(null);
      setIsDialogOpen(false);
      fetchDepartments();
    } catch (error) {
      console.error('Error saving department:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar departamento",
        description: "Tente novamente mais tarde."
      });
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      budget_limit: department.budget_limit?.toString() || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este departamento?')) return;

    try {
      const { error } = await supabase
        .from('departments')
        .update({ active: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Departamento desativado",
        description: "O departamento foi desativado com sucesso."
      });

      fetchDepartments();
    } catch (error) {
      console.error('Error deactivating department:', error);
      toast({
        variant: "destructive",
        title: "Erro ao desativar departamento",
        description: "Tente novamente mais tarde."
      });
    }
  };

  if (loading) {
    return <div className="p-6">Carregando departamentos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Gerenciar Departamentos</h2>
          <p className="text-muted-foreground">Administre os departamentos da organização</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingDepartment(null);
              setFormData({ name: '', description: '', budget_limit: '' });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Departamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartment ? 'Editar Departamento' : 'Criar Novo Departamento'}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment 
                  ? 'Atualize as informações do departamento.'
                  : 'Preencha os dados para criar um novo departamento.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Departamento</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="budget_limit">Limite de Orçamento (R$)</Label>
                <Input
                  id="budget_limit"
                  type="number"
                  step="0.01"
                  value={formData.budget_limit}
                  onChange={(e) => setFormData({ ...formData, budget_limit: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingDepartment ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <Card key={department.id} className={!department.active ? 'opacity-50' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {department.name}
                  </CardTitle>
                  <CardDescription>{department.description}</CardDescription>
                </div>
                <Badge variant={department.active ? 'default' : 'secondary'}>
                  {department.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {department.budget_limit && (
                <p className="text-sm text-muted-foreground mb-4">
                  Orçamento: R$ {department.budget_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(department)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(department.id)}
                  disabled={!department.active}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nenhum departamento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando o primeiro departamento da organização.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Departamento
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DepartmentManager;