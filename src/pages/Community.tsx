import { useState } from 'react';
import { Users, Handshake, Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { CommunityCard } from '@/components/community/CommunityCard';
import { CollabCard } from '@/components/community/CollabCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockCommunities, mockCollabs } from '@/data/mockData';

export default function Community() {
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
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Создать группу
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCommunities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collabs" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Найдите партнеров для совместных проектов
              </p>
              <Button size="sm" className="btn-glow">
                <Plus className="w-4 h-4 mr-2" />
                Создать запрос
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCollabs.map((collab) => (
                <CollabCard key={collab.id} collab={collab} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
