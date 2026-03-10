<script setup>
/** 国内导航项（链接可后续替换） */
const navItemsCN = [
  { label: 'UPDF', href: 'https://www.updf.cn/' },
  { label: 'AI', href: 'https://ai.updf.cn/' },
  { label: '用户中心', href: 'https://accounts.updf.cn/' },
  { label: '收银台', href: 'https://checkout.updf.cn/' }
]
/** 海外导航项（链接可后续替换，与国内可不同） */
const navItemsOverseas = [
  { label: 'UPDF', href: 'https://www.updf.com/' },
  { label: 'AI', href: 'https://ai.updf.com/' },
  { label: 'Sign', href: 'https://sign.updf.com/' },
  { label: '用户中心', href: 'https://accounts.updf.com/' },
  { label: '收银台', href: 'https://updf.com/pricing-individuals/?source=website_updf&channel=SEO-EN-AI&currency=USD&language=en-US' }
]

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' }
  ],
  link: [
    { rel: 'icon', type: 'image/png', href: '/images/logo.png' }
  ],
  htmlAttrs: {
    lang: 'zh-CN',
    class: 'h-screen'
  },
  bodyAttrs: {
    class: 'h-full min-h-0 overflow-hidden m-0'
  }
})

const title = 'AI-Logo'
const description = '个人 AI 对话测试项目，基于 Nuxt + Vercel AI SDK，支持 DeepSeek 与联网搜索。'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp class="app-root flex flex-col min-h-0 overflow-hidden w-full h-full">
    <UHeader class="shrink-0 border-b border-default w-full">
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2 cursor-pointer"
        >
          <AppLogo class="shrink-0 rounded-xl w-[32px] h-[32px]" />
        </NuxtLink>
      </template>

      <template #default>
        <nav class="hidden sm:flex items-center gap-1 cursor-pointer">
          <UDropdownMenu
            :items="[navItemsCN.map((item) => ({ label: item.label, to: item.href }))]"
            :content="{ align: 'start' }"
          >
            <UButton
              variant="ghost"
              size="sm"
              color="neutral"
              trailing-icon="i-lucide-chevron-down"
              class="cursor-pointer"
            >
              国内
            </UButton>
          </UDropdownMenu>
          <UDropdownMenu
            :items="[navItemsOverseas.map((item) => ({ label: item.label, to: item.href }))]"
            :content="{ align: 'start' }"
          >
            <UButton
              variant="ghost"
              size="sm"
              color="neutral"
              trailing-icon="i-lucide-chevron-down"
              class="cursor-pointer"
            >
              海外
            </UButton>
          </UDropdownMenu>
        </nav>
      </template>

      <template #right>
        <UColorModeButton aria-label="风格" class="cursor-pointer" />
        <UButton
          to="#"
          variant="ghost"
          size="sm"
          color="neutral"
          class="cursor-pointer"
        >
          更多功能
        </UButton>
      </template>
    </UHeader>

    <!-- main：除 header 外占据剩余空间；NuxtLayout 才会应用 layouts/default.vue（左侧栏+内容） -->
    <UMain class="main-area flex-1 min-h-0 min-w-0 w-full flex flex-col overflow-hidden">
      <NuxtLayout class="flex flex-col flex-1 min-h-0 min-w-0 w-full overflow-hidden">
        <NuxtPage class="page-slot flex flex-col flex-1 min-h-0 min-w-0 w-full overflow-hidden" />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
