<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

defineProps<{
	banner: AsyncTheme.BannerConfig;
}>();

const bannerRef = ref<HTMLElement>()
const videoLoaded = ref(false)
const videoError = ref(false)

// 获取滚动距离的函数
const getScrollTop = () => {
	const supportPageOffset = window.pageXOffset !== undefined;
	const isCSS1Compat = (document.compatMode || '') === 'CSS1Compat';
	return supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
};

const scrollFun = () => {
	const scrollTop = getScrollTop();
	if (bannerRef.value) {
		bannerRef.value.style.transform = `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, ${Math.min(scrollTop / 3, 100)}, 0, 1)`;
	}
}

const handleVideoLoad = () => {
	videoLoaded.value = true
	videoError.value = false
}

const handleVideoError = () => {
	videoError.value = true
	videoLoaded.value = false
}

onMounted(() => {
	scrollFun();
	window.addEventListener("scroll", scrollFun);
});

onUnmounted(() => {
	window.removeEventListener("scroll", scrollFun);
});
</script>

<template>
	<template v-if="banner?.type === 'img'">
		<img
			ref="bannerRef"
			class="trm-banner-cover"
			:src="banner.bgurl"
			:style="`object-position: ${banner.position || 'top'};object-fit:${banner.fit || 'cover'};`"
			alt="banner"
			onload="this.onload=null;this.style.opacity=1;"
		/>
	</template>
	<template v-if="banner?.type === 'video'">
		<!-- 后备背景（渐变色） -->
		<div
			v-if="videoError || !videoLoaded"
			ref="bannerRef"
			class="trm-banner-cover trm-banner-fallback"
		></div>

		<!-- 视频元素 -->
		<video
			v-show="!videoError && videoLoaded"
			ref="bannerRef"
			class="trm-banner-cover"
			autoplay
			loop
			muted
			playsinline
			webkit-playsinline
			x5-playsinline
			x5-video-player-type="h5"
			x5-video-player-fullscreen="false"
			@loadeddata="handleVideoLoad"
			@error="handleVideoError"
			@canplay="handleVideoLoad"
		>
			<source :src="banner.bgurl" type="video/mp4" />
			Your browser does not support HTML5 video.
		</video>

		<!-- 加载指示器 -->
		<div v-if="!videoLoaded && !videoError" class="trm-banner-loading">
			<div class="loading-spinner"></div>
		</div>
	</template>
</template>

<style scoped>
.trm-banner-fallback {
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0;
	left: 0;
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	background-size: cover;
	background-position: center;
}

.trm-banner-loading {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	z-index: 1;
}

.loading-spinner {
	width: 40px;
	height: 40px;
	border: 4px solid rgba(255, 255, 255, 0.3);
	border-top-color: #fff;
	border-radius: 50%;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

/* 移动端优化 */
@media (max-width: 768px) {
	.trm-banner-cover {
		object-fit: cover;
	}

	.loading-spinner {
		width: 30px;
		height: 30px;
		border-width: 3px;
	}
}
</style>
