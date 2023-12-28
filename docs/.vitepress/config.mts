import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "mafeifan 的编程技术分享",
  lastUpdated: true,
  description: "DevOps,K8s,Prometheus,Terraform,Laravel,Laravel教程,Jenkins系列教程,Docker系列教程",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {text: 'Home', link: '/'},
      {
        text: 'DevOps',
        items: [
          {text: 'Jenkins2系列',   link: '/DevOps/Jenkins/Jenkins2-学习系列1----使用Docker方式安装最新版Jenkins'},
          {text: 'Docker系列',     link: '/DevOps/Docker/Docker-学习系列1--使用-Docker-快速实现多版本PHP切换'},
          {text: 'Prometheus系列', link: '/DevOps//Prometheus/1.产品介绍'},
          {text: 'Ansible2系列',   link: '/DevOps/Ansible/Ansible-2----1-介绍与使用场景'},
          {text: 'Terraform',     link: '/DevOps/Terraform/tip'},
          {text: 'Gitlab系列',     link: '/Gitlab/tips'},
        ]
      },
      {
        text: 'Tools',
        items: [
          {text: 'Git学习系列',   link: '/Tools/Git/Git-和-GitHub：从入门到实践1-Git-和-GitHub-基础简介'},
        ]
      },
      {text: 'Markdown Page', link: '/markdown-examples'},
      // {text: 'Frontend', link: '/markdown-examples'},
      // {text: 'Backend', link: '/markdown-examples'},
      // {text: 'Other', link: '/markdown-examples'},
    ],
    sidebar: {
      '/Tools/Git/': [
        {
          text: 'Git学习系列',
          collapsed: false,
          items: [
            {link: '/Tools/Git/Git-和-GitHub：从入门到实践1-Git-和-GitHub-基础简介', text:'Git-和-GitHub-基础简介'},
            {link: '/Tools/Git/Git-和-GitHub：从入门到实践2-Git-和-GitHub-基础配置', text:'Git-和-GitHub-基础配置'},
            {link: '/Tools/Git/Git-和-GitHub：从入门到实践3-Git-分支简介、Git-和-GitHub-日常操作', text:'Git-分支简介、Git-和-GitHub-日常操作'},
            {link: '/Tools/Git/Git-和-GitHub：从入门到实践4-Git 进阶-比较、回滚、撤销、分支合并和冲突解决', text:'Git 进阶：比较、回滚、撤销、分支合并和冲突解决'},
            {link: '/Tools/Git/Git-和-GitHub：从入门到实践5-分支策略管理', text:'Git 进阶：分支策略管理'},
          ]
        }
      ],

      '/DevOps/Terraform/': [
        {
          text: 'Terraform',
          collapsed: false,
          items: [
            {text: 'Terraform使用技巧', link: '/DevOps/Terraform/tip'},
            {text: 'Terraform状态管理', link: '/DevOps/Terraform/state'},
            {text: '使用dynamic封装重复语句块', link: '/DevOps/Terraform//dynamic'},
          ]
        }
      ],
      '/DevOps/Ansible/': [
        {
          text: "Ansible2 系列",
          collapsed: false,
          items: [
            {link: '/Devops/Ansible/Ansible-2----1-介绍与使用场景', text: '1 介绍与使用场景'},
            {link: '/Devops/Ansible/Ansible-2----2-安装与配置', text: '2 安装与配置'},
            {link: '/Devops/Ansible/Ansible-2----3-配置文件', text: '3 配置文件'},
            {link: '/Devops/Ansible/Ansible-2----4-常用模块及常用API', text: '4 常用模块及常用API'},
            {link: '/Devops/Ansible/Ansible-2----5-playbook-语法', text: '5 playbook 语法'},
            {link: '/Devops/Ansible/Ansible-2----6-playbook-管理', text: '6 playbook 管理'},
            {link: '/Devops/Ansible/运维自动化之Ansible', text: '总结-运维自动化之Ansible'},
          ]
        }
      ],
      '/DevOps/Jenkins/': [
        {
          text: "Jenkins2 系列",
          collapsed: false,
          items: [
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列1----使用Docker方式安装最新版Jenkins',
              text: '1 使用Docker方式安装最新版Jenkins'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列2----Pipeline-介绍及基础', text: '2 Pipeline 介绍及基础'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列3----Groovy语法介绍', text: '3 Groovy语法介绍'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列4----Pipeline-post-部分', text: '4 Pipeline post 部分'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列5----Pipeline-中的指令', text: '5 Pipeline 中的指令'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列6----环境变量', text: '6 环境变量'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列7----构建工具', text: '7 构建工具'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列8----实战-使用-Generic-Webhook-Trigger-插件自动构建个人博客',
              text: '8 实战: 使用 Generic Webhook Trigger 插件自动构建个人博客'
            },
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列9----Generic-Webhook-Trigger-插件详讲',
              text: '9 Generic-Webhook-Trigger 插件详讲'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列10----多分支pipeline构建', text: '10 多分支pipeline构建'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列11----参数化构建', text: '11 参数化构建'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列12----创建和使用共享库', text: '12 创建和使用共享库'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列13----邮件和Slack通知', text: '13 邮件和Slack通知'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列14----使用-Config-File-Provider-添加邮件模板',
              text: '14 使用 Config-File-Provider 添加邮件模板'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列15----声明式PipelineAPI补充', text: '15 声明式Pipeline API补充'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列16----Jenkins权限控制插件（Role-based-Authorization-Strategy）',
              text: '16 Jenkins权限控制插件(Role-based-Authorization-Strategy)'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列17----制品管理', text: '17 制品管理'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列18----凭证管理', text: '18 凭证管理'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列19----使用-Script-Console-批量修改Jenkins任务',
              text: '19 使用 Script-Console 批量修改Jenkins任务'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列20----通过SSH方法添加Slave节点', text: '20 通过SSH方法添加Slave节点'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列21----通过JNLP协议添加Slave节点', text: '21 通过JNLP协议添加Slave节点'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列22----pipeline-中-agent-使用介绍', text: '22 pipeline 中 agent 使用介绍'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列23----Jenkins-定期备份', text: '23 Jenkins 定期备份'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列24----Electron-应用的流水线设计', text: '24 Electron-应用的流水线设计'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列25----添加-Docker-Cloud-并构建镜像',
              text: '25 添加 Docker Cloud 并构建镜像'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列26----使用阿里云容器镜像服务', text: '26 使用阿里云容器镜像服务'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列27----pipeline-中-Docker-操作', text: '27 pipeline 中 Docker 操作'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列28----优化多分支流水线任务', text: '28 优化多分支流水线任务'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列29----安装指定版本插件', text: '29 安装指定版本插件'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列30----从Jenkins迁移到GitHubActions',
              text: '30 从Jenkins迁移到GitHub Actions'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列31---DockerInDocker', text: '31 DockerInDocker'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列32---访问宿主机并执行命令', text: '32 访问宿主机并执行命令'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列33---根据git-message中的内容触发构建', text: '33 根据git提交内容触发构建'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列34---配置仅合并代码后触发流水线', text: '34 配置仅合并代码后触发流水线'},
            {link: '/DevOps/Jenkins/Jenkins-学习资源', text: 'Jenkins资源收集'},
            {link: '/DevOps/Jenkins/Jenkins-sh-step', text: 'Jenkins内置sh详讲'},
          ]
        }
      ],
      '/Gitlab/': [
        {
          text: 'Gitlab 系列',
          collapsed: false,
          items: [
            {text: 'install-docker方式安装gitlab', link: '/Gitlab/mgt/install-docker方式安装gitlab'},
            {text: 'runner的executor该如何选择', link: '/Gitlab/runner/runner-runner的executor该如何选择'},
            {text: 'pipeline-自己执行git-commit', link: '/Gitlab/pipeline-自己执行git-commit'},
            {text: 'pipeline-flutter流水线制作', link: '/Gitlab/pipeline-flutter流水线制作'},
            {text: 'pipeline-技巧总结', link: '/Gitlab/tips'},
          ]
        }
      ],
      '/DevOps/Docker':  [{
        text: 'Docker 系列',
        collapsed: false,
        items: [
          {link: '/Devops/Docker/Docker-学习系列1--使用-Docker-快速实现多版本PHP切换', text: '1 使用-Docker-快速实现多版本PHP切换'},
          {link: '/Devops/Docker/Docker-学习系列2--保存对容器的修改', text: '2 保存对容器的修改'},
          {link: '/Devops/Docker/Docker-学习系列3--提交并分享自己的镜像', text: '3 提交并分享自己的镜像'},
          {link: '/Devops/Docker/Docker-学习系列4--简单总结-docker-curriculum', text: '4 简单总结 docker-curriculum'},
          {link: '/Devops/Docker/Docker-学习系列5--nginx-容器', text: '5 Nginx-容器'},
          {
            link: '/Devops/Docker/Docker-学习系列6--Docker-Compose-中的环境变量使用注意事项',
            text: '6 Docker Compose 中的环境变量使用注意事项'
          },
          {link: '/Devops/Docker/Docker-学习系列7--容器化Node项目', text: '7 容器化Node项目'},
          {link: '/Devops/Docker/Docker-学习系列8--结合daocloud实现持续集成', text: '8 结合daocloud实现持续集成'},
          {link: '/Devops/Docker/Docker-学习系列9--Docker的技术原理介绍', text: '9 Docker的技术原理介绍'},
          {link: '/Devops/Docker/Docker-学习系列10-开源图形化管理系统', text: '10 开源图形化管理系统'},
          {link: '/Devops/Docker/Docker-学习系列11-多阶段镜像构建', text: '11 多阶段镜像构建'},
          {link: '/Devops/Docker/Docker-学习系列12-轻松实现-MySQL-主从同步', text: '12 轻松实现MySQL主从同步'},
          {link: '/Devops/Docker/Docker-学习系列13-实现-基于pxc-的mysql-多节点主主同步', text: '13 实现基于pxc的mysql多节点主主同步'},
          {link: '/Devops/Docker/Docker-学习系列14-使用haproxy实现mysql集群的负载均衡', text: '14 使用haproxy实现mysql集群的负载均衡'},
          {
            link: '/Devops/Docker/Docker-学习系列15-Docker使用xdebug配合PHPStorm调试PHP',
            text: '15 Docker使用xdebug配合PHPStorm调试PHP'
          },
          {link: '/Devops/Docker/Docker-学习系列16-使用过程的一些经验总结', text: '16 使用过程的一些经验总结'},
          {link: '/Devops/Docker/Docker-学习系列17-镜像和容器的导入导出', text: '17 镜像和容器的导入导出'},
          {link: '/Devops/Docker/Docker-学习系列18-关于PHP5-6', text: '18 关于PHP5.6'},
          {link: '/Devops/Docker/Docker-学习系列19-容器化Angular项目', text: '19 容器化Angular项目'},
          {link: '/Devops/Docker/Docker-学习系列20-工具推荐，dive--分析镜像层的工具', text: '20 工具推荐，dive--分析镜像层的工具'},
          {link: '/Devops/Docker/Docker-学习系列21-配置远程访问Docker', text: '21 配置远程访问Docker'},
          {link: '/Devops/Docker/Docker-学习系列22-Docker-Layer-Caching.md', text: '22 Docker-Layer-Caching.md'},
          {
            link: '/Devops/Docker/Docker-学习系列23-推荐一款自动更新 Docker 镜像与容器的神器 Watchtower.md',
            text: '23 推荐一款自动更新 Docker 镜像与容器的神器 Watchtower'
          },
          {link: '/Devops/Docker/Docker-学习系列24-Docker-及-docker-compose-使用总结', text: '24 Docker 及 Docker-compose 使用总结'},
          {link: '/Devops/Docker/Docker-学习系列25-Dockerfile-中的-COPY-与-ADD-命令', text: '25 Dockerfile 中的 COPY 与 ADD 命令'},
          {link: '/Devops/Docker/Docker-学习系列26-hub-tool', text: '26-hub-tool工具介绍'},
          {link: '/Devops/Docker/Docker-学习系列27-Docker-in-Docker', text: '27-Docker-in-Docker'},
          {
            link: '/Devops/Docker/Docker-学习系列28-网络故障调试工具的瑞士军刀-netshoot',
            text: '28-网络故障调试工具的瑞士军刀-netshoot'
          },
          {
            link: '/Devops/Docker/Docker-学习系列29-使用 Docker Buildx 构建多种系统架构镜像',
            text: '29-使用 Docker Buildx 构建多种系统架构镜像'
          },
          {link: '/Devops/Docker/Docker-学习系列30-镜像同步的几种方式', text: '30-镜像同步的几种方式'},
          {link: '/Devops/Docker/Docker-学习系列31-如何制作一个高质量image', text: '31-如何制作一个高质量image'},
          {link: '/Devops/Docker/Docker-学习系列32-误删容器后恢复数据', text: '32-误删容器后恢复数据'},
          {link: '/Devops/Docker/Docker-学习系列33-镜像制作最佳实践', text: '33-镜像制作最佳实践'},
          {link: '/Devops/Docker/Docker-学习系列34-使用kaniko构建镜像', text: '34-使用kaniko构建镜像'},
          {link: '/Devops/Docker/Docker-学习系列35-日志驱动及处理', text: '35-日志驱动及处理'},
          {link: '/Devops/Docker/Docker-学习系列36-编写高效的Dockerfile', text: '35-编写高效的Dockerfile'},
          {link: '/Devops/Docker/Docker-学习资源', text: 'Docker学习资源'},
          {link: '/Devops/Docker/Docker-常见问题', text: 'Docker常见问题'}
        ]
      }],
      '/DevOps/Prometheus/':  [{
        text: 'Prometheus 系列',
        collapsed: false,
        items: [
          {
            "text": "1.产品介绍",
            "link": "/DevOps/Prometheus/1.产品介绍"
          },
          {
            "text": "2.安装部署",
            "link": "/DevOps/Prometheus/2.安装部署"
          },
          {
            "text": "3.配置介绍",
            "link": "/DevOps/Prometheus/3.配置介绍"
          },
          {
            "text": "4.数据格式",
            "link": "/DevOps/Prometheus/4.数据格式"
          },
          {
            "text": "5.PromQL语法上",
            "link": "/DevOps/Prometheus/5.PromQL语法上"
          },
          {
            "text": "6.PromQL语法下",
            "link": "/DevOps/Prometheus/6.PromQL语法下"
          },
          {
            "text": "7.任务与实例",
            "link": "/DevOps/Prometheus/7.任务与实例"
          },
          {
            "text": "8.标签重写",
            "link": "/DevOps/Prometheus/8.标签重写"
          },
          {
            "text": "9.主机监控",
            "link": "/DevOps/Prometheus/9.主机监控"
          },
          {
            "text": "10.主机监控指标",
            "link": "/DevOps/Prometheus/10.主机监控指标"
          },
          {
            "text": "11.Grafana可视化",
            "link": "/DevOps/Prometheus/11.Grafana可视化"
          },
          {
            "text": "12.配置告警规则",
            "link": "/DevOps/Prometheus/12.配置告警规则"
          },
          {
            "text": "13.告警管理",
            "link": "/DevOps/Prometheus/13.告警管理"
          },
          {
            "text": "14.Pushgateway",
            "link": "/DevOps/Prometheus/14.Pushgateway"
          },
          {
            "text": "15.Exporter详解",
            "link": "/DevOps/Prometheus/15.Exporter详解"
          },
          {
            "text": "16.Docker容器监控",
            "link": "/DevOps/Prometheus/16.Docker容器监控"
          },
          {
            "text": "17.探针监控",
            "link": "/DevOps/Prometheus/17.探针监控"
          },
          {
            "text": "18.基于Consul的服务发现",
            "link": "/DevOps/Prometheus/18.基于Consul的服务发现"
          },
          {
            "text": "19.监控Kubernetes集群_上篇",
            "link": "/DevOps/Prometheus/19.监控Kubernetes集群_上篇"
          },
          {
            "text": "20.监控Kubernetes集群_下篇",
            "link": "/DevOps/Prometheus/20.监控Kubernetes集群_下篇"
          },
          {
            "text": "21.容量管理",
            "link": "/DevOps/Prometheus/21.容量管理"
          },
          {
            "text": "22.远程存储",
            "link": "/DevOps/Prometheus/22.远程存储"
          },
          {
            "text": "23.高可用与扩展性",
            "link": "/DevOps/Prometheus/23.高可用与扩展性"
          },
          {
            "text": "24.Alertmanager集群",
            "link": "/DevOps/Prometheus/24.Alertmanager集群"
          },
          {
            "text": "25.Thanos介绍",
            "link": "/DevOps/Prometheus/25.Thanos介绍"
          }
        ]
      }]
      // {
      //   text: 'Examples',
      //   items: [
      //     {text: 'Markdown Examples', link: '/markdown-examples'},
      //     {text: 'Runtime API Examples', link: '/api-examples'}
      //   ]
      // },
    },
    socialLinks: [
      {icon: 'github', link: 'https://github.com/mafeifan'},
      {icon: 'twitter', link: 'https://twitter.com/zzfinley'}
    ]
  }
})
