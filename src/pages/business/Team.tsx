import { useState } from 'react';
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  Edit2,
  Trash2,
  Crown,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMyBusiness, useTeamMembers, useInviteTeamMember, useUpdateTeamMemberRole, useRemoveTeamMember } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const roleConfig = {
  admin: { label: 'Администратор', color: 'bg-purple-100 text-purple-800', description: 'Полный доступ к управлению' },
  editor: { label: 'Редактор', color: 'bg-blue-100 text-blue-800', description: 'Создание и редактирование публикаций' },
  viewer: { label: 'Просмотр', color: 'bg-gray-100 text-gray-800', description: 'Только просмотр статистики' },
};

export default function BusinessTeam() {
  const { toast } = useToast();
  const { data: business, isLoading: isBusinessLoading } = useMyBusiness();
  const { data: teamData, isLoading: isTeamLoading, error: teamError } = useTeamMembers();

  const inviteMutation = useInviteTeamMember();
  const updateRoleMutation = useUpdateTeamMemberRole();
  const removeMutation = useRemoveTeamMember();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [editingMember, setEditingMember] = useState<{ id: string; role: 'admin' | 'editor' | 'viewer' } | null>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const isPremium = business?.tier === 'premium';
  const isLoading = isBusinessLoading || isTeamLoading;

  const handleInvite = async () => {
    if (!inviteEmail) return;

    try {
      await inviteMutation.mutateAsync({ email: inviteEmail, role: inviteRole });
      toast({
        title: 'Приглашение отправлено',
        description: `Пользователь ${inviteEmail} добавлен в команду`,
      });
      setInviteEmail('');
      setInviteRole('editor');
      setIsInviteDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось отправить приглашение',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingMember) return;

    try {
      await updateRoleMutation.mutateAsync({ id: editingMember.id, role: editingMember.role });
      toast({
        title: 'Роль обновлена',
        description: 'Роль сотрудника успешно изменена',
      });
      setEditingMember(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить роль',
        variant: 'destructive',
      });
    }
  };

  const handleRemove = async () => {
    if (!memberToDelete) return;

    try {
      await removeMutation.mutateAsync(memberToDelete);
      toast({
        title: 'Сотрудник удалён',
        description: 'Сотрудник удалён из команды',
      });
      setMemberToDelete(null);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить сотрудника',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show upgrade message if not Premium
  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Команда</h1>
          <p className="text-muted-foreground">Управление сотрудниками</p>
        </div>

        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Функция доступна на тарифе Premium</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Добавляйте до 5 сотрудников в свою команду для совместного управления бизнесом.
              Назначайте роли и контролируйте доступ.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link to="/business/subscription">
                  <Crown className="w-4 h-4 mr-2" />
                  Перейти на Premium
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature preview */}
        <Card>
          <CardHeader>
            <CardTitle>Возможности команды</CardTitle>
            <CardDescription>Что вы получите с тарифом Premium</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <Shield className="w-8 h-8 text-purple-500 mb-2" />
                <h4 className="font-medium mb-1">Администратор</h4>
                <p className="text-sm text-muted-foreground">Полный доступ к управлению бизнесом</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Edit2 className="w-8 h-8 text-blue-500 mb-2" />
                <h4 className="font-medium mb-1">Редактор</h4>
                <p className="text-sm text-muted-foreground">Создание и редактирование событий и акций</p>
              </div>
              <div className="p-4 border rounded-lg">
                <Users className="w-8 h-8 text-gray-500 mb-2" />
                <h4 className="font-medium mb-1">Просмотр</h4>
                <p className="text-sm text-muted-foreground">Доступ к статистике и отчётам</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const members = teamData?.members || [];
  const maxMembers = teamData?.maxMembers || 5;
  const currentCount = teamData?.currentCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Команда</h1>
          <p className="text-muted-foreground">Управление сотрудниками</p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={currentCount >= maxMembers}>
              <UserPlus className="w-4 h-4 mr-2" />
              Добавить сотрудника
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить сотрудника</DialogTitle>
              <DialogDescription>
                Введите email пользователя, которого хотите добавить в команду.
                Пользователь должен быть зарегистрирован на платформе.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="employee@example.com"
                    className="pl-10"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as typeof inviteRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex flex-col">
                        <span>Администратор</span>
                        <span className="text-xs text-muted-foreground">Полный доступ</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="editor">
                      <div className="flex flex-col">
                        <span>Редактор</span>
                        <span className="text-xs text-muted-foreground">Создание публикаций</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="viewer">
                      <div className="flex flex-col">
                        <span>Просмотр</span>
                        <span className="text-xs text-muted-foreground">Только статистика</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={handleInvite} disabled={!inviteEmail || inviteMutation.isPending}>
                {inviteMutation.isPending ? 'Добавление...' : 'Добавить'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{currentCount} / {maxMembers}</div>
                <p className="text-sm text-muted-foreground">Сотрудников</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{members.filter(m => m.role === 'admin').length}</div>
                <p className="text-sm text-muted-foreground">Администраторов</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{members.filter(m => m.role === 'editor').length}</div>
                <p className="text-sm text-muted-foreground">Редакторов</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team list */}
      <Card>
        <CardHeader>
          <CardTitle>Сотрудники</CardTitle>
          <CardDescription>
            {currentCount === 0
              ? 'Добавьте первого сотрудника в команду'
              : `Показано: ${currentCount} из ${maxMembers}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Команда пуста</h3>
              <p className="text-muted-foreground mb-4">Добавьте сотрудников для совместной работы</p>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Добавить сотрудника
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {members.map((member) => {
                const role = roleConfig[member.role];
                return (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.user.avatar || undefined} />
                        <AvatarFallback>
                          {member.user.name?.[0]?.toUpperCase() || member.user.email[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.user.name || member.user.email}</p>
                        <p className="text-sm text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={role.color}>{role.label}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setEditingMember({ id: member.id, role: member.role });
                            setIsEditDialogOpen(true);
                          }}>
                            <Edit2 className="w-4 h-4 mr-2" />
                            Изменить роль
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => setMemberToDelete(member.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit role dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить роль</DialogTitle>
            <DialogDescription>Выберите новую роль для сотрудника</DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="py-4">
              <Select
                value={editingMember.role}
                onValueChange={(v) => setEditingMember({ ...editingMember, role: v as typeof editingMember.role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Администратор</SelectItem>
                  <SelectItem value="editor">Редактор</SelectItem>
                  <SelectItem value="viewer">Просмотр</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateRole} disabled={updateRoleMutation.isPending}>
              {updateRoleMutation.isPending ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!memberToDelete} onOpenChange={() => setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить сотрудника?</AlertDialogTitle>
            <AlertDialogDescription>
              Сотрудник потеряет доступ к управлению бизнесом. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-red-600 hover:bg-red-700">
              {removeMutation.isPending ? 'Удаление...' : 'Удалить'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
