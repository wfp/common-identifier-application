const { defineConfig } = require("vite");
const commonjs = require('@rollup/plugin-commonjs');

export default defineConfig({
    plugins: [commonjs()]
});