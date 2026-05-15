import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // root src
      '@': path.resolve(__dirname, 'src'),

      // ── modules ──────────────────────────────────────────────────────────
      '@auth': path.resolve(__dirname, 'src/modules/auth'),
      '@shared': path.resolve(__dirname, 'src/modules/shared'),

      // user sub-modules
      '@home': path.resolve(__dirname, 'src/modules/user/home'),
      '@userManagement': path.resolve(__dirname, 'src/modules/user/userManagement'),

      // admin sub-modules
      '@networkManagement': path.resolve(__dirname, 'src/modules/admin/networkManagement'),

      // ── store ─────────────────────────────────────────────────────────────
      '@store': path.resolve(__dirname, 'src/store'),
      '@slices': path.resolve(__dirname, 'src/store/slices'),

      // auth slices
      '@authSlices': path.resolve(__dirname, 'src/store/slices/auth'),

      // admin slices
      '@adminSlices': path.resolve(__dirname, 'src/store/slices/admin'),
      '@networkSlices': path.resolve(__dirname, 'src/store/slices/admin/networkManagementSlices'),

      // user slices
      '@userSlices': path.resolve(__dirname, 'src/store/slices/user/userManagementSlices'),

      // ── infrastructure ────────────────────────────────────────────────────
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@locales': path.resolve(__dirname, 'src/locales'),
    },
  },
  server: {
    host: '10.10.19.228',
    port: 9000,
  },
})