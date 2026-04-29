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

  // Surface env-loading status at server startup so missing/wrong keys
  // are obvious in the terminal instead of silently failing as 401.
  if (!clientId || !clientSecret) {
    console.warn(
      '\n[vite] ⚠️  Clova credentials not loaded from .env\n' +
      `        CLOVA_CLIENT_ID=${clientId ? 'set' : 'MISSING'}\n` +
      `        CLOVA_CLIENT_SECRET=${clientSecret ? 'set' : 'MISSING'}\n` +
      '        Make sure .env is in the project root (next to package.json),\n' +
      '        the variable names have NO "VITE_" prefix, and restart `npm run dev`.\n'
    )
  } else {
    console.log(
      `[vite] ✓ Clova credentials loaded (id=${clientId.length} chars, secret=${clientSecret.length} chars)`
    )
  }

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
            proxy.on('proxyReq', (proxyReq, req) => {
              const injected = []
              if (clientId) {
                proxyReq.setHeader('X-NCP-APIGW-API-KEY-ID', clientId)
                injected.push('id')
              }
              if (clientSecret) {
                proxyReq.setHeader('X-NCP-APIGW-API-KEY', clientSecret)
                injected.push('secret')
              }
              console.log(
                `[vite proxy] → ${req.method} ${req.url} ` +
                `auth=${injected.length === 2 ? 'OK' : 'MISSING(' + injected.join(',') + ')'}`
              )
            })
            proxy.on('proxyRes', (proxyRes, req) => {
              console.log(`[vite proxy] ← ${req.method} ${req.url} ${proxyRes.statusCode}`)
            })
            proxy.on('error', (err, req) => {
              console.error(`[vite proxy] ✗ ${req.method} ${req.url}`, err.message)
            })
          },
        },
      },
    },
  }
})
