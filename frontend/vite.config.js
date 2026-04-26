import { defineConfig } from 'vite'

export default defineConfig({
  // Read environment variables from the repository root so frontend/.env is not needed.
  envDir: '..',
})
