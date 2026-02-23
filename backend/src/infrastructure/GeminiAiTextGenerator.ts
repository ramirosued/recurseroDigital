import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiTextGenerator, AiTextGeneratorResult } from '../core/services/AiTextGenerator';

export class GeminiAiTextGenerator implements AiTextGenerator {
    private readonly modelName: string;
    private client: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        this.modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

        if (apiKey) {
            const genAI = new GoogleGenerativeAI(apiKey);
            this.client = genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    maxOutputTokens: 2048,
                    temperature: 0.3,
                    topP: 0.95
                }
            });
        }
    }

    async generateText(prompt: string): Promise<AiTextGeneratorResult> {
        console.log('Enviando prompt a gemini: ', prompt)
        if (!this.client) {
            throw new Error('GEMINI_API_KEY no está configurada. Define la variable de entorno para usar la IA.');
        }

        const response = await this.client.generateContent({
            contents: [
                {
                    role: 'user',
                    parts: [{ text: prompt }]
                }
            ]
        });

        const text = this.extractText(response);

        if (!text) {
            const modelResponse = response.response;
            const diagnostic = modelResponse
                ? {
                    promptFeedback: modelResponse.promptFeedback ?? null,
                    candidates: (modelResponse.candidates || []).map((candidate) => ({
                        finishReason: candidate.finishReason ?? null,
                        safetyRatings: candidate.safetyRatings ?? null
                    }))
                }
                : { promptFeedback: null, candidates: [] };

            console.error(
                'Diagnóstico Gemini (respuesta vacía):',
                JSON.stringify(diagnostic, null, 2)
            );

            throw new Error('La API de Gemini no devolvió contenido de texto.');
        }

        return {
            text,
            provider: 'google-gemini',
            model: this.modelName
        };
    }

    private extractText(response: Awaited<ReturnType<ReturnType<GoogleGenerativeAI['getGenerativeModel']>['generateContent']>>): string | null {
        const raw = response.response?.text?.();
        if (raw && raw.trim().length > 0) {
            return raw.trim();
        }

        const candidates = response.response?.candidates || [];
        for (const candidate of candidates) {
            const parts = candidate.content?.parts || [];
            const joined = parts
                .map((part: any) => typeof part.text === 'string' ? part.text : '')
                .filter(Boolean)
                .join('\n')
                .trim();
            if (joined.length > 0) {
                return joined;
            }
        }

        return null;
    }
}

