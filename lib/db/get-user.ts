import { db } from "./index";
import { users } from "./schema";

/**
 * Resolves the current user ID from the database.
 *
 * For now (no auth), returns the ID of the first user created via seed.
 * Replace this with session-based auth lookup later.
 */
export async function getCurrentUserId(): Promise<number | null> {
	const [user] = await db
		.select({ id: users.id })
		.from(users)
		.limit(1);

	return user?.id ?? null;
}

/**
 * Same as getCurrentUserId but throws if no user exists.
 */
export async function requireUserId(): Promise<number> {
	const id = await getCurrentUserId();
	if (id === null) {
		throw new Error("No user found. Run `npm run db:seed` first.");
	}
	return id;
}
