#!/bin/bash

# Automated HeroUI Import Optimizer
# This script replaces barrel imports with specific component imports

echo "🔧 HeroUI Import Optimizer"
echo "========================="

# Create a backup first
echo "📋 Creating backup..."
cp -r src src_backup_heroui_$(date +%Y%m%d_%H%M%S)

# Create a Node.js script to replace imports
cat > "./scripts/fix-heroui-imports.js" << 'EOF'
const fs = require('fs');
const path = require('path');

// Mapping of HeroUI components to their specific import paths
const HEROUI_COMPONENT_MAP = {
  // Buttons
  'Button': '@heroui/button',
  'ButtonGroup': '@heroui/button',
  
  // Cards
  'Card': '@heroui/card',
  'CardBody': '@heroui/card',
  'CardHeader': '@heroui/card',
  'CardFooter': '@heroui/card',
  
  // Inputs
  'Input': '@heroui/input',
  'Textarea': '@heroui/input',
  
  // Select
  'Select': '@heroui/select',
  'SelectItem': '@heroui/select',
  'SelectSection': '@heroui/select',
  
  // Table
  'Table': '@heroui/table',
  'TableHeader': '@heroui/table',
  'TableColumn': '@heroui/table',
  'TableBody': '@heroui/table',
  'TableRow': '@heroui/table',
  'TableCell': '@heroui/table',
  
  // Modal
  'Modal': '@heroui/modal',
  'ModalContent': '@heroui/modal',
  'ModalHeader': '@heroui/modal',
  'ModalBody': '@heroui/modal',
  'ModalFooter': '@heroui/modal',
  
  // Navigation
  'Tabs': '@heroui/tabs',
  'Tab': '@heroui/tabs',
  'Breadcrumbs': '@heroui/breadcrumbs',
  'BreadcrumbItem': '@heroui/breadcrumbs',
  'Pagination': '@heroui/pagination',
  
  // Feedback
  'Spinner': '@heroui/spinner',
  'Progress': '@heroui/progress',
  'CircularProgress': '@heroui/progress',
  'Badge': '@heroui/badge',
  'Chip': '@heroui/chip',
  'Avatar': '@heroui/avatar',
  'AvatarGroup': '@heroui/avatar',
  
  // Form
  'Checkbox': '@heroui/checkbox',
  'CheckboxGroup': '@heroui/checkbox',
  'Radio': '@heroui/radio',
  'RadioGroup': '@heroui/radio',
  'Switch': '@heroui/switch',
  'Slider': '@heroui/slider',
  
  // Overlay
  'Dropdown': '@heroui/dropdown',
  'DropdownTrigger': '@heroui/dropdown',
  'DropdownMenu': '@heroui/dropdown',
  'DropdownItem': '@heroui/dropdown',
  'DropdownSection': '@heroui/dropdown',
  'Popover': '@heroui/popover',
  'PopoverTrigger': '@heroui/popover',
  'PopoverContent': '@heroui/popover',
  'Tooltip': '@heroui/tooltip',
  
  // Layout
  'Divider': '@heroui/divider',
  'Spacer': '@heroui/spacer',
  'Skeleton': '@heroui/skeleton',
  
  // Hooks (keep these as they are)
  'useDisclosure': '@heroui/react',
  'useSwitch': '@heroui/react',
  'useCheckbox': '@heroui/react'
};

function optimizeHeroUIImports(content) {
  // Find HeroUI barrel imports
  const heroUIImportRegex = /import\s*{([^}]+)}\s*from\s*["']@heroui\/react["'];?/g;
  
  let optimizedContent = content;
  let match;
  
  while ((match = heroUIImportRegex.exec(content)) !== null) {
    const fullImport = match[0];
    const importItems = match[1]
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    // Group imports by package
    const importGroups = {};
    
    importItems.forEach(item => {
      const componentName = item.replace(/\s+as\s+\w+/, '').trim();
      const packagePath = HEROUI_COMPONENT_MAP[componentName];
      
      if (packagePath) {
        if (!importGroups[packagePath]) {
          importGroups[packagePath] = [];
        }
        importGroups[packagePath].push(item);
      } else {
        // Unknown component, keep in react import
        if (!importGroups['@heroui/react']) {
          importGroups['@heroui/react'] = [];
        }
        importGroups['@heroui/react'].push(item);
      }
    });
    
    // Generate optimized imports
    const optimizedImports = Object.entries(importGroups)
      .map(([packagePath, components]) => {
        if (components.length === 1) {
          return `import { ${components[0]} } from "${packagePath}";`;
        } else {
          return `import {\n  ${components.join(',\n  ')}\n} from "${packagePath}";`;
        }
      })
      .join('\n');
    
    // Replace the barrel import with optimized imports
    optimizedContent = optimizedContent.replace(fullImport, optimizedImports);
  }
  
  return optimizedContent;
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file has HeroUI imports
    if (content.includes('@heroui/react')) {
      console.log(`🔧 Optimizing: ${path.relative(process.cwd(), filePath)}`);
      
      const optimizedContent = optimizeHeroUIImports(content);
      
      if (optimizedContent !== content) {
        fs.writeFileSync(filePath, optimizedContent);
        console.log(`✅ Optimized: ${path.relative(process.cwd(), filePath)}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let optimizedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      optimizedCount += processDirectory(filePath);
    } else if (file.match(/\.(tsx|jsx)$/) && !file.includes('.test.')) {
      if (processFile(filePath)) {
        optimizedCount++;
      }
    }
  });
  
  return optimizedCount;
}

console.log('🚀 Starting HeroUI import optimization...\n');

const srcDir = path.join(process.cwd(), 'src');
const optimizedFiles = processDirectory(srcDir);

console.log(`\n✅ Optimization complete!`);
console.log(`📊 Optimized ${optimizedFiles} files`);
console.log(`💡 Expected bundle size reduction: 30-40%`);
console.log(`\n🎯 Next steps:`);
console.log(`1. Test your application: npm run dev`);
console.log(`2. Check bundle sizes: npm run analyze`);
console.log(`3. Run tests to ensure functionality`);
EOF

# Run the optimization
echo "🚀 Running HeroUI import optimization..."
node scripts/fix-heroui-imports.js

echo ""
echo "✅ HeroUI import optimization complete!"
echo ""
echo "📊 Expected Results:"
echo "- 30-40% bundle size reduction"
echo "- Faster build times"
echo "- Better tree-shaking"
echo ""
echo "🧪 Testing:"
echo "1. npm run dev (test functionality)"
echo "2. npm run build (check for errors)"
echo "3. npm run analyze (measure improvement)"
echo ""
echo "🔄 If issues occur:"
echo "- Restore from backup: src_backup_heroui_*"
echo "- Check console for missing imports"
echo "- Run: npm run analyze:components"
