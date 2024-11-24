module.exports = {
  plugins: {
    "postcss-import": {}, // Enables importing CSS files
    tailwindcss: {}, // Enables Tailwind CSS features
    autoprefixer: {}, // Automatically adds vendor prefixes
    cssnano: {
      // Minifies CSS for production
      preset: "default",
    },
  },
};
