# Bundle Size Optimization Guide

## 🚀 High-Impact Optimizations

### 1. Dynamic Imports for Heavy Components

Replace static imports with dynamic imports for heavy components:

```tsx
// Before
import { ImageGallery } from "@/_components/imageUpload/ImageGallery";
import ProductViewModal from "@/_components/genericComponents/ProductViewModal";

// After
const ImageGallery = dynamic(
  () => import("@/_components/imageUpload/ImageGallery"),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);

const ProductViewModal = dynamic(
  () => import("@/_components/genericComponents/ProductViewModal"),
  {
    loading: () => <div>Loading...</div>,
    ssr: false,
  }
);
```

### 2. Optimize TinyMCE Loading

TinyMCE is loaded from CDN but still impacts bundle size:

```tsx
// Create a lazy-loaded TinyMCE wrapper
const TinyMCEEditor = dynamic(
  () => import("@/_components/genericComponents/tinyMceEditor"),
  {
    loading: () => (
      <div className="h-32 bg-gray-100 animate-pulse rounded"></div>
    ),
    ssr: false,
  }
);
```

### 3. Tree-shake UI Libraries

Replace barrel imports with specific imports:

```tsx
// Before
import { Button, Card, Modal, Input, Select } from "@heroui/react";

// After
import { Button } from "@heroui/react/button";
import { Card } from "@heroui/react/card";
import { Modal } from "@heroui/react/modal";
```

### 4. Optimize Redux Store

Split your RTK Query APIs:

```tsx
// Create separate API slices for different features
const coreApi = createApi({
  reducerPath: "coreApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    // Only essential endpoints
  }),
});

const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (builder) => ({
    // Admin-only endpoints
  }),
});
```

### 5. Image Optimization

```tsx
// Use Next.js Image component with optimization
import Image from "next/image";

// Configure in next.config.mjs
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
};
```

## 📊 **Library-Specific Optimizations**

### Framer Motion (Large Animation Library)

```tsx
// Instead of importing everything
import { motion } from "framer-motion";

// Import only what you need
import { motion } from "framer-motion/dist/framer-motion";
// Or use CSS animations for simple cases
```

### React-Ace (Code Editor)

```tsx
// Already optimized with dynamic imports - good!
// Consider lazy loading modes and themes
const AceEditor = dynamic(
  () =>
    Promise.all([
      import("react-ace"),
      import("ace-builds/src-noconflict/mode-html"),
      import("ace-builds/src-noconflict/theme-monokai"),
    ]).then(([ace]) => ace),
  { ssr: false }
);
```

### Lucide React (Icons)

```tsx
// Instead of importing all icons
import { Search, Filter, Plus } from "lucide-react";

// Use tree-shakeable imports
import Search from "lucide-react/dist/esm/icons/search";
import Filter from "lucide-react/dist/esm/icons/filter";
```

## 🔧 **Next.js Configuration Optimizations**

```js
// next.config.mjs
const nextConfig = {
  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60,
  },

  // Enable compression
  compress: true,

  // Split chunks more aggressively
  webpack: (config) => {
    config.optimization.splitChunks = {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
        common: {
          name: "common",
          minChunks: 2,
          chunks: "all",
          enforce: true,
        },
      },
    };
    return config;
  },
};
```

## 🎨 **CSS Optimizations**

### Reduce Custom CSS

Your `globals.css` is quite large. Consider:

```css
/* Remove unused animations */
/* Use CSS-in-JS for component-specific styles */
/* Purge unused Tailwind classes */
```

### Tailwind CSS Optimization

```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [heroui()],
  // Add purge configuration
  purge: {
    enabled: process.env.NODE_ENV === "production",
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
  },
};
```

## 📱 **Mobile-First Optimization**

```tsx
// Use responsive loading
const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <MobileSkeleton />,
  ssr: false,
});

// Conditional loading based on screen size
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};
```

## 📈 **Monitoring and Continuous Optimization**

### 1. Set Bundle Size Limits

```json
// package.json
{
  "bundlewatch": {
    "files": [
      {
        "path": ".next/static/chunks/pages/*.js",
        "maxSize": "200kb"
      },
      {
        "path": ".next/static/chunks/*.js",
        "maxSize": "100kb"
      }
    ]
  }
}
```

### 2. Regular Analysis

```bash
# Weekly bundle analysis
npm run analyze

# Check for unused dependencies
npx depcheck

# Analyze duplicate dependencies
npx npm-check-updates
```

## 🏆 **Expected Results**

Implementing these optimizations should reduce your bundle sizes by:

- **Customer List**: 426 kB → ~250 kB (-40%)
- **Order List**: 409 kB → ~240 kB (-40%)
- **Image Upload**: 360 kB → ~200 kB (-45%)
- **Overall**: 87.5 kB shared → ~60 kB (-30%)

## 🎯 **Implementation Priority**

1. **High Impact, Low Effort**: Dynamic imports for modals and heavy components
2. **Medium Impact, Medium Effort**: Tree-shake UI libraries and optimize imports
3. **High Impact, High Effort**: Restructure Redux store and implement code splitting
4. **Ongoing**: Monitor bundle sizes and set up automated alerts

Start with dynamic imports for your largest components and progressively implement other optimizations!
