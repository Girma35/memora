import { NextResponse } from "next/server";
import { reconstructContext } from "@/lib/continuation/context-reconstructor";
import { requireUserId } from "@/lib/db/get-user";

export async function GET() {
	try {
		const userId = await requireUserId();
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
