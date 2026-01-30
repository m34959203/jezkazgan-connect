
import { GoogleGenAI, Type } from "@google/genai";
import { EventDetails } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
};

/**
 * Использует Gemini 3 Flash для адаптации текста под контекст любого города Казахстана.
 */
export const refineEventDetails = async (rawInput: Partial<EventDetails>): Promise<EventDetails & { imagePrompt: string }> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Ты — ведущий креативный директор платформы 'Kazakhstan Connect'. 
               Твоя задача: превратить входящие данные в стильный текст для афиши события в Казахстане.
               Входящие данные: ${JSON.stringify(rawInput)}
               
               Инструкции:
               1. Обязательно учитывай специфику указанного города. Если это Алматы — добавь вайб гор и яблок, если Астана — футуризм и левый берег, если Актау — Каспий, если малые города — уют и сообщество.
               2. Если локация не указана или указана неточно, предложи знаковые места этого города.
               3. Сгенерируй детальный 'imagePrompt' для фона. Используй современные визуальные тренды, избегай клише, добавляй тонкие национальные элементы (шанырак, орнамент в стиле минимализма, ландшафты Казахстана).
               
               Верни строго JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          tagline: { type: Type.STRING },
          date: { type: Type.STRING },
          location: { type: Type.STRING },
          description: { type: Type.STRING },
          theme: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ["title", "tagline", "date", "location", "description", "theme", "imagePrompt"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generatePosterBackground = async (prompt: string): Promise<string> => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `Professional high-end cinematic poster background: ${prompt}. Cinematic lighting, 8k resolution, artistic composition, no text. Reflect the unique atmosphere and aesthetics of modern Kazakhstan.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "9:16"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Не удалось сгенерировать изображение");
};
