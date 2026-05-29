import { createClient } from "@supabase/supabase-js";

const url = "https://laopwvhyifrkuivtscan.supabase.co";
const key = "sb_publishable_7fugWtySD_2ejVK4iCOUvw_C6fmpaY_";

const supabase = createClient(url, key);

console.log("🔌 Testing Supabase connection...");

const { data, error } = await supabase
	.from("_test_connection_")
	.select("*")
	.limit(1);

const connectionErrors = ["42P01", "PGRST116", "PGRST200"];
const isTableMissing =
	error &&
	(connectionErrors.includes(error.code) ||
		error.message?.includes("schema cache") ||
		error.message?.includes("does not exist") ||
		error.message?.includes("Could not find"));

if (isTableMissing) {
	console.log(
		"✅ Connection successful! Supabase is reachable. (No tables yet — that is expected)",
	);
} else if (error) {
	console.error("❌ Connection failed:", error.message, "| code:", error.code);
} else {
	console.log("✅ Connection successful!", data);
}
