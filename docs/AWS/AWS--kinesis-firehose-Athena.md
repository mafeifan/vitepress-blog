![](https://pek3b.qingstor.com/hexo-blog/20220530213702.png)

## 创建EC2
```yaml
# https://docs.aws.amazon.com/zh_cn/zh_cn/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-rules.html

# 防止用户选择错误内容参数

# 每个模板规则由两个属性组成：

# 规则条件（可选）— 确定规则的生效时间。

# 断言（必选）— 描述用户可为特定参数指定的值。

AWSTemplateFormatVersion: "2010-09-09"

Resources:
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: 't2.micro'
      AvailabilityZone: 'ap-northeast-1a'
      KeyName: 'aws-ty-2022'
      ImageId: ami-03d79d440297083e3
      UserData:
        # 内部函数 Fn::Sub 将输入字符串中的变量替换为您指定的值
        Fn::Base64: |
          #!/bin/bash
          yum update -y

          timedatectl set-timezone "Asia/Shanghai"
          
          curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip"
          unzip /tmp/awscliv2.zip -d /tmp/awslicv2
          /tmp/awslicv2/aws/install

          curl -sL https://rpm.nodesource.com/setup_14.x | bash -
          yum install -y gcc-c++ make 
          yum install -y nodejs
          
      Tags:
        - Key: Name
          # Jack---Jones
          Value: !Join ['-', ['Jack', '-', 'Jones']]

```

## 安装 kinesis agent

yum install -y aws-kinesis-agent

https://docs.aws.amazon.com/zh_cn/firehose/latest/dev/writing-with-agents.html

## 配置firehose

```bash
# 配置凭证
cat /etc/sysconfig/aws-kinesis-agent

# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_DEFAULT_REGION=

cd /etc/aws-kinesis/
cat agent.json

{
  "cloudwatch.emitMetrics": true,
  "kinesis.endpoint": "",
  "firehose.endpoint": "",

  "flows": [
    {
      "filePattern": "/tmp/app.log*",
      "kinesisStream": "yourkinesisstream",
      "partitionKeyOption": "RANDOM"
    },
    {
      "filePattern": "/var/log/kinesis-log*",
      "deliveryStream": "yourdeliverystream"
    }
  ]
}


# 修改为：

{
  "cloudwatch.emitMetrics": true,
  "kinesis.endpoint": "",
  "firehose.endpoint": "firehose.cn-north-1.amazonaws.com.cn",

  "flows": [
    {
      "filePattern": "/var/log/kinesis-log/*.log",
      # Delivery stream 的名称
      "kinesisStream": "KDS-S3-LogGenerator"
    }
  ]
}
```

重启服务并查看日志

```
service aws-kinesis-agent restart
tail -f /var/log/aws-kinesis-agent/aws-kinesis-agent.log
```

![](https://pek3b.qingstor.com/hexo-blog/20220530230216.png)


## 生成日志

`mkdir -p /var/log/kinesis-log`




## 参考
https://aws.amazon.com/cn/kinesis/data-firehose/faqs/?nc=sn&loc=5


## 生成日志程序
```js
const LOG_LINE_COUNT = 5
// 名称，分类，年龄，语言，平台，是否免费
const gameList = [
  ["马里奥","动作","全年龄","日语", "Switch", 0]
  ["GTA5","暴力","18","英语", "Steam", 0]
  ["FIFA22","体育","9","英语", "Steam", 0]
  ["FIFA22","体育","9","英语", "Steam", 0]
]

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function *myGenerator() {
  let index = 1;
  while(true) {
    yield index++;
  }
}

const logGenerator = async() => {
  
}


logGenerator()
```


```bash
2022-05-29 22:10:51.123, "马里奥","动作","全年龄","日语", "Switch", 0
2022-05-29 22:10:51.243, "GTA5","暴力","18","英语", "Steam", 0
2022-05-29 22:10:51.312, "FIFA22","体育","9","英语", "Steam", 0
2022-05-29 22:10:51.567, "FIFA22","体育","9","英语", "Steam",
2022-05-29 22:10:51.123, "马里奥","动作","全年龄","日语", "Switch", 0
2022-05-29 22:10:51.243, "GTA5","暴力","18","英语", "Steam", 0
2022-05-29 22:10:51.312, "FIFA22","体育","9","英语", "Steam", 00
```

```
logdate timestamp,
name string,
category string,
age string,
lang string,
platform string,
isfree tinyint

```

![](https://pek3b.qingstor.com/hexo-blog/20220530225738.png)

```sql
CREATE EXTERNAL TABLE IF NOT EXISTS `my_db`.`log-game` (
  `logdate` timestamp,
  `name` string,
  `category` string,
  `age` string,
  `lang` string,
  `platform` string,
  `isfree` tinyint
)
ROW FORMAT SERDE 'org.apache.hadoop.hive.serde2.lazy.LazySimpleSerDe' 
WITH SERDEPROPERTIES (
  'serialization.format' = ',',
  'field.delim' = ','
) LOCATION 's3://finley-athena-logs/'
TBLPROPERTIES ('has_encrypted_data'='false');
```

注意引号


![](https://pek3b.qingstor.com/hexo-blog/20220530230947.png)

![](https://pek3b.qingstor.com/hexo-blog/20220530231040.png)
