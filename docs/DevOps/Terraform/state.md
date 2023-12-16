## 命令

* `terraform plan` 和 `terraform apply` 是希望terraform配置文件和实际资源保持一致
* `terraform refresh` 是希望state文件和实际资源保持一致
*  当执行`terraform plan`， `terraform apply` 和 `terraform destroy` 会自动先执行`terraform refresh`


## state管理

简单来说，Terraform 将每次执行基础设施变更操作时的状态信息保存在当前目录的叫做`terraform.tfstate`的状态文件中。

当我们创建，销毁，更新resource基础设施资源，该文件会被同步更新。

为了解决多人状态文件的存储和共享问题，Terraform引入了远程状态存储机制, 将这个文件存储到远程数据库或对象存储。

以AWS为例
### state从local改为AWS S3后端

当前目录新建 module-tf-state-backend-s3 目录, 里面的 main.tf 内容是

module-tf-state-backend-s3
```
--- main.tf
--- variables.tf

```

```hcl
resource "aws_s3_bucket" "terraform_state" {
  bucket = var.bucket_name
  lifecycle {
    prevent_destroy = true
    ignore_changes  = [tags]
  }
}

resource "aws_s3_bucket_versioning" "terraform_s3_bucket_versioning" {
  bucket = aws_s3_bucket.terraform_state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state_encryption" {
  bucket = aws_s3_bucket.terraform_state.bucket

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = var.aws_dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  attribute {
    name = "LockID"
    type = "S"
  }
  lifecycle {
    ignore_changes = [tags]
  }
}
```

variables.tf

```hcl
variable "bucket_name" {
  type        = string
  default     = "terraform-state"
  description = "the unique bucket name"
}


variable "aws_dynamodb_table_name" {
  type        = string
  default     = "terraform-locks"
  description = "the unique bucket name"
}
``` 

```hcl
## 引入module-tf-state-backend-s3, 执行 tf apply, 创建好S3和dynamodb
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }
  required_version = ">= 1.2.0"

#  backend "s3" {
#    bucket = "terraform-state-655418457877"
#    // S3 bucket 中 Terraform 状态文件写入的文件路径
#    key    = "global/terraform.tfstate"
#    region = "cn-north-1"
#    // 用于锁定的 DynamoDB 表
#    dynamodb_table = "terraform-locks"
#    // Terraform 状态文件将以加密格式存储在S3的磁盘上
#    encrypt = true
#  }
}
module "backend_s3" {
  source      = "../modules/module-tf-state-backend-s3"
  bucket_name = "terraform-state-${local.account_id}"
}

## 2. 更新TF后端,去掉backend "s3" 的整块注释,注意S3的bucket名称,由于在region是唯一的,不能重名,故修改后缀数字改为account_id

## 3. 执行 terraform init -migrate-state
```

### 查看受到 terraform state 管理的资源列表

`terraform state list`

### 从 state 管理中排除资源,使其不受 terraform 维护,但是不会删除该资源，只是改为手动维护

```
terraform state rm module.eks-aws-lb-controller
terraform state rm module.module-eks-aws-load-balancer-controller
```

### 导入已存在的基础设施资源到 state

```
terraform import module.eks.aws_iam_role.gitlab-deploy-role gitlab-deployment-eks-role
```

### 指定具体模块 apply 或 plan

```
terraform plan -target=module.mymodule.aws_instance.myinstance
terraform apply -target=module.mymodule.aws_instance.myinstance

terraform plan -target=aws_instance.myinstance
terraform apply -target=aws_instance.myinstance
```

