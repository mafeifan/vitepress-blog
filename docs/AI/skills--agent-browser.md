---
date: 2026-04-09
---

## 前提

阅读 https://github.com/vercel-labs/agent-browser

## 安装
```bash
npm install -g agent-browser
agent-browser install


Installing Chrome...
  Downloading Chrome 147.0.7727.56 for mac-arm64
  https://storage.googleapis.com/chrome-for-testing-public/147.0.7727.56/mac-arm64/chrome-mac-arm64.zip
  99/165 MB (60%)
  Retrying download (attempt 2/3)
  165/165 MB (100%)
✓ Chrome 147.0.7727.56 installed successfully
  Location: /Users/maf/.agent-browser/browsers/chrome-147.0.7727.56
```

## 测试
```bash
agent-browser batch "open https://baidu.com" "snapshot -i" "screenshot"
✓ 百度一下，你就知道
  https://www.baidu.com/

- link "新闻" [ref=e1]
- link "hao123" [ref=e2]
- link "地图" [ref=e3]
- link "贴吧" [ref=e4]
- link "视频" [ref=e5]
- link "图片" [ref=e6]
- link "网盘" [ref=e7]
- link "文库" [ref=e8]
- link [ref=e9]
- link "更多" [ref=e12]
- generic "设置" [ref=e10] clickable [cursor:pointer]
- link "登录" [ref=e11]
- link "点击一下，了解更多" [ref=e13]
- textbox "伊朗宣布胜利" [ref=e27]
- generic [ref=e32] clickable [cursor:pointer]
- generic [ref=e30] clickable [cursor:pointer]
- generic [ref=e31] clickable [cursor:pointer]
- button "百度一下" [ref=e28]
- generic "复杂问题就找文心助手，深入思考回答更优" [ref=e26] clickable [cursor:pointer]
  - link "复杂问题就找文心助手，深入思考回答更优 " [ref=e29]
- link "百度热搜" [ref=e14]
- link " 换一换" [ref=e15]
- link " 根脉相连 薪火相传" [ref=e16]
- link "5 哪件兵器最厉害？小孩哥：东风5C" [ref=e17]
- link "1 央视曝光黑中医馆骗局" [ref=e18]
- link "6 虚假摆拍深山救助流浪女 3人被查" [ref=e19]
- link "2 西北大学调查贾某某涉论文抄袭问题" [ref=e20]
- link "7 霍尔木兹海峡已再次关闭" [ref=e21]
- link "3 这个百万亿级的大产业 和你息息相关" [ref=e22]
- link "8 杭州西湖将连续一周撒7吨漂白粉" [ref=e23]
- link "4 苏林将访华" [ref=e24]
- link "9 吴克群人民日报撰文" [ref=e25]

✓ Screenshot saved to /Users/maf/.agent-browser/tmp/screenshots/screenshot-1775706287182.png
```

## 关于 ref

ref 是 “Reference”（引用/索引）的缩写。

它是一个由 agent-browser 生成的临时唯一标识符，主要用于让 AI 模型能精准地操控页面元素。

1. ref 的核心作用

当你让 AI 执行操作（比如“点击登录按钮”）时，AI 并不直接通过坐标或复杂的 HTML 选择器（XPath/CSS Selector）来识别元素。

* 简化上下文： HTML 源码非常庞大且混乱。agent-browser 会将复杂的 DOM 树简化为你在终端看到的这种易读列表，并给每个重要元素打上 [ref=eX] 的标签。

* 指令对齐： AI 在做决策时会引用这个 ID。例如，AI 内部的逻辑是：“我看到了 link "登录" [ref=e11]，我要点击它，所以我发送指令 click e11”。

* 消除歧义： 如果页面上有两个“搜索”按钮，通过 ref=e10 和 ref=e20 就能让程序明确知道你要动哪一个。

2. 它在工作流程中的位置

当你运行 batch 命令时，幕后发生了以下过程：

* 解析 (Snapshot)： 浏览器提取当前的辅助功能树（Accessibility Tree）。

* 标记 (Labeling)： agent-browser 给每个可交互元素分配一个简单的 ID（如 e1, e2）。

* 反馈： 将带 ref 的文本列表传给 AI（或展示给你看）。

* 执行： 你（或 AI）接下来的指令会直接引用这些 ref。

3. 实际例子

看上面的返回结果：

* button "百度一下" [ref=e28]

* textbox "伊朗宣布胜利" [ref=e27]

如果你想让浏览器点击搜索按钮，你在后续的交互指令中只需要指明 `e28`，而不需要写 `document.querySelector('.s_btn')` 这种复杂的代码。

> ref 就是该元素在该次页面快照中的“身份证号”。
> 
> 注意： 这些 ID 通常是临时的。如果你刷新了页面或者页面发生了动态跳转，旧的 ref 就会失效，系统会生成一套全新的 ref 标识。

### Chrome Profile 注意
> Chrome 安全限制，使用 --remote-debugging-port 时，不能使用默认的 --user-data-dir

## 实战

1. 查看所有 Chrome Profiles
```bash
python3 -c "
import json,os
chrome_path = os.path.expanduser('~/Library/Application Support/Google/Chrome')
with open(os.path.join(chrome_path, 'Local State'), 'r') as f:
  data = json.load(f)
profiles = data.get('profile',{}).get('info_cache',{})
for pid, info in profiles.items():
  print(f\"{pid}:{info.get('name')} ({info.get('user name','No email')})\")
" 
```

输出：

Default: Your Chrome (No email)


2. 复制 profile 到新目录

```bash
mkdir -p ~/chrome-debug-default

# 复制 default profile (保留登录状态)
cp -R "$HOME/Library/Application Support/Google/Chrome/Default" ~/chrome-debug-default
cp "$HOME/Library/Application Support/Google/Chrome/Local State" ~/chrome-debug-default

# 如果要复制  profile2
cp -R "$HOME/Library/Application Support/Google/Chrome/Profile 2" ~/chrome-debug-profile2
cp "$HOME/Library/Application Support/Google/Chrome/Local State" ~/chrome-debug-profile2
```

3. 启动带远程调试的 Chrome

终端 1
```bash
# 关闭已运行的 chrome
pkill -9 -f "Google Chrome"

"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --remote-debugging-port=9222 \
  --user-data-dir="$HOME/chrome-debug-default" \
  --profile-directory="Default"

# 验证
curl -s http://127.0.0.1:9222/json/version

# 成功输出
{
   "Browser": "Chrome/147.0.7727.55",
   "Protocol-Version": "1.3",
   "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36",
   "V8-Version": "14.7.173.16",
   "WebKit-Version": "537.36 (@7dc2b8f6f651b42c0a8f3634c9feb5e0b6b25c91)",
   "webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/browser/380bf6dd-7545-4574-b636-7cda497e53e5"
}
```

终端 2
```bash
# 打开 x 发帖页面
agent-browser --cdp 9222 open https://x.com/compose/post
```

## 其他

### 安装 skill
`npx skills add vercel-labs/agent-browser`


