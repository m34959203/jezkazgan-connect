import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Mail,
  Shield,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCurrentUser } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { changePassword, deleteMyBusiness } from '@/lib/api';

export default function BusinessSettings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: user, refetch: refetchUser } = useCurrentUser();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingBusiness, setIsDeletingBusiness] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Ошибка',
        description: 'Пароли не совпадают',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Ошибка',
        description: 'Новый пароль должен содержать минимум 8 символов',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        currentPassword,
        newPassword,
      });
      toast({
        title: 'Успешно',
        description: 'Пароль успешно изменен',
      });
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось изменить пароль',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteBusiness = async () => {
    setIsDeletingBusiness(true);
    try {
      await deleteMyBusiness();
      toast({
        title: 'Бизнес удален',
        description: 'Ваш бизнес и все связанные данные были удалены',
      });
      setShowDeleteDialog(false);
      // Refresh user data and redirect
      await refetchUser();
      navigate('/');
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось удалить бизнес',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingBusiness(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Настройки</h1>
        <p className="text-muted-foreground">Управление настройками аккаунта</p>
      </div>

      {/* Account info */}
      <Card>
        <CardHeader>
          <CardTitle>Аккаунт</CardTitle>
          <CardDescription>Информация о вашем аккаунте</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Имя</Label>
              <Input value={user?.name || ''} disabled />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Для изменения email обратитесь в поддержку
          </p>
        </CardContent>
      </Card>

      {/* Password change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Безопасность
          </CardTitle>
          <CardDescription>Изменение пароля</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текущий пароль</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPasswords ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPasswords(!showPasswords)}
                >
                  {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <Input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Изменить пароль
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Уведомления
          </CardTitle>
          <CardDescription>Настройка уведомлений</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label>Email уведомления</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Получать уведомления о новых событиях на почту
              </p>
            </div>
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Label>Push уведомления</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Получать push-уведомления в браузере
              </p>
            </div>
            <Switch
              checked={pushNotifications}
              onCheckedChange={setPushNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Опасная зона
          </CardTitle>
          <CardDescription>Необратимые действия</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Удалить бизнес</p>
              <p className="text-sm text-muted-foreground">
                Все данные будут удалены безвозвратно
              </p>
            </div>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удаление бизнеса</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить бизнес? Это действие нельзя отменить.
              Все ваши публикации, события и акции будут удалены.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isDeletingBusiness}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteBusiness} disabled={isDeletingBusiness}>
              {isDeletingBusiness && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Удалить бизнес
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
