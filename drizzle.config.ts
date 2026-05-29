import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load .env.local variables
dotenv.config({ path: ".env.local" });

export default defineConfig({
	schema: "./lib/db/schema.ts",
	out: "./lib/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
	},
});
