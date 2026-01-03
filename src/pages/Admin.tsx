import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  Shield, 
  CheckCircle, 
  XCircle,
  Plus,
  Pencil,
  Save,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import './Admin.css';

interface UserWithRole {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  role: UserRole;
  created_at: string | null;
}

interface UserFormData {
  nombre: string;
  email: string;
  password: string;
  newPassword: string;
  role: UserRole;
  activo: boolean;
}

const initialFormData: UserFormData = {
  nombre: '',
  email: '',
  password: '',
  newPassword: '',
  role: 'estudiante',
  activo: true,
};

const Admin: React.FC = () => {
  const { user: currentUser, isAdmin, profile } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithRole | null>(null);

  const canManageUsers = isAdmin;

  // Cargar usuarios desde Supabase
  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Obtener perfiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Obtener roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combinar datos
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          nombre: profile.nombre,
          email: profile.email,
          activo: profile.activo ?? true,
          role: (userRole?.role as UserRole) || 'estudiante',
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El correo no es válido';
    }

    if (!isEditing && !formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (!isEditing && formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar nueva contraseña solo si se ingresó algo
    if (isEditing && formData.newPassword.trim() && formData.newPassword.length < 6) {
      errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Abrir diálogo para crear usuario
  const handleOpenCreateDialog = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingUserId(null);
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  // Abrir diálogo para editar usuario
  const handleOpenEditDialog = (user: UserWithRole) => {
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '',
      newPassword: '',
      role: user.role,
      activo: user.activo,
    });
    setFormErrors({});
    setIsEditing(true);
    setEditingUserId(user.id);
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  // Cerrar diálogo
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingUserId(null);
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof UserFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Crear nuevo usuario con Edge Function (no inicia sesión)
  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        throw new Error('No hay sesión activa');
      }

      const response = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          nombre: formData.nombre.trim(),
          role: formData.role,
          activo: formData.activo,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error al crear usuario');
      }

      if (response.data?.error) {
        if (response.data.error.includes('already') || response.data.error.includes('exists')) {
          toast({
            title: 'Error',
            description: 'Este correo ya está registrado.',
            variant: 'destructive',
          });
          return;
        }
        throw new Error(response.data.error);
      }

      toast({
        title: 'Usuario creado',
        description: `El usuario ${formData.nombre} ha sido creado exitosamente.`,
      });

      handleCloseDialog();
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el usuario.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Actualizar usuario existente
  const handleUpdateUser = async () => {
    if (!validateForm() || !editingUserId) return;

    setSaving(true);
    try {
      // Actualizar perfil en la base de datos
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          nombre: formData.nombre.trim(),
          activo: formData.activo,
        })
        .eq('id', editingUserId);

      if (profileError) {
        console.error('Error updating profile:', profileError);
        throw new Error('No se pudo actualizar el perfil: ' + profileError.message);
      }

      // Actualizar o insertar rol
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', editingUserId)
        .maybeSingle();

      if (existingRole) {
        // Actualizar rol existente
        const { error: roleUpdateError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', editingUserId);

        if (roleUpdateError) {
          console.error('Error updating role:', roleUpdateError);
          throw new Error('No se pudo actualizar el rol: ' + roleUpdateError.message);
        }
      } else {
        // Insertar nuevo rol
        const { error: roleInsertError } = await supabase
          .from('user_roles')
          .insert({ user_id: editingUserId, role: formData.role });

        if (roleInsertError) {
          console.error('Error inserting role:', roleInsertError);
          throw new Error('No se pudo asignar el rol: ' + roleInsertError.message);
        }
      }

      // Actualizar contraseña si se proporcionó una nueva
      if (formData.newPassword.trim()) {
        console.log('Updating password for user:', editingUserId);
        
        const { data: passwordResponse, error: passwordError } = await supabase.functions.invoke('admin-update-password', {
          body: {
            userId: editingUserId,
            newPassword: formData.newPassword.trim(),
          },
        });

        if (passwordError) {
          console.error('Password update function error:', passwordError);
          throw new Error('Error al actualizar contraseña: ' + passwordError.message);
        }

        if (passwordResponse?.error) {
          console.error('Password update response error:', passwordResponse.error);
          throw new Error('Error al actualizar contraseña: ' + passwordResponse.error);
        }

        console.log('Password updated successfully');
      }

      toast({
        title: 'Usuario actualizado',
        description: formData.newPassword.trim() 
          ? 'Los datos y la contraseña del usuario han sido actualizados exitosamente.'
          : 'Los datos del usuario han sido actualizados exitosamente.',
      });

      handleCloseDialog();
      await fetchUsers();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el usuario.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Cambiar estado activo/inactivo
  const handleToggleUserStatus = async (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (userId === currentUser?.id) {
      toast({
        title: 'Operación no permitida',
        description: 'No puedes desactivar tu propia cuenta.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newStatus = !targetUser.activo;
      const { error } = await supabase
        .from('profiles')
        .update({ activo: newStatus })
        .eq('id', userId);

      if (error) throw error;

      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, activo: newStatus } : u
      ));

      toast({
        title: newStatus ? 'Usuario activado' : 'Usuario desactivado',
        description: `${targetUser.nombre} ha sido ${newStatus ? 'activado' : 'desactivado'}.`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado del usuario.',
        variant: 'destructive',
      });
    }
  };

  // Confirmar eliminación de usuario
  const handleConfirmDeleteUser = (user: UserWithRole) => {
    if (user.id === currentUser?.id) {
      toast({
        title: 'Operación no permitida',
        description: 'No puedes eliminar tu propia cuenta.',
        variant: 'destructive',
      });
      return;
    }
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      // Eliminar rol
      await supabase.from('user_roles').delete().eq('user_id', userToDelete.id);
      
      // Eliminar resultados de simulacro
      await supabase.from('resultados_simulacro').delete().eq('user_id', userToDelete.id);
      
      // Eliminar mensajes
      await supabase.from('mensajes').delete().or(`remitente_id.eq.${userToDelete.id},destinatario_id.eq.${userToDelete.id}`);
      
      // Eliminar perfil
      const { error } = await supabase.from('profiles').delete().eq('id', userToDelete.id);
      
      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      toast({
        title: 'Usuario eliminado',
        description: `${userToDelete.nombre} ha sido eliminado del sistema.`,
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario.',
        variant: 'destructive',
      });
    } finally {
      setDeleteConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  // Obtener badge de rol
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-primary text-primary-foreground';
      case 'profesor':
        return 'bg-success text-success-foreground';
      default:
        return 'bg-accent text-accent-foreground';
    }
  };

  // Obtener label de rol
  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'profesor':
        return 'Profesor';
      default:
        return 'Estudiante';
    }
  };

  // Estadísticas
  const stats = {
    totalUsuarios: users.length,
    totalEstudiantes: users.filter(u => u.role === 'estudiante').length,
    totalProfesores: users.filter(u => u.role === 'profesor').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    usuariosActivos: users.filter(u => u.activo).length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-container flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="section-title flex items-center gap-2 mb-0">
              <Shield className="h-8 w-8" />
              Panel de Administración
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestión de usuarios y estadísticas del sistema.
            </p>
          </div>
          <Button variant="outline" onClick={fetchUsers} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsuarios}</p>
                <p className="text-xs text-muted-foreground">Usuarios Totales</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.usuariosActivos}</p>
                <p className="text-xs text-muted-foreground">Activos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEstudiantes}</p>
                <p className="text-xs text-muted-foreground">Estudiantes</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-accent-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalProfesores}</p>
                <p className="text-xs text-muted-foreground">Profesores</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gestión de Usuarios */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>Administra los usuarios del sistema</CardDescription>
            </div>
            {canManageUsers && (
              <Button onClick={handleOpenCreateDialog} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Usuario
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Nombre</th>
                    <th className="text-left py-3 px-2 font-medium hidden sm:table-cell">Email</th>
                    <th className="text-left py-3 px-2 font-medium">Rol</th>
                    <th className="text-left py-3 px-2 font-medium">Estado</th>
                    {canManageUsers && (
                      <th className="text-right py-3 px-2 font-medium">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr 
                      key={user.id} 
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium">{user.nombre}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{user.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-muted-foreground hidden sm:table-cell">
                        {user.email}
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getRoleBadge(user.role)}>
                          {getRoleLabel(user.role)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        {user.activo ? (
                          <span className="flex items-center gap-1 text-success">
                            <CheckCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Activo</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-destructive">
                            <XCircle className="h-4 w-4" />
                            <span className="hidden sm:inline">Inactivo</span>
                          </span>
                        )}
                      </td>
                      {canManageUsers && (
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(user)}
                              className="h-8 w-8 p-0"
                              title="Editar usuario"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConfirmDeleteUser(user)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              title="Eliminar usuario"
                              disabled={user.id === currentUser?.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Switch
                              checked={user.activo}
                              onCheckedChange={() => handleToggleUserStatus(user.id)}
                              disabled={user.id === currentUser?.id}
                              title={user.id === currentUser?.id ? 'No puedes desactivar tu cuenta' : 'Activar/Desactivar'}
                            />
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay usuarios registrados.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diálogo para Crear/Editar Usuario */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <Pencil className="h-5 w-5" />
                    Editar Usuario
                  </>
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Crear Nuevo Usuario
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos del usuario.'
                  : 'Completa los datos para registrar un nuevo usuario.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Nombre */}
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  placeholder="Ingresa el nombre"
                  value={formData.nombre}
                  onChange={e => handleInputChange('nombre', e.target.value)}
                  className={formErrors.nombre ? 'border-destructive' : ''}
                />
                {formErrors.nombre && (
                  <p className="text-xs text-destructive">{formErrors.nombre}</p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Correo Electrónico *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={formErrors.email ? 'border-destructive' : ''}
                  disabled={isEditing}
                />
                {formErrors.email && (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                )}
                {isEditing && (
                  <p className="text-xs text-muted-foreground">El correo no se puede modificar.</p>
                )}
              </div>

              {/* Contraseña - solo para crear */}
              {!isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={e => handleInputChange('password', e.target.value)}
                      className={formErrors.password ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-destructive">{formErrors.password}</p>
                  )}
                </div>
              )}

              {/* Nueva Contraseña - solo para editar */}
              {isEditing && (
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">Nueva Contraseña (opcional)</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Dejar vacío para no cambiar"
                      value={formData.newPassword}
                      onChange={e => handleInputChange('newPassword', e.target.value)}
                      className={formErrors.newPassword ? 'border-destructive pr-10' : 'pr-10'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formErrors.newPassword && (
                    <p className="text-xs text-destructive">{formErrors.newPassword}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Mínimo 6 caracteres si deseas cambiarla.</p>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="role">Rol *</Label>
                <Select value={formData.role} onValueChange={val => handleInputChange('role', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estudiante">Estudiante</SelectItem>
                    <SelectItem value="profesor">Profesor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Estado activo */}
              <div className="flex items-center justify-between">
                <Label htmlFor="activo" className="cursor-pointer">Usuario activo</Label>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={val => handleInputChange('activo', val)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog} disabled={saving}>
                Cancelar
              </Button>
              <Button 
                onClick={isEditing ? handleUpdateUser : handleCreateUser} 
                disabled={saving}
                className="gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmar eliminación de usuario */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará permanentemente a <strong>{userToDelete?.nombre}</strong> y todos sus datos asociados (resultados de simulacros, mensajes, etc.). Esta acción no se puede deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Admin;
