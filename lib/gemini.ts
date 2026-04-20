import { GoogleGenAI } from "@google/genai";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set in environment");
  return new GoogleGenAI({ apiKey });
}

interface GenerateImageResult {
  imageBase64: string;
  mimeType: string;
  text?: string;
}

/**
 * Gera uma imagem a partir de um prompt de texto.
 * Usa Nano Banana (Gemini 3.1 Flash Image Preview).
 */
export async function generateImage(
  prompt: string,
  aspectRatio: string = "3:4"
): Promise<GenerateImageResult> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio,
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("Sem resposta do Gemini");

  let imageBase64 = "";
  let mimeType = "image/png";
  let text = "";

  for (const part of parts) {
    if (part.text) {
      text += part.text;
    } else if (part.inlineData) {
      imageBase64 = part.inlineData.data ?? "";
      mimeType = part.inlineData.mimeType ?? "image/png";
    }
  }

  if (!imageBase64) throw new Error("Gemini não retornou imagem");

  return { imageBase64, mimeType, text };
}

/**
 * Edita/melhora uma imagem existente com um prompt.
 * Envia a imagem + instrução, recebe imagem editada.
 */
export async function editImage(
  imageBase64: string,
  imageMimeType: string,
  prompt: string,
  aspectRatio: string = "3:4"
): Promise<GenerateImageResult> {
  const ai = getClient();

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: imageMimeType,
              data: imageBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      imageConfig: {
        aspectRatio,
      },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("Sem resposta do Gemini");

  let resultBase64 = "";
  let resultMime = "image/png";
  let text = "";

  for (const part of parts) {
    if (part.text) {
      text += part.text;
    } else if (part.inlineData) {
      resultBase64 = part.inlineData.data ?? "";
      resultMime = part.inlineData.mimeType ?? "image/png";
    }
  }

  if (!resultBase64) throw new Error("Gemini não retornou imagem editada");

  return { imageBase64: resultBase64, mimeType: resultMime, text };
}
