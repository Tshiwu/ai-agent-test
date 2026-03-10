import type { UIMessage } from 'ai'
import { computed, watch } from 'vue'

const STORAGE_KEY = 'ai-logo-conversations'
const STATE_KEY_CONVERSATIONS = 'ai-logo-conversations-list'
const STATE_KEY_ACTIVE_ID = 'ai-logo-conversations-active-id'

export interface Conversation {
  id: string
  title: string
  messages: UIMessage[]
}

function genId() {
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function loadFromStorage(): Conversation[] {
  if (import.meta.server) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const list = JSON.parse(raw) as Conversation[]
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function saveToStorage(list: Conversation[]) {
  if (import.meta.server) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    //
  }
}

export function useConversations() {
  const conversations = useState<Conversation[]>(STATE_KEY_CONVERSATIONS, () => loadFromStorage())
  const activeId = useState<string | null>(STATE_KEY_ACTIVE_ID, () => null)

  if (activeId.value === null && conversations.value.length > 0) {
    activeId.value = conversations.value[0].id
  }

  const activeConversation = computed(() =>
    conversations.value.find((c) => c.id === activeId.value) ?? null
  )

  function addNew() {
    const conv: Conversation = {
      id: genId(),
      title: '新对话',
      messages: []
    }
    conversations.value = [conv, ...conversations.value]
    activeId.value = conv.id
    saveToStorage(conversations.value)
    return conv.id
  }

  function setActive(id: string | null) {
    activeId.value = id
  }

  function remove(id: string) {
    const wasActive = activeId.value === id
    conversations.value = conversations.value.filter((c) => c.id !== id)
    if (wasActive) {
      activeId.value = conversations.value[0]?.id ?? null
    }
    saveToStorage(conversations.value)
  }

  function updateMessages(id: string, messages: UIMessage[]) {
    const conv = conversations.value.find((c) => c.id === id)
    if (!conv) return
    conv.messages = messages
    saveToStorage(conversations.value)
  }

  function updateTitle(id: string, title: string) {
    const conv = conversations.value.find((c) => c.id === id)
    if (!conv) return
    conv.title = title.trim().slice(0, 80) || '新对话'
    saveToStorage(conversations.value)
  }

  watch(
    conversations,
    () => saveToStorage(conversations.value),
    { deep: true }
  )

  if (conversations.value.length === 0) {
    addNew()
  }

  return {
    conversations,
    activeId,
    activeConversation,
    addNew,
    setActive,
    remove,
    updateMessages,
    updateTitle
  }
}
