/**
 * Generic interface for generating embeddings.
 * This is currently mocked so you can test memory deduplication locally
 * without being locked into OpenAI or paying for API calls.
 * 
 * Once you decide on an AI provider (OpenAI, Anthropic, local Transformers.js),
 * you can swap out the implementation inside this function.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
	// For the MVP testing phase, we return a deterministic pseudorandom 
	// vector based on the text length and character codes, simulating an embedding.
	// We use 1536 dimensions as that is what the DB schema is currently set to.
	const dimensions = 1536;
	const vector = new Array(dimensions).fill(0);
	
	let seed = 0;
	for (let i = 0; i < text.length; i++) {
		seed += text.charCodeAt(i);
	}

	for (let i = 0; i < dimensions; i++) {
		// Pseudorandom math to generate a normalized vector between -1 and 1
		vector[i] = Math.sin(seed + i) * Math.cos(seed * i);
	}

	// Normalize the vector (required for cosine similarity)
	const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
	return vector.map(val => val / (magnitude || 1));
}
