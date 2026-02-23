export interface AiTextGeneratorResult {
    text: string;
    provider: string;
    model: string;
}

export interface AiTextGenerator {
    generateText(prompt: string): Promise<AiTextGeneratorResult>;
}

