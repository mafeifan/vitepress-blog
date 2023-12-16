## 配置别名

```shell
alias tf="terraform"
alias tfa="terraform apply"
alias tfp="terraform plan"
```

## 加速 tf init

执行 `tf init` 时，让 provider 从本地目录搜索安装，解决因为联网超时，导致init失败
1. 创建TF配置文件，[参数说明](https://developer.hashicorp.com/terraform/cli/config/config-file)

Windows 系统:  C:\Users\your_user_name\AppData\Roaming\terraform.rc
MacOS: ~/.terraformrc


```
disable_checkpoint = true
disable_checkpoint_signature = true
plugin_cache_dir = "D:/terraform-providers"
provider_installation {
    filesystem_mirror {
        path = "D:/terraform-providers"
        include = ["registry.terraform.io/*/*"]
    }
}
```

2. 创建缓存目录 `mkdir -p ~/.terraform.d/plugin-cache`

```
	.terraform.d
	├── checkpoint_cache
	├── checkpoint_signature
	├── credentials.tfrc.json
	└── plugin-cache
	    └── registry.terraform.io
	        └── hashicorp
	            ├── archive
	            │   └── 2.2.0
	            │       └── darwin_amd64
	            │           └── terraform-provider-archive_v2.2.0_x5
	            ├── aws
	            │   ├── 4.35.0
	            │   │   └── darwin_amd64
	            │   │       └── terraform-provider-aws_v4.35.0_x5
	            │   ├── 4.38.0
	            │   │   └── darwin_amd64
	            │   │       └── terraform-provider-aws_v4.38.0_x5
	            │   ├── 4.40.0
	            │   │   ├── 4.40.0.json
	            │   │   └── darwin_amd64
	            │   │       └── terraform-provider-aws_v4.40.0_x5
	            │   ├── 4.44.0
	            │   │   └── darwin_amd64
	            │   │       └── terraform-provider-aws_v4.44.0_x5
            │   └── index.json
```

3. 这样 `terraform  init` 就会使用本地目录，或者 显式指定 `terraform init -plugin-dir=~/.terraform.d/plugin-cache`



## 修改 module 名字

需求： 要改代码中 module 的名字, module-demo-1 为 module-demo-2

```hcl
module "module-demo-1" {
// ....
}
```

1. 指令先执行 tf init 
2. 再执行 tf state mv module.module-demo-1 module.module-demo-2
3. 这样 plan 后不会发生变化

## 根据变量动态创建 resource

```hcl
resource "aws_route53_record" "gov-apigw-inout-dns-record" {
  count   = var.env_name == "prod" ? 1 : 0
  zone_id = data.aws_route53_zone.primary.id
  name    = var.acm_domain_name
  type    = "CNAME"
  ttl     = 300
  records = [aws_api_gateway_domain_name.gov-apigw-inout-domain.regional_domain_name]
}
```

## 关于 aws 的 tags 和 tags_all

Tag属性表示在 Terraform 状态文件中的特定 resource 的 tag，而tag_all是在 provider 上指定的 resource tag 和 default tag 的总和。

举个例子，如果我们想给asg创建出来的ec2添加默认tag，需要这么写

```hcl
provider "aws" {
  profile = "default"
  region  = "us-east-2"

  default_tags {
    tags = {
      Environment     = "Test"
      Service         = "Example"
      HashiCorp-Learn = "aws-default-tags"
    }
  }
}

data "aws_default_tags" "current" {}

resource "aws_autoscaling_group" "example" {
  availability_zones = data.aws_availability_zones.available.names
  desired_capacity   = 1
  max_size           = 1
  min_size           = 1

  launch_template {
    id      = aws_launch_template.example.id
    version = "$Latest"
  }
  # 这里使用dynamic关键字动态给resource添加tag
  dynamic "tag" {
    for_each = data.aws_default_tags.current.tags
    content {
      key                 = tag.key
      value               = tag.value
      propagate_at_launch = true
    }
  }
}
```


## 使用 terraform console 调试函数

```
$ terraform console
> concat(["a"], ["b"])
[
  "a",
  "b",
]
> max(4,12,7)
12

```


## 有用的站点

* https://developer.hashicorp.com/terraform/tutorials/aws/aws-default-tags
* [插件下载](https://releases.hashicorp.com/)
