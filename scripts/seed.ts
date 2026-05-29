import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
	users,
	sessions,
	activities,
	projects,
	memoryItems,
} from "../lib/db/schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function seed() {
	console.log("🌱 Seeding database with mock data...\n");

	// Clean existing data
	await db.delete(memoryItems);
	await db.delete(activities);
	await db.delete(sessions);
	await db.delete(projects);
	await db.delete(users);

	// --- User ---
	const [user] = await db
		.insert(users)
		.values({
			name: "Ake",
			email: "ake@memora.dev",
		})
		.returning();
	console.log(`  ✓ Created user: ${user.name}`);

	// --- Projects ---
	const [memora] = await db
		.insert(projects)
		.values({
			userId: user.id,
			name: "Memora",
			description: "Persistent AI Memory & Productivity OS",
			color: "#00E5FF",
			isActive: "true",
		})
		.returning();

	const [backend] = await db
		.insert(projects)
		.values({
			userId: user.id,
			name: "Backend API",
			description: "Supabase + Drizzle backend services",
			color: "#FF6B6B",
			isActive: "true",
		})
		.returning();
	console.log(`  ✓ Created ${2} projects`);

	// --- Sessions ---

	// Yesterday's session (the main one shown on Home Feed)
	const yesterdayStart = new Date();
	yesterdayStart.setDate(yesterdayStart.getDate() - 1);
	yesterdayStart.setHours(9, 0, 0, 0);

	const yesterdayEnd = new Date(yesterdayStart);
	yesterdayEnd.setHours(13, 12, 0, 0); // 4h 12m

	const [sessionYesterday] = await db
		.insert(sessions)
		.values({
			userId: user.id,
			title: "Authentication Refactor & Middleware Debugging",
			project: "Memora",
			status: "completed",
			startTime: yesterdayStart,
			endTime: yesterdayEnd,
			durationMinutes: 252,
			focusScore: 84,
			summary:
				"Worked on auth middleware refactoring — resolved JWT token refresh logic and investigated session persistence issues on mobile.",
		})
		.returning();

	// Today's session (ongoing)
	const todayStart = new Date();
	todayStart.setHours(9, 0, 0, 0);

	const [sessionToday] = await db
		.insert(sessions)
		.values({
			userId: user.id,
			title: "Deep Work: Authentication Refactor",
			project: "Memora",
			status: "active",
			startTime: todayStart,
			durationMinutes: 52,
			focusScore: 94,
		})
		.returning();

	// Older session
	const olderStart = new Date();
	olderStart.setDate(olderStart.getDate() - 2);
	olderStart.setHours(14, 0, 0, 0);
	const olderEnd = new Date(olderStart);
	olderEnd.setHours(15, 15, 0, 0);

	const [sessionOlder] = await db
		.insert(sessions)
		.values({
			userId: user.id,
			title: "Review: Component Library",
			project: "Memora",
			status: "completed",
			startTime: olderStart,
			endTime: olderEnd,
			durationMinutes: 75,
			focusScore: 65,
		})
		.returning();

	console.log(`  ✓ Created ${3} sessions`);

	// --- Activities for Yesterday's Session ---
	await db.insert(activities).values([
		{
			sessionId: sessionYesterday.id,
			type: "file_edit",
			description: "Modified middleware.ts — refactored token refresh logic",
			metadata: { linesAdded: 24, linesRemoved: 8, file: "middleware.ts" },
			timestamp: new Date(yesterdayStart.getTime() + 15 * 60000),
			durationSeconds: 1800,
		},
		{
			sessionId: sessionYesterday.id,
			type: "file_edit",
			description: "Updated auth.ts — added JWT rotation support",
			metadata: { linesAdded: 42, linesRemoved: 12, file: "auth.ts" },
			timestamp: new Date(yesterdayStart.getTime() + 45 * 60000),
			durationSeconds: 3600,
		},
		{
			sessionId: sessionYesterday.id,
			type: "research",
			description: "Reviewed Next.js middleware documentation",
			metadata: { url: "https://nextjs.org/docs/middleware" },
			timestamp: new Date(yesterdayStart.getTime() + 110 * 60000),
			durationSeconds: 900,
		},
		{
			sessionId: sessionYesterday.id,
			type: "research",
			description: "Compared JWT vs Session cookie approaches",
			metadata: {
				url: "https://stackoverflow.com/questions/...",
				topic: "jwt-vs-session",
			},
			timestamp: new Date(yesterdayStart.getTime() + 125 * 60000),
			durationSeconds: 600,
		},
		{
			sessionId: sessionYesterday.id,
			type: "blocker",
			description: "Session persistence failing on mobile browser instances",
			metadata: {
				severity: "high",
				file: "middleware.ts",
				browser: "Chrome Mobile",
			},
			timestamp: new Date(yesterdayStart.getTime() + 150 * 60000),
		},
		{
			sessionId: sessionYesterday.id,
			type: "commit",
			description: "feat(auth): implement refresh rotation",
			metadata: {
				branch: "feat/auth-refresh",
				hash: "a1b2c3d",
				files: ["auth.ts", "middleware.ts"],
			},
			timestamp: new Date(yesterdayStart.getTime() + 200 * 60000),
		},
		{
			sessionId: sessionYesterday.id,
			type: "pause_point",
			description: "Paused while debugging middleware redirect issue",
			metadata: {
				context: "token refresh handling",
				nextStep: "Verify token refresh logic in production",
			},
			timestamp: yesterdayEnd,
		},
		{
			sessionId: sessionYesterday.id,
			type: "deployment",
			description: "Staging branch deployed to testing environment",
			metadata: { environment: "staging", status: "successful" },
			timestamp: new Date(yesterdayStart.getTime() + 180 * 60000),
		},
	]);

	// --- Activities for Today's Session ---
	await db.insert(activities).values([
		{
			sessionId: sessionToday.id,
			type: "file_edit",
			description: "Modified middleware.ts — debugging SSR hydration",
			metadata: { linesAdded: 8, linesRemoved: 3, file: "middleware.ts" },
			timestamp: new Date(todayStart.getTime() + 10 * 60000),
			durationSeconds: 1200,
		},
		{
			sessionId: sessionToday.id,
			type: "file_edit",
			description: "Updated auth.utils.ts — extracted token helpers",
			metadata: { linesAdded: 56, linesRemoved: 0, file: "auth.utils.ts" },
			timestamp: new Date(todayStart.getTime() + 30 * 60000),
			durationSeconds: 2400,
		},
		{
			sessionId: sessionToday.id,
			type: "blocker",
			description: "Session persistence failing on mobile browser instances",
			metadata: {
				severity: "high",
				file: "middleware.ts",
				browser: "Chrome Mobile",
			},
			timestamp: new Date(todayStart.getTime() + 45 * 60000),
		},
	]);

	// --- Activities for Older Session ---
	await db.insert(activities).values([
		{
			sessionId: sessionOlder.id,
			type: "file_edit",
			description: "Reviewed UI component library structure",
			metadata: { file: "components/" },
			timestamp: olderStart,
			durationSeconds: 2700,
		},
		{
			sessionId: sessionOlder.id,
			type: "break",
			description: "Coffee break",
			durationSeconds: 900,
			timestamp: new Date(olderStart.getTime() + 45 * 60000),
		},
	]);

	console.log(`  ✓ Created ${10} activities`);

	// --- Memory Items ---
	await db.insert(memoryItems).values([
		{
			userId: user.id,
			sessionId: sessionYesterday.id,
			type: "summary",
			content:
				"Fixed sidebar hydration issue — resolved the SSR mismatch in the navigation component. Deployed backend staging successfully.",
			tags: ["hydration", "ssr", "deployment"],
			importanceScore: 85,
		},
		{
			userId: user.id,
			sessionId: sessionYesterday.id,
			type: "insight",
			content:
				"Memory recall high on 'hydration' related files today. You solved a recurring hydration bug by moving the token check strictly into the server-side middleware logic, bypassing the client-side race condition.",
			tags: ["hydration", "middleware", "pattern"],
			importanceScore: 90,
		},
		{
			userId: user.id,
			sessionId: sessionToday.id,
			type: "insight",
			content:
				"You solved a recurring hydration bug by moving the token check strictly into the server-side middleware logic, bypassing the client-side race condition.",
			tags: ["hydration", "debugging", "resolution"],
			importanceScore: 92,
		},
		{
			userId: user.id,
			type: "pattern",
			content:
				"Context usage at 84% based on the last 200 commits. Peak focus typically occurs around 10:15 AM.",
			tags: ["productivity", "focus", "pattern"],
			importanceScore: 75,
		},
		{
			userId: user.id,
			type: "milestone",
			content:
				"Authentication system refactored — JWT token rotation implemented, reducing API calls by 40%.",
			tags: ["auth", "milestone", "optimization"],
			importanceScore: 95,
		},
		{
			userId: user.id,
			type: "insight",
			content:
				"Productivity streak at 12 days — most productive period is 2PM-5PM. Debugging time reduced by 30% this week.",
			tags: ["productivity", "streak", "analytics"],
			importanceScore: 80,
		},
	]);

	console.log(`  ✓ Created ${6} memory items`);

	console.log("\n✅ Seed complete!");
	console.log(`   User ID: ${user.id}`);
	console.log(`   Sessions: 3 (1 active, 2 completed)`);
	console.log(`   Activities: 10`);
	console.log(`   Memory Items: 6`);
	console.log(`\n📊 Home Feed will now show real data.`);

	await client.end();
}

seed().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
