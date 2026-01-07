import { GeminiProvider } from "@/infrastructure/ai/gemini";
import { OllamaProvider } from "@/infrastructure/ai/ollama";
import { OpenAiProvider } from "@/infrastructure/ai/openai";
import { env } from "@/lib/env";

// Define a common interface for AI providers
export interface AiProvider {
  generate(messages: string[]): Promise<string>;
}

// Factory to get the AI provider based on the environment variable
const getAiProvider = (): AiProvider => {
  switch (env.AI_PROVIDER) {
    case "gemini":
      if (!env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not set");

      return new GeminiProvider();
    case "openai":
      if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");

      return new OpenAiProvider();
    case "ollama":
      if (!env.OLLAMA_BASE_URL) throw new Error("OLLAMA_BASE_URL is not set");
      if (!env.OLLAMA_MODEL) throw new Error("OLLAMA_MODEL is not set");

      return new OllamaProvider();
    default:
      throw new Error(`Unsupported AI provider: ${env.AI_PROVIDER}`);
  }
};

export const aiProvider = getAiProvider();
