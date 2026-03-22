https://roadmap.sh/


AWS S3 讲解
```
  ├── 1. S3 基础概念
  │   ├── 什么是 S3
  │   ├── 核心组件：Bucket + Object
  │   └── 适用场景
  │
  ├── 2. 存储类别 (Storage Classes)
  │   ├── Standard (标准)
  │   ├── Intelligent-Tiering (智能分层)
  │   ├── Glacier (归档)
  │   └── 成本优化对比
  │
  ├── 3. 核心功能
  │   ├── Versioning (版本控制)
  │   ├── Lifecycle (生命周期)
  │   ├── Encryption (加密)
  │   └── Static Website Hosting
  │
  ├── 4. 访问控制
  │   ├── Bucket Policy
  │   ├── IAM Policies
  │   ├── ACLs
  │   └── Block Public Access
  │
  ├── 5. 数据保护
  │   ├── Replication (复制)
  │   ├── Object Lock (对象锁定)
  │   └── 备份策略
  │
  └── 6. 最佳实践
      ├── 命名规范
      ├── 安全性
      └── 成本优化
```
  ---
  

### 详细大纲

  1. 什么是 Amazon S3？

  - 对象存储服务：不同于块存储/文件存储
  - 特点：无限容量、高持久性(11个9)、高可用
  - 核心概念：
    - Bucket（桶）：容器，类似文件夹顶级目录
    - Object（对象）：文件 + 元数据 + 唯一键值

  2. 存储类别对比

| 存储类型 | 访问速度 | 可用区 (AZ) | 最小存储时长 | 典型使用场景 |
|---------|---------|------------|-------------|-------------|
| S3 Standard | 毫秒级 | ≥ 3 | 无 | 热数据、网站托管、内容分发 |
| S3 Intelligent-Tiering | 毫秒级 | ≥ 3 | 无* | 访问模式未知或多变的数据 |
| S3 Express One Zone | 个位数毫秒级 | 1 | 无 | 机器学习、实时分析、高性能计算 |
| S3 Standard-IA | 毫秒级 | ≥ 3 | 30 天 | 备份、灾难恢复、不常访问但需即时获取 |
| S3 One Zone-IA | 毫秒级 | 1 | 30 天 | 可再生数据的次级备份、不常访问且非关键数据 |
| S3 Glacier Instant Retrieval | 毫秒级 | ≥ 3 | 90 天 | 季度访问一次的长期档案（如医疗影像）|
| S3 Glacier Flexible Retrieval | 分钟/小时 | ≥ 3 | 90 天 | 离线备份、数小时内可接受的归档 |
| S3 Glacier Deep Archive | 12 - 48 小时 | ≥ 3 | 180 天 | 合规性存档（存储 7-10 年，极少访问）|

  3. 关键功能

  版本控制 (Versioning)
  - 保留对象多个版本
  - 防止误删除、覆盖

  生命周期策略 (Lifecycle)
  - 自动将对象转移到低成本存储类
  - 自动删除过期对象

  静态网站托管
  - 直接托管 HTML/CSS/JS
  - 配合 CloudFront CDN

  4. 访问控制模型

  安全层级（由外到内）
  1. Block Public Access → 阻止公开访问
  2. Bucket Policy → JSON 策略控制
  3. IAM Policy → 用户/角色权限
  4. ACL → 细粒度控制（较少用）

  5. 数据保护

  - 跨区域复制 (CRR)：多区域灾备
  - 同区域复制 (SRR)：合规/低延迟
  - S3 Object Lock：WORM 保护，防删除

  6. 定价模式

  - 存储费：按 GB/月
  - 请求费：PUT/GET/DELETE
  - 数据传出：出桶才收费
  - S3 Glacier 检索费：注意隐藏成本

  ---
  讲解建议

  1. 开场：用生活类比（Bucket = 仓库，Object = 箱子）
  2. 重点：存储类别选择 + 成本优化 + 安全性
  3. 互动：展示 AWS Console 实际操作
  4. 结尾：常见坑点 + 最佳实践清单

### S3 常见命令

同步时，删除目标路径中源路径没有的文件，适合CICD流水线部署

* aws s3 sync /home/data/ s3://my-bucket/backup/ --delete

生成一个 1 小时 (3600 秒) 有效的下载链接。适合临时分享
* aws s3 presign s3://my-bucket/private-file.pdf --expires-in 3600
