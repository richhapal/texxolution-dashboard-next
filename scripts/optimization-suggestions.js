import fs from "fs";
import path from "path";

console.log("💡 Component Optimization Suggestions\n");

function analyzeComponentForOptimization(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const suggestions = [];

    // Check for dynamic imports
    if (!content.includes("dynamic(") && content.includes("import(")) {
      suggestions.push(
        "Consider using dynamic() from next/dynamic for code splitting"
      );
    }

    // Check for barrel imports from @heroui/react
    if (content.includes('from "@heroui/react"')) {
      suggestions.push(
        "Replace barrel imports with specific component imports from @heroui/*"
      );
    }

    // Check for multiple lucide-react imports
    const lucideImports = (content.match(/from ['"]lucide-react['"]/g) || [])
      .length;
    if (lucideImports > 1) {
      suggestions.push(
        "Consolidate lucide-react imports into a single import statement"
      );
    }

    // Check for large inline styles
    if (content.includes("style={{") && content.split("style={{").length > 5) {
      suggestions.push(
        "Consider moving inline styles to CSS classes or styled components"
      );
    }

    // Check for heavy animation libraries
    if (content.includes("framer-motion") && content.includes("animate")) {
      suggestions.push(
        "Consider using CSS animations for simple animations instead of framer-motion"
      );
    }

    // Check for unused imports
    const imports = content.match(/import\s+{([^}]+)}\s+from/g) || [];
    imports.forEach((importStatement) => {
      const importedItems = importStatement
        .match(/{([^}]+)}/)[1]
        .split(",")
        .map((item) => item.trim());
      importedItems.forEach((item) => {
        const itemName = item.replace(/\s+as\s+\w+/, "").trim();
        if (
          !content.includes(itemName + "(") &&
          !content.includes("<" + itemName) &&
          !content.includes(itemName + ".")
        ) {
          suggestions.push(`Possible unused import: ${itemName}`);
        }
      });
    });

    return suggestions;
  } catch (error) {
    return [];
  }
}

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
      const suggestions = analyzeComponentForOptimization(filePath);
      if (suggestions.length > 0) {
        fileList.push({
          path: filePath,
          name: file,
          relativePath: path.relative(process.cwd(), filePath),
          suggestions: suggestions,
        });
      }
    }
  });

  return fileList;
}

const srcDir = path.join(process.cwd(), "src");
const componentsWithSuggestions = findComponentFiles(srcDir);

console.log("🎯 OPTIMIZATION OPPORTUNITIES:");
console.log("==============================");

componentsWithSuggestions.forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.name}`);
  console.log(`   Path: ${comp.relativePath}`);
  comp.suggestions.forEach((suggestion) => {
    console.log(`   💡 ${suggestion}`);
  });
  console.log("");
});

console.log(
  `\n📊 Total components analyzed: ${componentsWithSuggestions.length}`
);
console.log(
  `💡 Components with optimization opportunities: ${componentsWithSuggestions.length}`
);

// Save suggestions
fs.writeFileSync(
  "./optimization-suggestions.json",
  JSON.stringify(componentsWithSuggestions, null, 2)
);
console.log("📋 Suggestions saved to optimization-suggestions.json");
