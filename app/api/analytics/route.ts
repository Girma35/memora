import { NextResponse } from "next/server";
import { getProductivityStreak, getDailyAnalytics } from "@/lib/db/queries/analytics";

export async function GET() {
	try {
		const userId = 1;
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
