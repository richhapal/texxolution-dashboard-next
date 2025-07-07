#!/bin/bash

# Component Size Analysis Script
# This script provides multiple ways to analyze component sizes

echo "🔍 Component Size Analysis Tool"
echo "==============================="

# Create the scripts directory if it doesn't exist
mkdir -p scripts

# 1. Create a detailed bundle analyzer script
cat > "./scripts/analyze-components.js" << 'EOF'
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Analyzing Component Sizes...\n');

// Function to get file size in KB
function getFileSizeInKB(filepath) {
  try {
    const stats = fs.statSync(filepath);
    return Math.round(stats.size / 1024 * 100) / 100; // Round to 2 decimal places
  } catch (error) {
    return 0;
  }
}

// Function to count lines of code
function countLinesOfCode(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

// Function to analyze imports in a file
function analyzeImports(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const imports = content.match(/import.*from.*['"][^'"]+['"]/g) || [];
    return imports.length;
  } catch (error) {
    return 0;
  }
}

// Function to find all component files
function findComponentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findComponentFiles(filePath, fileList);
    } else if (file.match(/\.(tsx|jsx|ts|js)$/) && !file.includes('.test.') && !file.includes('.spec.')) {
      fileList.push({
        path: filePath,
        name: file,
        dir: dir.replace(process.cwd(), ''),
        size: getFileSizeInKB(filePath),
        lines: countLinesOfCode(filePath),
        imports: analyzeImports(filePath)
      });
    }
  });
  
  return fileList;
}

// Analyze all components
const srcDir = path.join(process.cwd(), 'src');
const components = findComponentFiles(srcDir);

// Sort by size (largest first)
const sortedBySize = [...components].sort((a, b) => b.size - a.size);

// Sort by lines of code
const sortedByLines = [...components].sort((a, b) => b.lines - a.lines);

// Sort by imports
const sortedByImports = [...components].sort((a, b) => b.imports - a.imports);

// Generate report
console.log('🏆 LARGEST COMPONENTS BY FILE SIZE:');
console.log('=====================================');
sortedBySize.slice(0, 15).forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.name}`);
  console.log(`   Path: ${comp.dir}/${comp.name}`);
  console.log(`   Size: ${comp.size} KB`);
  console.log(`   Lines: ${comp.lines}`);
  console.log(`   Imports: ${comp.imports}`);
  console.log('');
});

console.log('📏 LARGEST COMPONENTS BY LINES OF CODE:');
console.log('=======================================');
sortedByLines.slice(0, 10).forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.name} - ${comp.lines} lines (${comp.size} KB)`);
});

console.log('\n📦 COMPONENTS WITH MOST IMPORTS:');
console.log('================================');
sortedByImports.slice(0, 10).forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.name} - ${comp.imports} imports (${comp.size} KB)`);
});

// Category analysis
console.log('\n📁 SIZE BY CATEGORY:');
console.log('===================');

const categories = {};
components.forEach(comp => {
  const category = comp.dir.split('/')[1] || 'root'; // Get first subdirectory
  if (!categories[category]) {
    categories[category] = { totalSize: 0, count: 0, files: [] };
  }
  categories[category].totalSize += comp.size;
  categories[category].count++;
  categories[category].files.push(comp);
});

Object.entries(categories)
  .sort(([,a], [,b]) => b.totalSize - a.totalSize)
  .forEach(([category, data]) => {
    console.log(`${category}: ${data.totalSize.toFixed(2)} KB (${data.count} files)`);
  });

// Generate detailed JSON report
const report = {
  timestamp: new Date().toISOString(),
  summary: {
    totalComponents: components.length,
    totalSize: components.reduce((sum, comp) => sum + comp.size, 0),
    totalLines: components.reduce((sum, comp) => sum + comp.lines, 0),
    averageSize: components.reduce((sum, comp) => sum + comp.size, 0) / components.length
  },
  largestBySize: sortedBySize.slice(0, 20),
  largestByLines: sortedByLines.slice(0, 20),
  mostImports: sortedByImports.slice(0, 20),
  categories: categories,
  allComponents: components
};

fs.writeFileSync('./component-size-report.json', JSON.stringify(report, null, 2));
console.log('\n📋 Detailed report saved to component-size-report.json');

// Recommendations
console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
console.log('=================================');

const largeComponents = sortedBySize.filter(comp => comp.size > 5);
if (largeComponents.length > 0) {
  console.log('🔴 Large Components (>5KB):');
  largeComponents.slice(0, 5).forEach(comp => {
    console.log(`   - ${comp.name} (${comp.size} KB) - Consider code splitting`);
  });
}

const heavyImportComponents = sortedByImports.filter(comp => comp.imports > 10);
if (heavyImportComponents.length > 0) {
  console.log('\n🟡 Components with Many Imports (>10):');
  heavyImportComponents.slice(0, 5).forEach(comp => {
    console.log(`   - ${comp.name} (${comp.imports} imports) - Consider reducing dependencies`);
  });
}

const longComponents = sortedByLines.filter(comp => comp.lines > 300);
if (longComponents.length > 0) {
  console.log('\n🟠 Long Components (>300 lines):');
  longComponents.slice(0, 5).forEach(comp => {
    console.log(`   - ${comp.name} (${comp.lines} lines) - Consider breaking into smaller components`);
  });
}
EOF

# 2. Create a webpack bundle analyzer for individual components
cat > "./scripts/component-bundle-impact.js" << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('🎯 Component Bundle Impact Analysis\n');

// This script helps identify which components contribute most to bundle size
// by analyzing their dependencies and usage patterns

function analyzeComponentDependencies(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract imports
    const imports = [];
    const importMatches = content.match(/import.*from.*['"][^'"]+['"]/g) || [];
    
    importMatches.forEach(importLine => {
      const match = importLine.match(/from\s+['"]([^'"]+)['"]/);
      if (match) {
        imports.push(match[1]);
      }
    });
    
    // Categorize imports
    const dependencies = {
      external: imports.filter(imp => !imp.startsWith('.') && !imp.startsWith('@/')),
      internal: imports.filter(imp => imp.startsWith('./') || imp.startsWith('../')),
      absolute: imports.filter(imp => imp.startsWith('@/')),
      heroui: imports.filter(imp => imp.includes('@heroui')),
      lucide: imports.filter(imp => imp.includes('lucide')),
      framerMotion: imports.filter(imp => imp.includes('framer-motion')),
      react: imports.filter(imp => imp.includes('react') && !imp.includes('react-')),
      nextjs: imports.filter(imp => imp.includes('next/')),
      others: imports.filter(imp => 
        !imp.startsWith('.') && 
        !imp.startsWith('@/') && 
        !imp.includes('@heroui') && 
        !imp.includes('lucide') && 
        !imp.includes('framer-motion') &&
        !imp.includes('react') &&
        !imp.includes('next/')
      )
    };
    
    return dependencies;
  } catch (error) {
    return null;
  }
}

// Find components with heavy external dependencies
function findComponentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findComponentFiles(filePath, fileList);
    } else if (file.match(/\.(tsx|jsx)$/) && !file.includes('.test.')) {
      const deps = analyzeComponentDependencies(filePath);
      if (deps) {
        fileList.push({
          path: filePath,
          name: file,
          relativePath: path.relative(process.cwd(), filePath),
          dependencies: deps,
          totalExternalDeps: deps.external.length,
          heavyLibraries: deps.heroui.length + deps.framerMotion.length + deps.lucide.length
        });
      }
    }
  });
  
  return fileList;
}

const srcDir = path.join(process.cwd(), 'src');
const components = findComponentFiles(srcDir);

// Sort by external dependencies
const heavyComponents = components
  .filter(comp => comp.totalExternalDeps > 3)
  .sort((a, b) => b.totalExternalDeps - a.totalExternalDeps);

console.log('🚀 COMPONENTS WITH MOST EXTERNAL DEPENDENCIES:');
console.log('==============================================');
heavyComponents.slice(0, 10).forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.name}`);
  console.log(`   Path: ${comp.relativePath}`);
  console.log(`   External Dependencies: ${comp.totalExternalDeps}`);
  console.log(`   Heavy Libraries: ${comp.heavyLibraries}`);
  console.log(`   HeroUI Imports: ${comp.dependencies.heroui.length}`);
  console.log(`   Lucide Icons: ${comp.dependencies.lucide.length}`);
  console.log(`   Framer Motion: ${comp.dependencies.framerMotion.length}`);
  console.log('');
});

// Find components using heavy libraries
const heroUIUsers = components.filter(comp => comp.dependencies.heroui.length > 5);
const lucideUsers = components.filter(comp => comp.dependencies.lucide.length > 3);
const framerUsers = components.filter(comp => comp.dependencies.framerMotion.length > 0);

console.log('📊 LIBRARY USAGE ANALYSIS:');
console.log('=========================');
console.log(`HeroUI Heavy Users (>5 imports): ${heroUIUsers.length} components`);
console.log(`Lucide Heavy Users (>3 imports): ${lucideUsers.length} components`);
console.log(`Framer Motion Users: ${framerUsers.length} components`);

if (heroUIUsers.length > 0) {
  console.log('\n🎨 Top HeroUI Users:');
  heroUIUsers.slice(0, 5).forEach(comp => {
    console.log(`   - ${comp.name}: ${comp.dependencies.heroui.length} HeroUI imports`);
  });
}

if (lucideUsers.length > 0) {
  console.log('\n🔍 Top Lucide Users:');
  lucideUsers.slice(0, 5).forEach(comp => {
    console.log(`   - ${comp.name}: ${comp.dependencies.lucide.length} icon imports`);
  });
}

// Save detailed analysis
const analysis = {
  timestamp: new Date().toISOString(),
  summary: {
    totalComponents: components.length,
    componentsWithExternalDeps: components.filter(c => c.totalExternalDeps > 0).length,
    heavyLibraryUsers: components.filter(c => c.heavyLibraries > 0).length
  },
  heavyComponents: heavyComponents.slice(0, 20),
  libraryUsage: {
    heroUI: heroUIUsers,
    lucide: lucideUsers,
    framerMotion: framerUsers
  },
  allComponents: components
};

fs.writeFileSync('./component-bundle-impact.json', JSON.stringify(analysis, null, 2));
console.log('\n📋 Bundle impact analysis saved to component-bundle-impact.json');
EOF

# 3. Create a real-time bundle monitoring script
cat > "./scripts/monitor-component-changes.js" << 'EOF'
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('👀 Component Change Monitor\n');

// Get current bundle state
function getCurrentBundleState() {
  try {
    execSync('npm run build', { stdio: 'pipe' });
    
    const chunksDir = path.join(process.cwd(), '.next/static/chunks');
    if (!fs.existsSync(chunksDir)) return {};
    
    const chunks = fs.readdirSync(chunksDir);
    const bundleState = {};
    
    chunks.forEach(chunk => {
      if (chunk.endsWith('.js')) {
        const filePath = path.join(chunksDir, chunk);
        const stats = fs.statSync(filePath);
        bundleState[chunk] = Math.round(stats.size / 1024);
      }
    });
    
    return bundleState;
  } catch (error) {
    console.error('Failed to build and analyze bundle:', error.message);
    return {};
  }
}

// Save current state for comparison
const currentState = getCurrentBundleState();
const stateFile = './bundle-state.json';

if (fs.existsSync(stateFile)) {
  const previousState = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  
  console.log('📈 Bundle Size Changes:');
  console.log('======================');
  
  const changes = [];
  
  Object.keys(currentState).forEach(chunk => {
    const currentSize = currentState[chunk];
    const previousSize = previousState[chunk] || 0;
    const change = currentSize - previousSize;
    
    if (change !== 0) {
      changes.push({
        chunk,
        previous: previousSize,
        current: currentSize,
        change: change,
        percentChange: previousSize > 0 ? ((change / previousSize) * 100).toFixed(1) : 'new'
      });
    }
  });
  
  // Sort by absolute change
  changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  
  if (changes.length === 0) {
    console.log('✅ No bundle size changes detected');
  } else {
    changes.forEach(change => {
      const emoji = change.change > 0 ? '📈' : '📉';
      const sign = change.change > 0 ? '+' : '';
      console.log(`${emoji} ${change.chunk}`);
      console.log(`   ${change.previous} KB → ${change.current} KB (${sign}${change.change} KB, ${change.percentChange}%)`);
    });
  }
} else {
  console.log('💾 Saving initial bundle state for future comparisons');
}

fs.writeFileSync(stateFile, JSON.stringify(currentState, null, 2));
EOF

# 4. Create component size optimization suggestions
cat > "./scripts/optimization-suggestions.js" << 'EOF'
const fs = require('fs');
const path = require('path');

console.log('💡 Component Optimization Suggestions\n');

function analyzeComponentForOptimization(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const suggestions = [];
    
    // Check for dynamic imports
    if (!content.includes('dynamic(') && content.includes('import(')) {
      suggestions.push('Consider using dynamic() from next/dynamic for code splitting');
    }
    
    // Check for barrel imports from @heroui/react
    if (content.includes('from "@heroui/react"')) {
      suggestions.push('Replace barrel imports with specific component imports from @heroui/*');
    }
    
    // Check for multiple lucide-react imports
    const lucideImports = (content.match(/from ['"]lucide-react['"]/g) || []).length;
    if (lucideImports > 1) {
      suggestions.push('Consolidate lucide-react imports into a single import statement');
    }
    
    // Check for large inline styles
    if (content.includes('style={{') && content.split('style={{').length > 5) {
      suggestions.push('Consider moving inline styles to CSS classes or styled components');
    }
    
    // Check for heavy animation libraries
    if (content.includes('framer-motion') && content.includes('animate')) {
      suggestions.push('Consider using CSS animations for simple animations instead of framer-motion');
    }
    
    // Check for unused imports
    const imports = content.match(/import\s+{([^}]+)}\s+from/g) || [];
    imports.forEach(importStatement => {
      const importedItems = importStatement.match(/{([^}]+)}/)[1].split(',').map(item => item.trim());
      importedItems.forEach(item => {
        const itemName = item.replace(/\s+as\s+\w+/, '').trim();
        if (!content.includes(itemName + '(') && !content.includes('<' + itemName) && !content.includes(itemName + '.')) {
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
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findComponentFiles(filePath, fileList);
    } else if (file.match(/\.(tsx|jsx)$/) && !file.includes('.test.')) {
      const suggestions = analyzeComponentForOptimization(filePath);
      if (suggestions.length > 0) {
        fileList.push({
          path: filePath,
          name: file,
          relativePath: path.relative(process.cwd(), filePath),
          suggestions: suggestions
        });
      }
    }
  });
  
  return fileList;
}

const srcDir = path.join(process.cwd(), 'src');
const componentsWithSuggestions = findComponentFiles(srcDir);

console.log('🎯 OPTIMIZATION OPPORTUNITIES:');
console.log('==============================');

componentsWithSuggestions.forEach((comp, index) => {
  console.log(`${index + 1}. ${comp.name}`);
  console.log(`   Path: ${comp.relativePath}`);
  comp.suggestions.forEach(suggestion => {
    console.log(`   💡 ${suggestion}`);
  });
  console.log('');
});

console.log(`\n📊 Total components analyzed: ${componentsWithSuggestions.length}`);
console.log(`💡 Components with optimization opportunities: ${componentsWithSuggestions.length}`);

// Save suggestions
fs.writeFileSync('./optimization-suggestions.json', JSON.stringify(componentsWithSuggestions, null, 2));
console.log('📋 Suggestions saved to optimization-suggestions.json');
EOF

echo "✅ Component analysis scripts created!"
echo ""
echo "📊 Available Analysis Commands:"
echo "=============================="
echo ""
echo "1. 📏 Analyze component file sizes:"
echo "   node scripts/analyze-components.js"
echo ""
echo "2. 📦 Analyze bundle impact:"
echo "   node scripts/component-bundle-impact.js"
echo ""
echo "3. 👀 Monitor bundle changes:"
echo "   node scripts/monitor-component-changes.js"
echo ""
echo "4. 💡 Get optimization suggestions:"
echo "   node scripts/optimization-suggestions.js"
echo ""
echo "5. 🎯 Run all analyses:"
echo "   npm run analyze:components"
echo ""

# Add the new script to package.json
npm pkg set scripts.analyze:components="node scripts/analyze-components.js && node scripts/component-bundle-impact.js && node scripts/optimization-suggestions.js"

echo "🚀 Quick Start:"
echo "=============="
echo "Run this command to analyze all your components:"
echo "npm run analyze:components"
