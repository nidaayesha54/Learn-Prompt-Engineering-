import { GoogleGenAI } from "@google/genai";
import { type ChatMessage, type Coordinates, type Source } from '../types';

// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Sends a prompt to the Gemini API and returns the response.
 * @param prompt The user's input.
 * @param history The chat history (not used in this implementation but good for context).
 * @param location The user's coordinates for location-based queries.
 * @param systemPrompt The custom system instruction for the model.
 * @returns A promise that resolves to an object containing the model's text response and an array of sources.
 */
export const getGeminiResponse = async (
  prompt: string,
  history: ChatMessage[],
  location: Coordinates | null,
  systemPrompt: string
): Promise<{ text: string; sources: Source[] }> => {
  const model = "gemini-2.5-flash";

  // Use Google Search by default for grounding.
  const tools: any[] = [{ googleSearch: {} }];
  let toolConfig: any = undefined;

  // Heuristic to enable Google Maps grounding for location-based queries.
  const locationKeywords = ['near me', 'nearby', 'around here', 'closest', 'restaurants', 'coffee shops', 'parks'];
  if (location && locationKeywords.some(keyword => prompt.toLowerCase().includes(keyword))) {
    tools.push({ googleMaps: {} });
    toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      },
    };
  }

  const config: any = {
    tools: tools,
  };
  if (systemPrompt?.trim()) {
    config.systemInstruction = systemPrompt;
  }

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: config,
      // Conditionally add toolConfig if it has been defined.
      ...(toolConfig && { toolConfig }),
    });

    const text = response.text;
    const sources: Source[] = [];

    // Extract grounding sources from the response metadata.
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      for (const chunk of groundingChunks) {
        if (chunk.web && chunk.web.uri) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri });
        }
        if (chunk.maps && chunk.maps.uri) {
          sources.push({ uri: chunk.maps.uri, title: chunk.maps.title || 'View on Google Maps' });
        }
      }
    }

    if (!text && sources.length === 0) {
      return {
        text: "I couldn't find any information for that. Please try a different query.",
        sources: [],
      };
    }

    return { text, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return {
      text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
      sources: [],
    };
  }
};

// Helper function to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // result is a data URL like "data:audio/webm;base64,..."
      // We only need the base64 part
      const base64data = (reader.result as string).split(',')[1];
      resolve(base64data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Transcribes an audio blob using the Gemini API.
 * @param audioBlob The audio data to transcribe.
 * @returns A promise that resolves to the transcribed text.
 */
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const model = "gemini-2.5-flash";

  try {
    const base64Audio = await blobToBase64(audioBlob);

    const audioPart = {
      inlineData: {
        mimeType: audioBlob.type,
        data: base64Audio,
      },
    };

    const textPart = {
      text: "Please transcribe this audio.",
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [audioPart, textPart] },
    });

    const transcription = response.text;

    if (!transcription) {
      return "Could not transcribe the audio. The response was empty.";
    }

    return transcription;

  } catch (error) {
    console.error("Error calling Gemini API for transcription:", error);
    return "Sorry, I'm having trouble with transcription right now. Please try again in a moment.";
  }
};
