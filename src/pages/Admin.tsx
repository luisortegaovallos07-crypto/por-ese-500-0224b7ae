import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { mockUsers, mockEstadisticas, User, UserRole } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Users, 
  BarChart3, 
  Calendar, 
  Newspaper, 
  Shield, 
  CheckCircle, 
  XCircle,
  Plus,
  Pencil,
  Save,
  X,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Estado local para simular la base de datos
let usersData = [...mockUsers];

interface UserFormData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: UserRole;
  activo: boolean;
}

const initialFormData: UserFormData = {
  nombre: '',
  apellido: '',
  email: '',
  password: '',
  role: 'estudiante',
  activo: true,
};

const Admin: React.FC = () => {
  const { user: currentUser, isAdmin, isProfesor } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>(usersData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  const canManageUsers = isAdmin || isProfesor;

  // Validar el formulario
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof UserFormData, string>> = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El correo es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'El correo no es válido';
    } else if (!isEditing && users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      errors.email = 'Este correo ya está registrado';
    } else if (isEditing && users.some(u => u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== editingUserId)) {
      errors.email = 'Este correo ya está registrado por otro usuario';
    }

    if (!isEditing && !formData.password.trim()) {
      errors.password = 'La contraseña es requerida';
    } else if (!isEditing && formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Solo admin puede crear admins
    if (formData.role === 'admin' && !isAdmin) {
      errors.role = 'Solo los administradores pueden asignar rol de administrador';
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
  const handleOpenEditDialog = (user: User) => {
    setFormData({
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      password: '', // No mostramos la contraseña actual
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
    // Limpiar error del campo cuando el usuario escribe
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Crear nuevo usuario
  const handleCreateUser = () => {
    if (!validateForm()) return;

    const newUser: User = {
      id: `user-${Date.now()}`,
      nombre: formData.nombre.trim(),
      apellido: formData.apellido.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      role: formData.role,
      activo: formData.activo,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    usersData = updatedUsers;

    toast({
      title: 'Usuario creado',
      description: `El usuario ${newUser.nombre} ${newUser.apellido} ha sido creado exitosamente.`,
    });

    handleCloseDialog();
  };

  // Actualizar usuario existente
  const handleUpdateUser = () => {
    if (!validateForm() || !editingUserId) return;

    const updatedUsers = users.map(user => {
      if (user.id === editingUserId) {
        return {
          ...user,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim().toLowerCase(),
          // Solo actualizar contraseña si se proporcionó una nueva
          password: formData.password.trim() || user.password,
          role: formData.role,
          activo: formData.activo,
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    usersData = updatedUsers;

    toast({
      title: 'Usuario actualizado',
      description: 'Los datos del usuario han sido actualizados exitosamente.',
    });

    handleCloseDialog();
  };

  // Cambiar estado activo/inactivo
  const handleToggleUserStatus = (userId: string) => {
    const updatedUsers = users.map(user => {
      if (user.id === userId) {
        // No permitir desactivar al usuario actual
        if (user.id === currentUser?.id) {
          toast({
            title: 'Operación no permitida',
            description: 'No puedes desactivar tu propia cuenta.',
            variant: 'destructive',
          });
          return user;
        }
        return { ...user, activo: !user.activo };
      }
      return user;
    });

    setUsers(updatedUsers);
    usersData = updatedUsers;

    const targetUser = users.find(u => u.id === userId);
    if (targetUser && targetUser.id !== currentUser?.id) {
      toast({
        title: targetUser.activo ? 'Usuario desactivado' : 'Usuario activado',
        description: `${targetUser.nombre} ${targetUser.apellido} ha sido ${targetUser.activo ? 'desactivado' : 'activado'}.`,
      });
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

  // Estadísticas actualizadas
  const stats = {
    totalUsuarios: users.length,
    totalEstudiantes: users.filter(u => u.role === 'estudiante').length,
    totalProfesores: users.filter(u => u.role === 'profesor').length,
    totalAdmins: users.filter(u => u.role === 'admin').length,
    usuariosActivos: users.filter(u => u.activo).length,
    ...mockEstadisticas,
  };

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Panel de Administración
          </h1>
          <p className="text-muted-foreground">
            Gestión de usuarios y estadísticas del sistema.
          </p>
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
                <p className="text-2xl font-bold">{stats.promedioGeneral}%</p>
                <p className="text-xs text-muted-foreground">Promedio General</p>
              </div>
            </CardContent>
          </Card>
          <Card className="card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-accent-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.eventosProximos}</p>
                <p className="text-xs text-muted-foreground">Eventos Próximos</p>
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
                          <p className="font-medium">{user.nombre} {user.apellido}</p>
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
                  ? 'Modifica los datos del usuario. Deja la contraseña vacía para mantener la actual.'
                  : 'Completa los datos para registrar un nuevo usuario en el sistema.'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Nombre */}
              <div className="grid gap-2">
                <Label htmlFor="nombre">Nombre *</Label>
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

              {/* Apellido */}
              <div className="grid gap-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  placeholder="Ingresa el apellido"
                  value={formData.apellido}
                  onChange={e => handleInputChange('apellido', e.target.value)}
                  className={formErrors.apellido ? 'border-destructive' : ''}
                />
                {formErrors.apellido && (
                  <p className="text-xs text-destructive">{formErrors.apellido}</p>
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
                />
                {formErrors.email && (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                )}
              </div>

              {/* Contraseña */}
              <div className="grid gap-2">
                <Label htmlFor="password">
                  Contraseña {isEditing ? '(dejar vacía para mantener)' : '*'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isEditing ? '••••••••' : 'Mínimo 6 caracteres'}
                    value={formData.password}
                    onChange={e => handleInputChange('password', e.target.value)}
                    className={`pr-10 ${formErrors.password ? 'border-destructive' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-xs text-destructive">{formErrors.password}</p>
                )}
              </div>

              {/* Rol */}
              <div className="grid gap-2">
                <Label htmlFor="role">Rol *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: UserRole) => handleInputChange('role', value)}
                >
                  <SelectTrigger className={formErrors.role ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="estudiante">Estudiante</SelectItem>
                    <SelectItem value="profesor">Profesor</SelectItem>
                    {isAdmin && <SelectItem value="admin">Administrador</SelectItem>}
                  </SelectContent>
                </Select>
                {formErrors.role && (
                  <p className="text-xs text-destructive">{formErrors.role}</p>
                )}
              </div>

              {/* Estado Activo */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <Label htmlFor="activo" className="text-sm font-medium">
                    Usuario Activo
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Los usuarios inactivos no pueden iniciar sesión.
                  </p>
                </div>
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={checked => handleInputChange('activo', checked)}
                />
              </div>

              {/* Aviso para profesores */}
              {!isAdmin && formData.role === 'admin' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Solo los administradores pueden crear usuarios con rol de administrador.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={isEditing ? handleUpdateUser : handleCreateUser}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Admin;
