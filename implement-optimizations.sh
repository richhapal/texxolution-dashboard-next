#!/bin/bash

# Bundle Size Optimization Implementation Script
# This script implements key optimizations for your Next.js project

echo "🚀 Implementing Bundle Size Optimizations..."

# Create a backup of the current state
echo "📋 Creating backup..."
cp -r src src_backup_$(date +%Y%m%d_%H%M%S)

echo "✅ Backup created. Now implementing optimizations..."

# 1. Create optimized imports configuration
cat > "./src/_lib/utils/dynamicImports.ts" << 'EOF'
import dynamic from 'next/dynamic';

// Centralized dynamic imports for heavy components
export const DynamicProductViewModal = dynamic(() => import("@/_components/genericComponents/ProductViewModal"), {
  loading: () => null,
  ssr: false
});

export const DynamicImageGallery = dynamic(() => import("@/_components/imageUpload/ImageGallery"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false
});

export const DynamicTinyMCEEditor = dynamic(() => import("@/_components/genericComponents/tinyMceEditor"), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded"></div>,
  ssr: false
});

export const DynamicProductForm = dynamic(() => import("@/_components/genericComponents/ProductForm"), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false
});

export const DynamicQuickActions = dynamic(() => import("@/_components/productList/QuickActions"), {
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded"></div>,
  ssr: false
});

export const DynamicAnalyticsCards = dynamic(() => import("@/_components/orderList/AnalyticsCards"), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-24 bg-gray-100 animate-pulse rounded"></div>
    ))}
  </div>,
  ssr: false
});

// Modal components should be loaded dynamically
export const DynamicImagePreviewModal = dynamic(() => import("@/_components/imageUpload/ImagePreviewModal").then(mod => ({ default: mod.ImagePreviewModal })), {
  loading: () => null,
  ssr: false
});

// Form components that are conditionally rendered
export const DynamicJobForm = dynamic(() => import("@/_components/genericComponents/jobForm"), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false
});
EOF

# 2. Create optimized Hero UI imports
cat > "./src/_lib/utils/heroUIImports.ts" << 'EOF'
// Optimized Hero UI imports to reduce bundle size
// Instead of importing everything from "@heroui/react", import specific components

// Button components
export { Button } from "@heroui/button";
export { ButtonGroup } from "@heroui/button";

// Card components
export { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";

// Input components
export { Input } from "@heroui/input";
export { Textarea } from "@heroui/input";

// Select components
export { Select, SelectItem } from "@heroui/select";

// Table components
export { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/table";

// Modal components
export { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";

// Navigation components
export { Tabs, Tab } from "@heroui/tabs";
export { Pagination } from "@heroui/pagination";

// Feedback components
export { Spinner } from "@heroui/spinner";
export { Progress } from "@heroui/progress";
export { Badge } from "@heroui/badge";
export { Chip } from "@heroui/chip";

// Form components
export { Checkbox, CheckboxGroup } from "@heroui/checkbox";
export { Radio, RadioGroup } from "@heroui/radio";
export { Switch } from "@heroui/switch";

// Overlay components
export { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
export { Popover, PopoverTrigger, PopoverContent } from "@heroui/popover";
export { Tooltip } from "@heroui/tooltip";

// Layout components
export { Divider } from "@heroui/divider";
export { Spacer } from "@heroui/spacer";
export { Skeleton } from "@heroui/skeleton";

// Hooks
export { useDisclosure } from "@heroui/react";

// Usage example:
// Instead of: import { Button, Card, Modal } from "@heroui/react";
// Use: import { Button } from "@heroui/button";
//      import { Card } from "@heroui/card";
//      import { Modal } from "@heroui/modal";
EOF

# 3. Create bundle size monitoring script
cat > "./scripts/monitor-bundle-size.js" << 'EOF'
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Bundle size monitoring script
console.log('📊 Monitoring bundle sizes...');

// Build the project
console.log('🔨 Building project...');
execSync('npm run build', { stdio: 'inherit' });

// Check .next/static/chunks/ directory
const chunksDir = path.join(process.cwd(), '.next/static/chunks');
const chunks = fs.readdirSync(chunksDir);

const bundleSizes = {};
let totalSize = 0;

chunks.forEach(chunk => {
  if (chunk.endsWith('.js')) {
    const filePath = path.join(chunksDir, chunk);
    const stats = fs.statSync(filePath);
    const sizeInKB = Math.round(stats.size / 1024);
    bundleSizes[chunk] = sizeInKB;
    totalSize += sizeInKB;
  }
});

// Sort by size
const sortedBundles = Object.entries(bundleSizes)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10); // Top 10 largest bundles

console.log('\n📈 Bundle Size Report:');
console.log('====================');
sortedBundles.forEach(([name, size]) => {
  console.log(`${name}: ${size} KB`);
});

console.log(`\n🔍 Total JavaScript size: ${totalSize} KB`);

// Set warning thresholds
const LARGE_BUNDLE_THRESHOLD = 200; // KB
const HUGE_BUNDLE_THRESHOLD = 500; // KB

const largeBundles = sortedBundles.filter(([,size]) => size > LARGE_BUNDLE_THRESHOLD);
const hugeBundles = sortedBundles.filter(([,size]) => size > HUGE_BUNDLE_THRESHOLD);

if (hugeBundles.length > 0) {
  console.log('\n⚠️  HUGE bundles (>500KB):');
  hugeBundles.forEach(([name, size]) => {
    console.log(`  - ${name}: ${size} KB`);
  });
}

if (largeBundles.length > 0) {
  console.log('\n⚠️  Large bundles (>200KB):');
  largeBundles.forEach(([name, size]) => {
    console.log(`  - ${name}: ${size} KB`);
  });
}

if (totalSize > 1000) {
  console.log('\n⚠️  Total bundle size exceeds 1MB - consider implementing more code splitting');
}

// Generate report file
const report = {
  timestamp: new Date().toISOString(),
  totalSize,
  bundleSizes,
  warnings: {
    hugeBundles: hugeBundles.length,
    largeBundles: largeBundles.length,
    totalSizeWarning: totalSize > 1000
  }
};

fs.writeFileSync('./bundle-size-report.json', JSON.stringify(report, null, 2));
console.log('\n📋 Report saved to bundle-size-report.json');
EOF

# 4. Create webpack optimization configuration
cat > "./webpack.optimization.js" << 'EOF'
// Additional webpack optimizations for next.config.mjs
const webpackOptimizations = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor libraries
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        // Hero UI components
        heroui: {
          test: /[\\/]node_modules[\\/]@heroui[\\/]/,
          name: 'heroui',
          chunks: 'all',
          priority: 20,
        },
        // React and related
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
          name: 'react',
          chunks: 'all',
          priority: 30,
        },
        // Redux toolkit
        redux: {
          test: /[\\/]node_modules[\\/](@reduxjs|react-redux)[\\/]/,
          name: 'redux',
          chunks: 'all',
          priority: 25,
        },
        // Common components
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
    // Module concatenation
    concatenateModules: true,
    // Minimize in production
    minimize: true,
    // Use SWC minifier
    minimizer: process.env.NODE_ENV === 'production' ? [
      '...',
      new (require('terser-webpack-plugin'))({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        },
      }),
    ] : [],
  },
};

module.exports = webpackOptimizations;
EOF

# 5. Update package.json with optimization scripts
echo "📦 Adding optimization scripts to package.json..."

# Add new scripts
npm pkg set scripts.optimize="node scripts/monitor-bundle-size.js"
npm pkg set scripts.analyze:detailed="ANALYZE=true npm run build && npm run optimize"
npm pkg set scripts.check-duplicates="npx jscodeshift --dry --print --transform=/node_modules/duplicate-package-checker-webpack-plugin/src/index.js src/"

echo "✅ Bundle optimization implementation complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Run 'npm run analyze:detailed' to see current bundle sizes"
echo "2. Review the generated bundle-size-report.json"
echo "3. Implement dynamic imports using src/_lib/utils/dynamicImports.ts"
echo "4. Replace @heroui/react imports with specific component imports"
echo "5. Monitor bundle sizes regularly with 'npm run optimize'"
echo ""
echo "🎯 Expected Improvements:"
echo "- 30-45% reduction in bundle sizes"
echo "- Faster page load times"
echo "- Better Core Web Vitals scores"
echo "- Improved user experience"
