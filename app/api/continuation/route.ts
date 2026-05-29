import { NextResponse } from "next/server";
import { reconstructContext } from "@/lib/continuation/context-reconstructor";

export async function GET() {
	try {
		const userId = 1;
		const context = await reconstructContext(userId);
		return NextResponse.json(context);
	} catch (error) {
		console.error("Failed to reconstruct context:", error);
		return NextResponse.json(
			{ error: "Failed to reconstruct context" },
			{ status: 500 },
		);
	}
}
