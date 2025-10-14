// ===== Basic preference filter =====
function meetsPreferences(user, candidate) {
  const prefs = user.desiredAttributes || {};
  const cand = candidate.attributes || {};

  // Normalize genders to lowercase for comparison
  const prefGender = prefs.preferredGender ? prefs.preferredGender.toLowerCase() : null;
  const candGender = cand.gender ? cand.gender.toLowerCase() : null;

  // Gender preference — only check if the user has a preference
  if (prefGender && candGender && prefGender !== candGender) {
    return false;
  }

  // Age range preference
  if (typeof prefs.minAge === "number" && typeof cand.age === "number" && cand.age < prefs.minAge) {
    return false;
  }
  if (typeof prefs.maxAge === "number" && typeof cand.age === "number" && cand.age > prefs.maxAge) {
    return false;
  }

  return true;
}

// ===== Compatibility: shared interests =====
function compatibilityScore(a, b) {
  const interestsA = new Set(a.interests || []);
  const interestsB = new Set(b.interests || []);
  let shared = 0;
  interestsA.forEach(interest => {
    if (interestsB.has(interest)) shared++;
  });
  return shared; // simple numeric score
}

// ===== Main matching logic =====
function findMatchForUser(currentUser, everyone, eloRange = 100) {
  if (!currentUser || !Array.isArray(everyone)) return [];

  // 1 Filter: same event, not self
  let candidates = everyone.filter(
    u => u.id !== currentUser.id && u.eventId === currentUser.eventId
  );

  // 2 Filter: preference checks (gender, age)
  candidates = candidates.filter(c => meetsPreferences(currentUser, c));

  // 3 Filter: Elo range (within ± eloRange)
  candidates = candidates.filter(c => {
    const userElo = typeof currentUser.elo === "number" ? currentUser.elo : 1500;
    const candElo = typeof c.elo === "number" ? c.elo : 1500;
    return Math.abs(candElo - userElo) <= eloRange;
  });

  // 4 Score and sort
  const scored = candidates.map(c => ({
    candidate: c,
    score: compatibilityScore(currentUser, c)
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score; // higher score first
    return (b.candidate.elo ?? 0) - (a.candidate.elo ?? 0); // tie-break by Elo
  });

  // Return all scored matches (ranked)
  return scored;
}

// ===== Export =====
module.exports = {
  meetsPreferences,
  compatibilityScore,
  findMatchForUser
};
