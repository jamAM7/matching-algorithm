// ===== Basic preference filter =====
function meetsPreferences(user, candidate) {
  const prefs = user.desiredAttributes || {};
  const cand = candidate.attributes || {};

  // Normalize genders to lowercase for comparison (this is not really needed but just in case)
  const prefGender = prefs.preferredGender ? prefs.preferredGender.toLowerCase() : null;
  const candGender = cand.gender ? cand.gender.toLowerCase() : null;

  // First check if there is a gender preference, and the candidate has a gender, then check if theyre not equal
  if (prefGender && candGender && prefGender !== candGender) {
    return false;
  }

  // Age range preference
  if (cand.age < prefs.minAge) {
    return false;
  }
  if (cand.age > prefs.maxAge) {
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
  return shared; //  returns simple numeric score like 1,2, or 3/
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
    const userElo = typeof currentUser.elo === "number" ? currentUser.elo : 1500; //sets default here to 1500 for a new user for exmaple
    const candElo = typeof c.elo === "number" ? c.elo : 1500; //sets default here to 1500 for a new user for exmaple
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
