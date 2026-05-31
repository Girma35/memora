import { db } from "@/lib/db";
import { memoryItems } from "@/lib/db/schema";
import { generateEmbedding } from "../semantic/embeddings";
import { eq, and, desc } from "drizzle-orm";
import { cosineDistance } from "drizzle-orm/sql";

export async function processNewMemory(
	userId: number,
	content: string,
	type: "summary" | "insight" | "pattern" | "milestone" | "decision_log" | "distraction" | "burnout_pattern" | "workflow_inefficiency",
	sessionId?: number
) {
	try {
		// 1. Generate the embedding asynchronously
		const newVector = await generateEmbedding(content);

		// 2. Query the DB for the most similar existing memory
		// cosineDistance returns distance (0 = identical, 2 = completely opposite).
		// Similarity is 1 - distance.
		const nearestMemories = await db
			.select({
				id: memoryItems.id,
				content: memoryItems.content,
				distance: cosineDistance(memoryItems.embedding, newVector),
			})
			.from(memoryItems)
			.where(eq(memoryItems.userId, userId))
			.orderBy(cosineDistance(memoryItems.embedding, newVector))
			.limit(1);

		// 3. The Deduplication Logic (0.85 Threshold)
		if (nearestMemories.length > 0) {
			const topMatch = nearestMemories[0];
			// Convert distance to similarity
			const similarity = 1 - (topMatch.distance as number);

			if (similarity > 0.85) {
				// 🛑 EXACT DUPLICATE OR HIGHLY SIMILAR
				// Action: Do nothing. Drop the memory entirely as requested.
				console.log(`[Memory Ingest] Dropped duplicate memory. Similarity: ${similarity.toFixed(2)}`);
				return;
			}
		}

		// ✅ BRAND NEW TOPIC (No matches found or similarity <= 0.85)
		// Action: Insert straight into the database
		await db.insert(memoryItems).values({
			userId,
			sessionId: sessionId ?? null,
			type,
			content,
			embedding: newVector,
			createdAt: new Date(),
		});

		console.log(`[Memory Ingest] Successfully saved new memory.`);

	} catch (error) {
		console.error("[Memory Ingest] Failed to process memory:", error);
	}
}
