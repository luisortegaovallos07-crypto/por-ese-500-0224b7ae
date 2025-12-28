import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockUsers, mockEstadisticas } from '@/data/mockData';
import { Users, BarChart3, Calendar, Newspaper, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Admin: React.FC = () => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-primary text-primary-foreground';
      case 'profesor': return 'bg-success text-success-foreground';
      default: return 'bg-accent text-accent-foreground';
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-2"><Shield className="h-8 w-8" />Panel de Administración</h1>
          <p className="text-muted-foreground">Gestión de usuarios y estadísticas del sistema.</p>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="p-4 flex items-center gap-3"><Users className="h-8 w-8 text-primary" /><div><p className="text-2xl font-bold">{mockEstadisticas.totalUsuarios}</p><p className="text-xs text-muted-foreground">Usuarios</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><BarChart3 className="h-8 w-8 text-success" /><div><p className="text-2xl font-bold">{mockEstadisticas.promedioGeneral}%</p><p className="text-xs text-muted-foreground">Promedio</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><Calendar className="h-8 w-8 text-warning" /><div><p className="text-2xl font-bold">{mockEstadisticas.eventosProximos}</p><p className="text-xs text-muted-foreground">Eventos</p></div></CardContent></Card>
          <Card><CardContent className="p-4 flex items-center gap-3"><Newspaper className="h-8 w-8 text-accent-foreground" /><div><p className="text-2xl font-bold">{mockEstadisticas.totalSimulacrosRealizados}</p><p className="text-xs text-muted-foreground">Simulacros</p></div></CardContent></Card>
        </div>
        
        <Card>
          <CardHeader><CardTitle>Gestión de Usuarios</CardTitle><CardDescription>Administra los usuarios del sistema</CardDescription></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b"><th className="text-left py-3 px-2">Nombre</th><th className="text-left py-3 px-2">Email</th><th className="text-left py-3 px-2">Rol</th><th className="text-left py-3 px-2">Estado</th></tr></thead>
                <tbody>
                  {mockUsers.map(user => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-medium">{user.nombre} {user.apellido}</td>
                      <td className="py-3 px-2 text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-2"><Badge className={getRoleBadge(user.role)}>{user.role}</Badge></td>
                      <td className="py-3 px-2">{user.activo ? <span className="flex items-center gap-1 text-success"><CheckCircle className="h-4 w-4" />Activo</span> : <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" />Inactivo</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Admin;
