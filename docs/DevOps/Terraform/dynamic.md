dynamic 可以在 resource 内创建重复的block

dynamic 支持在 resource, data, provider 和 provisioner blocks 内使用

## 举例

下列的 subnet 定义是重复的

```
resource "azurerm_virtual_network" "dynamic_block" {
    name                = "vnet-dynamicblock-example-centralus"
    resource_group_name = azurerm_resource_group.dynamic_block.name
    location            = azurerm_resource_group.dynamic_block.location
    address_space       = ["10.10.0.0/16"]

    subnet {
        name           = "snet1"
        address_prefix = "10.10.1.0/24"
    }

    subnet {
        name           = "snet2"
        address_prefix = "10.10.2.0/24"
    }

    subnet {
        name           = "snet3"
        address_prefix = "10.10.3.0/24"
    }

    subnet {
        name           = "snet4"
        address_prefix = "10.10.4.0/24"
    }
}
```

## 使用 dynamic 进行封装

```hcl
resource "azurerm_virtual_network" "dynamic_block" {
    name                = "vnet-dynamicblock-example-centralus"
    resource_group_name = azurerm_resource_group.dynamic_block.name
    location            = azurerm_resource_group.dynamic_block.location
    address_space       = ["10.10.0.0/16"]

    dynamic "subnet" {
        for_each = var.subnets
            iterator = item   #optional
            content {
                name           = item.value.name
                address_prefix = item.value.address_prefix
            }
    }
}
```

subnets 改为通过变量传入
```hcl
variable "subnets" {
    description = "list of values to assign to subnets"
    type = list(object({
        name           = string
        address_prefix = string
    }))
}
```

实际的值类似

```
subnets = [
    { name = "snet1", address_prefix = "10.10.1.0/24" },
    { name = "snet2", address_prefix = "10.10.2.0/24" },
    { name = "snet3", address_prefix = "10.10.3.0/24" },
    { name = "snet4", address_prefix = "10.10.4.0/24" }
]
```

## Dynamic 支持多级嵌套

```hcl
dynamic "origin_group" {
    for_each = var.load_balancer_origin_groups
    iterator = outer_block
    content {
        name = outer_block.key
        dynamic "origin" {
            for_each = outer_block.value.origins
            iterator = inner_block
            content {
                hostname = inner_block.value.hostname
            }
        }
    }
}
```

再举例

Cloudfront 在prod下绑定的域名是https，有个cloudfront_default_certificate属性需要是false，其他环境需要是true，所以我们可以这么写

```hcl
resource "aws_cloudfront_distribution" "govplt-s3-website-distribution" {
    // .....
    dynamic "viewer_certificate" {
        for_each = var.env_name == "prod" ? [1] : []
        content {
            cloudfront_default_certificate = false
            iam_certificate_id             = data.aws_iam_server_certificate.govplt-management-domain.id
            minimum_protocol_version       = "TLSv1.2_2021"
            ssl_support_method             = "sni-only"
        }
    }

    dynamic "viewer_certificate" {
        for_each = var.env_name != "prod" ? [1] : []
        content {
            cloudfront_default_certificate = true
        }
    }
}
```
