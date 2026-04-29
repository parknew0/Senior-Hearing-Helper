import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// The Naver Clova CSR endpoint is documented at:
//   POST https://naveropenapi.apigw.ntruss.com/recog/v1/stt?lang=Kor
//   headers: X-NCP-APIGW-API-KEY-ID, X-NCP-APIGW-API-KEY,
//            Content-Type: application/octet-stream
//   body:    binary audio (MP3 / AAC / AC3 / OGG / FLAC / WAV, ≤ 60s)
//   response: { "text": "..." }
//
// Browsers cannot call that endpoint directly (CORS) and the secret must
// not ship in the bundle. Vite's dev proxy forwards browser requests from
// /api/clova/* to the real endpoint and injects the auth headers from the
// developer's local .env so the secret stays on the dev server only.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const clientId = env.CLOVA_CLIENT_ID
  const clientSecret = env.CLOVA_CLIENT_SECRET

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/clova': {
          target: 'https://naveropenapi.apigw.ntruss.com',
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/api\/clova/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (clientId) proxyReq.setHeader('X-NCP-APIGW-API-KEY-ID', clientId)
              if (clientSecret) proxyReq.setHeader('X-NCP-APIGW-API-KEY', clientSecret)
            })
          },
        },
      },
    },
  }
})
