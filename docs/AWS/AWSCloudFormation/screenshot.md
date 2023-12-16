## rule

![](http://pek3b.qingstor.com/hexo-blog/20220206141656.png)


## detect drift 偏差检测

CF生成的资源然后又手动做了修改，这时候就会出现偏差，就需要做偏差检测。

这里手动修改了tag name

![](http://pek3b.qingstor.com/hexo-blog/20220206145225.png)

![](http://pek3b.qingstor.com/hexo-blog/20220206145409.png)

![](http://pek3b.qingstor.com/hexo-blog/20220206145445.png)


## Stack
![](http://pek3b.qingstor.com/hexo-blog/20220206174020.png)

![](http://pek3b.qingstor.com/hexo-blog/20220206175813.png)


### 修改 15_stack_root.yaml

更新根堆栈

![](http://pek3b.qingstor.com/hexo-blog/20220206180104.png)

![](http://pek3b.qingstor.com/hexo-blog/20220206180153.png)

更新成功

![](http://pek3b.qingstor.com/hexo-blog/20220206180327.png)

删除根堆栈，其使用的嵌套模板都被删除了

![](http://pek3b.qingstor.com/hexo-blog/20220206180820.png)

生产环境中开启终止保护

