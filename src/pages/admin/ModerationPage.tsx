import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Eye, MessageSquare, Flag, Clock, User, Building2, Loader2, RefreshCw } from 'lucide-react';
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
import { fetchAdminModeration, approveEvent, rejectEvent, verifyBusiness, resolveComplaint, rejectComplaint, type ModerationData, type Complaint, type ComplaintReason } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const typeIcons: Record<string, typeof Building2> = {
  business: Building2,
  event: Flag,
  comment: MessageSquare,
  promotion: Flag,
  review: MessageSquare,
  user: User,
};

const typeLabels: Record<string, string> = {
  business: 'Бизнес',
  event: 'Событие',
  comment: 'Комментарий',
  promotion: 'Акция',
  review: 'Отзыв',
  user: 'Пользователь',
};

const reasonLabels: Record<ComplaintReason, string> = {
  spam: 'Спам',
  fraud: 'Мошенничество',
  inappropriate: 'Неприемлемый контент',
  outdated: 'Неактуальная информация',
  copyright: 'Нарушение авторских прав',
  fake: 'Недостоверная информация',
  offensive: 'Оскорбительный контент',
  other: 'Другое',
};

const categoryLabels: Record<string, string> = {
  restaurant: 'Ресторан',
  cafe: 'Кафе',
  beauty: 'Красота',
  fitness: 'Фитнес',
  education: 'Образование',
  entertainment: 'Развлечения',
  services: 'Услуги',
  retail: 'Магазин',
  concerts: 'Концерты',
  theater: 'Театр',
  sports: 'Спорт',
  exhibitions: 'Выставки',
  festivals: 'Фестивали',
  children: 'Детям',
  other: 'Другое',
};

export default function ModerationPage() {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolution, setResolution] = useState('');
  const [moderation, setModeration] = useState<ModerationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadModeration();
  }, []);

  const loadModeration = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAdminModeration();
      setModeration(data);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные модерации',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveEvent = async (id: string) => {
    setProcessingId(id);
    try {
      await approveEvent(id);
      toast({
        title: 'Успешно',
        description: 'Событие одобрено',
      });
      loadModeration();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось одобрить событие',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectEvent = async (id: string) => {
    setProcessingId(id);
    try {
      await rejectEvent(id);
      toast({
        title: 'Успешно',
        description: 'Событие отклонено',
      });
      loadModeration();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить событие',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleVerifyBusiness = async (id: string) => {
    setProcessingId(id);
    try {
      await verifyBusiness(id);
      toast({
        title: 'Успешно',
        description: 'Бизнес верифицирован',
      });
      loadModeration();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось верифицировать бизнес',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleResolveComplaint = async (id: string) => {
    if (!resolution.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Укажите принятые меры',
        variant: 'destructive',
      });
      return;
    }
    setProcessingId(id);
    try {
      await resolveComplaint(id, resolution);
      toast({
        title: 'Успешно',
        description: 'Жалоба рассмотрена, меры приняты',
      });
      setSelectedComplaint(null);
      setResolution('');
      loadModeration();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать жалобу',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectComplaint = async (id: string) => {
    setProcessingId(id);
    try {
      await rejectComplaint(id, resolution || 'Жалоба отклонена');
      toast({
        title: 'Успешно',
        description: 'Жалоба отклонена',
      });
      setSelectedComplaint(null);
      setResolution('');
      loadModeration();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отклонить жалобу',
        variant: 'destructive',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const complaintsCount = moderation?.counts.complaints ?? 0;
  const pendingContent = (moderation?.counts.events ?? 0) + (moderation?.counts.businesses ?? 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadModeration}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Обновить
          </Button>
          {(complaintsCount > 0 || pendingContent > 0) && (
            <Badge variant="destructive" className="text-sm px-3 py-1">
              {complaintsCount + pendingContent} требуют внимания
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <div className="text-2xl font-bold">{complaintsCount}</div>
            </div>
            <p className="text-sm text-muted-foreground">Жалоб на рассмотрении</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-blue-600" />
              <div className="text-2xl font-bold">{moderation?.counts.events ?? 0}</div>
            </div>
            <p className="text-sm text-muted-foreground">Событий на проверку</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-600" />
              <div className="text-2xl font-bold">{moderation?.counts.businesses ?? 0}</div>
            </div>
            <p className="text-sm text-muted-foreground">Бизнесов на проверку</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-600" />
              <div className="text-2xl font-bold">{pendingContent}</div>
            </div>
            <p className="text-sm text-muted-foreground">Всего на модерации</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content" className="relative">
            Контент
            {pendingContent > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">
                {pendingContent}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="complaints" className="relative">
            Жалобы
            {complaintsCount > 0 && (
              <span className="ml-2 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {complaintsCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {/* Pending Events */}
          {moderation?.pendingEvents && moderation.pendingEvents.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Flag className="w-5 h-5 text-blue-600" />
                События на модерации ({moderation.pendingEvents.length})
              </h3>
              {moderation.pendingEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Flag className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.title}</span>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[event.category] || event.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {event.businessName && <span>От: {event.businessName}</span>}
                            {event.cityName && <span>Город: {event.cityName}</span>}
                            <span>{new Date(event.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                          {event.creatorEmail && (
                            <p className="text-xs text-muted-foreground">Email: {event.creatorEmail}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveEvent(event.id)}
                          disabled={processingId === event.id}
                        >
                          {processingId === event.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Одобрить
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectEvent(event.id)}
                          disabled={processingId === event.id}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Отклонить
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pending Businesses */}
          {moderation?.pendingBusinesses && moderation.pendingBusinesses.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                Бизнесы на верификации ({moderation.pendingBusinesses.length})
              </h3>
              {moderation.pendingBusinesses.map((business) => (
                <Card key={business.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{business.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {categoryLabels[business.category] || business.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {business.ownerName && <span>Владелец: {business.ownerName}</span>}
                            {business.cityName && <span>Город: {business.cityName}</span>}
                            <span>{new Date(business.createdAt).toLocaleDateString('ru-RU')}</span>
                          </div>
                          {business.ownerEmail && (
                            <p className="text-xs text-muted-foreground">Email: {business.ownerEmail}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleVerifyBusiness(business.id)}
                          disabled={processingId === business.id}
                        >
                          {processingId === business.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Верифицировать
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty state */}
          {(!moderation?.pendingEvents?.length && !moderation?.pendingBusinesses?.length) && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Всё проверено!</h3>
                  <p className="text-muted-foreground">Нет контента, требующего модерации</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="complaints" className="space-y-4">
          {moderation?.pendingComplaints && moderation.pendingComplaints.length > 0 ? (
            moderation.pendingComplaints.map((complaint) => {
              const TypeIcon = typeIcons[complaint.targetType] || Flag;
              return (
                <Card key={complaint.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100">
                          <TypeIcon className="w-5 h-5 text-amber-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{complaint.targetName || 'Неизвестно'}</span>
                            <Badge variant="outline" className="text-xs">
                              {typeLabels[complaint.targetType] || complaint.targetType}
                            </Badge>
                            <Badge className="bg-amber-100 text-amber-800">Ожидает</Badge>
                          </div>
                          <p className="text-sm text-red-600 font-medium">
                            {reasonLabels[complaint.reason] || complaint.reason}
                          </p>
                          {complaint.description && (
                            <p className="text-sm text-muted-foreground">{complaint.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                            <span>От: {complaint.reporterName || complaint.reporterEmail || 'Аноним'}</span>
                            <span>{new Date(complaint.createdAt).toLocaleString('ru-RU')}</span>
                          </div>
                        </div>
                      </div>
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
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">Нет жалоб</h3>
                  <p className="text-muted-foreground">Все жалобы рассмотрены</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Complaint resolution dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => { setSelectedComplaint(null); setResolution(''); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Рассмотрение жалобы</DialogTitle>
            <DialogDescription>
              {selectedComplaint?.targetName || 'Неизвестно'} - {selectedComplaint ? (reasonLabels[selectedComplaint.reason] || selectedComplaint.reason) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm">{selectedComplaint?.description || 'Описание не указано'}</p>
              <p className="text-xs text-muted-foreground mt-2">
                От: {selectedComplaint?.reporterName || selectedComplaint?.reporterEmail || 'Аноним'} · {selectedComplaint ? new Date(selectedComplaint.createdAt).toLocaleString('ru-RU') : ''}
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
            <Button variant="outline" onClick={() => { setSelectedComplaint(null); setResolution(''); }}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedComplaint && handleRejectComplaint(selectedComplaint.id)}
              disabled={processingId === selectedComplaint?.id}
            >
              {processingId === selectedComplaint?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <XCircle className="w-4 h-4 mr-1" />
              )}
              Отклонить жалобу
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => selectedComplaint && handleResolveComplaint(selectedComplaint.id)}
              disabled={processingId === selectedComplaint?.id}
            >
              {processingId === selectedComplaint?.id ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Принять меры
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
