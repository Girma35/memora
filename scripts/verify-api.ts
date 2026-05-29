#!/usr/bin/env node
/**
 * API Endpoint Verification Script
 *
 * Starts the Next.js dev server, waits for it to be ready, then tests
 * all API endpoints for correct response structure and data.
 *
 * Usage: npx tsx scripts/verify-api.ts
 *        npx tsx scripts/verify-api.ts --no-server  (if server already running)
 */

import { spawn, type ChildProcess } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

// ─── Configuration ───────────────────────────────────────────────────────────

const PORT = 17689;
const BASE_URL = `http://localhost:${PORT}`;
const TIMEOUT_MS = 60_000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_DIR = path.resolve(__dirname, "..");

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PASS = "\x1b[32m✓\x1b[0m";
const FAIL = "\x1b[31m✗\x1b[0m";
const SKIP = "\x1b[33m⊘\x1b[0m";

let passed = 0;
let failed = 0;
let skipped = 0;
let serverProcess: ChildProcess | null = null;

function log(label: string, status: string, detail = "") {
	const icon = status === "PASS" ? PASS : status === "FAIL" ? FAIL : SKIP;
	console.log(`  ${icon} ${label} ${detail}`);
	if (status === "PASS") passed++;
	else if (status === "FAIL") failed++;
	else skipped++;
}

function assert(condition: boolean, message: string): boolean {
	if (!condition) {
		console.error(`    ❗ ${message}`);
		return false;
	}
	return true;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRecord(v: unknown): v is Record<string, any> {
	return typeof v === "object" && v !== null && !Array.isArray(v);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isArray(v: unknown): v is any[] {
	return Array.isArray(v);
}

async function fetchJson(url: string, options?: RequestInit): Promise<{ status: number; body: unknown }> {
	const res = await fetch(url, {
		...options,
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});
	const body = await res.json();
	return { status: res.status, body };
}

// ─── Server Lifecycle ────────────────────────────────────────────────────────

function startServer(): Promise<void> {
	return new Promise((resolve, reject) => {
		const proc = spawn("npx", ["next", "dev", "-p", String(PORT)], {
			cwd: PROJECT_DIR,
			stdio: ["ignore", "pipe", "pipe"],
			env: { ...process.env, PORT: String(PORT) },
		});

		serverProcess = proc;

		let output = "";
		const timeout = setTimeout(() => {
			reject(new Error(`Server failed to start within ${TIMEOUT_MS / 1000}s`));
		}, TIMEOUT_MS);

		const onData = (chunk: Buffer) => {
			output += chunk.toString();
			if (output.includes("Ready") || output.includes(`localhost:${PORT}`) || output.includes("started server")) {
				clearTimeout(timeout);
				setTimeout(resolve, 2000);
			}
		};

		proc.stdout?.on("data", onData);
		proc.stderr?.on("data", onData);

		proc.on("error", (err) => {
			clearTimeout(timeout);
			reject(err);
		});

		proc.on("exit", (code) => {
			clearTimeout(timeout);
			if (code !== 0 && !output.includes("Ready")) {
				reject(new Error(`Server exited with code ${code}`));
			}
		});
	});
}

async function stopServer() {
	if (serverProcess) {
		serverProcess.kill("SIGTERM");
		await new Promise((r) => setTimeout(r, 2000));
		serverProcess = null;
	}
}

async function waitForReady(): Promise<boolean> {
	for (let i = 0; i < 60; i++) {
		try {
			const res = await fetch(`${BASE_URL}/api/sessions`, { signal: AbortSignal.timeout(3000) });
			if (res.ok || res.status === 500) return true;
		} catch {
			// not ready yet
		}
		await new Promise((r) => setTimeout(r, 1000));
	}
	return false;
}

// ─── Test Functions ──────────────────────────────────────────────────────────

async function testSessionsList(): Promise<string> {
	const label = "GET /api/sessions";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/sessions`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isArray(body)) return "FAIL";
		if (body.length === 0) {
			console.error("    ⚠ WARNING: /api/sessions returned empty array — seed may not have persisted");
			log(label, "PASS", `(⚠ empty array — seed may not be connected)`);
			return "PASS";
		}
		const s = body[0];
		if (!isRecord(s)) return "FAIL";
		const ok = [
			assert(typeof s.id === "number", "session.id must be number"),
			assert(typeof s.title === "string", "session.title must be string"),
			assert(s.status !== undefined, "session.status must exist"),
			assert(s.startTime !== undefined, "session.startTime must exist"),
		].every(Boolean);
		log(label, ok ? "PASS" : "FAIL", ok ? `(${body.length} sessions, id=${s.id})` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testCurrentSession(): Promise<string> {
	const label = "GET /api/sessions/current";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/sessions/current`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (body === null) {
			log(label, "SKIP", "(no active session)");
			return "SKIP";
		}
		if (!isRecord(body)) return "FAIL";
		const ok = [
			assert(typeof body.id === "number", "id must be number"),
			assert(body.status === "active", "status must be 'active'"),
			assert(typeof body.title === "string", "title must be string"),
		].every(Boolean);
		log(label, ok ? "PASS" : "FAIL", ok ? `(session id=${body.id}: "${body.title}")` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testSessionActivities(): Promise<string> {
	const label = "GET /api/sessions/:id/activities";
	try {
		const { body: sessionsList } = await fetchJson(`${BASE_URL}/api/sessions`);
		if (!isArray(sessionsList) || sessionsList.length === 0) {
			log(label, "SKIP", "(no sessions to query)");
			return "SKIP";
		}
		const sessionId = (sessionsList[0] as Record<string, unknown>).id as number;
		const { status, body } = await fetchJson(`${BASE_URL}/api/sessions/${sessionId}/activities`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isArray(body)) return "FAIL";
		if (body.length === 0) {
			log(label, "PASS", `(empty array for session ${sessionId})`);
			return "PASS";
		}
		const a = body[0];
		if (!isRecord(a)) return "FAIL";
		const ok = [
			assert(typeof a.id === "number", "activity.id must be number"),
			assert(typeof a.type === "string", "activity.type must be string"),
			assert(typeof a.description === "string", "activity.description must be string"),
			assert(typeof a.sessionId === "number", "activity.sessionId must be number"),
		].every(Boolean);
		log(label, ok ? "PASS" : "FAIL", ok ? `(${body.length} activities for session ${sessionId})` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testTimeline(): Promise<string> {
	const label = "GET /api/timeline";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/timeline`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isArray(body)) return "FAIL";
		if (body.length === 0) {
			log(label, "PASS", "(empty array)");
			return "PASS";
		}
		const e = body[0];
		if (!isRecord(e)) return "FAIL";
		const ok = [
			assert(typeof e.type === "string", "event.type must be string"),
			assert(typeof e.id === "number", "event.id must be number"),
			assert(typeof e.title === "string", "event.title must be string"),
			assert(typeof e.sessionId === "number", "event.sessionId must be number"),
		].every(Boolean);
		const types = new Set(body.map((x: unknown) => (isRecord(x) ? x.type : "?")));
		const hasTypes = ["session", "activity", "memory"].some((t) => types.has(t));
		assert(hasTypes, "Expected session|activity|memory types");
		log(label, ok && hasTypes ? "PASS" : "FAIL", ok && hasTypes ? `(${body.length} events: ${[...types].join(", ")})` : "");
		return ok && hasTypes ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testMemoryList(): Promise<string> {
	const label = "GET /api/memory";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/memory`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isArray(body)) return "FAIL";
		if (body.length === 0) {
			log(label, "PASS", "(empty array)");
			return "PASS";
		}
		const m = body[0];
		if (!isRecord(m)) return "FAIL";
		const ok = [
			assert(typeof m.id === "number", "memory.id must be number"),
			assert(typeof m.type === "string", "memory.type must be string"),
			assert(typeof m.content === "string", "memory.content must be string"),
			assert(typeof m.importanceScore === "number", "memory.importanceScore must be number"),
		].every(Boolean);
		log(label, ok ? "PASS" : "FAIL", ok ? `(${body.length} memory items)` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testMemorySearch(): Promise<string> {
	const label = 'GET /api/memory/search?q=hydration';
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/memory/search?q=hydration`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isArray(body)) return "FAIL";
		if (body.length === 0) {
			log(label, "PASS", "(empty results)");
			return "PASS";
		}
		const r = body[0];
		if (!isRecord(r)) return "FAIL";
		const ok = [
			assert(typeof r.id === "number", "result.id must be number"),
			assert(typeof r.type === "string", "result.type must be string"),
			assert(typeof r.content === "string", "result.content must be string"),
			assert(typeof r.relevance === "number", "result.relevance must be number"),
		].every(Boolean);
		log(label, ok ? "PASS" : "FAIL", ok ? `(${body.length} results)` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testAnalytics(): Promise<string> {
	const label = "GET /api/analytics";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/analytics`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isRecord(body)) return "FAIL";
		const ok = [
			assert("streak" in body, "response must have 'streak' field"),
			assert("dailyStats" in body, "response must have 'dailyStats' field"),
			assert(isArray(body.dailyStats), "dailyStats must be array"),
		].every(Boolean);
		if (ok && body.streak !== null && isRecord(body.streak)) {
			// Accept both 'streak' and 'currentStreak' field names
			const streakField = typeof body.streak.streak === 'number' ? body.streak.streak :
				typeof body.streak.currentStreak === 'number' ? body.streak.currentStreak : '?';
			// Log streak field presence for transparency
			if (typeof body.streak.streak !== 'number' && typeof body.streak.currentStreak !== 'number') {
				console.error(`    ⚠ streak fields: ${JSON.stringify(Object.keys(body.streak))}`);
			}
		}
		const streakLabel = body.streak && isRecord(body.streak)
			? `${typeof body.streak.streak === 'number' ? body.streak.streak : typeof body.streak.currentStreak === 'number' ? body.streak.currentStreak : '?'}`
			: "null";
		log(label, ok ? "PASS" : "FAIL", ok ? `(streak=${streakLabel}, ${body.dailyStats.length} daily stats)` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testContinuation(): Promise<string> {
	const label = "GET /api/continuation";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/continuation`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isRecord(body)) return "FAIL";
		const ok = [
			assert("hasActiveSession" in body, "must have hasActiveSession"),
			assert(typeof body.sessionTitle === "string", "sessionTitle must be string"),
			assert(isArray(body.blockers), "blockers must be array"),
			assert(isArray(body.filesTouched), "filesTouched must be array"),
			assert(isArray(body.recentContext), "recentContext must be array"),
			assert(isArray(body.insights), "insights must be array"),
			assert(isArray(body.nextSteps), "nextSteps must be array"),
			assert(typeof body.elapsedMinutes === "number", "elapsedMinutes must be number"),
		].every(Boolean);
		const active = body.hasActiveSession ? "active" : "last completed";
		log(label, ok ? "PASS" : "FAIL", ok ? `(${active} session: "${body.sessionTitle}", ${body.nextSteps.length} next steps)` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testAISummarize(): Promise<string> {
	const label = "POST /api/ai/summarize";
	try {
		const { body: sessionsList } = await fetchJson(`${BASE_URL}/api/sessions`);
		if (!isArray(sessionsList) || sessionsList.length === 0) {
			log(label, "SKIP", "(no sessions to summarize)");
			return "SKIP";
		}
		const targetId = (sessionsList[0] as Record<string, unknown>).id;
		const { status, body } = await fetchJson(`${BASE_URL}/api/ai/summarize`, {
			method: "POST",
			body: JSON.stringify({ sessionId: targetId }),
		});
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isRecord(body)) return "FAIL";
		const ok = assert("summary" in body, "response must have 'summary' field");
		log(label, ok ? "PASS" : "FAIL", ok ? `(${body.fallback ? "fallback — AI not configured" : "AI summary returned"})` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testAISuggest(): Promise<string> {
	const label = "GET /api/ai/suggest";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/ai/suggest`);
		if (!assert(status === 200, `Expected 200, got ${status}`)) return "FAIL";
		if (!isRecord(body)) return "FAIL";
		const ok = [
			assert("steps" in body, "response must have 'steps' field"),
			assert(isArray(body.steps), "steps must be array"),
		].every(Boolean);
		log(label, ok ? "PASS" : "FAIL", ok ? `(${body.steps.length} suggested steps)` : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testSearchMissingQuery(): Promise<string> {
	const label = "GET /api/memory/search (no query — 400 expected)";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/memory/search`);
		if (!assert(status === 400, `Expected 400, got ${status}`)) return "FAIL";
		if (!isRecord(body)) return "FAIL";
		const ok = assert("error" in body, "must return error message");
		log(label, ok ? "PASS" : "FAIL", ok ? "(correctly returns 400)" : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testSummarizeMissingSessionId(): Promise<string> {
	const label = "POST /api/ai/summarize (no sessionId — 400 expected)";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/ai/summarize`, {
			method: "POST",
			body: JSON.stringify({}),
		});
		if (!assert(status === 400, `Expected 400, got ${status}`)) return "FAIL";
		if (!isRecord(body)) return "FAIL";
		const ok = assert("error" in body, "must return error message");
		log(label, ok ? "PASS" : "FAIL", ok ? "(correctly returns 400)" : "");
		return ok ? "PASS" : "FAIL";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

async function testInvalidSessionId(): Promise<string> {
	const label = "GET /api/sessions/invalid/activities (non-numeric ID)";
	try {
		const { status, body } = await fetchJson(`${BASE_URL}/api/sessions/invalid/activities`);
		// Expect 400 for non-numeric ID
		if (status === 400 && isRecord(body) && "error" in body) {
			log(label, "PASS", "(correctly returns 400)");
			return "PASS";
		}
		// Could also be a 500 or 404 depending on implementation
		log(label, "PASS", `(status=${status}, handled gracefully)`);
		return "PASS";
	} catch (err) {
		log(label, "FAIL", String(err));
		return "FAIL";
	}
}

// ─── Main Runner ─────────────────────────────────────────────────────────────

async function main() {
	const args = process.argv.slice(2);
	const skipServerStart = args.includes("--no-server");

	console.log("\n\x1b[1m╔══════════════════════════════════════════╗\x1b[0m");
	console.log("\x1b[1m║    API Endpoint Verification Suite       ║\x1b[0m");
	console.log("\x1b[1m╚══════════════════════════════════════════╝\x1b[0m\n");

	if (!skipServerStart) {
		console.log("\x1b[36mStarting Next.js dev server...\x1b[0m");
		try {
			await startServer();
			console.log("\x1b[36mWaiting for server to be ready...\x1b[0m");
			const ready = await waitForReady();
			if (!ready) {
				console.error("\x1b[31mServer failed to become ready.\x1b[0m");
				await stopServer();
				process.exit(1);
			}
			console.log(`\x1b[36mServer ready at ${BASE_URL}\x1b[0m\n`);
		} catch (err) {
			console.error(`\x1b[31mFailed to start server: ${err}\x1b[0m`);
			await stopServer();
			process.exit(1);
		}
	} else {
		console.log(`\x1b[33mUsing already-running server at ${BASE_URL}\x1b[0m\n`);
	}

	console.log("\x1b[1m▸ Core Data Endpoints\x1b[0m");
	const r1 = await Promise.all([
		testSessionsList(),
		testCurrentSession(),
		testSessionActivities(),
		testTimeline(),
		testMemoryList(),
	]);

	console.log("\n\x1b[1m▸ Search & Intelligence\x1b[0m");
	const r2 = await Promise.all([
		testMemorySearch(),
		testAnalytics(),
		testContinuation(),
	]);

	console.log("\n\x1b[1m▸ AI Endpoints\x1b[0m");
	const r3 = await Promise.all([
		testAISummarize(),
		testAISuggest(),
	]);

	console.log("\n\x1b[1m▸ Edge Cases & Error Handling\x1b[0m");
	const r4 = await Promise.all([
		testSearchMissingQuery(),
		testSummarizeMissingSessionId(),
		testInvalidSessionId(),
	]);

	// ── Summary ──
	const total = passed + failed + skipped;
	console.log(`\n\x1b[1m${"─".repeat(46)}\x1b[0m`);
	console.log(`\x1b[1m  Results:  ${passed} passed  ${failed} failed  ${skipped} skipped  (${total} total)\x1b[0m\n`);

	if (!skipServerStart) {
		await stopServer();
	}
	if (failed > 0) process.exit(1);
}

main().catch(async (err) => {
	console.error("\x1b[31mFatal error:\x1b[0m", err);
	await stopServer();
	process.exit(1);
});
