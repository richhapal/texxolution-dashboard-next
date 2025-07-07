#!/bin/bash

# Bundle Size Reduction Script for Next.js Project
# Run this script to implement bundle optimizations

echo "🚀 Starting Bundle Size Optimization..."

# 1. Install additional optimization packages
echo "📦 Installing optimization packages..."
npm install --save-dev webpack-bundle-analyzer @next/bundle-analyzer

# 2. Create optimized component template
echo "🔧 Creating optimization templates..."

# Create a template for dynamic imports
cat > "./optimization-template.tsx" << 'EOF'
// Template for converting static imports to dynamic imports
import dynamic from 'next/dynamic';

// Before (Static Import):
// import { HeavyComponent } from './HeavyComponent';

// After (Dynamic Import):
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div className="animate-pulse bg-gray-200 h-32 rounded"></div>,
  ssr: false // Set to false for client-side only components
});

// For named exports:
const NamedExportComponent = dynamic(
  () => import('./module').then(mod => ({ default: mod.NamedExport })),
  {
    loading: () => <div>Loading...</div>,
    ssr: false
  }
);

// For conditional loading:
const ConditionalComponent = dynamic(
  () => import('./ConditionalComponent'),
  {
    loading: () => <div>Loading...</div>,
    ssr: false
  }
);

// Usage in JSX remains the same:
// <HeavyComponent />
// <NamedExportComponent />
// <ConditionalComponent />
EOF

# 3. Create bundle optimization checklist
cat > "./BUNDLE_OPTIMIZATION_CHECKLIST.md" << 'EOF'
# Bundle Optimization Checklist

## ✅ Implementation Steps

### Phase 1: Quick Wins (1-2 days)
- [ ] Convert large components to dynamic imports
- [ ] Optimize @heroui/react imports (use specific imports)
- [ ] Convert modals to dynamic imports
- [ ] Optimize TinyMCE loading
- [ ] Update next.config.mjs with performance settings

### Phase 2: Medium Impact (3-5 days)
- [ ] Split Redux store into feature-specific APIs
- [ ] Implement tree-shaking for icon libraries
- [ ] Optimize image loading and formats
- [ ] Remove unused CSS classes
- [ ] Implement code splitting for routes

### Phase 3: Advanced Optimizations (1-2 weeks)
- [ ] Implement service worker for caching
- [ ] Add bundle size monitoring to CI/CD
- [ ] Optimize third-party script loading
- [ ] Implement progressive loading strategies
- [ ] Add performance monitoring

## 🎯 Target Bundle Sizes

### Current Sizes:
- Shared JS: 87.5 kB
- Customer List: 426 kB
- Order List: 409 kB
- Image Upload: 360 kB

### Target Sizes:
- Shared JS: < 60 kB (-30%)
- Customer List: < 250 kB (-40%)
- Order List: < 240 kB (-40%)
- Image Upload: < 200 kB (-45%)

## 📊 Monitoring Commands

```bash
# Analyze bundle sizes
npm run analyze

# Check for unused dependencies
npx depcheck

# Find duplicate dependencies
npx npm-dedupe

# Check bundle size impact
npm run build && ls -la .next/static/chunks/
```

## 🔍 Components to Optimize (Priority Order)

### High Priority (Large Impact):
1. ProductViewModal - Convert to dynamic import
2. ImageGallery - Convert to dynamic import
3. TinyMCE Editor - Already optimized, but can improve loading
4. ProductForm - Split into smaller components

### Medium Priority:
1. QuickActions - Dynamic import
2. AnalyticsCards - Dynamic import
3. Table components - Lazy load
4. Filter components - Dynamic import

### Low Priority:
1. Icons - Use tree-shaking
2. Utility functions - Analyze usage
3. Small components - Monitor impact

## 🛠️ Implementation Examples

### 1. Dynamic Import Pattern:
```tsx
const ComponentName = dynamic(() => import('./ComponentName'), {
  loading: () => <ComponentSkeleton />,
  ssr: false
});
```

### 2. Named Export Pattern:
```tsx
const { ComponentName } = dynamic(() => import('./module'), {
  loading: () => <div>Loading...</div>,
  ssr: false
});
```

### 3. Conditional Loading:
```tsx
const AdminComponent = dynamic(() => import('./AdminComponent'), {
  loading: () => <div>Loading admin features...</div>,
  ssr: false
});

// Use only when needed
{userRole === 'admin' && <AdminComponent />}
```
EOF

# 4. Create package.json scripts for optimization
echo "📝 Adding optimization scripts..."
npm pkg set scripts.analyze="ANALYZE=true npm run build"
npm pkg set scripts.analyze:client="ANALYZE=true npm run build && open .next/analyze/client.html"
npm pkg set scripts.analyze:server="ANALYZE=true npm run build && open .next/analyze/server.html"
npm pkg set scripts.size-limit="npm run build && bundlesize"
npm pkg set scripts.deps-check="npx depcheck"
npm pkg set scripts.deps-dedupe="npx npm-dedupe"

# 5. Run initial analysis
echo "📊 Running initial bundle analysis..."
npm run analyze

echo "✅ Bundle optimization setup complete!"
echo ""
echo "🎯 Next Steps:"
echo "1. Review BUNDLE_OPTIMIZATION_CHECKLIST.md"
echo "2. Use optimization-template.tsx as a guide"
echo "3. Start with Phase 1 optimizations"
echo "4. Monitor progress with 'npm run analyze'"
echo ""
echo "📈 Expected Results:"
echo "- 30-45% reduction in bundle sizes"
echo "- Faster initial page loads"
echo "- Better user experience"
