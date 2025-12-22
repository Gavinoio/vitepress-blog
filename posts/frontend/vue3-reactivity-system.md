---
title: 深入理解 Vue 3 响应式系统原理
date: 2024-12-12 10:51:15
categories:
  - 前端开发
tags:
  - Vue3
  - 响应式
  - JavaScript
---

# 深入理解 Vue 3 响应式系统原理

Vue 3 使用 Proxy 重写了响应式系统，相比 Vue 2 的 Object.defineProperty，带来了更好的性能和更强大的功能。

## 1. Vue 2 vs Vue 3 响应式对比

### Vue 2 的局限性

```javascript
// Vue 2 使用 Object.defineProperty
const data = { count: 0 };

Object.defineProperty(data, 'count', {
  get() {
    console.log('获取 count');
    return this._count;
  },
  set(value) {
    console.log('设置 count');
    this._count = value;
  }
});

// 问题1：无法检测新增属性
data.newProp = 'hello'; // ❌ 不会触发响应式更新

// 问题2：无法检测数组索引变化
const arr = [1, 2, 3];
arr[0] = 100; // ❌ 不会触发响应式更新

// 问题3：无法检测数组长度变化
arr.length = 0; // ❌ 不会触发响应式更新
```

### Vue 3 使用 Proxy

```javascript
// Vue 3 使用 Proxy
const data = { count: 0 };

const proxy = new Proxy(data, {
  get(target, key) {
    console.log('获取', key);
    return target[key];
  },
  set(target, key, value) {
    console.log('设置', key);
    target[key] = value;
    return true;
  }
});

// ✅ 所有操作都能被拦截
proxy.newProp = 'hello'; // 可以检测到
proxy.arr = [1, 2, 3];
proxy.arr[0] = 100; // 可以检测到
proxy.arr.length = 0; // 可以检测到
```

## 2. 响应式核心 API

### reactive

创建响应式对象，深度响应式。

```javascript
import { reactive } from 'vue';

const state = reactive({
  count: 0,
  nested: {
    value: 100
  },
  arr: [1, 2, 3]
});

// 所有嵌套属性都是响应式的
state.count++; // ✅ 响应式
state.nested.value++; // ✅ 响应式
state.arr.push(4); // ✅ 响应式

// 注意：不能直接替换整个对象
// state = {}; // ❌ 会失去响应式
// 应该这样：
Object.assign(state, { count: 0, nested: { value: 0 } }); // ✅
```

### ref

创建单个值的响应式引用。

```javascript
import { ref, isRef, unref } from 'vue';

const count = ref(0);

// 在 JS 中需要用 .value 访问
console.log(count.value); // 0
count.value++;

// 在模板中自动解包，不需要 .value
// <template>{{ count }}</template>

// 判断是否是 ref
console.log(isRef(count)); // true

// 获取 ref 的值，如果不是 ref 则返回原值
const value = unref(count); // 等同于 isRef(count) ? count.value : count

// ref 可以包含任何值
const obj = ref({ name: 'John' });
obj.value.name = 'Jane'; // ✅ 响应式

const arr = ref([1, 2, 3]);
arr.value.push(4); // ✅ 响应式
```

### computed

创建计算属性。

```javascript
import { reactive, computed } from 'vue';

const state = reactive({
  firstName: 'John',
  lastName: 'Doe'
});

// 只读计算属性
const fullName = computed(() => {
  return `${state.firstName} ${state.lastName}`;
});

console.log(fullName.value); // "John Doe"

// 可写计算属性
const fullNameWritable = computed({
  get() {
    return `${state.firstName} ${state.lastName}`;
  },
  set(value) {
    const names = value.split(' ');
    state.firstName = names[0];
    state.lastName = names[1];
  }
});

fullNameWritable.value = 'Jane Smith';
console.log(state.firstName); // "Jane"
console.log(state.lastName); // "Smith"
```

### watch 和 watchEffect

```javascript
import { reactive, ref, watch, watchEffect } from 'vue';

const count = ref(0);
const state = reactive({ name: 'John' });

// 1. 监听单个 ref
watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} -> ${newVal}`);
});

// 2. 监听多个源
watch([count, () => state.name], ([newCount, newName], [oldCount, oldName]) => {
  console.log(`count: ${newCount}, name: ${newName}`);
});

// 3. 监听 reactive 对象的属性
watch(
  () => state.name,
  (newVal, oldVal) => {
    console.log(`name changed: ${oldVal} -> ${newVal}`);
  }
);

// 4. 深度监听
watch(
  state,
  (newVal, oldVal) => {
    console.log('state changed');
  },
  { deep: true }
);

// 5. 立即执行
watch(
  count,
  (newVal) => {
    console.log('count:', newVal);
  },
  { immediate: true } // 立即执行一次
);

// 6. watchEffect - 自动追踪依赖
watchEffect(() => {
  console.log(`count: ${count.value}, name: ${state.name}`);
}); // 会在 count 或 state.name 变化时自动执行

// 7. 停止监听
const stop = watch(count, (newVal) => {
  console.log(newVal);
});

stop(); // 停止监听
```

## 3. 响应式工具函数

### toRef 和 toRefs

```javascript
import { reactive, toRef, toRefs } from 'vue';

const state = reactive({
  count: 0,
  name: 'John'
});

// toRef - 为响应式对象的单个属性创建 ref
const count = toRef(state, 'count');
console.log(count.value); // 0
count.value++; // state.count 也会变化

// toRefs - 将响应式对象的所有属性转换为 ref
const { name } = toRefs(state);
console.log(name.value); // "John"

// 常用于组合式函数的返回值
function useCounter() {
  const state = reactive({
    count: 0,
    double: computed(() => state.count * 2)
  });

  function increment() {
    state.count++;
  }

  // 解构后仍保持响应式
  return {
    ...toRefs(state),
    increment
  };
}

const { count, double, increment } = useCounter();
```

### readonly 和 shallowReadonly

```javascript
import { reactive, readonly, shallowReadonly } from 'vue';

const state = reactive({ count: 0, nested: { value: 1 } });

// 创建只读代理，深度只读
const readonlyState = readonly(state);
// readonlyState.count++; // ❌ 警告：无法修改只读属性

// 创建浅层只读代理
const shallowReadonlyState = shallowReadonly(state);
// shallowReadonlyState.count++; // ❌ 警告
shallowReadonlyState.nested.value++; // ✅ 可以修改嵌套属性
```

### isReactive 和 isReadonly

```javascript
import { reactive, readonly, isReactive, isReadonly, isProxy } from 'vue';

const state = reactive({ count: 0 });
const readonlyState = readonly(state);

console.log(isReactive(state)); // true
console.log(isReactive(readonlyState)); // false
console.log(isReadonly(readonlyState)); // true
console.log(isProxy(state)); // true
console.log(isProxy(readonlyState)); // true
```

### toRaw 和 markRaw

```javascript
import { reactive, toRaw, markRaw } from 'vue';

const state = reactive({ count: 0 });

// toRaw - 获取原始对象
const raw = toRaw(state);
raw.count++; // 不会触发响应式更新

// markRaw - 标记对象永远不会转换为响应式
const nonReactive = markRaw({ value: 100 });
const state2 = reactive({
  obj: nonReactive
});

console.log(isReactive(state2.obj)); // false
```

## 4. 响应式最佳实践

### 组合式函数 (Composables)

```javascript
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 自定义组合式函数
export function useMouse() {
  const x = ref(0);
  const y = ref(0);

  function update(event) {
    x.value = event.pageX;
    y.value = event.pageY;
  }

  onMounted(() => {
    window.addEventListener('mousemove', update);
  });

  onUnmounted(() => {
    window.removeEventListener('mousemove', update);
  });

  return { x, y };
}

// 使用
import { useMouse } from './useMouse';

export default {
  setup() {
    const { x, y } = useMouse();

    return { x, y };
  }
};
```

### 状态管理模式

```javascript
import { reactive, readonly } from 'vue';

// 创建全局状态
const state = reactive({
  user: null,
  isLoading: false
});

// 只暴露只读版本
export const useState = () => readonly(state);

// 提供修改状态的方法
export const setUser = (user) => {
  state.user = user;
};

export const setLoading = (loading) => {
  state.isLoading = loading;
};

// 在组件中使用
import { useState, setUser } from './store';

export default {
  setup() {
    const state = useState();

    function login(userData) {
      setUser(userData);
    }

    return { state, login };
  }
};
```

## 5. 性能优化技巧

### 使用 shallowRef 和 shallowReactive

```javascript
import { shallowRef, shallowReactive, triggerRef } from 'vue';

// shallowRef - 只有 .value 的变化是响应式的
const state = shallowRef({ count: 0 });
state.value.count++; // ❌ 不会触发更新
state.value = { count: 1 }; // ✅ 会触发更新

// 手动触发更新
triggerRef(state);

// shallowReactive - 只有根级别属性是响应式的
const state2 = shallowReactive({
  count: 0,
  nested: { value: 1 }
});

state2.count++; // ✅ 响应式
state2.nested.value++; // ❌ 不是响应式
state2.nested = { value: 2 }; // ✅ 响应式
```

### 使用 computed 缓存计算结果

```javascript
import { ref, computed } from 'vue';

const list = ref([1, 2, 3, 4, 5]);

// ❌ 不好 - 每次都重新计算
const filteredList = () => list.value.filter(item => item > 2);

// ✅ 好 - 只在依赖变化时重新计算
const filteredListComputed = computed(() => {
  console.log('计算过滤结果');
  return list.value.filter(item => item > 2);
});
```

## 6. 常见陷阱

### 解构响应式对象

```javascript
import { reactive, toRefs } from 'vue';

const state = reactive({ count: 0 });

// ❌ 错误 - 失去响应式
const { count } = state;
count++; // 不会触发更新

// ✅ 正确 - 使用 toRefs
const { count } = toRefs(state);
count.value++; // 会触发更新
```

### ref 自动解包

```javascript
import { ref, reactive } from 'vue';

const count = ref(0);

// 在 reactive 中会自动解包
const state = reactive({ count });
console.log(state.count); // 0（不需要 .value）
state.count++; // ✅

// 在数组和 Map 中不会自动解包
const arr = reactive([ref(0)]);
console.log(arr[0].value); // 需要 .value

const map = reactive(new Map([['count', ref(0)]]));
console.log(map.get('count').value); // 需要 .value
```

## 总结

Vue 3 响应式系统的核心要点：

1. **Proxy vs defineProperty**：Proxy 提供了更全面的拦截能力
2. **reactive vs ref**：对象用 reactive，基本类型用 ref
3. **computed**：缓存计算结果，提高性能
4. **watch vs watchEffect**：需要访问旧值用 watch，自动追踪依赖用 watchEffect
5. **性能优化**：适时使用 shallow 版本的 API
6. **组合式函数**：复用响应式逻辑的最佳实践

理解这些概念和 API，能够帮助你更好地使用 Vue 3 构建高性能的应用。
