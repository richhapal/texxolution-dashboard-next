import fs from "fs";
import path from "path";

console.log("🎯 Component Bundle Impact Analysis\n");

// This script helps identify which components contribute most to bundle size
// by analyzing their dependencies and usage patterns

function analyzeComponentDependencies(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    // Extract imports
    const imports = [];
    const importMatches = content.match(/import.*from.*['"][^'"]+['"]/g) || [];

    importMatches.forEach((importLine) => {
      const match = importLine.match(/from\s+['"]([^'"]+)['"]/);
      if (match) {
        imports.push(match[1]);
      }
    });

    // Categorize imports
    const dependencies = {
      external: imports.filter(
        (imp) => !imp.startsWith(".") && !imp.startsWith("@/")
      ),
      internal: imports.filter(
        (imp) => imp.startsWith("./") || imp.startsWith("../")
      ),
      absolute: imports.filter((imp) => imp.startsWith("@/")),
      heroui: imports.filter((imp) => imp.includes("@heroui")),
      lucide: imports.filter((imp) => imp.includes("lucide")),
      framerMotion: imports.filter((imp) => imp.includes("framer-motion")),
      react: imports.filter(
        (imp) => imp.includes("react") && !imp.includes("react-")
      ),
      nextjs: imports.filter((imp) => imp.includes("next/")),
      others: imports.filter(
        (imp) =>
          !imp.startsWith(".") &&
          !imp.startsWith("@/") &&
          !imp.includes("@heroui") &&
          !imp.includes("lucide") &&
          !imp.includes("framer-motion") &&
          !imp.includes("react") &&
          !imp.includes("next/")
      ),
    };

    return dependencies;
  } catch (error) {
    return null;
  }
}

// Find components with heavy external dependencies
function findComponentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      findComponentFiles(filePath, fileList);
    } else if (file.match(/\.(tsx|jsx)$/) && !file.includes(".test.")) {
      const deps = analyzeComponentDependencies(filePath);
      if (deps) {
        fileList.push({
          path: filePath,
          name: file,
          relativePath: path.relative(process.cwd(), filePath),
          dependencies: deps,
          totalExternalDeps: deps.external.length,
          heavyLibraries:
            deps.heroui.length + deps.framerMotion.length + deps.lucide.length,
        });
      }
    }
  });

  return fileList;
}

const srcDir = path.join(process.cwd(), "src");
const components = findComponentFiles(srcDir);

// Sort by external dependencies
const heavyComponents = components
  .filter((comp) => comp.totalExternalDeps > 3)
  .sort((a, b) => b.totalExternalDeps - a.totalExternalDeps);

console.log("🚀 COMPONENTS WITH MOST EXTERNAL DEPENDENCIES:");
console.log("==============================================");
heavyComponents.slice(0, 10).forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.name}`);
  console.log(`   Path: ${comp.relativePath}`);
  console.log(`   External Dependencies: ${comp.totalExternalDeps}`);
  console.log(`   Heavy Libraries: ${comp.heavyLibraries}`);
  console.log(`   HeroUI Imports: ${comp.dependencies.heroui.length}`);
  console.log(`   Lucide Icons: ${comp.dependencies.lucide.length}`);
  console.log(`   Framer Motion: ${comp.dependencies.framerMotion.length}`);
  console.log("");
});

// Find components using heavy libraries
const heroUIUsers = components.filter(
  (comp) => comp.dependencies.heroui.length > 5
);
const lucideUsers = components.filter(
  (comp) => comp.dependencies.lucide.length > 3
);
const framerUsers = components.filter(
  (comp) => comp.dependencies.framerMotion.length > 0
);

console.log("📊 LIBRARY USAGE ANALYSIS:");
console.log("=========================");
console.log(
  `HeroUI Heavy Users (>5 imports): ${heroUIUsers.length} components`
);
console.log(
  `Lucide Heavy Users (>3 imports): ${lucideUsers.length} components`
);
console.log(`Framer Motion Users: ${framerUsers.length} components`);

if (heroUIUsers.length > 0) {
  console.log("\n🎨 Top HeroUI Users:");
  heroUIUsers.slice(0, 5).forEach((comp) => {
    console.log(
      `   - ${comp.name}: ${comp.dependencies.heroui.length} HeroUI imports`
    );
  });
}

if (lucideUsers.length > 0) {
  console.log("\n🔍 Top Lucide Users:");
  lucideUsers.slice(0, 5).forEach((comp) => {
    console.log(
      `   - ${comp.name}: ${comp.dependencies.lucide.length} icon imports`
    );
  });
}

// Save detailed analysis
const analysis = {
  timestamp: new Date().toISOString(),
  summary: {
    totalComponents: components.length,
    componentsWithExternalDeps: components.filter(
      (c) => c.totalExternalDeps > 0
    ).length,
    heavyLibraryUsers: components.filter((c) => c.heavyLibraries > 0).length,
  },
  heavyComponents: heavyComponents.slice(0, 20),
  libraryUsage: {
    heroUI: heroUIUsers,
    lucide: lucideUsers,
    framerMotion: framerUsers,
  },
  allComponents: components,
};

fs.writeFileSync(
  "./component-bundle-impact.json",
  JSON.stringify(analysis, null, 2)
);
console.log(
  "\n📋 Bundle impact analysis saved to component-bundle-impact.json"
);
