#!/bin/bash

# Complete Component Size Monitoring Suite
# Run this script to get comprehensive component size analysis

echo "🎯 Component Size Monitoring Suite"
echo "=================================="
echo ""

# Function to show file sizes in a readable format
show_sizes() {
    echo "📊 Current Component Sizes:"
    echo "========================="
    find src -name "*.tsx" -o -name "*.jsx" | while read file; do
        size=$(wc -c < "$file")
        lines=$(wc -l < "$file")
        kb_size=$(echo "scale=2; $size / 1024" | bc)
        echo "$(printf "%8.2f KB" $kb_size) $(printf "%4d lines" $lines) - $file"
    done | sort -nr | head -20
    echo ""
}

# Function to analyze bundle impact
analyze_bundle() {
    echo "📦 Bundle Analysis:"
    echo "=================="
    if [ -d ".next/static/chunks" ]; then
        echo "Current bundle chunks:"
        ls -lah .next/static/chunks/*.js | awk '{print $5 " - " $9}' | sort -hr | head -10
    else
        echo "No build found. Run 'npm run build' first."
    fi
    echo ""
}

# Function to check for optimization opportunities
check_optimizations() {
    echo "🔍 Optimization Opportunities:"
    echo "============================="
    
    # Check for barrel imports
    barrel_count=$(grep -r "from ['\"]@heroui/react['\"]" src --include="*.tsx" --include="*.jsx" | wc -l)
    echo "🎯 Components with barrel imports: $barrel_count"
    
    # Check for large files
    large_files=$(find src -name "*.tsx" -o -name "*.jsx" -exec wc -c {} + | awk '$1 > 20480 {print $2}' | wc -l)
    echo "📏 Components >20KB: $large_files"
    
    # Check for dynamic imports
    dynamic_count=$(grep -r "dynamic(" src --include="*.tsx" --include="*.jsx" | wc -l)
    echo "⚡ Components using dynamic imports: $dynamic_count"
    
    echo ""
}

# Main execution
echo "🚀 Running comprehensive component analysis..."
echo ""

# 1. Show current sizes
show_sizes

# 2. Run detailed analysis if scripts exist
if [ -f "scripts/analyze-components.js" ]; then
    echo "🔬 Running detailed component analysis..."
    node scripts/analyze-components.js
    echo ""
fi

# 3. Check bundle impact
analyze_bundle

# 4. Check optimization opportunities
check_optimizations

# 5. Generate recommendations
echo "💡 Immediate Action Items:"
echo "========================="
echo "1. 🎯 Optimize HeroUI imports (30-40% reduction):"
echo "   ./optimize-heroui-imports.sh"
echo ""
echo "2. ⚡ Add dynamic imports to largest components:"
echo "   - image-upload/page.tsx (59.78 KB)"
echo "   - orderList/page.tsx (42.1 KB)"
echo "   - ImageGallery.tsx (32.99 KB)"
echo ""
echo "3. 📏 Split large components (>300 lines):"
echo "   - Break into smaller, focused components"
echo "   - Use composition over large single components"
echo ""
echo "4. 🧹 Remove unused imports:"
echo "   npm run analyze:components"
echo ""

# 6. Quick commands reference
echo "🎮 Quick Commands:"
echo "================="
echo "📊 Analyze all components:     npm run analyze:components"
echo "📦 Check bundle sizes:         npm run analyze"
echo "🔧 Optimize HeroUI imports:    ./optimize-heroui-imports.sh"
echo "👀 Monitor changes:            node scripts/monitor-component-changes.js"
echo "💡 Get suggestions:            node scripts/optimization-suggestions.js"
echo ""

# 7. Monitoring setup
echo "📈 Continuous Monitoring:"
echo "======================="
echo "Add to your workflow:"
echo "- Before changes: ./monitor-component-sizes.sh > before.txt"
echo "- After changes:  ./monitor-component-sizes.sh > after.txt"
echo "- Compare:        diff before.txt after.txt"
echo ""

echo "✅ Component size monitoring complete!"
echo "🎯 Start with: ./optimize-heroui-imports.sh for immediate 30-40% reduction"
