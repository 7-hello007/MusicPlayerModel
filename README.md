# SONORA — Music Space

一个纯前端的本地音乐播放器。无需后端、无需上传，直接导入本地音乐文件夹即可播放。界面采用深色氛围背景、动态粒子、渐变时钟、旋转黑胶唱片和圆形进度环，支持拖动唱片调整播放进度。

---

## 目录

- [简介](#简介)
- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [使用说明](#使用说明)
- [键盘快捷键](#键盘快捷键)
- [移动端手势](#移动端手势)
- [文件说明](#文件说明)
- [浏览器兼容性](#浏览器兼容性)
- [已知限制](#已知限制)
- [许可证](#许可证)

---

## 简介

SONORA 是一个运行在浏览器中的本地音乐播放器。它不依赖任何服务器或第三方音乐服务，所有音乐文件都通过浏览器的 `File API` 和 `Object URL` 在本地读取和播放。界面分为左右两部分：

- **左侧播放器区**：动态渐变时钟、旋转黑胶唱片、圆形进度环、播放/暂停按钮、歌曲信息。
- **右侧音乐空间**：导入区域、歌曲列表、搜索、歌曲数量统计。

项目采用模块化组织：CSS 通过 `style.css` 使用 `@import` 汇总，JavaScript 通过 `scripts.js` 按顺序动态加载 `js/` 目录下的功能模块。

---

## 功能特性

- 🎵 **导入本地音乐**支持点击选择文件夹、点击添加按钮、拖拽文件/文件夹到导入区域。
- 🎧 **多格式支持**支持 `.mp3`、`.wav`、`.flac`、`.m4a`、`.aac`、`.ogg`、`.oga`、`.webm`。
- ▶️ **播放控制**播放、暂停、上一首、下一首、自动播放下一首。
- 🎚️ **拖动唱片调进度**在黑胶唱片上按住并旋转，即可像真实黑胶一样前后调整播放进度。
- ⌨️ **键盘增强**空格播放/暂停；短按左右方向键切歌；长按左右方向键快退/快进当前歌曲；上下方向键调节音量，并自动显示音量条。
- 🔍 **实时搜索**按歌曲标题或艺术家筛选歌曲列表。
- 🕒 **动态渐变时钟**左上角时钟每秒滚动，数字颜色渐变流动。
- 🌌 **粒子背景**Canvas 粒子随鼠标轻微排斥，营造音乐宇宙氛围。
- 📱 **响应式布局**桌面端左右分栏，移动端上下布局，支持滑动手势切歌。
- 🎨 **封面渐变**根据歌曲索引自动分配不同的渐变色封面。
- 💬 **Toast 提示**导入成功、无法播放等操作反馈。
- 📂 **智能文件名解析**自动识别 `编号 标题 - 艺术家` 或 `艺术家 - 标题` 格式，提取标题和艺术家。
- 🔢 **Windows 风格排序**
  按自然排序规则排列歌曲：数字优先，前导零多的在前，字母优先于中文，中文按拼音排序。

---

## 技术栈

- **HTML5**：语义化结构、`<audio>`、`<canvas>`、`File API`、`webkitdirectory`。
- **CSS3**：CSS 变量、Flexbox、Grid、`conic-gradient`、`radial-gradient`、`mask`、`backdrop-filter`、动画与过渡。
- **原生 JavaScript**：无框架、无构建工具，使用全局函数和变量协作。
- **Canvas 2D**：粒子动画。
- **requestAnimationFrame**：唱片旋转和进度动画。

---

## 项目结构

```text
MusicPlayerModel/
├── index.html                  # 主页面
├── style.css                   # CSS 总入口，@import 所有样式模块
├── scripts.js                  # JS 总入口，按顺序加载 js/ 下模块
├── README.md                   # 项目说明
├── css/                        # 样式模块
│   ├── global/
│   │   ├── variables.css
│   │   ├── reset.css
│   │   └── app.css
│   ├── background/
│   │   └── background.css
│   ├── clock/
│   │   └── clock.css
│   ├── layout/
│   │   ├── player-area.css
│   │   ├── music-space.css
│   │   ├── library.css
│   │   └── responsive.css
│   ├── player/
│   │   ├── player-header.css
│   │   ├── navigation.css
│   │   ├── player-stage.css
│   │   ├── orbit.css
│   │   ├── progress.css
│   │   ├── record.css
│   │   ├── record-light.css
│   │   ├── grooves.css
│   │   ├── record-label.css
│   │   ├── play-button.css
│   │   ├── track-info.css
│   │   └── volume.css
│   ├── library/
│   │   ├── header-actions.css
│   │   ├── add-button.css
│   │   ├── search.css
│   │   ├── import-area.css
│   │   ├── track-list.css
│   │   ├── equalizer.css
│   │   └── empty.css
│   └── feedback/
│       └── toast.css
├── js/                         # 功能模块
│   ├── core/
│   │   ├── 01-dom.js
│   │   ├── 02-state.js
│   │   └── 03-utils.js
│   └── features/
│       ├── 04-clock.js
│       ├── 05-import.js
│       ├── 06-tracks.js
│       ├── 07-playback.js
│       ├── 08-progress.js
│       ├── 09-seek.js
│       ├── 10-search.js
│       ├── 11-keyboard.js
│       ├── 12-swipe.js
│       ├── 13-particles.js
│       └── 14-volume.js
└── pho/                        # 模板资源
    ├── index-pho.html              # 旧版页面（未在主线使用）
    ├── script-pho.js               # 旧版脚本（未在主线使用）
    ├── style-pho.css               # 旧版样式（未在主线使用）
    └── scripts.js.pro              # 新式脚本（未在主线使用）
```

---

## 快速开始

### 方式一：直接打开

直接用浏览器打开 `index.html` 即可。

> 注意：部分浏览器在 `file://` 协议下对 `webkitdirectory` 和本地文件读取有限制。如果导入文件夹不可用，请使用方式二。

### 方式二：本地 HTTP 服务器（推荐）

在项目根目录执行：

```bash
# Python 3
python -m http.server 8080

# 或 Node.js
npx serve .
```

然后访问：

```text
http://localhost:8080
```

---

## 使用说明

1. **导入音乐**

   - 点击右侧“Import Local Music”区域。
   - 点击右上角“+”按钮。
   - 将音乐文件夹或文件拖拽到导入区域。
2. **播放音乐**

   - 点击歌曲列表中的任意歌曲开始播放。
   - 点击左侧播放器中心按钮播放/暂停。
   - 点击播放器左半边区域：上一首。
   - 点击播放器右半边区域：下一首。
3. **调整进度**

   - 在黑胶唱片上按住并顺时针/逆时针旋转。
   - 一圈对应整首歌曲的进度。
   - 拖动结束后不会误触播放/暂停。
4. **搜索**

   - 点击右上角搜索按钮。
   - 输入标题或艺术家关键词，列表实时过滤。
5. **查看歌曲状态**

   - 当前播放歌曲在列表中高亮，并显示跳动均衡器。
   - 左侧底部显示当前歌曲标题和艺术家。

---

## 键盘快捷键

| 按键        | 功能                   |
| ----------- | ---------------------- |
| `Space`   | 播放 / 暂停            |
| `←` 短按 | 上一首                 |
| `→` 短按 | 下一首                 |
| `←` 长按 | 当前歌曲快退           |
| `→` 长按 | 当前歌曲快进           |
| `↑`      | 提高音量，并显示音量条 |
| `↓`      | 降低音量，并显示音量条 |

> 当焦点在搜索输入框时，快捷键不会触发。

---

## 移动端手势

| 手势             | 功能         |
| ---------------- | ------------ |
| 在播放器区域左滑 | 下一首       |
| 在播放器区域右滑 | 上一首       |
| 在唱片上旋转     | 调整播放进度 |

---

## 文件说明

### 根目录

| 文件           | 作用                                                   |
| -------------- | ------------------------------------------------------ |
| `index.html` | 页面结构：背景、播放器、音乐空间、搜索、Toast、Audio。 |
| `style.css`  | CSS 总入口，通过`@import` 加载所有样式模块。         |
| `scripts.js` | JS 总入口，按顺序动态加载`js/` 下模块。              |
| `README.md`  | 项目说明文档。                                         |

### `js/` 模块

| 文件                         | 作用                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------- |
| `core/01-dom.js`           | 获取并缓存所有 DOM 元素引用。                                                    |
| `core/02-state.js`         | 定义全局状态：歌曲列表、当前索引、播放状态、Seek 状态、唱片旋转、进度动画等。    |
| `core/03-utils.js`         | 工具函数：时间格式化、Toast、文件名解析、Windows 风格排序、HTML 转义、封面渐变。 |
| `features/04-clock.js`     | 动态渐变时钟：每秒滚动数字。                                                     |
| `features/05-import.js`    | 音乐导入：点击、拖拽、文件过滤、Object URL、读取时长、排序。                     |
| `features/06-tracks.js`    | 歌曲列表渲染、搜索过滤、点击播放。                                               |
| `features/07-playback.js`  | 播放控制：播放/暂停、上一首/下一首、自动下一首、唱片旋转。                       |
| `features/08-progress.js`  | 圆形进度环和进度球的平滑动画。                                                   |
| `features/09-seek.js`      | 拖动唱片调整播放进度。                                                           |
| `features/10-search.js`    | 搜索框打开/关闭、实时过滤。                                                      |
| `features/11-keyboard.js`  | 键盘快捷键：空格、方向键、长按快进快退、音量调节。                               |
| `features/12-swipe.js`     | 移动端左右滑动切歌。                                                             |
| `features/13-particles.js` | Canvas 粒子背景，并在最后完成首次渲染初始化。                                    |
| `features/14-volume.js`    | 音量控制、本地存储、键盘 API。                                                   |

### `css/` 模块

| 文件                           | 作用                         |
| ------------------------------ | ---------------------------- |
| `global/variables.css`       | 全局 CSS 变量。              |
| `global/reset.css`           | 全局重置。                   |
| `global/app.css`             | 主布局。                     |
| `background/background.css`  | 背景与氛围光。               |
| `clock/clock.css`            | 时钟样式与动画。             |
| `layout/player-area.css`     | 左侧播放器容器。             |
| `layout/music-space.css`     | 右侧音乐空间容器。           |
| `layout/library.css`         | 音乐库滚动区域。             |
| `layout/responsive.css`      | 响应式适配。                 |
| `player/player-header.css`   | 左侧头部（预留 LOGO 样式）。 |
| `player/navigation.css`      | 左右隐形点击区域。           |
| `player/player-stage.css`    | 播放器舞台居中。             |
| `player/orbit.css`           | 外圈轨道与虚线旋转。         |
| `player/progress.css`        | 圆形进度环与进度球。         |
| `player/record.css`          | 黑胶唱片本体。               |
| `player/record-light.css`    | 唱片表面彩色光晕。           |
| `player/grooves.css`         | 唱片纹路。                   |
| `player/record-label.css`    | 唱片中心标签。               |
| `player/play-button.css`     | 中心播放/暂停按钮。          |
| `player/track-info.css`      | 底部歌曲信息。               |
| `player/volume.css`          | 音量控制条。                 |
| `library/header-actions.css` | 头部按钮组。                 |
| `library/add-button.css`     | 添加按钮。                   |
| `library/search.css`         | 搜索按钮与搜索框。           |
| `library/import-area.css`    | 导入区域。                   |
| `library/track-list.css`     | 歌曲列表。                   |
| `library/equalizer.css`      | 播放中均衡器动画。           |
| `library/empty.css`          | 空状态。                     |
| `feedback/toast.css`         | Toast 提示。                 |

### `pho/` 模块

| 文件               | 作用                            |
| ------------------ | ------------------------------- |
| `index-pho.html` | 旧版/手机版页面，未在主线使用。 |
| `script-pho.js`  | 旧版/手机版脚本，未在主线使用。 |
| `style-pho.css`  | 旧版/手机版样式，未在主线使用。 |
| `scripts.js.pro` | 备份/旧版脚本，未在主线使用。   |

---

## 浏览器兼容性

推荐使用最新版：

- Chrome / Edge
- Firefox
- Safari

需要支持以下特性：

- CSS 变量、`conic-gradient`、`mask`、`backdrop-filter`
- `File API`、`URL.createObjectURL`
- `Pointer Events`
- `requestAnimationFrame`
- `webkitdirectory`（导入文件夹）

> 部分浏览器在 `file://` 下可能限制文件夹导入，建议使用本地 HTTP 服务器。

---

## 已知限制

- 纯前端实现，刷新页面后导入的音乐列表会丢失。
- 歌曲信息（标题、艺术家）从文件名猜测，不支持读取 ID3 等元数据。
- 封面为自动生成的渐变色，不支持嵌入专辑封面。
- 不支持播放列表保存、歌词、均衡器音效调节。
- `pho/` 目录下的文件未在主线中引用，可能为旧版或实验版本。



---



## 许可证

本项目采用 `[MIT](LICENSE)` 许可证。

你可以自由使用、修改、分发本软件，包括商业用途，只需保留原始版权声明和许可证声明。软件按“原样”提供，不提供任何形式的担保。

## 致谢

感谢所有为本地音乐播放体验提供灵感的开源项目和设计资源。

**SONORA — Your Local Sound Universe.**
