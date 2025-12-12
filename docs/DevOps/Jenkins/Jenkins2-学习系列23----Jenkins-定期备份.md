Jenkins的所有数据文件都存在文件中，Jenkins备份就是备份JENKINS_HOME目录。默认路径是`/var/lib/jenkins`，或者到Jenkins的配置文件中查看`cat /etc/default/jenkins | grep "home"`。

JENKINS_HOME目录 结构如下：
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-445eaff1e931e26a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> 其中 workspace, builds 和 fingerprints目录是不需要备份的

定期备份是个好习惯，备份功能通过安装插件实现。

##### thin-backup 备份插件
比较流行的插件有 [periodicbacku](https://github.com/jenkinsci/periodicbackup-plugin) 和 [thin-backup](https://github.com/jenkinsci/thin-backup-plugin) ，发现无论是Github中更新时间还是star数量 thin-backup都更好些，所以选择了 thin-backup

thin-backup 安装好后，管理页面会多出一个菜单项，进入后是 thin-backup 设置页面，
非常简答，立即备份，恢复和配置

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-b704a1e3ac8f043b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

配置页面中可以设置备份路径，备份周期，最大备份数量等等

> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-49ac95452fb906ff.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

备份周期的填写要符合Jenkins trigger cron语法，我填写的是 `H 23 * * 6` 即每周6的23点任意分钟执行

#### 关于 Jenkins trigger cron
类似[UNIX cron]([https://en.wikipedia.org/wiki/Cron](https://en.wikipedia.org/wiki/Cron)
)语法，一段 cron 包含5个字段。使用空格或tab分隔

格式为：
分钟：0~59
小时：0~23
一月某一天：1~31
月份：1~12
星期几：0~7
还可以使用以下字符，一次性指定多个值
*：匹配所有值
M-N：匹配M到N之间的值
M-N/X：指定M到N范围内，以X值为步长
A,B,C：逗号分隔枚举多个值

有时候存在大量同一时刻执行的定时任务，比如N个半夜零点(0 0 * * *)执行的任务，这样会产生负载不均衡，Jenkins提供了H字符来解决这一问题，H表示hash，(0 0 * * *)表示零点0分至0点59分之间任何一个时间点

Jenkins trigger cron 提供了更便捷的写法 @yearly， @monthly，@weekly， @daily，@hourly

| 缩写|等价写法|描述|
|----| ----|---- |
| @daily 或 @midnight | 0 0 * * * |每天午夜0点执行 |
| @hourly  | 0 * * * * |每个整点0分执行 |
| @monthly | 0 0 1 * * |每月1号的午夜执行 |
| @weekly | 0 0 * * 0 |每周日午夜执行 |
| @yearly 或 @annually | 0 0 1 1 * |每年1月1日的午夜执行|

#### 进阶
无意看到一篇[文章]([https://www.coveros.com/auto-commit-jenkins-configuration-changes-with-git/](https://www.coveros.com/auto-commit-jenkins-configuration-changes-with-git/)
)，把 JENKINS_HOME 放到Git版本控制中管理，这样省去了频繁备份的烦恼。


#### 参考
[https://en.wikipedia.org/wiki/Cron](https://en.wikipedia.org/wiki/Cron)
