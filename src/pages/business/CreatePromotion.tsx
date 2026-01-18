import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Percent, Calendar, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyBusiness } from '@/hooks/use-api';
import { useToast } from '@/hooks/use-toast';
import { createPromotion } from '@/lib/api';

export default function CreatePromotion() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: business, isLoading } = useMyBusiness();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [conditions, setConditions] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [image, setImage] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Бизнес не найден</p>
        <Button asChild className="mt-4">
          <Link to="/create-business">Создать бизнес</Link>
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !discount || !validUntil) {
      toast({
        title: 'Заполните обязательные поля',
        description: 'Название, скидка и срок действия обязательны',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert date to ISO datetime (end of day)
      const validUntilDate = new Date(`${validUntil}T23:59:59`).toISOString();

      await createPromotion({
        title,
        description: description || undefined,
        discount,
        conditions: conditions || undefined,
        validUntil: validUntilDate,
        image: image || undefined,
      });

      toast({
        title: 'Акция создана!',
        description: 'Акция успешно опубликована',
      });

      navigate('/business/publications');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Не удалось создать акцию';
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/business/publications"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад к публикациям
        </Link>
        <h1 className="text-2xl font-bold">Создать акцию</h1>
        <p className="text-muted-foreground">Добавьте новую акцию для привлечения клиентов</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle>Основная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Название акции *</Label>
              <Input
                id="title"
                placeholder="Например: Скидка 20% на всё меню"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount">Размер скидки/выгода *</Label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="discount"
                  placeholder="20% или 500 тенге"
                  className="pl-10"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                placeholder="Расскажите подробнее об акции..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditions">Условия акции</Label>
              <Textarea
                id="conditions"
                placeholder="При заказе от 5000 тенге, только по будням..."
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Ссылка на изображение</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="image"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="pl-10"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration */}
        <Card>
          <CardHeader>
            <CardTitle>Срок действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="validUntil">Действует до *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="validUntil"
                  type="date"
                  className="pl-10"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-200 dark:border-green-900">
          <p className="text-sm text-green-700 dark:text-green-300">
            Акция сразу будет опубликована и доступна всем пользователям города.
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/business/publications')}>
            Отмена
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? 'Создание...' : 'Создать акцию'}
          </Button>
        </div>
      </form>
    </div>
  );
}
