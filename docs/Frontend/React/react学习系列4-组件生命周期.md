组件的生命周期非常重要。[官方文档](https://reactjs.org/docs/react-component.html) 已经就讲的比较清楚了
找了半天发现下面的图最清晰直观(点击放大)：
![20160815095219530.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-a9ddeb87a9ab8a5a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

需要注意几点：
1. 初始化阶段的getInitialState()方法在es6里的写法中被constructor()取代。[详见](https://reactjs.org/docs/react-without-es6.html#setting-the-initial-state)
2. 方法中带有前缀 will 的在特定环节之前被调用，而带有前缀 did 的方法则会在特定环节之后被调用。特定环节我的理解就是render方法。
未完待续


参考：
http://www.jianshu.com/p/c36a0601b00c
https://doc.react-china.org/docs/react-component.html
http://www.cnblogs.com/twobin/p/4949888.html
