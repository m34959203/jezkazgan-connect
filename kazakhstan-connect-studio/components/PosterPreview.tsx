
import React from 'react';
import { GeneratedPoster } from '../types';

interface PosterPreviewProps {
  poster: GeneratedPoster;
}

export const PosterPreview: React.FC<PosterPreviewProps> = ({ poster }) => {
  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <div className="relative aspect-[9/16] w-full rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">
        <img 
          src={poster.imageUrl} 
          className="absolute inset-0 w-full h-full object-cover scale-105"
          alt="Event Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/40" />

        <div className="absolute inset-0 p-8 flex flex-col justify-between text-center">
          <div className="pt-4">
            <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-tighter rounded-full">
              {poster.details.theme}
            </span>
            <h2 className="poster-title text-5xl mt-6 leading-none text-white drop-shadow-2xl">
              {poster.details.title}
            </h2>
            <p className="poster-font text-blue-400 mt-4 text-sm font-bold uppercase tracking-widest">
              {poster.details.tagline}
            </p>
          </div>

          <div className="space-y-6">
            <div className="p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center justify-center gap-2 font-bold">
                  <span className="text-blue-500">📅</span> {poster.details.date}
                </div>
                <div className="h-[1px] w-8 bg-white/10 mx-auto" />
                <div className="flex items-center justify-center gap-2 text-gray-300">
                  <span className="text-blue-500">📍</span> {poster.details.location}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center">
               <div className="text-[9px] text-white/30 uppercase tracking-[0.4em] mb-2">Kazakhstan Connect</div>
               <div className="w-12 h-[1px] bg-blue-500/50" />
            </div>
          </div>
        </div>
      </div>

      <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all text-sm flex items-center justify-center gap-2">
        📥 Скачать афишу
      </button>
    </div>
  );
};
