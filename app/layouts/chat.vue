<template>
  <div class="chat-layout flex flex-1 min-h-0 min-w-0 w-full overflow-hidden">
    <AppConversationSidebar />
    <div class="chat-content flex flex-col flex-1 min-h-0 min-w-0 overflow-hidden">
      <slot />
    </div>
  </div>
</template>
