// backend/src/common/services/gemini.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService implements OnModuleInit {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI | null = null;

  // Proveedor y modelo utilizado en la última inferencia
  private lastUsedProvider: string = 'Sin conexión';
  private lastUsedModel: string = 'Sin conexión';

  // Configuración de Ollama (IA Local)
  private readonly ollamaBaseUrl: string;
  private readonly ollamaModel: string;
  private readonly ollamaFallbackModel = 'llama3.2:latest';

  // Cascada de modelos vigentes para Google Gemini (Nube)
  private readonly fallbackModels = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];

  constructor(private readonly configService: ConfigService) {
    this.ollamaBaseUrl =
      this.configService.get<string>('OLLAMA_BASE_URL') || 'http://127.0.0.1:11434';
    this.ollamaModel = this.configService.get<string>('OLLAMA_MODEL') || 'qwen2.5-coder:1.5b';

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    const isPlaceholderKey =
      !apiKey ||
      apiKey === 'AIzaSyDemoKeyForDevelopmentMode2026' ||
      apiKey === 'AIzaSyTuClaveRealDeGeminiAqui' ||
      apiKey === 'demo_key' ||
      apiKey.includes('TuClaveReal');

    if (!isPlaceholderKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.logger.log('Google Gemini API inicializado.');
    } else {
      this.logger.log(
        'GEMINI_API_KEY no configurada o es demo. Se priorizará Ollama IA Local (100% Offline).',
      );
    }
  }

  async onModuleInit() {
    this.ensureOllamaModel();
  }

  /**
   * Verifica la disponibilidad del modelo en Ollama y lo descarga automáticamente si no existe.
   */
  public async ensureOllamaModel(): Promise<void> {
    try {
      const res = await fetch(`${this.ollamaBaseUrl}/api/tags`);
      if (res.ok) {
        const data: any = await res.json();
        const models = (data?.models || []).map((m: any) => m.name);
        const targetModel = this.ollamaModel || 'qwen2.5-coder:1.5b';
        const hasModel = models.some(
          (m: string) => m === targetModel || m.startsWith(targetModel) || m.includes('qwen2.5-coder'),
        );
        if (!hasModel) {
          this.logger.warn(
            `Modelo "${targetModel}" no encontrado en Ollama. Iniciando descarga automática...`,
          );
          fetch(`${this.ollamaBaseUrl}/api/pull`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: targetModel, stream: false }),
          })
            .then(async (pullRes) => {
              if (pullRes.ok) {
                this.logger.log(`Modelo "${targetModel}" descargado exitosamente en Ollama.`);
              } else {
                this.logger.warn(`Respuesta al descargar modelo: ${await pullRes.text()}`);
              }
            })
            .catch((err) => {
              this.logger.debug(`Error descargando modelo en Ollama: ${err?.message || err}`);
            });
        } else {
          this.logger.log(`Modelo local "${targetModel}" verificado y listo en Ollama.`);
        }
      }
    } catch (err: any) {
      this.logger.debug(`Ollama aún no está disponible para verificar tags: ${err?.message || err}`);
    }
  }

  public getLastUsedProvider(): string {
    return this.lastUsedProvider;
  }

  public getLastUsedModel(): string {
    return this.lastUsedModel;
  }

  /**
   * Intenta generar respuesta JSON usando el servidor local de Ollama.
   */
  private async tryOllamaJson<T>(prompt: string): Promise<T | null> {
    const candidateModels = [
      this.ollamaModel,
      this.ollamaFallbackModel,
      'qwen2.5-coder:1.5b',
      'llama3.2:latest',
      'llama3.2',
    ];
    const modelsToTry = Array.from(new Set(candidateModels.filter(Boolean)));

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            prompt,
            stream: false,
            format: 'json',
            options: {
              temperature: 0.2,
              num_predict: 350,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data: any = await response.json();
          if (data && data.response) {
            const cleanJson = this.sanitizeJsonString(data.response);
            const parsed = JSON.parse(cleanJson) as T;
            this.lastUsedProvider = 'Ollama (Local)';
            this.lastUsedModel = model;
            this.logger.log(`Inferencia exitosa con Ollama Local [Modelo: ${model}]`);
            return parsed;
          }
        } else {
          this.logger.warn(`Ollama HTTP ${response.status} para modelo ${model}`);
          if (response.status === 404) {
            this.ensureOllamaModel();
          }
        }
      } catch (err: any) {
        this.logger.debug(
          `Ollama con modelo ${model} no disponible o timeout: ${err?.message || err}`,
        );
      }
    }

    return null;
  }

  /**
   * Intenta generar texto libre usando el servidor local de Ollama.
   */
  private async tryOllamaText(prompt: string): Promise<string | null> {
    const candidateModels = [
      this.ollamaModel,
      this.ollamaFallbackModel,
      'qwen2.5-coder:1.5b',
      'llama3.2:latest',
      'llama3.2',
    ];
    const modelsToTry = Array.from(new Set(candidateModels.filter(Boolean)));

    for (const model of modelsToTry) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

        const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model,
            prompt,
            stream: false,
            options: {
              temperature: 0.4,
              num_predict: 350,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data: any = await response.json();
          if (data && data.response) {
            this.lastUsedProvider = 'Ollama (Local)';
            this.lastUsedModel = model;
            return data.response.trim();
          }
        }
      } catch (err: any) {
        this.logger.debug(`Ollama texto con modelo ${model} falló: ${err?.message || err}`);
      }
    }

    return null;
  }

  /**
   * Genera contenido estructurado en JSON:
   * 1. Prioridad: Ollama Local (100% offline y rápido)
   * 2. Cascada: Google Gemini (Nube) si está configurado
   * 3. Fallback: Generador determinista seguro
   */
  async generateJson<T>(prompt: string, fallbackGenerator: () => T): Promise<T> {
    // 1. Intentar Ollama Local
    const localResult = await this.tryOllamaJson<T>(prompt);
    if (localResult !== null) {
      return localResult;
    }

    // 2. Intentar Google Gemini en la nube
    if (this.genAI) {
      const deadline = Date.now() + 10000;
      for (const modelName of this.fallbackModels) {
        const remaining = deadline - Date.now();
        if (remaining < 500) break;
        try {
          this.logger.log(`Intentando inferencia Gemini con modelo: ${modelName}`);
          const model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const response = await model.generateContent(prompt, {
            timeout: Math.min(remaining, 6000),
          });
          const text = response.response.text();

          const cleanJson = this.sanitizeJsonString(text);
          const parsed = JSON.parse(cleanJson) as T;

          this.lastUsedProvider = 'Google Gemini (Nube)';
          this.lastUsedModel = modelName;
          return parsed;
        } catch (error: any) {
          this.logger.warn(`Fallo en Gemini ${modelName}: ${error?.message || error}.`);
        }
      }
    }

    // 3. Fallback determinista
    this.logger.warn('Tanto Ollama como Gemini no respondieron. Ejecutando fallback determinista.');
    this.lastUsedProvider = 'Sin conexión';
    this.lastUsedModel = 'Sin conexión';
    return fallbackGenerator();
  }

  /**
   * Genera texto libre:
   * 1. Prioridad: Ollama Local
   * 2. Cascada: Google Gemini
   * 3. Fallback: Generador determinista
   */
  async generateText(prompt: string, fallbackGenerator: () => string): Promise<string> {
    // 1. Intentar Ollama Local
    const localText = await this.tryOllamaText(prompt);
    if (localText !== null && localText.length > 0) {
      return localText;
    }

    // 2. Intentar Google Gemini en la nube
    if (this.genAI) {
      const deadline = Date.now() + 10000;
      for (const modelName of this.fallbackModels) {
        const remaining = deadline - Date.now();
        if (remaining < 500) break;
        try {
          const model = this.genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.4,
            },
          });

          const response = await model.generateContent(prompt, {
            timeout: Math.min(remaining, 6000),
          });
          this.lastUsedProvider = 'Google Gemini (Nube)';
          this.lastUsedModel = modelName;
          return response.response.text().trim();
        } catch (error: any) {
          this.logger.warn(`Fallo en Gemini ${modelName} para generateText: ${error?.message || error}.`);
        }
      }
    }

    this.lastUsedProvider = 'Sin conexión';
    this.lastUsedModel = 'Sin conexión';
    return fallbackGenerator();
  }

  /**
   * Limpia delimitadores markdown ```json ... ``` que pueda agregar el LLM
   */
  private sanitizeJsonString(rawText: string): string {
    let sanitized = rawText.trim();
    if (sanitized.startsWith('```json')) {
      sanitized = sanitized.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (sanitized.startsWith('```')) {
      sanitized = sanitized.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return sanitized.trim();
  }
}
