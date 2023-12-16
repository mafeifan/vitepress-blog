## 镜像制作最佳实践

1. 使用官方的镜像作为基础镜像

![](http://pek3b.qingstor.com/hexo-blog/20211122211224.png)

2. 基础镜像的标签不要使用latest
3. 使用.dockerignore 文件
4. 最经常变化的命令越往后执行 充分利用缓存机制

把 `copy myapp /app` 放到后面，因为myapp是源码目录，是会经常发生变动的，一旦该层内容发生变动，那么后续的层都会重新执行  
![](http://pek3b.qingstor.com/hexo-blog/20211122210707.png)

这是优化后的执行顺序

![](http://pek3b.qingstor.com/hexo-blog/20211122210758.png)

5. dockerfile中每行命令产生一层，请最大限度减少层数
6. 当Dockerfile的指令修改了，复制的文件变化了，或者构建镜像时指定的变量不同了，对应的镜像层缓存就会失效。某一层的镜像缓存失效之后，它之后的镜像层缓存都会失效
7. 使用CMD和ENTRYPOINT时，请务必使用数组语法。CMD /bin/echo 会在你的命令前面加上/bin/sh -c 可能导致意想不到的问题
8. 使用多步构建 multi staging
9. 不要使用root用户 避免潜在的风险
10. 使用 docker scan 命令扫描风险

## 参考

https://www.qikqiak.com/post/dockerfile-best-practice/
