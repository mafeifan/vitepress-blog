# zsh theme 仓库推荐

> 一个顺眼的终端主题不只是颜值，更能在每次敲命令时快速传递上下文信息。本文整理当前最值得关注的几个 zsh 主题 / 提示符框架，并给出选型建议。

## 快速对比

| 名称 | 风格 | 是否跨 Shell | 需要 Nerd Font | 配置方式 | 适合人群 |
|------|------|:-----------:|:--------------:|----------|----------|
| Powerlevel10k | 信息丰富 | ❌ 仅 zsh | 推荐 | 交互式向导 | 重度定制党 |
| Starship | 简洁现代 | ✅ | 推荐 | TOML 文件 | 多语言开发者 |
| Spaceship | 信息丰富 | ❌ 仅 zsh | 推荐 | zsh 变量 | 全栈 / DevOps |
| Pure | 极简 | ❌ 仅 zsh | ❌ | 几乎零配置 | 极简主义者 |
| Oh My Zsh 内置 | 多样 | ❌ 仅 zsh | 部分需要 | 单变量切换 | 入门用户 |

---

## 1. Powerlevel10k — 最流行的 zsh 主题

- **GitHub**：https://github.com/romkatv/powerlevel10k
- **⭐ Stars**：50k+

以**极致渲染速度**著称，即使在超大 git 仓库中也几乎零延迟。内置交互式配置向导 `p10k configure`，首次运行即可可视化选择样式。

**核心特性：**
- 四种内置风格：Lean、Classic、Rainbow、Pure
- 即时提示（Instant Prompt）：shell 启动时先显示提示符，后台再加载插件，几乎消除启动延迟
- 展示 git 状态、Python venv、AWS profile、命令耗时、后台任务等
- 兼容 Oh My Zsh、Prezto、zinit、Antigen

**安装（Oh My Zsh）：**
```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k"
```
在 `~/.zshrc` 中设置：
```bash
ZSH_THEME="powerlevel10k/powerlevel10k"
```
重新打开终端后会自动触发配置向导。

---

## 2. Starship — 跨 Shell 的现代提示符

- **GitHub**：https://github.com/starship/starship
- **⭐ Stars**：50k+

Rust 编写，**支持 zsh、bash、fish、PowerShell、Nu** 等几乎所有主流 Shell，一份配置到处用。

**核心特性：**
- 单二进制，零依赖，安装极简
- 开箱即用：自动检测当前目录的语言环境（Node.js、Python、Go、Rust、Java…）并显示版本号
- `~/.config/starship.toml` 控制每个模块的显示与样式
- 社区预设（Preset）一键切换整体风格

**安装（macOS）：**
```bash
brew install starship
```
在 `~/.zshrc` 末尾追加：
```bash
eval "$(starship init zsh)"
```

**切换预设风格：**
```bash
# 例如切换为 Tokyo Night 风格
starship preset tokyo-night -o ~/.config/starship.toml
```

---

## 3. Spaceship — 面向全栈开发者的 zsh 主题

- **GitHub**：https://github.com/spaceship-prompt/spaceship-prompt
- **⭐ Stars**：20k+

以"宇宙飞船"为意象，内置对 Node.js、Python、Ruby、Go、Rust、Docker、Kubernetes、AWS 等数十种工具的上下文感知。

**核心特性：**
- 每个展示项（Section）均可独立开关与排序
- 异步渲染，不阻塞输入
- 通过 `~/.config/spaceship/spaceship.zsh` 或 `~/.zshrc` 中的环境变量配置

**安装（Oh My Zsh）：**
```bash
git clone --depth=1 https://github.com/spaceship-prompt/spaceship-prompt.git \
  "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/spaceship-prompt"
ln -s "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/spaceship-prompt/spaceship.zsh-theme" \
  "${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/spaceship.zsh-theme"
```
在 `~/.zshrc` 中设置：
```bash
ZSH_THEME="spaceship"
```

---

## 4. Pure — 极简单行提示符

- **GitHub**：https://github.com/sindresorhus/pure
- **⭐ Stars**：13k+

由知名开源作者 sindresorhus 维护，设计原则是"只显示你真正需要的信息"。

**核心特性：**
- 异步检测 git 远程状态，输入不卡顿
- 命令执行时间超过阈值时自动显示耗时
- 上一条命令失败时提示符变色提示
- 无需 Nerd Font，任何等宽字体均可正常显示

**安装（npm）：**
```bash
npm install --global pure-prompt
```
在 `~/.zshrc` 中添加：
```bash
autoload -U promptinit; promptinit
prompt pure
```

**安装（Homebrew）：**
```bash
brew install pure
```
在 `~/.zshrc` 中添加：
```bash
fpath+=("$(brew --prefix)/share/zsh/site-functions")
autoload -U promptinit; promptinit
prompt pure
```

---

## 5. Oh My Zsh 内置主题 — 入门首选

- **GitHub**：https://github.com/ohmyzsh/ohmyzsh
- **主题列表**：https://github.com/ohmyzsh/ohmyzsh/wiki/Themes

Oh My Zsh 本身是 zsh 配置框架，附带 **150+ 内置主题**，无需额外安装，改一行配置即可切换。

**常用主题：**

| 主题名 | 风格描述 |
|--------|---------|
| `robbyrussell` | 默认，简洁，箭头 + git 分支 |
| `agnoster` | 电力线风格，信息密度高，需 Nerd Font |
| `ys` | 多行，时间戳 + 完整路径 + git 状态 |
| `af-magic` | 分隔线风格，目录与 git 信息清晰分区 |
| `avit` | 双行，彩色，适合宽屏 |

**切换主题：**
```bash
# 编辑 ~/.zshrc，修改这一行
ZSH_THEME="ys"
# 生效
source ~/.zshrc
```

想预览所有主题再决定？运行：
```bash
# 随机切换主题预览（每次新终端随机生效）
ZSH_THEME="random"
```

---

## 如何选择？

```
需要跨多种 Shell？
  └─ 是 → Starship
  └─ 否
       ├─ 追求极简、不想折腾字体？→ Pure
       ├─ 刚接触 zsh / Oh My Zsh？→ Oh My Zsh 内置主题（先用 ys 或 agnoster）
       ├─ 全栈开发，需要感知多语言环境？→ Spaceship
       └─ 追求极速渲染 + 深度定制？→ Powerlevel10k
```

---

## 字体前置条件

带图标的主题（Powerlevel10k、agnoster、Spaceship、Starship 默认预设）需要安装 **Nerd Font**，否则提示符会显示方块乱码。

- **字体仓库**：https://github.com/ryanoasis/nerd-fonts
- **推荐字体**：MesloLGS NF（Powerlevel10k 官方推荐）、JetBrainsMono Nerd Font、FiraCode Nerd Font

**macOS 安装：**
```bash
brew install --cask font-meslo-lg-nerd-font
```
安装后在终端 App（Terminal.app / iTerm2 / Warp）的字体设置中切换到对应 Nerd Font 即可。
