import {
  streamText,
  generateText,
  type UIMessage,
  convertToModelMessages,
  createGateway,
  tool,
  stepCountIs
} from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

const DUCKDUCKGO_API = 'https://api.duckduckgo.com'

const DUCKDUCKGO_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept: 'application/json'
}

async function searchWeb(query: string): Promise<string> {
  try {
    const res = await fetch(`${DUCKDUCKGO_API}/?q=${encodeURIComponent(query)}&format=json`, {
      signal: AbortSignal.timeout(8000),
      headers: DUCKDUCKGO_HEADERS
    })
    const data = (await res.json()) as {
      Abstract?: string
      AbstractURL?: string
      AbstractSource?: string
      RelatedTopics?: Array<{ Text?: string, FirstURL?: string, Result?: string }>
    }
    const parts: string[] = []
    if (data.Abstract) {
      parts.push(`摘要: ${data.Abstract}`)
      if (data.AbstractSource) parts.push(`来源: ${data.AbstractSource}`)
      if (data.AbstractURL) parts.push(`链接: ${data.AbstractURL}`)
    }
    if (data.RelatedTopics?.length) {
      const items = data.RelatedTopics.slice(0, 5).map(t => t.Text || t.Result || '').filter(Boolean)
      if (items.length) parts.push('相关: ' + items.join(' | '))
    }
    return parts.length ? parts.join('\n') : `未找到与「${query}」相关的即时结果，请基于已有知识回答。`
  } catch (e) {
    return `联网搜索暂时不可用: ${e instanceof Error ? e.message : String(e)}。请基于已有知识回答。`
  }
}

const OPENAI_PROBE_TIMEOUT_MS = 8000

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
  }

  const config = useRuntimeConfig()
  const deepseekKey = config.deepseekApiKey
  const openaiKey = config.openaiApiKey
  const openaiBaseURL = config.openaiBaseURL
  const gatewayKey = config.aiGatewayApiKey
  const openrouterKey = config.openrouterApiKey
  const openrouterModel = config.openrouterModel || 'openai/gpt-4o-mini'

  const body = await readBody<{ messages: UIMessage[], provider?: string, deepThinking?: boolean }>(event)
  const messages = body?.messages ?? []
  const modelMessages = await convertToModelMessages(messages)
  const preferredProvider = body?.provider as 'auto' | 'openai' | 'deepseek' | 'gateway' | 'openrouter' | undefined
  const useWebSearch = body?.deepThinking === true
  console.log('[chat] deepThinking:', body?.deepThinking, '| useWebSearch:', useWebSearch)

  // 统一用 .chat() 走 /chat/completions，兼容代理/镜像
  const openaiModel = openaiKey
    ? createOpenAI({
        apiKey: openaiKey,
        ...(openaiBaseURL && { baseURL: openaiBaseURL })
      }).chat('gpt-4o-mini')
    : null
  const deepseekModel = deepseekKey
    ? createOpenAI({
        apiKey: deepseekKey,
        baseURL: 'https://api.deepseek.com'
      }).chat('deepseek-chat')
    : null
  const gatewayModel = gatewayKey
    ? createGateway({ apiKey: gatewayKey })('anthropic/claude-sonnet-4')
    : null
  const openrouterModelInstance = openrouterKey
    ? createOpenAI({
        apiKey: openrouterKey,
        baseURL: 'https://openrouter.ai/api/v1'
      }).chat(openrouterModel)
    : null

  let model = openaiModel ?? deepseekModel ?? gatewayModel ?? openrouterModelInstance
  let provider: 'openai' | 'deepseek' | 'gateway' | 'openrouter' = openaiModel
    ? 'openai'
    : deepseekModel
      ? 'deepseek'
      : gatewayModel
        ? 'gateway'
        : 'openrouter'

  if (preferredProvider === 'openai' && openaiModel) {
    model = openaiModel
    provider = 'openai'
  } else if (preferredProvider === 'deepseek' && deepseekModel) {
    model = deepseekModel
    provider = 'deepseek'
  } else if (preferredProvider === 'gateway' && gatewayModel) {
    model = gatewayModel
    provider = 'gateway'
  } else if (preferredProvider === 'openrouter' && openrouterModelInstance) {
    model = openrouterModelInstance
    provider = 'openrouter'
  } else if (!preferredProvider || preferredProvider === 'auto') {
    if (openaiModel && deepseekModel) {
      let probeTimer: ReturnType<typeof setTimeout> | undefined
      try {
        const controller = new AbortController()
        probeTimer = setTimeout(() => controller.abort(), OPENAI_PROBE_TIMEOUT_MS)
        await generateText({
          model: openaiModel,
          prompt: 'hi',
          maxOutputTokens: 1,
          abortSignal: controller.signal
        })
      } catch (e) {
        console.warn('[chat] OpenAI 不可用，改用 DeepSeek:', e instanceof Error ? e.message : String(e))
        model = deepseekModel
        provider = 'deepseek'
      } finally {
        if (probeTimer) clearTimeout(probeTimer)
      }
    }
  }

  if (!model) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Missing API key or selected provider not configured. Set NUXT_OPENAI_API_KEY, NUXT_DEEPSEEK_API_KEY, NUXT_OPENROUTER_API_KEY or NUXT_AI_GATEWAY_API_KEY in .env'
    })
  }

  const modelId = provider === 'openai'
    ? 'gpt-4o-mini'
    : provider === 'deepseek'
      ? 'deepseek-chat'
      : provider === 'openrouter'
        ? openrouterModel
        : 'anthropic/claude-sonnet-4'
  const keyPreview = provider === 'openai' && openaiKey
    ? `${openaiKey.slice(0, 7)}...${openaiKey.slice(-4)}`
    : provider === 'deepseek' && deepseekKey
      ? `deepseek...${String(deepseekKey).slice(-4)}`
      : provider === 'openrouter' && openrouterKey
        ? `openrouter...${String(openrouterKey).slice(-4)}`
        : gatewayKey
          ? `gateway(...${String(gatewayKey).slice(-4)})`
          : 'none'
  console.log('[chat] provider:', provider, '| model:', modelId, '| key:', keyPreview, '| messages:', modelMessages.length)

  const isDeepSeek = provider === 'deepseek'
  const enableWebSearch = isDeepSeek && useWebSearch
  const webSearchTool = {
    web_search: tool({
      description: '联网搜索：当用户问实时信息、新闻、天气、股价、当前事件或需要最新资料时调用。输入为搜索关键词。',
      inputSchema: z.object({
        query: z.string().describe('搜索关键词，尽量简短准确')
      }),
      execute: async ({ query }: { query: string }) => searchWeb(query)
    })
  }

  let result
  try {
    result = streamText({
      model,
      system: enableWebSearch
        ? '你是一个有帮助的助手。当用户需要实时、最新或联网信息时，先使用 web_search 工具搜索再回答。请用简洁的中文回复。'
        : '你是一个有帮助的助手。请用简洁的中文回复用户。',
      messages: modelMessages,
      maxOutputTokens: 1024,
      ...(enableWebSearch && {
        tools: webSearchTool,
        stopWhen: stepCountIs(3)
      })
    })
  } catch (err: unknown) {
    console.error('[chat] streamText error:', err)
    const message = err instanceof Error ? err.message : String(err)
    const statusCode = err && typeof err === 'object' && 'statusCode' in err ? Number((err as { statusCode?: number }).statusCode) : 502
    throw createError({
      statusCode: statusCode >= 400 ? statusCode : 502,
      statusMessage: `AI 请求失败: ${message}`
    })
  }

  const raw = result.toUIMessageStreamResponse()
  const headers = new Headers(raw.headers)
  headers.set('X-AI-Provider', provider)
  headers.set('X-AI-Model', modelId)
  return new Response(raw.body, { status: raw.status, statusText: raw.statusText, headers })
})
