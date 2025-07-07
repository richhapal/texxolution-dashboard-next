import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("👀 Component Change Monitor\n");

// Get current bundle state
function getCurrentBundleState() {
  try {
    execSync("npm run build", { stdio: "pipe" });

    const chunksDir = path.join(process.cwd(), ".next/static/chunks");
    if (!fs.existsSync(chunksDir)) return {};

    const chunks = fs.readdirSync(chunksDir);
    const bundleState = {};

    chunks.forEach((chunk) => {
      if (chunk.endsWith(".js")) {
        const filePath = path.join(chunksDir, chunk);
        const stats = fs.statSync(filePath);
        bundleState[chunk] = Math.round(stats.size / 1024);
      }
    });

    return bundleState;
  } catch (error) {
    console.error("Failed to build and analyze bundle:", error.message);
    return {};
  }
}

// Save current state for comparison
const currentState = getCurrentBundleState();
const stateFile = "./bundle-state.json";

if (fs.existsSync(stateFile)) {
  const previousState = JSON.parse(fs.readFileSync(stateFile, "utf8"));

  console.log("📈 Bundle Size Changes:");
  console.log("======================");

  const changes = [];

  Object.keys(currentState).forEach((chunk) => {
    const currentSize = currentState[chunk];
    const previousSize = previousState[chunk] || 0;
    const change = currentSize - previousSize;

    if (change !== 0) {
      changes.push({
        chunk,
        previous: previousSize,
        current: currentSize,
        change: change,
        percentChange:
          previousSize > 0 ? ((change / previousSize) * 100).toFixed(1) : "new",
      });
    }
  });

  // Sort by absolute change
  changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

  if (changes.length === 0) {
    console.log("✅ No bundle size changes detected");
  } else {
    changes.forEach((change) => {
      const emoji = change.change > 0 ? "📈" : "📉";
      const sign = change.change > 0 ? "+" : "";
      console.log(`${emoji} ${change.chunk}`);
      console.log(
        `   ${change.previous} KB → ${change.current} KB (${sign}${change.change} KB, ${change.percentChange}%)`
      );
    });
  }
} else {
  console.log("💾 Saving initial bundle state for future comparisons");
}

fs.writeFileSync(stateFile, JSON.stringify(currentState, null, 2));
