---
title: Web Audio API 核心：AudioContext 深度解析
date: 2024-12-23 10:00:00
categories:
  - 前端开发
tags:
  - Web Audio API
  - AudioContext
  - JavaScript
  - 音频处理
cover: https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920
---

# Web Audio API 核心：AudioContext 深度解析

AudioContext 是 Web Audio API 的核心接口，为浏览器提供了强大的音频处理能力。本文将深入探讨 AudioContext 的作用、优缺点以及实际应用场景。

## 什么是 AudioContext？

AudioContext 是 Web Audio API 的主要接口，它代表了一个音频处理图（Audio Processing Graph），用于管理和控制音频节点的创建、连接和处理。

### 基本用法

```javascript
// 创建 AudioContext 实例（兼容旧版浏览器）
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();

// 使用完毕后关闭以释放资源
// audioContext.close();
```

### 核心概念

AudioContext 基于节点图架构，音频处理流程如下：

```
Source Node → Processing Nodes → Destination Node
   (音频源)      (处理节点)        (音频输出)
```

**关键属性：**

- `audioContext.state` - 当前状态（`running`/`suspended`/`closed`）
- `audioContext.sampleRate` - 采样率（通常为 44100 Hz 或 48000 Hz）
- `audioContext.currentTime` - 当前时间线位置（秒）
- `audioContext.destination` - 音频输出目标节点

## AudioContext 的核心作用

### 1. 音频源管理

AudioContext 可以创建多种类型的音频源：

```javascript
// 1. 从音频文件创建源
async function loadAudioFile(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  return source;
}

// 2. 创建振荡器（合成音频）
const oscillator = audioContext.createOscillator();
oscillator.type = 'sine'; // sine, square, sawtooth, triangle
oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 音符

// 3. 从媒体元素创建源
const audio = document.querySelector('audio');
const mediaSource = audioContext.createMediaElementSource(audio);

// 4. 从麦克风获取输入
navigator.mediaDevices.getUserMedia({ audio: true })
  .then(stream => {
    const micSource = audioContext.createMediaStreamSource(stream);
    micSource.connect(audioContext.destination);
  });
```

### 2. 音频处理与效果

AudioContext 提供了丰富的音频处理节点：

```javascript
// 增益控制（音量）
const gainNode = audioContext.createGain();
gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
gainNode.gain.linearRampToValueAtTime(1.0, audioContext.currentTime + 2);

// 立体声平衡
const pannerNode = audioContext.createStereoPanner();
pannerNode.pan.setValueAtTime(-1, audioContext.currentTime); // -1(左) 到 1(右)

// 滤波器
const biquadFilter = audioContext.createBiquadFilter();
biquadFilter.type = 'lowpass';
biquadFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
biquadFilter.Q.setValueAtTime(1, audioContext.currentTime);

// 延迟效果
const delayNode = audioContext.createDelay();
delayNode.delayTime.setValueAtTime(0.5, audioContext.currentTime);

// 音频分析
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// 连接节点
source
  .connect(biquadFilter)
  .connect(gainNode)
  .connect(pannerNode)
  .connect(delayNode)
  .connect(audioContext.destination);
```

### 3. 精确的时间控制

AudioContext 提供高精度的时间控制：

```javascript
const now = audioContext.currentTime;

// 精确调度音频事件
oscillator.start(now);
oscillator.stop(now + 2); // 2秒后停止

// 参数自动化
gainNode.gain.setValueAtTime(0, now);
gainNode.gain.linearRampToValueAtTime(1, now + 1); // 1秒内淡入
gainNode.gain.exponentialRampToValueAtTime(0.01, now + 3); // 2秒后淡出
```

### 4. 音频可视化

结合 Canvas API 实现音频可视化：

```javascript
function visualize() {
  const canvas = document.getElementById('visualizer');
  const canvasCtx = canvas.getContext('2d');

  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  source.connect(analyser);
  analyser.connect(audioContext.destination);

  function draw() {
    requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = (dataArray[i] / 255) * canvas.height;

      canvasCtx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

      x += barWidth + 1;
    }
  }

  draw();
}
```

## 优点

### 1. 强大的音频处理能力

- **原生支持**：无需第三方库即可进行复杂的音频处理
- **节点化架构**：灵活组合各种音频节点，实现复杂效果
- **实时处理**：支持实时音频流处理和分析

### 2. 高精度时间控制

```javascript
// 精确到微秒级的音频调度
const beatInterval = 60 / 120; // 120 BPM
let nextBeatTime = audioContext.currentTime;

function scheduleBeat() {
  const osc = audioContext.createOscillator();
  osc.connect(audioContext.destination);
  osc.start(nextBeatTime);
  osc.stop(nextBeatTime + 0.05);

  nextBeatTime += beatInterval;

  setTimeout(() => {
    scheduleBeat();
  }, (beatInterval - 0.1) * 1000);
}
```

### 3. 广泛的浏览器支持

现代浏览器几乎都支持 Web Audio API：

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Opera: ✅
- 移动端浏览器: ✅（需要用户交互触发）

### 4. 低延迟音频处理

相比于 HTML5 `<audio>` 元素，AudioContext 提供更低的延迟，适合实时音频应用。

### 5. 丰富的音频节点

内置多种音频处理节点：

- `GainNode` - 音量控制
- `BiquadFilterNode` - 滤波器（低通、高通、带通等）
- `ConvolverNode` - 混响效果
- `DynamicsCompressorNode` - 动态压缩
- `AnalyserNode` - 音频分析
- `PannerNode` / `StereoPannerNode` - 立体声定位
- `DelayNode` - 延迟效果
- `WaveShaperNode` - 波形整形（失真效果）

## 缺点与限制

### 1. 学习曲线陡峭

Web Audio API 的概念较为复杂，需要一定的音频处理基础：

```javascript
// 初学者可能难以理解的节点连接
const source = audioContext.createBufferSource();
const analyser = audioContext.createAnalyser();
const gainNode = audioContext.createGain();
const filter = audioContext.createBiquadFilter();

// 复杂的信号路由
source.connect(filter);
filter.connect(gainNode);
gainNode.connect(analyser);
analyser.connect(audioContext.destination);

// 同时也可以这样连接（用于可视化）
gainNode.connect(analyser);
```

### 2. 移动端限制

移动浏览器对 AudioContext 有特殊限制：

```javascript
// 移动端必须在用户交互中创建/恢复 AudioContext
document.addEventListener('touchstart', function() {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}, { once: true });

// iOS Safari 有自动播放限制
// 必须在用户事件处理器中调用
button.addEventListener('click', () => {
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start(0);
});
```

### 3. 性能开销

复杂的音频处理图可能消耗大量 CPU：

```javascript
// 不良实践：创建过多节点
for (let i = 0; i < 100; i++) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  // ... 可能导致性能问题
}

// 良好实践：重用节点，按需创建
const oscillatorPool = [];
function getOscillator() {
  return oscillatorPool.pop() || audioContext.createOscillator();
}
```

### 4. 浏览器兼容性差异

尽管大部分浏览器支持，但仍有细微差异：

```javascript
// 需要处理浏览器前缀
const AudioContext = window.AudioContext || window.webkitAudioContext;

// 某些旧版浏览器可能不支持某些节点
if (audioContext.createStereoPanner) {
  const panner = audioContext.createStereoPanner();
} else {
  // 使用 PannerNode 作为替代
  const panner = audioContext.createPanner();
}
```

### 5. 调试困难

音频问题往往难以调试：

- 听不到声音可能是节点连接错误
- 音频失真可能是增益设置不当
- 时间同步问题难以定位

```javascript
// 调试技巧：检查节点连接
function debugAudioGraph(node, depth = 0) {
  console.log('  '.repeat(depth) + node.constructor.name);
  // 递归检查连接的节点（需要手动跟踪）
}
```

### 6. 内存管理

需要手动管理音频资源：

```javascript
// 不再使用时需要断开连接
source.disconnect();

// 关闭 AudioContext 释放资源
audioContext.close();

// 大型 AudioBuffer 会占用大量内存
// 需要在不使用时及时释放
audioBuffer = null;
```

## 实际应用场景

### 1. 在线音乐播放器

```javascript
class MusicPlayer {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
  }

  async loadTrack(url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  play() {
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = this.audioBuffer;
    this.source.connect(this.gainNode);
    this.source.start(0);
  }

  pause() {
    this.source?.stop();
  }

  setVolume(value) {
    this.gainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
  }

  fadeOut(duration = 1) {
    const now = this.audioContext.currentTime;
    this.gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
  }
}

// 使用
const player = new MusicPlayer();
await player.loadTrack('song.mp3');
player.play();
player.setVolume(0.7);
```

### 2. 实时音频可视化

```javascript
class AudioVisualizer {
  constructor(audioElement) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;

    const source = this.audioContext.createMediaElementSource(audioElement);
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  getFrequencyData() {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  getWaveform() {
    this.analyser.getByteTimeDomainData(this.dataArray);
    return this.dataArray;
  }

  visualize(canvas) {
    const ctx = canvas.getContext('2d');
    const draw = () => {
      requestAnimationFrame(draw);

      const data = this.getFrequencyData();

      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / data.length;

      data.forEach((value, index) => {
        const barHeight = (value / 255) * canvas.height;
        const hue = (index / data.length) * 360;

        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(
          index * barWidth,
          canvas.height - barHeight,
          barWidth,
          barHeight
        );
      });
    };

    draw();
  }
}

// 使用
const audio = document.querySelector('audio');
const visualizer = new AudioVisualizer(audio);
visualizer.visualize(document.querySelector('canvas'));
```

### 3. 声音合成器

```javascript
class Synthesizer {
  constructor() {
    this.audioContext = new AudioContext();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);

    this.activeNotes = new Map();
  }

  playNote(frequency, duration = 1) {
    const now = this.audioContext.currentTime;

    // 创建振荡器
    const oscillator = this.audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);

    // 创建包络（ADSR）
    const envelope = this.audioContext.createGain();
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.5, now + 0.01); // Attack
    envelope.gain.exponentialRampToValueAtTime(0.3, now + 0.1); // Decay
    envelope.gain.setValueAtTime(0.3, now + duration - 0.1); // Sustain
    envelope.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release

    // 连接节点
    oscillator.connect(envelope);
    envelope.connect(this.masterGain);

    // 播放
    oscillator.start(now);
    oscillator.stop(now + duration);

    return { oscillator, envelope };
  }

  playChord(frequencies, duration = 1) {
    frequencies.forEach(freq => this.playNote(freq, duration));
  }

  // 钢琴键盘映射
  noteToFrequency(note) {
    const notes = {
      'C4': 261.63,
      'D4': 293.66,
      'E4': 329.63,
      'F4': 349.23,
      'G4': 392.00,
      'A4': 440.00,
      'B4': 493.88,
      'C5': 523.25
    };
    return notes[note];
  }
}

// 使用
const synth = new Synthesizer();

// 播放单音
synth.playNote(440, 1); // A4

// 播放和弦
synth.playChord([261.63, 329.63, 392.00], 2); // C大三和弦
```

### 4. 实时音效处理

```javascript
class AudioEffects {
  constructor(audioElement) {
    this.audioContext = new AudioContext();

    // 创建源
    this.source = this.audioContext.createMediaElementSource(audioElement);

    // 创建效果节点
    this.equalizer = this.createEqualizer();
    this.reverb = this.audioContext.createConvolver();
    this.delay = this.audioContext.createDelay();
    this.distortion = this.audioContext.createWaveShaper();
    this.masterGain = this.audioContext.createGain();

    // 默认连接（干信号）
    this.connectNodes();
  }

  createEqualizer() {
    // 创建 10 段均衡器
    const frequencies = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
    const filters = frequencies.map(freq => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1;
      filter.gain.value = 0;
      return filter;
    });

    // 串联滤波器
    for (let i = 0; i < filters.length - 1; i++) {
      filters[i].connect(filters[i + 1]);
    }

    return {
      input: filters[0],
      output: filters[filters.length - 1],
      filters
    };
  }

  connectNodes() {
    this.source
      .connect(this.equalizer.input);

    this.equalizer.output
      .connect(this.masterGain)
      .connect(this.audioContext.destination);
  }

  setEQ(bandIndex, gain) {
    this.equalizer.filters[bandIndex].gain.value = gain;
  }

  async loadReverb(impulseResponseUrl) {
    const response = await fetch(impulseResponseUrl);
    const arrayBuffer = await response.arrayBuffer();
    this.reverb.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  enableReverb(mix = 0.5) {
    // 创建干湿混合
    const dryGain = this.audioContext.createGain();
    const wetGain = this.audioContext.createGain();

    dryGain.gain.value = 1 - mix;
    wetGain.gain.value = mix;

    this.source.disconnect();

    // 干信号
    this.source.connect(dryGain).connect(this.masterGain);

    // 湿信号（带混响）
    this.source.connect(this.reverb).connect(wetGain).connect(this.masterGain);
  }

  enableDistortion(amount = 50) {
    const curve = new Float32Array(this.audioContext.sampleRate);
    const deg = Math.PI / 180;

    for (let i = 0; i < this.audioContext.sampleRate; i++) {
      const x = (i * 2) / this.audioContext.sampleRate - 1;
      curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
    }

    this.distortion.curve = curve;
    this.distortion.oversample = '4x';

    this.source.disconnect();
    this.source
      .connect(this.distortion)
      .connect(this.masterGain)
      .connect(this.audioContext.destination);
  }
}

// 使用
const audio = document.querySelector('audio');
const effects = new AudioEffects(audio);

// 调整均衡器
effects.setEQ(0, 5);  // 增强低音
effects.setEQ(9, 3);  // 增强高音

// 添加混响
await effects.loadReverb('impulse-response.wav');
effects.enableReverb(0.3);
```

### 5. 语音录制与处理

```javascript
class VoiceRecorder {
  constructor() {
    this.audioContext = new AudioContext();
    this.chunks = [];
  }

  async start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);

    this.mediaRecorder.ondataavailable = (e) => {
      this.chunks.push(e.data);
    };

    this.mediaRecorder.onstop = async () => {
      const blob = new Blob(this.chunks, { type: 'audio/webm' });
      const arrayBuffer = await blob.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.chunks = [];
    };

    this.mediaRecorder.start();
  }

  stop() {
    return new Promise(resolve => {
      this.mediaRecorder.onstop = async () => {
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
        this.chunks = [];
        resolve(this.audioBuffer);
      };
      this.mediaRecorder.stop();
    });
  }

  async playback() {
    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(0);
  }

  // 降噪处理
  async denoiseAudio() {
    const offline = new OfflineAudioContext(
      this.audioBuffer.numberOfChannels,
      this.audioBuffer.length,
      this.audioBuffer.sampleRate
    );

    const source = offline.createBufferSource();
    source.buffer = this.audioBuffer;

    // 创建低通滤波器去除高频噪声
    const filter = offline.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3000;

    source.connect(filter);
    filter.connect(offline.destination);

    source.start(0);

    this.audioBuffer = await offline.startRendering();
    return this.audioBuffer;
  }
}

// 使用
const recorder = new VoiceRecorder();

document.getElementById('record').addEventListener('click', () => {
  recorder.start();
});

document.getElementById('stop').addEventListener('click', async () => {
  await recorder.stop();
  await recorder.denoiseAudio();
  recorder.playback();
});
```

### 6. 游戏音效引擎

```javascript
class GameAudioEngine {
  constructor() {
    this.audioContext = new AudioContext();
    this.sounds = new Map();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
  }

  async loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.sounds.set(name, audioBuffer);
  }

  playSound(name, options = {}) {
    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume ?? 1;

    // 3D 音效定位
    if (options.position) {
      const panner = this.audioContext.createPanner();
      panner.setPosition(options.position.x, options.position.y, options.position.z);
      source.connect(panner);
      panner.connect(gainNode);
    } else {
      source.connect(gainNode);
    }

    gainNode.connect(this.masterGain);

    source.start(0);

    return source;
  }

  // 播放循环背景音乐
  playBackgroundMusic(name, fadeInDuration = 2) {
    const source = this.playSound(name, { volume: 0 });
    source.loop = true;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(
      0.5,
      this.audioContext.currentTime + fadeInDuration
    );

    return source;
  }

  // 碰撞音效（带音调变化）
  playCollisionSound(intensity) {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100 * intensity, this.audioContext.currentTime);

    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + 0.1);
  }
}

// 使用
const audioEngine = new GameAudioEngine();

// 预加载音效
await audioEngine.loadSound('jump', 'jump.mp3');
await audioEngine.loadSound('coin', 'coin.mp3');
await audioEngine.loadSound('bgm', 'background.mp3');

// 播放音效
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    audioEngine.playSound('jump');
  }
});

// 收集金币时
audioEngine.playSound('coin', {
  position: { x: 10, y: 0, z: 5 }
});

// 播放背景音乐
audioEngine.playBackgroundMusic('bgm');

// 碰撞音效
audioEngine.playCollisionSound(1.5);
```

## 最佳实践

### 1. 用户交互触发

```javascript
// 在用户交互中初始化 AudioContext
let audioContext;

document.addEventListener('click', function initAudio() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }

  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // 只初始化一次
  document.removeEventListener('click', initAudio);
}, { once: true });
```

### 2. 资源管理

```javascript
class AudioManager {
  constructor() {
    this.audioContext = new AudioContext();
    this.buffers = new Map();
    this.activeSources = new Set();
  }

  async preloadSounds(soundList) {
    const promises = soundList.map(({ name, url }) =>
      this.loadSound(name, url)
    );
    await Promise.all(promises);
  }

  async loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.buffers.set(name, buffer);
  }

  play(name) {
    const buffer = this.buffers.get(name);
    if (!buffer) return null;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);

    this.activeSources.add(source);

    source.onended = () => {
      this.activeSources.delete(source);
    };

    source.start(0);
    return source;
  }

  stopAll() {
    this.activeSources.forEach(source => source.stop());
    this.activeSources.clear();
  }

  cleanup() {
    this.stopAll();
    this.audioContext.close();
    this.buffers.clear();
  }
}
```

### 3. 性能优化

```javascript
// 使用对象池避免频繁创建节点
class NodePool {
  constructor(audioContext, createNodeFn, initialSize = 10) {
    this.audioContext = audioContext;
    this.createNode = createNodeFn;
    this.available = [];
    this.active = new Set();

    // 预创建节点
    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createNode());
    }
  }

  acquire() {
    let node = this.available.pop();
    if (!node) {
      node = this.createNode();
    }
    this.active.add(node);
    return node;
  }

  release(node) {
    this.active.delete(node);
    node.disconnect();
    this.available.push(node);
  }
}

// 使用
const gainPool = new NodePool(
  audioContext,
  () => audioContext.createGain(),
  20
);
```

### 4. 错误处理

```javascript
class SafeAudioContext {
  constructor() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      console.error('AudioContext not supported', error);
      this.audioContext = null;
    }
  }

  async loadAudio(url) {
    if (!this.audioContext) {
      throw new Error('AudioContext not available');
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  resume() {
    if (this.audioContext?.state === 'suspended') {
      return this.audioContext.resume();
    }
  }
}
```

## 总结

AudioContext 是 Web Audio API 的核心，提供了强大而灵活的音频处理能力。

**核心优势：**
- 原生浏览器支持，无需依赖外部库
- 节点化架构，可灵活组合各种音频效果
- 高精度时间控制，适合音乐和游戏应用
- 支持实时音频分析和可视化

**主要挑战：**
- 学习曲线较陡，需要音频处理知识
- 移动端有使用限制，需要用户交互触发
- 复杂应用可能有性能开销
- 调试相对困难

**适用场景：**
- 音乐播放器和音频编辑工具
- 游戏音效引擎
- 实时音频可视化
- 语音处理应用
- 在线乐器和合成器
- 音频教育工具

通过合理使用 AudioContext 及其相关 API，我们可以在浏览器中实现专业级的音频应用，为用户提供丰富的听觉体验。

## 参考资源

- [MDN - Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN - AudioContext](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [Web Audio Examples](https://github.com/mdn/webaudio-examples)
