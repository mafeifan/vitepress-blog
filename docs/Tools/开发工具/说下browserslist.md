[browserslist ](https://github.com/ai/browserslist) 是一个开源项目
见到有些package.json里会有如下的配置参数
```
 "browserslist": [
    "> 1%",
    "last 2 versions",
    "Android >= 3.2", 
    "Firefox >= 20", 
    "iOS 7"
  ]
```
应该不难猜出来，这代表这个项目的浏览器兼容情况。
白话就是我这个项目兼容绝大多数的，最新的和iOS7系统下的浏览器。不兼容Android 3.2系统以下和Firefox20以下的浏览器
像这些" [> 1%](http://browserl.ist/?q=%3E+1%25)", "[last 2 versions](http://browserl.ist/?q=last+2+versions)" 都是查询参数。
查询参数很强大，比如我想查看中国人使用浏览器的情况请输入 `> 1% in CN`。竟然还有IE8 ~>_<~。对比美国`> 1% in US`的。
具体参数列表见[官方文档](https://github.com/ai/browserslist#queries)

那配这个除了说明我的项目支持情况，对开发有啥作用呢?

具体的影响到前端工具的编译情况，比如 Autoprefixer 可以给css加兼容性前缀
babel-preset-env ， eslint-plugin-compat， stylelint-no-unsupported-browser-features 和 postcss-normalize
比如.babelrc文件你可以针对配置
```
{
  "presets": [
    ["env", {
      "targets": {
        "browsers": ["last 2 versions"],
        "node": "current"
      },
    }]
  ]
}
```
![20170928175559.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-b9a44eafc7ed0e5a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

更进一步根据浏览器可以获得[特性](http://caniuse.com/)，比如最新的chrome浏览器支持原生的promise，而IE不支持，babel根据browserslist配置项就会动态的转义。不用在一个个进行配置了。
