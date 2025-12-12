这篇文章和 Docker 无关，只是稍微感慨下

近几天打算用Docker跑一个需要PHP5.6的项目，然后发现Docker官方提供的PHP镜像中，只有PHP7.0以上的介绍。没有PHP5.5及PHP5.6的(tag还有，只不过主页中没有)
感到比较纳闷，[官方github](https://github.com/docker-library/php/)也移除了相关的代码。
[搜索](https://github.com/docker-library/php/pull/768)发现原来是PHP官方团队已经不再维护5.6。
也就是说，既然官方都不管了，Docker更不没有必要继续维护相关分支。
然后去[PHP官方公告](http://php.net/supported-versions.php)查看从2019年1月1日起PHP5.6已经不再维护支持，就连PHP7.1都只进行安全支持。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-bb6d6c3b458fefe7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样可以倒逼企业进行系统版本更新换代。对开发人员绝对是好事，虽然企业主出于成本考虑不愿意进行升级。
最后如果想查看之前5.6及5.5的Dockerfile细节，可以查看这个[PR](https://github.com/docker-library/php/pull/768/files)。
