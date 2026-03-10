// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  /** 禁用在线字体拉取，避免启动时连接 fonts.google.com 超时（约 30s+） */
  ui: {
    fonts: false
  },

  runtimeConfig: {
    /** Vercel AI Gateway API Key（可选，若使用 Gateway） */
    aiGatewayApiKey: '',
    /** OpenAI API Key（推荐在 .env 中设置 NUXT_OPENAI_API_KEY） */
    openaiApiKey: '',
    /** OpenAI 兼容 API 的 baseURL（直连超时时可填代理/镜像地址） */
    openaiBaseURL: '',
    /** DeepSeek API Key（可选，国内较稳定） */
    deepseekApiKey: '',
    /** OpenRouter API Key（可选，可选多种模型 https://openrouter.ai） */
    openrouterApiKey: '',
    /** OpenRouter 默认模型 ID（可选，如 openai/gpt-4o-mini、deepseek/deepseek-chat） */
    openrouterModel: 'openai/gpt-4o-mini'
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },
  // @nuxt/fonts 模块的配置，避免启动时请求 Google 超时
  // @ts-expect-error fonts 由 @nuxt/ui 依赖的模块提供
  fonts: {
    providers: { google: false }
  },

  /** 加快 dev/build 启动与首屏 */
  vite: {
    build: {
      sourcemap: false
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'ai', '@ai-sdk/vue']
    }
  }
})
