import { defineConfig } from "vite";

export default defineConfig({
  // Without this `camera.getPostPipeline("WobbleShader")` will not
  // work because the classes get compiled down to "Mt", "Rt", ...
  build: {
    minify: false,
  },
});