import { useState } from "react";
import { 
  Home, 
  ShoppingBag, 
  Building2, 
  Users, 
  BarChart3, 
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  UserCheck,
  Award,
  Package,
  Upload
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "Sistema de Vendas", url: "/", icon: ShoppingBag },
  { title: "Requisições", url: "/requests", icon: Building2 },
  { title: "Controle de Estoque", url: "/inventory", icon: BarChart3 },
];

const managementItems = [
  { title: "Produtos", url: "/products", icon: Package, roles: ["admin", "manager"] },
  { title: "Importar Produtos", url: "/import-products", icon: Upload, roles: ["admin", "manager"] },
  { title: "Dashboard Importações", url: "/import-dashboard", icon: BarChart3, roles: ["admin", "manager"] },
  { title: "Departamentos", url: "/departments", icon: Building2, roles: ["admin", "manager"] },
  { title: "Usuários", url: "/users", icon: Users, roles: ["admin"] },
  { title: "Relatórios", url: "/reports", icon: BarChart3, roles: ["admin", "manager"] },
];

const enterpriseItems = [
  { title: "Analytics", url: "/analytics", icon: BarChart3, roles: ["admin", "manager"] },
  { title: "Audit Logs", url: "/audit-logs", icon: Shield, roles: ["admin"] },
  { title: "Workflows", url: "/workflows", icon: Settings, roles: ["admin", "manager"] },
  { title: "API Management", url: "/api-management", icon: Settings, roles: ["admin"] },
];

const settingsItems = [
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const collapsed = !open;
  const location = useLocation();
  const { profile } = useAuth();
  const [managementOpen, setManagementOpen] = useState(true);
  
  const currentPath = location.pathname;
  
  const isActive = (path: string) => currentPath === path;
  const hasManagementAccess = managementItems.some(item => 
    !item.roles || item.roles.includes(profile?.role || "")
  );
  const hasEnterpriseAccess = enterpriseItems.some(item => 
    !item.roles || item.roles.includes(profile?.role || "")
  );
  
  const getNavClasses = (isActive: boolean) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
      : "hover:bg-sidebar-accent/50";

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      default: return 'secondary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return Shield;
      case 'manager': return UserCheck;
      default: return Award;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'manager': return 'Gerente';
      default: return 'Vendedor';
    }
  };

  const canAccessItem = (item: any) => {
    if (!item.roles) return true;
    return item.roles.includes(profile?.role || "");
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* User Info */}
        {!collapsed && profile && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {profile.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {profile.full_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {(() => {
                    const RoleIcon = getRoleIcon(profile.role);
                    return <RoleIcon className="w-3 h-3" />;
                  })()}
                  <Badge variant={getRoleBadgeVariant(profile.role)} className="text-xs">
                    {getRoleLabel(profile.role)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(isActive(item.url))}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Management Section */}
        {hasManagementAccess && (
          <SidebarGroup>
            <Collapsible open={managementOpen} onOpenChange={setManagementOpen}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex items-center justify-between w-full hover:bg-sidebar-accent/50 px-2 py-1 rounded-md">
                  <span>Gestão</span>
                  {!collapsed && (
                    managementOpen ? 
                      <ChevronDown className="w-4 h-4" /> : 
                      <ChevronRight className="w-4 h-4" />
                  )}
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuSub>
                      {managementItems
                        .filter(canAccessItem)
                        .map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink 
                                to={item.url} 
                                className={getNavClasses(isActive(item.url))}
                              >
                                <item.icon className="w-4 h-4" />
                                {!collapsed && <span>{item.title}</span>}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Enterprise Section */}
        {hasEnterpriseAccess && (
          <SidebarGroup>
            <Collapsible open={true}>
              <SidebarGroupLabel>
                <span>Recursos Empresariais</span>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuSub>
                      {enterpriseItems
                        .filter(canAccessItem)
                        .map((item) => (
                          <SidebarMenuSubItem key={item.title}>
                            <SidebarMenuSubButton asChild>
                              <NavLink 
                                to={item.url} 
                                className={getNavClasses(isActive(item.url))}
                              >
                                <item.icon className="w-4 h-4" />
                                {!collapsed && <span>{item.title}</span>}
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(isActive(item.url))}>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}