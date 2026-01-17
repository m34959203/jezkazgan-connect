import { useState } from 'react';
import { Search, MoreHorizontal, Plus, Edit, Trash2, MapPin, Users, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Mock cities data
const mockCities = [
  {
    id: '1',
    name: 'Алматы',
    slug: 'almaty',
    region: 'Алматинская область',
    isActive: true,
    usersCount: 5420,
    businessesCount: 89,
    eventsCount: 34,
  },
  {
    id: '2',
    name: 'Астана',
    slug: 'astana',
    region: 'Акмолинская область',
    isActive: true,
    usersCount: 4210,
    businessesCount: 67,
    eventsCount: 28,
  },
  {
    id: '3',
    name: 'Караганда',
    slug: 'karaganda',
    region: 'Карагандинская область',
    isActive: true,
    usersCount: 1850,
    businessesCount: 34,
    eventsCount: 12,
  },
  {
    id: '4',
    name: 'Шымкент',
    slug: 'shymkent',
    region: 'Туркестанская область',
    isActive: true,
    usersCount: 2100,
    businessesCount: 41,
    eventsCount: 15,
  },
  {
    id: '5',
    name: 'Жезказган',
    slug: 'jezkazgan',
    region: 'Карагандинская область',
    isActive: true,
    usersCount: 890,
    businessesCount: 23,
    eventsCount: 8,
  },
  {
    id: '6',
    name: 'Актау',
    slug: 'aktau',
    region: 'Мангистауская область',
    isActive: false,
    usersCount: 0,
    businessesCount: 0,
    eventsCount: 0,
  },
];

export default function CitiesPage() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newCity, setNewCity] = useState({ name: '', slug: '', region: '' });

  const filteredCities = mockCities.filter((city) =>
    city.name.toLowerCase().includes(search.toLowerCase()) ||
    city.region.toLowerCase().includes(search.toLowerCase())
  );

  const activeCities = mockCities.filter((c) => c.isActive).length;
  const totalUsers = mockCities.reduce((acc, c) => acc + c.usersCount, 0);
  const totalBusinesses = mockCities.reduce((acc, c) => acc + c.businessesCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Города</h1>
          <p className="text-muted-foreground">
            Управление городами платформы
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Добавить город
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Добавить город</DialogTitle>
              <DialogDescription>
                Добавьте новый город на платформу
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название</Label>
                <Input
                  id="name"
                  placeholder="Например: Атырау"
                  value={newCity.name}
                  onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  placeholder="atyrau"
                  value={newCity.slug}
                  onChange={(e) => setNewCity({ ...newCity, slug: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Регион</Label>
                <Input
                  id="region"
                  placeholder="Атырауская область"
                  value={newCity.region}
                  onChange={(e) => setNewCity({ ...newCity, region: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={() => setDialogOpen(false)}>
                Добавить
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <div className="text-2xl font-bold">{mockCities.length}</div>
            </div>
            <p className="text-sm text-muted-foreground">Всего городов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ToggleRight className="w-5 h-5 text-green-600" />
              <div className="text-2xl font-bold text-green-600">{activeCities}</div>
            </div>
            <p className="text-sm text-muted-foreground">Активных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            </div>
            <p className="text-sm text-muted-foreground">Пользователей</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-600" />
              <div className="text-2xl font-bold">{totalBusinesses}</div>
            </div>
            <p className="text-sm text-muted-foreground">Бизнесов</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию или региону..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cities table */}
      <Card>
        <CardHeader>
          <CardTitle>Список городов</CardTitle>
          <CardDescription>
            Показано: {filteredCities.length} городов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Город</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Регион</TableHead>
                <TableHead>Пользователей</TableHead>
                <TableHead>Бизнесов</TableHead>
                <TableHead>Событий</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCities.map((city) => (
                <TableRow key={city.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {city.name.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{city.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {city.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {city.region}
                  </TableCell>
                  <TableCell>{city.usersCount.toLocaleString()}</TableCell>
                  <TableCell>{city.businessesCount}</TableCell>
                  <TableCell>{city.eventsCount}</TableCell>
                  <TableCell>
                    {city.isActive ? (
                      <Badge className="bg-green-100 text-green-800">
                        Активен
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Отключён
                      </Badge>
                    )}
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
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {city.isActive ? (
                            <>
                              <ToggleLeft className="w-4 h-4 mr-2" />
                              Отключить
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4 mr-2" />
                              Включить
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Удалить
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
