import { useState } from 'react';
import { Search, MoreHorizontal, UserPlus, Shield, Ban, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'Администратор',
    email: 'admin@afisha.kz',
    role: 'admin',
    city: 'Алматы',
    isPremium: true,
    status: 'active',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'Айдар Касымов',
    email: 'aidar@example.com',
    role: 'user',
    city: 'Алматы',
    isPremium: true,
    status: 'active',
    createdAt: '2026-01-10',
  },
  {
    id: '3',
    name: 'Марат Сериков',
    email: 'marat@business.kz',
    role: 'business',
    city: 'Астана',
    isPremium: false,
    status: 'active',
    createdAt: '2026-01-08',
  },
  {
    id: '4',
    name: 'Дана Омарова',
    email: 'dana@example.com',
    role: 'user',
    city: 'Караганда',
    isPremium: false,
    status: 'active',
    createdAt: '2026-01-05',
  },
  {
    id: '5',
    name: 'Модератор',
    email: 'mod@afisha.kz',
    role: 'moderator',
    city: 'Шымкент',
    isPremium: false,
    status: 'active',
    createdAt: '2026-01-01',
  },
];

const roleLabels: Record<string, string> = {
  admin: 'Админ',
  moderator: 'Модератор',
  business: 'Бизнес',
  user: 'Пользователь',
};

const roleColors: Record<string, string> = {
  admin: 'bg-red-100 text-red-800',
  moderator: 'bg-purple-100 text-purple-800',
  business: 'bg-blue-100 text-blue-800',
  user: 'bg-gray-100 text-gray-800',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Пользователи</h1>
          <p className="text-muted-foreground">
            Управление пользователями платформы
          </p>
        </div>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Добавить
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени или email..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Роль" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все роли</SelectItem>
                <SelectItem value="admin">Админы</SelectItem>
                <SelectItem value="moderator">Модераторы</SelectItem>
                <SelectItem value="business">Бизнес</SelectItem>
                <SelectItem value="user">Пользователи</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Список пользователей</CardTitle>
          <CardDescription>
            Всего: {filteredUsers.length} пользователей
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Подписка</TableHead>
                <TableHead>Дата регистрации</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role]} variant="secondary">
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.city}</TableCell>
                  <TableCell>
                    {user.isPremium ? (
                      <Badge className="bg-amber-100 text-amber-800">Premium</Badge>
                    ) : (
                      <span className="text-muted-foreground">Free</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.createdAt}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Действия</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Mail className="w-4 h-4 mr-2" />
                          Написать
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Shield className="w-4 h-4 mr-2" />
                          Сменить роль
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Ban className="w-4 h-4 mr-2" />
                          Заблокировать
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
