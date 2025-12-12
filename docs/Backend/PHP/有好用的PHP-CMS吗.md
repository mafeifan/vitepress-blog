最新帮朋友做个企业站，说白了就是个简单的CMS。
纯展示类的。这种东西技术含量低，千万不要自己从头开发，只要找个现成的cms，改改模板就可以了。时间就是金钱，会改就可以。
我知道有dede，帝国的存在，不过没用过，感觉也挺麻烦了。如果有简单的就更好了。
之前我也做过一个纯展示类的，是基于 [DouPHP](http://www.douco.com/)，不过最高只支持PHP5.2。我的服务器装的PHP7.1和 PHP7.2。我选择不妥协。
于是乎，又去找了其他的cms，经过对比，最终选择了蝉知，说实话这个名字起的一般，很容易打出产值。
用了一阵发现有几个好处：
1. 开源，[github上](https://github.com/easysoft/zsite)有源码
2. 定制化比较高，特别是后台有个可视化功能很好用
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-7b71d56062f8cb30.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
而且还可以为页面添加自定义css和js。
直接线上编辑文件，添加 JS 或 CSS。

总结出的问题，针对7.1版本
1. 编辑模板注意区分，桌面版和移动版
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-6c72fd2d39a4097e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
2. 编辑移动版header的地址是 /system/tmp/template/mobile/block/header.html.php
比如想改logo，这里有个小bug
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-fe4331ac694168d9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

不过客户给我发了个 http://2070.wangzhan31.com/ 。。
一看就是流水线出来的，还有这个 http://m.hnjjjs.com/ 等于一个模子刻出来的。


