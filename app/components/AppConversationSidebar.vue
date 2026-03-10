<script setup lang="ts">
const {
  conversations,
  activeId,
  addNew,
  setActive,
  remove
} = useConversations()
</script>

<template>
  <aside
    class="conversation-sidebar fixed h-full top-auto left-0 shrink-0 w-56 sm:w-64 border-r border-default bg-default/80 flex flex-col overflow-hidden"
    aria-label="对话列表"
  >
    <div class="p-2 border-b border-default shrink-0">
      <UButton
        block
        icon="i-lucide-plus"
        variant="soft"
        class="cursor-pointer"
        @click="addNew()"
      >
        新对话
      </UButton>
    </div>
    <nav
      class="flex-1 min-h-0 overflow-y-auto p-2"
      aria-label="对话历史"
    >
      <button
        v-for="c in conversations"
        :key="c.id"
        type="button"
        class="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors group cursor-pointer"
        :class="activeId === c.id ? 'bg-primary/15 text-primary' : 'hover:bg-muted/60'"
        @click="setActive(c.id)"
      >
        <span
          class="min-w-0 flex-1 truncate"
          :title="c.title"
        >
          {{ c.title }}
        </span>
        <UButton
          icon="i-lucide-trash-2"
          color="neutral"
          variant="ghost"
          size="xs"
          class="opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
          aria-label="删除对话"
          @click.stop="remove(c.id)"
        />
      </button>
    </nav>
  </aside>
</template>
