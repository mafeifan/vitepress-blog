## Serverless 的重点

* 不需要部署 or 管理 server

* 会根据需求自动的 scale out/in

* 不需要为 idle 资源支付费用

* 天生就具备的 HA & fault tolerance 等特性


目前 AWS 提供的 serverless service 其实很多，下图是目前比较常见的几个：

![](https://pek3b.qingstor.com/hexo-blog/20220712222012.png)

但要如何判断 AWS service 是否为 serverless? 只要评估一下上一个 section 提到的四个原则，如果都满足，表示这个服务属于 serverless(例如：Lambda、SNS、SQS)，只要有一项不满足，则该服务不属于 serverless(例如：EC2、Kinesis)

## Lambda

文件中提到可设定 Lambda Function 执行时使用的 memory 范围在 128MB ~ 10,240MB(10GB) 之间

比较需要注意的是，Lambda function 执行时 的vCPU core 的数量是根据 memory 的设定大小来决定，如果在设定最大 10GB memory 的情况下，可以取得最大 6 vCPU core；简单来说，就是 memory 设定越大，执行速度会越快，当然费用也会越高

> 实际上就是只有 memory & timeout 设定可以调整而已

