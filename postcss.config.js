import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";
import tailwindConfig from "./src/css/tailwind.config.js";
// import postcssNested from "postcss-nested";

// https://stackoverflow.com/questions/59326048/how-to-compile-css-variables-with-postcss
// https://tailwindcss.com/docs/using-with-preprocessors#nesting
export default {
  plugins: [
    // postcssNested,
    // @ts-ignore
    tailwind(tailwindConfig),
    autoprefixer,
    // https://tailwindcss.com/docs/optimizing-for-production#enabling-manually
    // https://cssnano.co/docs/what-are-optimisations/
    cssnano,
  ],
};
