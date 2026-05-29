import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/semantic/search";
import { requireUserId } from "@/lib/db/get-user";

export async function GET(request: Request) {
	try {
		const url = new URL(request.url);
		const query = url.searchParams.get("q");
		if (!query) {
			return NextResponse.json(
				{ error: "Query parameter 'q' is required" },
				{ status: 400 },
			);
		}

		const userId = await requireUserId();
		const results = await semanticSearch(userId, query);
		return NextResponse.json(results);
	} catch (error) {
		console.error("Search failed:", error);
		return NextResponse.json(
			{ error: "Search failed" },
			{ status: 500 },
		);
	}
}
