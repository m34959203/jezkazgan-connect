import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, Flag, Clock, User, Building2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Mock complaints data
const mockComplaints = [
  {
    id: '1',
    type: 'business',
    target: 'Ресторан "Тюльпан"',
    reporter: 'Айдар К.',
    reason: 'Неактуальная информация',
    description: 'Указанные цены не соответствуют действительности, меню устарело.',
    status: 'pending',
    createdAt: '2026-01-17 14:30',
  },
  {
    id: '2',
    type: 'event',
    target: 'Концерт Димаша',
    reporter: 'Дана О.',
    reason: 'Мошенничество',
    description: 'Событие уже отменено, но публикация активна.',
    status: 'pending',
    createdAt: '2026-01-17 10:15',
  },
  {
    id: '3',
    type: 'comment',
    target: 'Комментарий к Кофейня Арома',
    reporter: 'Марат С.',
    reason: 'Оскорбление',
    description: 'Нецензурная лексика в комментарии.',
    status: 'resolved',
    createdAt: '2026-01-16 18:45',
    resolvedAt: '2026-01-17 09:00',
    resolution: 'Комментарий удалён, пользователь предупреждён.',
  },
];

// Mock pending content data
const mockPendingContent = [
  {
    id: '1',
    type: 'business',
    title: 'Кофейня "Бариста"',
    author: 'Нурлан А.',
    city: 'Алматы',
    createdAt: '2026-01-17 15:00',
  },
  {
    id: '2',
    type: 'event',
    title: 'Мастер-класс по рисованию',
    author: 'Салон красоты Glamour',
    city: 'Караганда',
    createdAt: '2026-01-17 12:30',
  },
  {
    id: '3',
    type: 'promotion',
    title: 'Скидка 50% на первый заказ',
    author: 'ТехноМир',
    city: 'Шымкент',
    createdAt: '2026-01-17 11:00',
  },
];

const typeIcons: Record<string, typeof Building2> = {
  business: Building2,
  event: Flag,
  comment: MessageSquare,
  promotion: Flag,
};

const typeLabels: Record<string, string> = {
  business: 'Бизнес',
  event: 'Событие',
  comment: 'Комментарий',
  promotion: 'Акция',
};

export default function ModerationPage() {
  const [selectedComplaint, setSelectedComplaint] = useState<typeof mockComplaints[0] | null>(null);
  const [resolution, setResolution] = useState('');

  const pendingComplaints = mockComplaints.filter((c) => c.status === 'pending').length;
  const pendingContent = mockPendingContent.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Модерация</h1>
          <p className="text-muted-foreground">
            Жалобы и контент на проверку
          </p>
        </div>
        {(pendingComplaints > 0 || pendingContent > 0) && (
          <Badge variant="destructive" className="text-sm px-3 py-1">
            {pendingComplaints + pendingContent} требуют внимания
          </Badge>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div className="text-2xl font-bold">{pendingComplaints}</div>
            </div>
            <p className="text-sm text-muted-foreground">Жалоб на рассмотрении</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div className="text-2xl font-bold">{pendingContent}</div>
            </div>
            <p className="text-sm text-muted-foreground">Контента на проверку</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-2xl font-bold">
                {mockComplaints.filter((c) => c.status === 'resolved').length}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Решено сегодня</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              <div className="text-2xl font-bold">0</div>
            </div>
            <p className="text-sm text-muted-foreground">Заблокировано</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="complaints" className="space-y-4">
        <TabsList>
          <TabsTrigger value="complaints" className="relative">
            Жалобы
            {pendingComplaints > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {pendingComplaints}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="content" className="relative">
            Контент
            {pendingContent > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                {pendingContent}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="complaints" className="space-y-4">
          {mockComplaints.map((complaint) => {
            const TypeIcon = typeIcons[complaint.type];
            return (
              <Card key={complaint.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        complaint.status === 'pending' ? 'bg-amber-100' : 'bg-green-100'
                      }`}>
                        <TypeIcon className={`w-5 h-5 ${
                          complaint.status === 'pending' ? 'text-amber-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{complaint.target}</span>
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[complaint.type]}
                          </Badge>
                          {complaint.status === 'pending' ? (
                            <Badge className="bg-amber-100 text-amber-800">Ожидает</Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">Решено</Badge>
                          )}
                        </div>
                        <p className="text-sm text-red-600 font-medium">{complaint.reason}</p>
                        <p className="text-sm text-muted-foreground">{complaint.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                          <span>От: {complaint.reporter}</span>
                          <span>{complaint.createdAt}</span>
                        </div>
                        {complaint.resolution && (
                          <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800">
                            <span className="font-medium">Решение:</span> {complaint.resolution}
                          </div>
                        )}
                      </div>
                    </div>
                    {complaint.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Рассмотреть
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          {mockPendingContent.map((content) => {
            const TypeIcon = typeIcons[content.type];
            return (
              <Card key={content.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <TypeIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{content.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[content.type]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>От: {content.author}</span>
                          <span>Город: {content.city}</span>
                          <span>{content.createdAt}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        Просмотр
                      </Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Одобрить
                      </Button>
                      <Button size="sm" variant="destructive">
                        <XCircle className="w-4 h-4 mr-1" />
                        Отклонить
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Complaint resolution dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Рассмотрение жалобы</DialogTitle>
            <DialogDescription>
              {selectedComplaint?.target} - {selectedComplaint?.reason}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{selectedComplaint?.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                От: {selectedComplaint?.reporter} · {selectedComplaint?.createdAt}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Решение</label>
              <Textarea
                placeholder="Опишите принятые меры..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={() => setSelectedComplaint(null)}>
              <XCircle className="w-4 h-4 mr-1" />
              Отклонить жалобу
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setSelectedComplaint(null)}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Принять меры
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
