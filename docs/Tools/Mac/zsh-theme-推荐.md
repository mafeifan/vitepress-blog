# zsh theme 仓库推荐

zsh 有丰富的主题生态，一个好看又实用的终端主题能显著提升开发效率和使用体验。以下整理了几个主流且值得关注的 zsh 主题仓库。

## Powerlevel10k

⭐ GitHub: https://github.com/romkatv/powerlevel10k

目前最流行的 zsh 主题，以**极致的渲染速度**著称（即使在大型 git 仓库中也几乎无延迟）。自带交互式配置向导，首次运行 `p10k configure` 即可按需定制：

- 支持多种预设风格（Lean、Classic、Rainbow、Pure）
- 展示 git 状态、当前目录、命令执行耗时、后台任务数等信息
- 兼容 Oh My Zsh、Prezto、zinit 等主流插件管理器

**安装（Oh My Zsh）：**
```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```
然后在 `~/.zshrc` 中设置 `ZSH_THEME="powerlevel10k/powerlevel10k"`。

---

## Starship

⭐ GitHub: https://github.com/starship/starship

Rust 编写的**跨 Shell 提示符**，支持 zsh、bash、fish、PowerShell 等，配置简单、速度极快。

- 零依赖，单二进制安装
- 默认展示语言版本（Node.js、Python、Go、Rust …）、git 分支与状态
- 通过 `~/.config/starship.toml` 灵活配置每个模块

**安装：**
```bash
brew install starship
# 在 ~/.zshrc 末尾添加
echo 'eval "$(starship init zsh)"' >> ~/.zshrc
```

---

## Oh My Zsh 内置主题

⭐ GitHub: https://github.com/ohmyzsh/ohmyzsh/wiki/Themes

Oh My Zsh 官方提供了 **100+ 内置主题**，开箱即用，无需额外安装。几个常用主题：

| 主题名 | 特点 |
|--------|------|
| `robbyrussell` | 默认主题，简洁轻量 |
| `agnoster` | 经典电力线风格，需要 Nerd Font |
| `af-magic` | 分隔符风格，显示当前目录与 git 信息 |
| `ys` | 多行显示，信息丰富 |

**切换主题：**
```bash
# ~/.zshrc
ZSH_THEME="agnoster"
```

---

## Spaceship

⭐ GitHub: https://github.com/spaceship-prompt/spaceship-prompt

以"宇宙飞船"为灵感的 zsh 主题，功能全面，内置对 Node.js、Python、Docker、Kubernetes 等数十种工具的支持。

- 模块化设计，可自由开关每个展示项
- 支持异步渲染，避免卡顿

**安装（Oh My Zsh）：**
```bash
git clone --depth=1 https://github.com/spaceship-prompt/spaceship-prompt.git \
  "$ZSH_CUSTOM/themes/spaceship-prompt"
ln -s "$ZSH_CUSTOM/themes/spaceship-prompt/spaceship.zsh-theme" \
  "$ZSH_CUSTOM/themes/spaceship.zsh-theme"
# ~/.zshrc 中设置
ZSH_THEME="spaceship"
```

---

## Pure

⭐ GitHub: https://github.com/sindresorhus/pure

极简风格的单行提示符，由知名开源作者 sindresorhus 维护。

- 异步检测 git 远程状态，不阻塞输入
- 提示符只保留最关键的信息：目录、git 分支、上一条命令是否失败

**安装（npm）：**
```bash
npm install --global pure-prompt
```
然后在 `~/.zshrc` 中添加：
```bash
autoload -U promptinit; promptinit
prompt pure
```

---

## 字体推荐

大多数带图标的主题（如 Powerlevel10k、agnoster）需要安装 **Nerd Font**，否则图标会显示为乱码。

推荐字体仓库：https://github.com/ryanoasis/nerd-fonts

常用字体：MesloLGS NF、Hack Nerd Font、FiraCode Nerd Font。
