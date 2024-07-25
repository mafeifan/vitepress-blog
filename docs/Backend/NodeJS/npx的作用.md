1. 避免写 `node-modules/.bin/mocha --version`, npx 的原理很简单，就是运行的时候，会到node_modules/.bin路径和环境变量$PATH里面，检查命令是否存在。
2. 避免全局安装模块，如`npx create-react-app my-react-app`

参考：
https://www.npmjs.com/package/npx

http://www.ruanyifeng.com/blog/2019/02/npx.html
