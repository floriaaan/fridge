import { AiProvider } from "@/infrastructure/ai";
import { env } from "@/lib/env";
import { generateText } from "ai";
import { createOllama } from "ai-sdk-ollama";

export class OllamaProvider implements AiProvider {
  private ollamaInstance: ReturnType<typeof createOllama>;

  constructor() {
    this.ollamaInstance = createOllama({
      baseURL: env.OLLAMA_BASE_URL!,
    });
  }

  async generate(messages: string[]) {
    const { text } = await generateText({
      model: this.ollamaInstance(env.OLLAMA_MODEL!),
      prompt: messages.join("\n"),
    });
    return text;
  }
}
