<template>
  <svg
    viewBox="0 0 400 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    class="footer-illus text-primary/60"
    aria-hidden="true"
  >
    <!-- 背景弧线 -->
    <path
      d="M50 80 Q200 20 350 80"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-dasharray="8 4"
      opacity="0.4"
      class="animate-dash"
    />
    <!-- 小机器人/终端轮廓 -->
    <g class="animate-float">
      <rect
        x="160"
        y="45"
        width="80"
        height="50"
        rx="6"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        opacity="0.8"
      />
      <circle
        cx="185"
        cy="62"
        r="4"
        fill="currentColor"
        opacity="0.6"
      />
      <circle
        cx="200"
        cy="62"
        r="4"
        fill="currentColor"
        opacity="0.4"
      />
      <circle
        cx="215"
        cy="62"
        r="4"
        fill="currentColor"
        opacity="0.6"
      />
      <rect
        x="170"
        y="72"
        width="60"
        height="6"
        rx="2"
        fill="currentColor"
        opacity="0.3"
      />
    </g>
    <!-- 光点 -->
    <circle
      cx="80"
      cy="70"
      r="3"
      fill="currentColor"
      class="animate-pulse"
      style="animation-delay: 0s"
    />
    <circle
      cx="320"
      cy="75"
      r="2"
      fill="currentColor"
      class="animate-pulse"
      style="animation-delay: 0.5s"
    />
    <circle
      cx="200"
      cy="95"
      r="2"
      fill="currentColor"
      opacity="0.6"
      class="animate-pulse"
      style="animation-delay: 1s"
    />
    <!-- 文字氛围线 -->
    <path
      d="M60 100 h280"
      stroke="currentColor"
      stroke-width="1"
      opacity="0.2"
    />
  </svg>
</template>

<style scoped>
.footer-illus {
  color: var(--ui-primary);
}
.dark .footer-illus {
  opacity: 0.9;
}
@keyframes dash {
  to {
    stroke-dashoffset: -24;
  }
}
.animate-dash {
  animation: dash 12s linear infinite;
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
