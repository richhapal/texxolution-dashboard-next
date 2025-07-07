# Bundle Size Analysis

This project includes comprehensive bundle size analysis tools to help monitor and optimize the application's performance.

## Tools Included

### 1. Next.js Bundle Analyzer

- **Purpose**: Provides detailed visualization of your webpack bundle
- **Output**: Interactive treemap visualization
- **Files**: Generates HTML reports in `.next/analyze/`

### 2. Webpack Bundle Analyzer

- **Purpose**: Advanced bundle analysis with detailed chunk information
- **Output**: Static HTML reports
- **Features**: Shows module sizes, chunk relationships, and optimization opportunities

### 3. Bundlewatch (Optional)

- **Purpose**: CI/CD integration for bundle size monitoring
- **Features**: Set size thresholds and get alerts when bundles exceed limits

## Usage

### Quick Analysis

```bash
# Analyze both client and server bundles
npm run analyze

# Analyze and automatically open client bundle report
npm run analyze:client

# Analyze and automatically open server bundle report
npm run analyze:server

# Analyze and open both reports
npm run analyze:both
```

### Manual Analysis

```bash
# Set environment variable and build
ANALYZE=true npm run build

# View reports
open .next/analyze/client.html
open .next/analyze/server.html
```

### Development Workflow

```bash
# Regular development
npm run dev

# Before deployment - check bundle sizes
npm run analyze:both

# Review the generated reports for optimization opportunities
```

## Understanding the Reports

### Client Bundle Report

- Shows what users download in their browsers
- Focus on reducing large dependencies
- Look for duplicate packages
- Identify unused code

### Server Bundle Report

- Shows server-side code size
- Helps optimize server performance
- Identifies server-side dependencies

## Optimization Strategies

### 1. Code Splitting

```javascript
// Use dynamic imports for large components
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <div>Loading...</div>,
});
```

### 2. Tree Shaking

```javascript
// Import only what you need
import { specific } from "library";
// Instead of
import * as library from "library";
```

### 3. Bundle Analysis Insights

- **Large dependencies**: Consider alternatives or lazy loading
- **Duplicate code**: Use webpack's splitChunks optimization
- **Unused code**: Remove dead code and unused imports
- **Third-party libraries**: Audit and replace heavy libraries

## Setting Up Bundle Size Monitoring

### For CI/CD (Optional)

1. Install bundlewatch globally or as dev dependency
2. Create `.bundlewatch.config.json`:

```json
{
  "files": [
    {
      "path": ".next/static/chunks/*.js",
      "maxSize": "100kb"
    },
    {
      "path": ".next/static/chunks/pages/*.js",
      "maxSize": "50kb"
    }
  ]
}
```

3. Add to your CI pipeline:

```bash
npm run build
npx bundlewatch
```

## Best Practices

1. **Regular Monitoring**: Run bundle analysis before major releases
2. **Set Thresholds**: Establish size limits for different bundle types
3. **Monitor Trends**: Track bundle size changes over time
4. **Optimize Iteratively**: Focus on the largest bundles first
5. **Document Changes**: Note when adding heavy dependencies

## Troubleshooting

### Common Issues

1. **Reports not generated**: Ensure `ANALYZE=true` is set
2. **Large bundle sizes**: Check for duplicate dependencies
3. **Slow analysis**: Large projects may take time to analyze

### Performance Impact

- Bundle analysis only runs when `ANALYZE=true`
- No performance impact on regular builds
- Analysis adds ~30-60 seconds to build time

## Files Generated

```
.next/analyze/
├── client.html          # Client bundle visualization
└── server.html          # Server bundle visualization
```

## Integration with Development Workflow

1. **Pre-commit**: Run analysis on significant changes
2. **PR Reviews**: Include bundle size impact in reviews
3. **Release Process**: Always analyze before production deployment
4. **Performance Monitoring**: Regular bundle size audits

## Next Steps

1. Set up automated bundle size monitoring in CI/CD
2. Establish team guidelines for bundle size thresholds
3. Create alerts for significant size increases
4. Regular optimization reviews based on analysis reports
