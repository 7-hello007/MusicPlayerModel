# SONORA JavaScript Refactor

## 目标

本版本保留原 SONORA 播放器的功能与视觉 DOM/CSS 接口，同时把 JavaScript 从“共享全局变量 + 直接调用其他模块函数”重构为：

```text
                ┌─────────────────────┐
                │   scripts.js        │
                │ Bootstrap / Config  │
                └──────────┬──────────┘
                           │
                    Sonora Namespace
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
      DOM Service       State Store        Event Bus
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
          Feature A                 Feature B
          Track List                Playback
              │                         │
              └────── Events API ───────┘
```

### 核心规则

每个功能文件只依赖 `window.Sonora` 提供的稳定接口：

```text
Feature
  ↓
Sonora.dom
Sonora.state
Sonora.store
Sonora.utils
Sonora.events
Sonora.services
```

禁止：

```text
playback.js → tracks.js
tracks.js   → playback.js
keyboard.js → volume.js
search.js   → tracks.js
```

改为：

```text
keyboard.js ──emit──→ EventBus ──→ playback.js
keyboard.js ──emit──→ EventBus ──→ volume.js

search.js ───emit──→ EventBus ──→ tracks.js
import.js ───emit──→ EventBus ──→ tracks.js
```

## 文件职责

| 文件 | 单一职责 |
|---|---|
| `scripts.js` | Bootstrap、配置、事件总线、模块加载 |
| `core/01-dom.js` | DOM 引用管理 |
| `core/02-state.js` | 应用状态与状态转换 |
| `core/03-utils.js` | 纯工具函数 |
| `features/04-clock.js` | 时钟 |
| `features/05-import.js` | 音乐导入与文件处理 |
| `features/06-tracks.js` | 歌曲列表渲染与过滤 |
| `features/07-playback.js` | 播放、暂停、切歌、唱片旋转 |
| `features/08-progress.js` | 圆形进度显示 |
| `features/09-seek.js` | 唱片拖动 Seek |
| `features/10-search.js` | 搜索 UI 与搜索状态 |
| `features/11-keyboard.js` | 键盘控制 |
| `features/12-swipe.js` | 移动端左右滑动 |
| `features/13-particles.js` | 粒子背景 |
| `features/14-volume.js` | 音量与音量 UI |

## 软件设计原则

### 1. Single Responsibility Principle
每个文件只有一个主要变化原因。

### 2. Open/Closed Principle
新功能可以作为新的 Feature 加入，通过 EventBus 与系统交互，而不需要修改已有 Feature。

### 3. Liskov Substitution Principle
功能模块不依赖具体实现，只依赖统一的 `Sonora` 服务接口。

### 4. Interface Segregation Principle
DOM、State、Utils、EventBus、Feature Service 分开暴露，避免模块获得一个巨大的万能对象。

### 5. Dependency Inversion Principle
Feature 不直接依赖另一个 Feature，而依赖抽象通信层 EventBus。

### 6. KISS / DRY
公共逻辑集中到 State、Utils、Config；Magic Number 集中到配置对象；重复的跨模块调用改为统一事件。

## 为什么 scripts.js 仍然有模块列表？

浏览器在普通 `file://` / WebView 环境下不能安全地枚举 `js/features/` 目录，因此“完全自动发现所有 JS 文件”并不可靠。

因此模块路径只保留在 `scripts.js` 的一个**声明式 manifest** 中：

```js
root.config.modules = [
    ...
];
```

它属于配置，不属于任何业务逻辑。

如果以后使用 Vite/Rollup/Webpack，可以把这一部分进一步替换成构建时自动生成的 manifest，而无需修改任何 Feature 文件。

## 后续扩展

例如增加 `15-lyrics.js`：

```js
(() => {
    const { dom, events } = Sonora;

    events.on("track:selected", ({ track }) => {
        // lyrics logic
    });
})();
```

它不需要：

```js
import.js
tracks.js
playback.js
search.js
```

中的任何函数或变量。

这样可以继续保持高内聚、低耦合。
