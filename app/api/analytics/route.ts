import { NextResponse } from "next/server";
import { getProductivityStreak, getDailyAnalytics } from "@/lib/db/queries/analytics";
import { requireUserId } from "@/lib/db/get-user";

export async function GET() {
	try {
		const userId = await requireUserId();
		const [streak, dailyStats] = await Promise.all([
			getProductivityStreak(userId),
			getDailyAnalytics(userId, 7),
		]);

		return NextResponse.json({ streak, dailyStats });
	} catch (error) {
		console.error("Failed to fetch analytics:", error);
		return NextResponse.json(
			{ error: "Failed to fetch analytics" },
			{ status: 500 },
		);
	}
}
