
import React, { useState } from 'react';
import { LoadingState, EventDetails, GeneratedPoster } from './types';
import { refineEventDetails, generatePosterBackground } from './services/geminiService';
import { PosterPreview } from './components/PosterPreview';

const App: React.FC = () => {
  const [loading, setLoading] = useState<LoadingState>(LoadingState.IDLE);
  const [formData, setFormData] = useState<Partial<EventDetails>>({
    title: '',
    date: '',
    location: '',
    description: '',
    theme: 'Modern Nomad'
  });
  const [poster, setPoster] = useState<GeneratedPoster | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(LoadingState.REFINING_TEXT);
    setError(null);

    try {
      const refined = await refineEventDetails(formData);
      setLoading(LoadingState.GENERATING_IMAGE);
      const imageUrl = await generatePosterBackground(refined.imagePrompt);
      
      setPoster({
        imageUrl,
        details: refined
      });
      setLoading(LoadingState.SUCCESS);
    } catch (err: any) {
      setError("Ошибка соединения. Попробуйте еще раз.");
      setLoading(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-white">
      {/* Навигация масштабирована на KZ */}
      <nav className="border-b border-white/5 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-500 italic">KZ</span>
            <div className="h-6 w-[1px] bg-white/20 mx-2" />
            <h1 className="text-lg font-bold tracking-tight uppercase">Connect <span className="text-blue-500 text-xs ml-1">Studio</span></h1>
          </div>
          <div className="text-[10px] text-gray-500 uppercase tracking-widest hidden md:block">
            Креативная платформа всего Казахстана
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <section className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
          <div className="bg-[#1e293b]/40 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span className="p-2 bg-blue-500/20 rounded-lg text-blue-500 text-sm">01</span>
              Ваше событие
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Название события</label>
                <input 
                  type="text" 
                  placeholder="Концерт, выставка или форум"
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-600"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Когда</label>
                  <input 
                    type="text" 
                    placeholder="Дата и время"
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500/50 outline-none transition-all"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Город и локация</label>
                  <input 
                    type="text" 
                    placeholder="Напр: Алматы, Медеу"
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500/50 outline-none transition-all"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Визуальный код</label>
                <select 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl px-4 py-3.5 focus:border-blue-500/50 outline-none"
                  value={formData.theme}
                  onChange={(e) => setFormData({...formData, theme: e.target.value})}
                >
                  <option value="Modern Nomad">Modern Nomad (Этно-футуризм)</option>
                  <option value="Urban Pulse">Urban Pulse (Мегаполис)</option>
                  <option value="Great Steppe">Great Steppe (Природа и простор)</option>
                  <option value="Cyber Shanyrak">Cyber Shanyrak (Технологии)</option>
                  <option value="Silk Road">Silk Road (Классика и история)</option>
                </select>
              </div>

              <button 
                disabled={loading !== LoadingState.IDLE && loading !== LoadingState.SUCCESS && loading !== LoadingState.ERROR}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 uppercase tracking-widest text-sm"
              >
                {loading === LoadingState.REFINING_TEXT && "Анализируем контекст региона..."}
                {loading === LoadingState.GENERATING_IMAGE && "Создаем уникальный визуал..."}
                {loading === LoadingState.IDLE || loading === LoadingState.SUCCESS || loading === LoadingState.ERROR ? "Создать афишу" : null}
              </button>

              {error && <p className="text-red-400 text-center text-xs">{error}</p>}
            </form>
          </div>
        </section>

        <section className="flex flex-col items-center justify-center min-h-[500px]">
          {loading === LoadingState.IDLE && !poster && (
            <div className="text-center p-12 border-2 border-dashed border-white/10 rounded-[3rem] w-full">
              <div className="text-6xl mb-4">🇰🇿</div>
              <h3 className="text-lg font-bold text-gray-400">Студия готова</h3>
              <p className="text-gray-600 text-sm mt-2">Создайте афишу для любого города Казахстана за несколько секунд</p>
            </div>
          )}

          {(loading === LoadingState.REFINING_TEXT || loading === LoadingState.GENERATING_IMAGE) && (
            <div className="text-center">
              <div className="w-16 h-16 border-t-2 border-blue-500 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-blue-500 font-bold uppercase tracking-widest text-xs animate-pulse">
                {loading === LoadingState.REFINING_TEXT ? "Генерируем смыслы..." : "Рисуем атмосферу..."}
              </p>
            </div>
          )}

          {poster && (
            <div className="w-full max-w-sm">
               <PosterPreview poster={poster} />
            </div>
          )}
        </section>
      </main>

      <footer className="mt-20 py-10 border-t border-white/5 text-center">
        <p className="text-xs text-gray-600 uppercase tracking-[0.3em]">
          Powered by <span className="text-gray-400">Kazakhstan Connect AI</span> • 2025
        </p>
      </footer>
    </div>
  );
};

export default App;
