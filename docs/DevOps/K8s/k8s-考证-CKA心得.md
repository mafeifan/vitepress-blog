2022年3月通过了CKA考试。

写下心得和最佳实践

## 考试前

1. 等黑五大概11月份在买，应该是最便宜的，原价2498，我买的CKA&LFS258套购1498.
2. 购买后一个月内需要激活，激活后一年内考试都有效
3. 考试有中文和英文选择，题目一样，看个人选择
4. 远程考试，提前把桌面和房间整理干净，不能有纸笔，水杯必须是透明的，考官会让开摄像头检查房间四角和整个桌面
5. 可以用笔记本外接显示器考试，但是只能运行浏览器程序
6. 不要报班，自己用虚拟机搭建集群练习就行
7. 名字要一致，可以填中文全称，考试前会检查身份证，英文的话可能要看护照，需要和报名网站一致


## 备考

1. 自己用虚拟机运行 kubeadm 或 kubekey 搭建集群
2. 看视频 https://www.bilibili.com/video/BV13Q4y1C7hS
3. 或买书，只推荐一本《Kubernetes权威指南》
4. 做模拟题,github 或闲鱼上搜 kubernetes-cka，开始感觉会比较难，直到熟练为止


## 考试中

1. 只能开两个浏览器标签，一个是答题页面，一个可以打开K8s官方文档，等于是开卷考试
2. 所以文档要勤阅
3. 把有用的文档存为书签
4. 答题页面可以打开一个笔记本，建议每个题目运行的命令都存上面，方便做完检查
5. 注意考试环境提供了3-5个集群，每个题目都要求切换到指定集群上面

## 必考的题目

1. etcd 的备份和还原
2. network policy 的创建
3. ingress 的创建
4. service 的创建
5. pod 的创建
6. role, serviceaccount, rolebinding的创建
7. deployment 的创建及 scale 伸缩
8. pv，pvc的创建
9. kubelet 和 kubectl 的升级
10. 设置某节点为不可调度并驱逐上面的pod


强烈建议把常考的题目存为书签
![](http://pek3b.qingstor.com/hexo-blog/20220308163318.png)

选择考试时间
![](http://pek3b.qingstor.com/hexo-blog/20220219205457.png)

![](http://pek3b.qingstor.com/hexo-blog/20220219205428.png)

![](http://pek3b.qingstor.com/hexo-blog/20220219205752.png)

![](http://pek3b.qingstor.com/hexo-blog/20220219210210.png)

![](http://pek3b.qingstor.com/hexo-blog/20220305204824.png)

## 有用的链接

https://www.reddit.com/r/kubernetes/comments/rzpu5i/i_just_passed_the_cka_here_are_some_tips_2022/

https://www.reddit.com/r/kubernetes/comments/s6l7xs/just_passed_the_cka_here_are_some_tips_and_tricks/

https://github.com/David-VTUK/CKA-StudyGuide

https://github.com/ahmetb/kubernetes-network-policy-recipes

https://killer.sh

https://github.com/kabary/kubernetes-cka/wiki/CKA-Killer-20-Questions
