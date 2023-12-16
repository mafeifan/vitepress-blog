Java 网络启动协议(JNLP) 是一种允许客户端启动托管在远程Web服务器上的应用程序的协议。
通过 JNLP 协议增加 agent 比较简单，步骤如下：
1. 进入 Manage Jenkins 页面 -> Configure Global Security -> Agents
勾选固定端口，填一个端口数字

> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-176a122e659dadeb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 进入 Manage Jenkins -> Manage Nodes -> New Node
勾选 Permanent Agent ，即设置为固定节点

3. 配置页面
Remote root directory 远程根目录，指连接 slave节点后使用的目录，相关文件会存放于此
Launch method  选择 "Launch agent by connecting it to the master"
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-8ed41628330c6c5b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. 添加节点后，点击名称进入连接页面

提示连接agent有两种方式：
* 直接在 agent 的浏览器上打开此页面，单击 Launch 按钮
* slave 需要安装java，复制页面上的地址 `sudo nohup java -jar agent.jar -jnlpUrl http://xx.xx.xx.xx:xx/computer/new/slave-agent.jnlp -secret ef6bedd1dfc7001077179aa6888e02078d4187aa28f4edfe8be23a7f796528a5 -workDir "/home" &`
然后运行
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-9dc99004e9808a4d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

SSH 登录 slave 机器上，然后运行master上提供的连接命令
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-d55dcd8237689fd0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

连接成功
> ![image.png](https://hexo-blog.pek3b.qingstor.com/upload_images/71414-b0c565d5981ad4f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


