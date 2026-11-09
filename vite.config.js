import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Le plugin transforme le JSX et permet le rechargement React en développement.
// Cette configuration Vite seule ne sert pas la fonction HTTP du dossier api/.
export default defineConfig({
  plugins: [react()],
})
