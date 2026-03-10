/**
 * 用于验证 API Key 是否有效：浏览器访问 /api/chat-test
 */
import { generateText, createGateway } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const deepseekKey = config.deepseekApiKey
  const openaiKey = config.openaiApiKey
  const openaiBaseURL = config.openaiBaseURL
  const gatewayKey = config.aiGatewayApiKey

  if (openaiKey) {
    try {
      const openai = createOpenAI({
        apiKey: openaiKey,
        ...(openaiBaseURL && { baseURL: openaiBaseURL })
      })
      const { text } = await generateText({
        model: openai.chat('gpt-4o-mini'),
        prompt: '只说一句话：你好，我是 AI。'
      })
      return { ok: true, provider: 'openai', text }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false, provider: 'openai', error: msg }
    }
  }

  if (deepseekKey) {
    try {
      const openai = createOpenAI({
        apiKey: deepseekKey,
        baseURL: 'https://api.deepseek.com'
      })
      const { text } = await generateText({
        model: openai.chat('deepseek-chat'),
        prompt: '只说一句话：你好，我是 AI。'
      })
      return { ok: true, provider: 'deepseek', text }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false, provider: 'deepseek', error: msg }
    }
  }

  if (gatewayKey) {
    try {
      const gateway = createGateway({ apiKey: gatewayKey })
      const { text } = await generateText({
        model: gateway('anthropic/claude-sonnet-4'),
        prompt: '只说一句话：你好，我是 AI。'
      })
      return { ok: true, provider: 'gateway', text }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      return { ok: false, provider: 'gateway', error: msg }
    }
  }

  return { ok: false, error: '未配置 NUXT_OPENAI_API_KEY、NUXT_DEEPSEEK_API_KEY 或 NUXT_AI_GATEWAY_API_KEY' }
})
