<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport } from 'ai'
import type { UIMessage } from 'ai'
import { ref, watch, computed } from 'vue'
import type { Conversation } from '~/composables/useConversations'

const props = defineProps<{
  conversation: Conversation | null
}>()

type ProviderOption = 'openai' | 'deepseek' | 'gateway' | 'openrouter'
const selectedProvider = ref<ProviderOption>('deepseek')
const deepThinking = ref(false)

const emit = defineEmits<{
  persist: [payload: { conversationId: string | null, messages: UIMessage[] }]
  setTitle: [payload: { conversationId: string | null, title: string }]
}>()

const initialMessages = computed(() => props.conversation?.messages ?? [])

const transport = new DefaultChatTransport({
  api: '/api/chat',
  body: () => ({ provider: selectedProvider.value, deepThinking: deepThinking.value })
})

const chat = new Chat({
  transport,
  messages: [...initialMessages.value]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any)

watch(
  () => chat.messages,
  (messages) => {
    const conversationId = props.conversation?.id ?? null
    if (messages.length > 0 && conversationId) {
      emit('persist', { conversationId, messages: [...messages] })
      const firstUser = messages.find(m => m.role === 'user')
      if (firstUser) {
        const part = firstUser.parts?.find((p: { type: string }) => p.type === 'text')
        const text = part && 'text' in part ? String(part.text).trim().slice(0, 80) : ''
        if (text) emit('setTitle', { conversationId, title: text })
      }
    }
  },
  { deep: true }
)

const input = ref('')

function handleSubmit(e: Event) {
  e.preventDefault()
  const text = input.value.trim()
  if (!text) return
  chat.sendMessage({ text })
  input.value = ''
}

function isTextPart(part: { type: string }) {
  return part.type === 'text'
}

function isToolPart(part: { type: string }) {
  return typeof part.type === 'string' && part.type.startsWith('tool-')
}

function getToolSearchResult(part: { type: string, result?: unknown }) {
  if (part.type !== 'tool-web_search') return null
  const r = part.result
  if (typeof r === 'string') return r
  return (r as { result?: string })?.result ?? null
}

const showIntro = computed(() => chat.messages.length === 0)
</script>

<template>
  <div class="chat-panel flex flex-col flex-1 min-h-0 w-full overflow-hidden">
    <main class="chat-main flex flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden py-4 sm:py-6">
      <div class="mx-auto w-full max-w-[1200px] px-3 sm:px-4 flex flex-col">
        <div class="flex flex-col gap-4">
          <div
            v-for="(m, index) in chat.messages"
            :key="m.id ?? index"
            class="flex flex-col gap-1"
          >
            <span class="text-xs font-medium text-muted">
              {{ m.role === 'user' ? '你' : 'AI' }}
            </span>
            <div
              v-for="(part, partIndex) in m.parts"
              :key="`${m.id}-${part.type}-${partIndex}`"
              class="rounded-lg px-3 py-2 text-sm"
              :class="m.role === 'user' ? 'bg-primary/10 text-primary' : 'bg-muted/50'"
            >
              <div
                v-if="isTextPart(part)"
                class="whitespace-pre-wrap"
              >
                {{ (part as { text?: string }).text }}
              </div>
              <div
                v-else-if="getToolSearchResult(part)"
                class="text-xs rounded bg-muted/80 p-2 whitespace-pre-wrap"
              >
                <span class="font-medium text-muted">🔍 联网搜索结果</span>
                <div class="mt-1">
                  {{ getToolSearchResult(part) }}
                </div>
              </div>
              <pre
                v-else-if="isToolPart(part)"
                class="text-xs overflow-x-auto p-2 rounded bg-muted"
              >{{ JSON.stringify(part, null, 2) }}</pre>
            </div>
          </div>
          <div
            v-if="chat.status === 'streaming'"
            class="flex items-center gap-2 text-muted text-sm"
          >
            <UIcon
              name="i-lucide-loader-2"
              class="animate-spin size-4"
            />
            正在生成…
          </div>
          <div
            v-if="chat.status === 'error' && chat.error"
            class="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
          >
            <p class="font-medium">
              请求失败
            </p>
            <p class="mt-1">
              {{ chat.error.message }}
            </p>
          </div>
        </div>
        <section
          v-show="showIntro"
          class="intro-block flex-1 flex flex-col items-center justify-center gap-4 py-8"
        >
          <AppFooterIllustration class="w-full max-w-md h-auto shrink-0" />
          <p class="text-sm text-muted">
            个人测试项目 · 基于 Nuxt + Vercel AI SDK
          </p>
        </section>
      </div>
    </main>
    <aside
      class="input-bar z-10 shrink-0 border-t border-default bg-default/95 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      aria-label="输入区"
    >
      <div class="mx-auto w-full max-w-[1200px] px-3 sm:px-4 py-3 sm:py-4">
        <form
          class="flex flex-wrap items-center gap-2"
          @submit="handleSubmit"
        >
          <select
            v-model="selectedProvider"
            class="h-11 rounded-lg border border-default bg-default px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 cursor-pointer"
            :disabled="chat.status === 'streaming'"
          >
            <option
              value="openai"
              disabled
            >
              OpenAI（暂不可用）
            </option>
            <option value="deepseek">
              DeepSeek
            </option>
            <option
              value="gateway"
              disabled
            >
              Vercel Gateway（暂不可用）
            </option>
            <option value="openrouter">
              OpenRouter
            </option>
          </select>
          <label
            class="inline-flex items-center gap-2 h-11 px-3 rounded-lg border border-default bg-default cursor-pointer text-sm"
            :class="{ 'opacity-60 pointer-events-none': chat.status === 'streaming' }"
          >
            <input
              v-model="deepThinking"
              type="checkbox"
              class="rounded border-default text-primary focus:ring-primary cursor-pointer"
              :disabled="chat.status === 'streaming'"
            >
            <span class="hidden sm:inline">深度思考（联网搜索）</span>
            <span class="sm:hidden">联网</span>
          </label>
          <UInput
            v-model="input"
            placeholder="输入消息…"
            size="lg"
            class="min-w-[120px] flex-1 cursor-pointer"
            :disabled="chat.status === 'streaming'"
          />
          <UButton
            type="submit"
            size="lg"
            icon="i-lucide-send"
            class="cursor-pointer"
            :loading="chat.status === 'streaming'"
            :disabled="!input.trim()"
          >
            发送
          </UButton>
        </form>
      </div>
    </aside>
  </div>
</template>
