import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Handshake, Plus, Loader2, AlertCircle } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CommunityCard } from '@/components/community/CommunityCard';
import { CollabCard } from '@/components/community/CollabCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  fetchCommunities,
  joinCommunity,
  leaveCommunity,
  fetchCollaborations,
  respondToCollaboration,
  type Community,
  type Collaboration,
} from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CommunityPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCollabsLoading, setIsCollabsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collabsError, setCollabsError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  const isLoggedIn = !!localStorage.getItem('token');

  useEffect(() => {
    loadCommunities();
    loadCollaborations();
  }, []);

  const loadCommunities = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCommunities();
      setCommunities(data);
    } catch (err) {
      setError('Не удалось загрузить сообщества');
      console.error('Failed to load communities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCollaborations = async () => {
    setIsCollabsLoading(true);
    setCollabsError(null);
    try {
      const data = await fetchCollaborations();
      setCollaborations(data);
    } catch (err) {
      setCollabsError('Не удалось загрузить коллаборации');
      console.error('Failed to load collaborations:', err);
    } finally {
      setIsCollabsLoading(false);
    }
  };

  const handleJoin = async (communityId: string) => {
    if (!isLoggedIn) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы присоединиться к группе',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setJoiningId(communityId);
    try {
      await joinCommunity(communityId);
      toast({
        title: 'Успешно',
        description: 'Вы присоединились к группе',
      });
      loadCommunities();
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось присоединиться к группе',
        variant: 'destructive',
      });
    } finally {
      setJoiningId(null);
    }
  };

  const handleLeave = async (communityId: string) => {
    setJoiningId(communityId);
    try {
      await leaveCommunity(communityId);
      toast({
        title: 'Успешно',
        description: 'Вы покинули группу',
      });
      loadCommunities();
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось покинуть группу',
        variant: 'destructive',
      });
    } finally {
      setJoiningId(null);
    }
  };

  const handleCreateGroup = () => {
    if (!isLoggedIn) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы создать группу',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    // TODO: Open create group modal
    toast({
      title: 'В разработке',
      description: 'Создание групп скоро будет доступно',
    });
  };

  const handleCreateCollab = () => {
    if (!isLoggedIn) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы создать запрос',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }
    // TODO: Open create collab modal
    toast({
      title: 'В разработке',
      description: 'Создание запросов скоро будет доступно',
    });
  };

  const handleRespond = async (collabId: string) => {
    if (!isLoggedIn) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите, чтобы откликнуться',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setRespondingId(collabId);
    try {
      await respondToCollaboration(collabId, 'Здравствуйте! Заинтересован в сотрудничестве.');
      toast({
        title: 'Успешно',
        description: 'Ваш отклик отправлен',
      });
      loadCollaborations();
    } catch (err) {
      toast({
        title: 'Ошибка',
        description: err instanceof Error ? err.message : 'Не удалось откликнуться',
        variant: 'destructive',
      });
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">Сообщество</h1>
            </div>
            <p className="text-muted-foreground">
              Группы по интересам и биржа коллабораций
            </p>
          </div>
        </div>

        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="groups" className="gap-2 data-[state=active]:bg-background">
              <Users className="w-4 h-4" />
              Группы
            </TabsTrigger>
            <TabsTrigger value="collabs" className="gap-2 data-[state=active]:bg-background">
              <Handshake className="w-4 h-4" />
              Коллаборации
            </TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Присоединяйтесь к группам по интересам
              </p>
              {isLoggedIn && (
                <Button variant="outline" size="sm" onClick={handleCreateGroup}>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать группу
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-4" onClick={loadCommunities}>
                  Попробовать снова
                </Button>
              </div>
            ) : communities.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Пока нет активных групп</p>
                {isLoggedIn && (
                  <Button className="mt-4" onClick={handleCreateGroup}>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать первую группу
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {communities.map((community) => (
                  <CommunityCard
                    key={community.id}
                    community={community}
                    onJoin={() => handleJoin(community.id)}
                    onLeave={() => handleLeave(community.id)}
                    isLoading={joiningId === community.id}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="collabs" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Найдите партнеров для совместных проектов
              </p>
              {isLoggedIn && (
                <Button size="sm" className="btn-glow" onClick={handleCreateCollab}>
                  <Plus className="w-4 h-4 mr-2" />
                  Создать запрос
                </Button>
              )}
            </div>

            {isCollabsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : collabsError ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mb-4" />
                <p className="text-muted-foreground">{collabsError}</p>
                <Button variant="outline" className="mt-4" onClick={loadCollaborations}>
                  Попробовать снова
                </Button>
              </div>
            ) : collaborations.length === 0 ? (
              <div className="text-center py-12">
                <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Пока нет активных запросов на коллаборацию</p>
                {isLoggedIn && (
                  <Button className="mt-4" onClick={handleCreateCollab}>
                    <Plus className="w-4 h-4 mr-2" />
                    Создать первый запрос
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborations.map((collab) => (
                  <CollabCard
                    key={collab.id}
                    collab={collab}
                    onRespond={() => handleRespond(collab.id)}
                    isLoading={respondingId === collab.id}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
