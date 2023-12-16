## 痛点

有时候我们在云上部署一套高可用的系统往往需要创建很多资源，以在AWS部署一个Web服务为例：

* 2台EC2
* ALB(负载均衡)
* RDS(弹性数据库)
* Route53(域名解析)
* CloudFront(CDN)
* S3(管理静态资源)
* IAM(用户管理)
* SES(电子邮件服务)
* CloudWatch(监控)

光这么多资源，如果在页面上手动创建配置即便是再熟练，也会很累。 还有其他缺点： 手动部署，容易出错 无法进行版本化控制 需要专人部署，人员无法复用

如果使用CloudFormation，我们可以把这些资源都放在一个模板里，然后通过CloudFormation控制台来创建或者更新这些资源。

## 什么是CloudFormation

![](http://pek3b.qingstor.com/hexo-blog/20220128220418.png)

所谓堆栈资源，表示一种依赖关系，比如要使用ALB资源，那么就需要实例资源。使用实例要先创建安全组。 堆栈资源最终是一个资源集合。

![](http://pek3b.qingstor.com/hexo-blog/20220128221644.png)

## CloudFormation模板

CloudFormation 模板是 JSON 或 YAML 格式的文本文件。 以下面为例。 表示创建一个EC2实例，指定了实例的AMI，类型，密钥对名称和数据卷。然后需要一个EIP来关联它。

```yaml
AWSTemplateFormatVersion: "2010-09-09"
Description: A sample template
Resources:
  MyEC2Instance:
    Type: "AWS::EC2::Instance"
    Properties:
      ImageId: "ami-0ff8a91507f77f867"
      AvailabilityZone: "ap-northeast-1a"
      InstanceType: t2.micro
      KeyName: testkey
      BlockDeviceMappings:
        - DeviceName: /dev/sdm
          Ebs:
            VolumeType: io1
            Iops: 200
            DeleteOnTermination: false
            VolumeSize: 20
  MyEIP:
    Type: AWS::EC2::EIP
    Properties:
      # !Ref 等价 Fn::Ref
      InstanceId: !Ref MyEC2Instance
```

一个标准的模板由下面的部分组成，只有Resources是必需的

```yaml
---
# 可选
AWSTemplateFormatVersion: "version date"

# 可选
Description:
  String

# 可选
# Designer 添加的信息，或者注释
# CloudFormation 不会转换、修改或编辑在 Metadata 区段中包含的任何信息
Metadata:
  template metadata

# 可选
Parameters:
  # set of parameters
  KeyName:
    Type: "AWS::EC2::KeyPair::KeyName"
    Description:
      "Name of an existing EC2 KeyPair to enable SSH access to the instances"
    Default:
      "my-awesome-key-name"
  SecurityGroupIDs:
    Type: "List<AWS::EC2::SecurityGroup::Id>"
    Description:
      "Name of an existing security group"
    Default:
      "sg-1a2b3cd4"
  EnvType:
    Type: "String"
    Description:
      "The type of environment"
    AllowableValues:
      - "test"
      - "prod"
      - "staging"
    Default:
      "test"  
# 可选
Rules:
  set of rules

# 可选
# 创建一个名为InstanceType的映射，在美东区我们使用m1.small，美西区使用m1.nano
Mappings:
  InstanceType:
    us-east-1:
      Type: "m1.small"
    us-west-1:
      Type: "m1.nano"
  SubnetMap:
    us-east-1:
      SubnetID: "subnet-12345678"
    us-west-1:
      SubnetID: "subnet-7654321"

# 可选
# 比如测试环境用安全组A，正式环境用B
Conditions:
  set of conditions

# 可选
Transform:
  set of transforms

# 必需
Resources:
  set of resources

# 可选
# 比如输出新创建的IP是什么
Outputs:
  # set of outputs
  KeyName
    Description: "This is the EIP for EC2"
    Value:
      Ref: MyEIP
```

AWS比较牛逼的是提供了`AWS CloudFormation Designer`可视化工具来拖拖拽拽资源生成模板。

并且官方提供了很多[示例模板](https://docs.aws.amazon.com/zh_cn/AWSCloudFormation/latest/UserGuide/cfn-sample-templates.html)，你可以直接拿来改改就能用。

![](http://pek3b.qingstor.com/hexo-blog/20220128224812.png)

## 实战

如果已经有模板，可以直接上传到S3，然后填S3地址读取

![](http://pek3b.qingstor.com/hexo-blog/20220128225917.png)

## 参考

https://github.com/awslabs/aws-cloudformation-templates

https://docs.aws.amazon.com/zh_cn/AWSCloudFormation/latest/UserGuide/cfn-whatis-concepts.html

https://github.com/cloudtools/troposphere
