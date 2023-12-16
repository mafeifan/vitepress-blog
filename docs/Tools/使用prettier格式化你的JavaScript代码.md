prettier是一个专门格式化JavaScript代码的工具。
WebStorm 2018.1 及以上版本集成了prettier工具。
1. 安装
`npm install prettier --save-dev`
2. 创建配置文件 `.prettierrc` 放到项目根目录， prettier 的格式化风格
内容比如是:
 ```
 {
   "printWidth": 100,
   "singleQuote": true,
   "trailingComma": "es5"
 }
 ```
3. commit 代码
4. 按快捷键 Alt-Shift-Ctrl-P(macOS下是Alt-Shift-Cmd-P)，你会发现所有的双引号字符串都变成单引号了


