import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("📊 Analyzing Component Sizes...\n");

// Function to get file size in KB
function getFileSizeInKB(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return Math.round((stats.size / 1024) * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    return 0;
  }
}

// Function to count lines of code
function countLinesOfCode(filepath) {
  try {
    const content = fs.readFileSync(filepath, "utf8");
    return content.split("\n").length;
  } catch (error) {
    return 0;
  }
}

// Function to analyze imports in a file
function analyzeImports(filepath) {
  try {
    const content = fs.readFileSync(filepath, "utf8");
    const imports = content.match(/import.*from.*['"][^'"]+['"]/g) || [];
    return imports.length;
  } catch (error) {
    return 0;
  }
}

// Function to find all component files
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
    } else if (
      file.match(/\.(tsx|jsx|ts|js)$/) &&
      !file.includes(".test.") &&
      !file.includes(".spec.")
    ) {
      fileList.push({
        path: filePath,
        name: file,
        dir: dir.replace(process.cwd(), ""),
        size: getFileSizeInKB(filePath),
        lines: countLinesOfCode(filePath),
        imports: analyzeImports(filePath),
      });
    }
  });

  return fileList;
}

// Analyze all components
const srcDir = path.join(process.cwd(), "src");
const components = findComponentFiles(srcDir);

// Sort by size (largest first)
const sortedBySize = [...components].sort((a, b) => b.size - a.size);

// Sort by lines of code
const sortedByLines = [...components].sort((a, b) => b.lines - a.lines);

// Sort by imports
const sortedByImports = [...components].sort((a, b) => b.imports - a.imports);

// Generate report
console.log("🏆 LARGEST COMPONENTS BY FILE SIZE:");
console.log("=====================================");
sortedBySize.slice(0, 15).forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.name}`);
  console.log(`   Path: ${comp.dir}/${comp.name}`);
  console.log(`   Size: ${comp.size} KB`);
  console.log(`   Lines: ${comp.lines}`);
  console.log(`   Imports: ${comp.imports}`);
  console.log("");
});

console.log("📏 LARGEST COMPONENTS BY LINES OF CODE:");
console.log("=======================================");
sortedByLines.slice(0, 10).forEach((comp, index) => {
  console.log(
    `${index + 1}. ${comp.name} - ${comp.lines} lines (${comp.size} KB)`
  );
});

console.log("\n📦 COMPONENTS WITH MOST IMPORTS:");
console.log("================================");
sortedByImports.slice(0, 10).forEach((comp, index) => {
  console.log(
    `${index + 1}. ${comp.name} - ${comp.imports} imports (${comp.size} KB)`
  );
});

// Category analysis
console.log("\n📁 SIZE BY CATEGORY:");
console.log("===================");

const categories = {};
components.forEach((comp) => {
  const category = comp.dir.split("/")[1] || "root"; // Get first subdirectory
  if (!categories[category]) {
    categories[category] = { totalSize: 0, count: 0, files: [] };
  }
  categories[category].totalSize += comp.size;
  categories[category].count++;
  categories[category].files.push(comp);
});

Object.entries(categories)
  .sort(([, a], [, b]) => b.totalSize - a.totalSize)
  .forEach(([category, data]) => {
    console.log(
      `${category}: ${data.totalSize.toFixed(2)} KB (${data.count} files)`
    );
  });

// Generate detailed JSON report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalComponents: components.length,
    totalSize: components.reduce((sum, comp) => sum + comp.size, 0),
    totalLines: components.reduce((sum, comp) => sum + comp.lines, 0),
    averageSize:
      components.reduce((sum, comp) => sum + comp.size, 0) / components.length,
  },
  largestBySize: sortedBySize.slice(0, 20),
  largestByLines: sortedByLines.slice(0, 20),
  mostImports: sortedByImports.slice(0, 20),
  categories: categories,
  allComponents: components,
};

fs.writeFileSync(
  "./component-size-report.json",
  JSON.stringify(report, null, 2)
);
console.log("\n📋 Detailed report saved to component-size-report.json");

// Recommendations
console.log("\n💡 OPTIMIZATION RECOMMENDATIONS:");
console.log("=================================");

const largeComponents = sortedBySize.filter((comp) => comp.size > 5);
if (largeComponents.length > 0) {
  console.log("🔴 Large Components (>5KB):");
  largeComponents.slice(0, 5).forEach((comp) => {
    console.log(
      `   - ${comp.name} (${comp.size} KB) - Consider code splitting`
    );
  });
}

const heavyImportComponents = sortedByImports.filter(
  (comp) => comp.imports > 10
);
if (heavyImportComponents.length > 0) {
  console.log("\n🟡 Components with Many Imports (>10):");
  heavyImportComponents.slice(0, 5).forEach((comp) => {
    console.log(
      `   - ${comp.name} (${comp.imports} imports) - Consider reducing dependencies`
    );
  });
}

const longComponents = sortedByLines.filter((comp) => comp.lines > 300);
if (longComponents.length > 0) {
  console.log("\n🟠 Long Components (>300 lines):");
  longComponents.slice(0, 5).forEach((comp) => {
    console.log(
      `   - ${comp.name} (${comp.lines} lines) - Consider breaking into smaller components`
    );
  });
}
