import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini API client
// Note: In a real production app, handle API key security carefully.
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateVideoScript = async (topic: string): Promise<string> => {
  if (!apiKey) return "错误：未配置 API 密钥。";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `请为关于“${topic}”的 TikTok/Reels 视频写一个简短、吸引人的视频脚本（30-60秒）。请使用中文编写，并包含 [场景] 和 (音频/旁白) 提示。`,
      config: {
        systemInstruction: "你是一位专业的视频编辑和脚本作家。保持脚本有力且具有病毒传播潜力。请务必使用中文输出。",
      }
    });
    return response.text || "生成脚本失败。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "生成脚本时出错，请检查您的 API 密钥。";
  }
};

export const generateAIImage = async (prompt: string): Promise<{ url: string, base64: string } | null> => {
  if (!apiKey) return null;

  try {
    // Using the pro image model for higher quality assets
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: "16:9",
            imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        const base64 = part.inlineData.data;
        const url = `data:image/png;base64,${base64}`;
        return { url, base64 };
      }
    }
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    return null;
  }
};