// const express = require("express");
// const cors = require("cors");
// const fs = require("fs");
// const path = require("path");
// const { rankMatchesFor } = require("./scoring");

// const app = express();
// app.use(cors());

// const PORT = 4000;
// const users = JSON.parse(fs.readFileSync(path.join(__dirname, "data/users.json"), "utf-8"));

// app.get("/users", (req, res) => res.json(users));

// app.get("/matches/:userId", (req, res) => {
//   const user = users.find(u => u.id === req.params.userId);
//   if (!user) return res.status(404).json({ error: "User not found" });
//   const matches = rankMatchesFor(user, users);
//   res.json({ userId: user.id, matches });
// });

// app.listen(PORT, () => console.log(`Matching service running on http://localhost:${PORT}`));


const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const {
  findMatchForUser,
  compatibilityScore,
  meetsPreferences
} = require("./logic");

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, "data", "users.json");
let users = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));

// Utility
const getUser = (id) => users.find(u => u.id === id);

// Health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Get all users (for UI)
app.get("/users", (_req, res) => res.json(users));

// === Get ranked matches for a user ===
app.get("/matches/:userId", (req, res) => {
  const currentUser = getUser(req.params.userId);
  if (!currentUser) return res.status(404).json({ error: "User not found" });

  // Use the simplified logic
  const results = findMatchForUser(currentUser, users, 100);

  // Transform for frontend clarity
  const formatted = results.map(r => ({
    userId: r.candidate.id,
    name: r.candidate.name,
    elo: r.candidate.elo,
    eventId: r.candidate.eventId,
    score: r.score,
    reasons: [
      `${r.score} shared interests`,
      `Elo difference: ${Math.abs(r.candidate.elo - currentUser.elo)}`
    ]
  }));

  res.json({
    userId: currentUser.id,
    matches: formatted
  });
});


// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Matching service running at http://localhost:${PORT}`));
