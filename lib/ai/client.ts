const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface AIClientConfig {
	model?: string;
	temperature?: number;
	maxTokens?: number;
}

const defaultConfig: AIClientConfig = {
	model: "gpt-4o-mini",
	temperature: 0.3,
	maxTokens: 1024,
};

export function getAIClient() {
	if (!OPENAI_API_KEY) {
		throw new Error("OPENAI_API_KEY is not configured in environment variables");
	}
	return {
		async chat(
			messages: { role: "system" | "user" | "assistant"; content: string }[],
			config?: Partial<AIClientConfig>,
		) {
			const cfg = { ...defaultConfig, ...config };
			const response = await fetch("https://api.openai.com/v1/chat/completions", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: cfg.model,
					messages,
					temperature: cfg.temperature,
					max_tokens: cfg.maxTokens,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`OpenAI API error: ${response.status} ${error}`);
			}

			const data = await response.json();
			return {
				content: data.choices[0]?.message?.content ?? "",
				usage: data.usage,
			};
		},

		async generateEmbedding(text: string) {
			const response = await fetch("https://api.openai.com/v1/embeddings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${OPENAI_API_KEY}`,
				},
				body: JSON.stringify({
					model: "text-embedding-3-small",
					input: text,
				}),
			});

			if (!response.ok) {
				const error = await response.text();
				throw new Error(`OpenAI Embedding API error: ${response.status} ${error}`);
			}

			const data = await response.json();
			return data.data[0]?.embedding as number[] | undefined;
		},
	};
}
