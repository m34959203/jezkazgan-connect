import { useState } from 'react';
import { Search, MoreHorizontal, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
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

// Mock businesses data
const mockBusinesses = [
  {
    id: '1',
    name: 'Ресторан "Тюльпан"',
    owner: 'Марат Сериков',
    category: 'restaurants',
    city: 'Алматы',
    tier: 'premium',
    isVerified: true,
    postsThisMonth: 8,
    createdAt: '2025-12-05',
  },
  {
    id: '2',
    name: 'Кофейня Арома',
    owner: 'Айгуль Нурланова',
    category: 'cafes',
    city: 'Алматы',
    tier: 'free',
    isVerified: false,
    postsThisMonth: 2,
    createdAt: '2026-01-15',
  },
  {
    id: '3',
    name: 'Фитнес "Энергия"',
    owner: 'Ерлан Жумабаев',
    category: 'sports',
    city: 'Астана',
    tier: 'lite',
    isVerified: true,
    postsThisMonth: 5,
    createdAt: '2025-11-20',
  },
  {
    id: '4',
    name: 'Салон красоты Glamour',
    owner: 'Дана Омарова',
    category: 'beauty',
    city: 'Караганда',
    tier: 'free',
    isVerified: true,
    postsThisMonth: 3,
    createdAt: '2025-10-10',
  },
  {
    id: '5',
    name: 'ТехноМир',
    owner: 'Асет Кенжебаев',
    category: 'shopping',
    city: 'Шымкент',
    tier: 'lite',
    isVerified: false,
    postsThisMonth: 10,
    createdAt: '2026-01-08',
  },
];

const tierLabels: Record<string, string> = {
  free: 'Free',
  lite: 'Lite',
  premium: 'Premium',
};

const tierColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-800',
  lite: 'bg-blue-100 text-blue-800',
  premium: 'bg-amber-100 text-amber-800',
};

const categoryLabels: Record<string, string> = {
  restaurants: 'Рестораны',
  cafes: 'Кафе',
  sports: 'Спорт',
  beauty: 'Красота',
  shopping: 'Магазины',
  education: 'Образование',
  services: 'Услуги',
  entertainment: 'Развлечения',
  other: 'Другое',
};

export default function BusinessesPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [verifiedFilter, setVerifiedFilter] = useState('all');

  const filteredBusinesses = mockBusinesses.filter((business) => {
    const matchesSearch =
      business.name.toLowerCase().includes(search.toLowerCase()) ||
      business.owner.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'all' || business.tier === tierFilter;
    const matchesVerified =
      verifiedFilter === 'all' ||
      (verifiedFilter === 'verified' && business.isVerified) ||
      (verifiedFilter === 'pending' && !business.isVerified);
    return matchesSearch && matchesTier && matchesVerified;
  });

  const pendingVerification = mockBusinesses.filter((b) => !b.isVerified).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Бизнесы</h1>
          <p className="text-muted-foreground">
            Управление бизнес-аккаунтами
          </p>
        </div>
        {pendingVerification > 0 && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {pendingVerification} ожидают верификации
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{mockBusinesses.length}</div>
            <p className="text-sm text-muted-foreground">Всего бизнесов</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockBusinesses.filter((b) => b.isVerified).length}
            </div>
            <p className="text-sm text-muted-foreground">Верифицированных</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockBusinesses.filter((b) => b.tier === 'premium').length}
            </div>
            <p className="text-sm text-muted-foreground">Premium</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {mockBusinesses.filter((b) => b.tier === 'lite').length}
            </div>
            <p className="text-sm text-muted-foreground">Lite</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или владельцу..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Тариф" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все тарифы</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="lite">Lite</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Верификация" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                <SelectItem value="verified">Верифицированные</SelectItem>
                <SelectItem value="pending">Ожидают проверки</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Businesses table */}
      <Card>
        <CardHeader>
          <CardTitle>Список бизнесов</CardTitle>
          <CardDescription>
            Показано: {filteredBusinesses.length} бизнесов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Бизнес</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Город</TableHead>
                <TableHead>Тариф</TableHead>
                <TableHead>Публикаций</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{business.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {business.owner}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{categoryLabels[business.category]}</TableCell>
                  <TableCell>{business.city}</TableCell>
                  <TableCell>
                    <Badge className={tierColors[business.tier]} variant="secondary">
                      {tierLabels[business.tier]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{business.postsThisMonth}</span>
                    <span className="text-muted-foreground">
                      /{business.tier === 'premium' ? '∞' : business.tier === 'lite' ? '10' : '3'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {business.isVerified ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Верифицирован
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        Ожидает
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
                          <Eye className="w-4 h-4 mr-2" />
                          Просмотреть
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 mr-2" />
                          Редактировать
                        </DropdownMenuItem>
                        {!business.isVerified && (
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Верифицировать
                          </DropdownMenuItem>
                        )}
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
