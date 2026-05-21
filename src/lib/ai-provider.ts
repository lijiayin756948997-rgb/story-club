/**
 * AI 模型提供者配置
 * 通过环境变量 AI_PROVIDER 切换，支持：
 * - deepseek: https://api.deepseek.com (国产，便宜)
 * - openai: https://api.openai.com/v1
 * - groq: https://api.groq.com/openai/v1 (免费 Llama)
 */

interface ProviderConfig {
  baseUrl: string;
  defaultModel: string;
}

const PROVIDERS: Record<string, ProviderConfig> = {
  deepseek: {
    baseUrl: "https://api.deepseek.com",
    defaultModel: "deepseek-chat",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
  },
  groq: {
    baseUrl: "https://api.groq.com/openai/v1",
    defaultModel: "llama-3.3-70b-versatile",
  },
};

export function getAIProvider() {
  const provider = process.env.AI_PROVIDER || "deepseek";
  const config = PROVIDERS[provider];

  if (!config) {
    throw new Error(
      `不支持的 AI 提供商: ${provider}。可选: ${Object.keys(PROVIDERS).join(", ")}`
    );
  }

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error(`未配置 AI_API_KEY 环境变量`);
  }

  return {
    baseUrl: config.baseUrl,
    model: process.env.AI_MODEL || config.defaultModel,
    apiKey,
  };
}
