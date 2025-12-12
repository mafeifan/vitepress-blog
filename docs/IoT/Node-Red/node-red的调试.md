介绍几种node-red的调试方法

1. 最常见的就是使用debug节点，可以勾选讲消息输出到调试窗口还是控制台

控制台查看和node-red安装有关，我的node-red是用pm2运行的，所以直接`pm2 logs`就可以查看node-red的日志

![](https://pek3b.qingstor.com/hexo-blog/20220521090302.png)

2. 使用 node.warn() 和 node.error() 方法

好处是会看到黄色和红色标记，以及node的名称和时间戳

![](https://pek3b.qingstor.com/hexo-blog/20220521090505.png)
