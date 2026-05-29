import { NextResponse } from "next/server";
import { semanticSearch } from "@/lib/semantic/search";

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

		const userId = 1;
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
