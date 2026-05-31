# Memora OS: End-to-End Testing Checklist

This guide is designed for you to test Memora as an end-user from a completely fresh state. Follow these steps sequentially to verify every core feature we've built.

## 🧹 Phase 0: Preparation
- [ ] Open your database (Supabase dashboard) and truncate/clear the `sessions`, `activities`, and `memoryItems` tables (so you can test without seed data).
- [ ] Open the app at `http://localhost:3000`.

## 🏠 Phase 1: The Empty State (Home Page)
- [ ] **Verify Home Page Empty States**: Ensure there are no static placeholders. You should see "No sessions recorded yet", "No files tracked yet", etc.
- [ ] **Verify Navigation**: Click the **Resume Session** button in the top navbar. It should route you to the `/workspace` page.

## ⏱️ Phase 2: Session Lifecycle (Workspace Page)
- [ ] **Start Session**: On the Workspace page, enter a new task (e.g., "Designing User Dashboard") and hit **Start Tracking**.
- [ ] **Verify Active State**: The UI should update to show the session is running.
- [ ] **Check Real-Time Home Page**: Open `http://localhost:3000` in a *new tab*. Ensure it now says "You worked 0.0h on Designing User Dashboard" and shows the active session card.

## 🛡️ Phase 3: Interruption Recovery & Browser Safety
- [ ] **Manual Pause**: Go back to the Workspace tab and click **Pause Session**. 
- [ ] **Context Capture**: A dark-mode modal should appear. Type a summary of what you did (e.g., "Finished the CSS, moving to logic next") and submit.
- [ ] **Verify Save**: The session should end and return to the "Start Session" state.
- [ ] **Test Tab Close Protection**: 
  - Start a *new* session.
  - Click somewhere on the page (to register interaction with the browser).
  - Click the **X** to close the browser tab. 
  - The browser's native "Leave Site?" warning should appear. 
  - Click **Cancel** to stay.
- [ ] **Test Hard Exit Auto-Pause**:
  - Close the tab again and click **Leave**.
  - Re-open the app in a new tab. The session should have successfully *auto-paused* in the background without losing your work state!

## 🧠 Phase 4: AI Chat & Semantic Search
- [ ] **Test ⌘K Bar**: On the Home page, scroll down to the floating `Ask Memora OS anything...` bar.
- [ ] **Trigger Search**: Type a keyword from your previous session (e.g., "Dashboard") and press **Enter**.
- [ ] **Verify Routing**: You should be instantly transported to the `/ai-chat` page.
- [ ] **Verify Auto-Search**: The chat should automatically run a semantic search for "Dashboard" and return the contextual memory from your database.

## 🕰️ Phase 5: Session History
- [ ] **Navigate to Memory**: Click on **Memory** in the sidebar (or navigate to `/session`).
- [ ] **Verify Timeline**: You should see a beautiful, chronological timeline of the sessions you just created.
- [ ] **Verify Details**: Check that the manual summary you wrote earlier ("Finished the CSS...") is visible inside the session block.

---

> [!TIP]
> **What to look out for:** Check your browser's Developer Console (F12) for any red errors during this process. If you can complete this entire list without a crash or error, the MVP core logic is 100% solid!
