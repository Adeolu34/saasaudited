import assert from "node:assert/strict";
import { fetchRobotsRules, evaluateRobotsAccess } from "../src/lib/competitors/robots";
import { discoverSourceUrls } from "../src/lib/competitors/discovery";

async function run() {
  const rules = await fetchRobotsRules("saasworthy");

  const blocked = evaluateRobotsAccess(
    "saasworthy",
    "https://www.saasworthy.com/comments/example",
    rules
  );
  assert.equal(blocked.allowed, false, "comments path should be blocked");

  const allowed = evaluateRobotsAccess(
    "saasworthy",
    "https://www.saasworthy.com/list",
    rules
  );
  assert.equal(allowed.allowed, true, "list path should be allowed");

  const discovered = await discoverSourceUrls("saasworthy", { maxPages: 5 });
  assert.ok(discovered.length >= 1, "should discover at least one URL");

  console.log("Competitor smoke checks passed.");
  console.log(`Discovered URLs: ${discovered.length}`);
}

run().catch((err) => {
  console.error("Competitor smoke checks failed:", err);
  process.exit(1);
});
