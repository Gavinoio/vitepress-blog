<template>
  <div class="eyedropper-demo">
    <div class="demo-header">
      <div class="color-preview" :style="{ background: currentColor }">
        <span v-if="!currentColor" class="placeholder-text">等待拾取...</span>
      </div>
      <button
        class="pick-btn"
        :class="{ picking: isPicking, unsupported: !isSupported }"
        :disabled="!isSupported || isPicking"
        @click="pickColor"
      >
        <span class="btn-icon">{{ isPicking ? '🎯' : '💉' }}</span>
        {{ isPicking ? '点击屏幕任意位置...' : isSupported ? '点击拾取颜色' : '浏览器不支持' }}
      </button>
    </div>

    <div v-if="currentColor" class="color-values">
      <div class="value-row" @click="copy(currentColor.toUpperCase())" title="点击复制">
        <span class="value-label">HEX</span>
        <span class="value-code">{{ currentColor.toUpperCase() }}</span>
        <span class="copy-hint">点击复制</span>
      </div>
      <div class="value-row" @click="copy(rgbValue)" title="点击复制">
        <span class="value-label">RGB</span>
        <span class="value-code">{{ rgbValue }}</span>
        <span class="copy-hint">点击复制</span>
      </div>
      <div class="value-row" @click="copy(hslValue)" title="点击复制">
        <span class="value-label">HSL</span>
        <span class="value-code">{{ hslValue }}</span>
        <span class="copy-hint">点击复制</span>
      </div>
    </div>

    <div v-if="history.length" class="history-section">
      <span class="history-label">历史记录</span>
      <div class="history-swatches">
        <div
          v-for="(color, i) in history"
          :key="i"
          class="swatch"
          :style="{ background: color }"
          :title="color"
          @click="currentColor = color"
        />
      </div>
    </div>

    <div v-if="!isSupported" class="unsupported-tip">
      ⚠️ EyeDropper API 需要 Chrome 95+ 或 Edge 95+ 浏览器支持
    </div>

    <transition name="toast">
      <div v-if="showToast" class="toast">✅ 已复制：{{ copiedText }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const currentColor = ref('')
const isPicking = ref(false)
const history = ref<string[]>([])
const showToast = ref(false)
const copiedText = ref('')
const isSupported = typeof window !== 'undefined' && 'EyeDropper' in window

async function pickColor() {
  if (!isSupported) return
  isPicking.value = true
  try {
    const eyeDropper = new (window as any).EyeDropper()
    const result = await eyeDropper.open()
    const color = result.sRGBHex.toLowerCase()
    currentColor.value = color
    if (!history.value.includes(color)) {
      history.value.unshift(color)
      if (history.value.length > 12) history.value.pop()
    }
  } catch {
    // 用户取消
  } finally {
    isPicking.value = false
  }
}

const rgbValue = computed(() => {
  if (!currentColor.value) return ''
  const hex = currentColor.value
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${r}, ${g}, ${b})`
})

const hslValue = computed(() => {
  if (!currentColor.value) return ''
  const hex = currentColor.value
  let r = parseInt(hex.slice(1, 3), 16) / 255
  let g = parseInt(hex.slice(3, 5), 16) / 255
  let b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
})

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedText.value = text
    showToast.value = true
    setTimeout(() => { showToast.value = false }, 2000)
  } catch {}
}
</script>

<style scoped>
.eyedropper-demo {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  background: var(--vp-c-bg-soft);
}

.demo-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.color-preview {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  border: 2px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.3s;
}

.placeholder-text {
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: center;
  padding: 4px;
}

.pick-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  border-radius: 8px;
  border: 2px solid #6062ce;
  background: #6062ce;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(96, 98, 206, 0.35);
  letter-spacing: 0.02em;
}

.pick-btn:hover:not(:disabled) {
  background: #4e50b8;
  border-color: #4e50b8;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(96, 98, 206, 0.45);
}

.pick-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(96, 98, 206, 0.3);
}

.pick-btn:disabled {
  background: #a0a0a0;
  border-color: #a0a0a0;
  box-shadow: none;
  cursor: not-allowed;
}

.pick-btn.picking {
  background: #8b8dd8;
  border-color: #8b8dd8;
  animation: pulse 1s infinite;
}

.pick-btn.unsupported {
  background: #d97706;
  border-color: #d97706;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.35);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.btn-icon { font-size: 18px; }

.color-values {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.value-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--vp-c-bg);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.value-row:hover { background: var(--vp-c-bg-mute); }
.value-row:hover .copy-hint { opacity: 1; }

.value-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--vp-c-text-3);
  width: 32px;
  flex-shrink: 0;
}

.value-code {
  font-family: var(--vp-font-family-mono);
  font-size: 14px;
  color: var(--vp-c-text-1);
  flex: 1;
}

.copy-hint {
  font-size: 12px;
  color: #6062ce;
  opacity: 0;
  transition: opacity 0.2s;
}

.history-section {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.history-label {
  font-size: 13px;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.history-swatches {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.swatch {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: 2px solid var(--vp-c-divider);
  cursor: pointer;
  transition: transform 0.15s;
}

.swatch:hover { transform: scale(1.2); }

.unsupported-tip {
  margin-top: 12px;
  padding: 10px 14px;
  background: var(--vp-c-warning-soft, #fff8e6);
  border-radius: 8px;
  font-size: 13px;
  color: var(--vp-c-warning-1, #e6a700);
}

.toast {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #6062ce;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  pointer-events: none;
}

.toast-enter-active, .toast-leave-active { transition: opacity 0.3s, transform 0.3s; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
