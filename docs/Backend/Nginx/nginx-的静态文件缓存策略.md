nginx-的静态文件缓存策略.md

### 覆盖发布和非覆盖发布的区别

* 覆盖发布： 前端项目打包后每次产生相同的文件名，发布至服务器时，同名文件直接替换，新文件添加。
* 非覆盖式发布： 采用更新文件名的形式，比如采用webpack的[id].[chunkhash].js的形式，这样更新文件后，新文件不会影响旧文件的存在。

### 覆盖式发布的缺点：

先更新页面再更新静态资源
新页面里加载旧的资源，页面和资源对应不上，会有页面混乱，还有执行会报错。
先更新静态资源再更新页面
在静态资源更新完成，页面没有被更新过程中，有缓存的用户是正常的。这个时候读本地的缓存，但是如果没有缓存的用户会怎样？依然是会页面混乱和执行错误，因为在旧的页面加载新资源。

无论如何，覆盖式发布都是能被用户感知到的，所以部分公司的发布是晚上上线。其中如果使用vue-cli直接生成webpack配置打包的话，直接发布dist文件夹下资源就会产生这种特殊的替换问题，因为在build.js文件中存在这么一行代码，初衷应该是防止dist文件夹越来越大，但是rimraf模块会递归删除目录所有文件，没有详细了解过vue-cli生成编译环境的人，就默认的采用了这种旧资源删除新资源生成。
```
// build.js
rm(path.join(config.build.assetsRoot, config.build.assetsSubDirectory), err => {
    ...
})
```

接下来讲了下，我更新的发布模式。
#### nginx的静态文件缓存策略

静态资源html不使用缓存，每次加载均从服务器中拉取最新的html文件
静态资源js/css/图片资源，采取强缓存策略，这个时间可以尽可能的长一些，因为是非覆盖式发布，所以如果html中加载资源URI更新，那么资源也会统一的更新

nginx可以对不同文件进行不同的缓存策略，大致配置如下（需要注意location匹配的优先级）：

```
location ~ .*\.(?:jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|mp4|ogg|ogv|webm)$
{
    expires      7d;
}

location ~ .*\.(?:js|css)$
{
    expires      7d;
}

location ~ .*\.(?:htm|html)$
{
    add_header Cache-Control "private, no-store, no-cache, must-revalidate, proxy-revalidate";
}
```

然后发布的时候先将除html文件移动至发布路径，同名文件默认跳过，新生成的文件会产生新的hash，新旧文件不会冲突，共存在发布路径。
html文件的更新当时做了两种方案

1. html完全由前端管理，前端发布的时候会有html文件，webpack打包时自动在html里写文件名；
2. html由后端管理（服务器渲染），前端只负责发布js、css等资源文件。在前端发布之后，后端修改版本号再发布；
