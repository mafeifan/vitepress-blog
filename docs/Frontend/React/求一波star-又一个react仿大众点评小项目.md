跟着这个视频做的 [React高级实战 打造大众点评 WebApp](http://coding.imooc.com/class/99.html)
这个视频的源代码大家在github上搜 “react 大众” 就能找到。

我加上了自己的理解并进行了结构代码调整和优化，而且用的版本都升级到最新。
目前是 react16, redux3.7.2, react-router v4, webpack 3.5, koa 2.3
比如有个列表加载更多的功能，好多页面需要代码严重重复，我给封装成了通用组件，放到了`src\components\base\ListLoadingMoreComponent`
并加入了支持stylus等功能，并写了一系列文章。见 [react学习系列1 修改create-react-app配置支持stylus](http://www.jianshu.com/p/9cd7a0dff11f)

这是我第一个用react做的小项目，有空就会优化，有不足之处还请见谅。
项目地址： https://github.com/mafeifan/react-dianping 欢迎star
