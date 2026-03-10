<script setup lang="ts">
import { useConversations } from '~/composables/useConversations'

useHead({ title: 'AI-Logo | 对话' })
useSeoMeta({ title: 'AI-Logo | 对话', description: '个人 AI 对话测试，支持 DeepSeek 与联网搜索' })

const {
  activeId,
  activeConversation,
  updateMessages,
  updateTitle
} = useConversations()

function onPersist(payload: { conversationId: string | null, messages: import('ai').UIMessage[] }) {
  if (payload.conversationId) updateMessages(payload.conversationId, payload.messages)
}

function onSetTitle(payload: { conversationId: string | null, title: string }) {
  if (payload.conversationId) updateTitle(payload.conversationId, payload.title)
}
</script>

<template>
  <div class="chat-page flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
    <template v-if="activeConversation">
      <ChatPanel
        :key="`chat-${activeId}`"
        :conversation="activeConversation"
        @persist="onPersist"
        @set-title="onSetTitle"
      />
    </template>
    <template v-else>
      <main class="chat-main flex flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden py-4 sm:py-6">
        <div class="mx-auto w-full max-w-[1200px] px-3 sm:px-4 flex flex-col flex-1 items-center justify-center py-8">
          <AppFooterIllustration class="w-full max-w-md h-auto shrink-0" />
          <p class="text-sm text-muted mt-4">
            个人测试项目 · 基于 Nuxt + Vercel AI SDK
          </p>
          <p class="text-sm text-muted mt-2">
            点击左侧「新对话」开始
          </p>
        </div>
      </main>
    </template>
  </div>
</template>
