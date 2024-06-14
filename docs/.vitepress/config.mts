import {defineConfig} from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "mafeifan 的编程技术分享",
  description: "DevOps,K8s,云原生,Prometheus,Terraform,Laravel,Jenkins系列教程,Docker系列教程",
  lang: "zh-CN",
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ["meta", {name: "apple-mobile-web-app-capable", content: "yes"}],
    [
      "script",
      {},
      `
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?b446f22728efd98e5f4247e4816ef8c9";
        var s = document.getElementsByTagName("script")[0]; 
        s.parentNode.insertBefore(hm, s);
      })();
      `
    ]
  ],
  lastUpdated: true,
  ignoreDeadLinks: true,
  themeConfig: {
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2020-present'
    },
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/mafeifan/vitepress-blog/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {text: 'Home', link: '/'},
      {
        text: 'Cloud Native',
        items: [
          {text: 'Docker系列', link: '/DevOps/Docker/Docker-学习系列1--为什么要使用Docker'},
          {text: 'Kubernetes系列', link: '/DevOps/K8s/k8s-理论-快速入门'},
          {text: 'Prometheus系列', link: '/DevOps/Prometheus/1.产品介绍'},
        ]
      },
      {
        text: 'DevOps',
        items: [
          {text: 'Jenkins2系列', link: '/DevOps/Jenkins/Jenkins2-学习系列1----使用Docker方式安装最新版Jenkins'},
          {text: 'GithubActions系列', link: '/DevOps/GithubActions/入门'},
          {text: 'Ansible2系列', link: '/DevOps/Ansible2/Ansible2--1-介绍与使用场景'},
          {text: 'Terraform', link: '/DevOps/Terraform/tip'},
          {text: 'Gitlab系列', link: '/Gitlab/pipeline-技巧总结'},
        ]
      },
      {
        text: 'Tools',
        items: [
          {text: 'Git学习系列', link: '/Tools/Git/Git-和-GitHub：从入门到实践1-Git-和-GitHub-基础简介'},
          {text: 'Other', link: '/Tools/优质免费软件推荐'},
        ]
      },
      {
        text: 'Frontend',
        items: [
          {text: 'JavaScript', link: '/Frontend/JavaScript/ES6技巧总结'},
          {text: 'HTML5', link: '/Frontend/HTML5/CSS3实现未知宽高元素的垂直居中和水平居中'},
          {text: 'GraphQL', link: '/Frontend/GraphQL/GraphQL-分享-理论篇'},
          {text: 'RxJS-6', link: '/Frontend/RxJS-6/RxJS-学习系列-1--认识-RxJS'},
          {text: 'Angular', link: '/Frontend/Angular/Angular-共享数据'},
        ]
      },
      {
        text: 'Links',
        items: [
           {text: 'Markdown测试页', link: '/markdown-examples'},
           {text: '友情链接', link: '/friend-links'},
        ]},
      // {text: 'Backend', link: '/markdown-examples'},
      // {text: 'Other', link: '/markdown-examples'},
    ],
    sidebar: {
      '/Frontend/Angular/': [
        {
          text: 'Angular',
          collapsed: false,
          items: [
            {
              "text": "Angular-共享数据",
              "link": "/Frontend/Angular/Angular-共享数据"
            },
            {
              "text": "Angular-样式使用注意事项",
              "link": "/Frontend/Angular/Angular-样式使用注意事项"
            },
            {
              "text": "Angular-模板变量",
              "link": "/Frontend/Angular/Angular-模板变量"
            },
            {
              "text": "Angular-pipe管道介绍及使用",
              "link": "/Frontend/Angular/Angular-pipe管道介绍及使用"
            },
            {
              "text": "Angular-component-组件内使用原生pipe",
              "link": "/Frontend/Angular/Angular-component-组件内使用原生pipe"
            },
            {
              "text": "Angular-使用-RxJS-优化处理Http请求",
              "link": "/Frontend/Angular/Angular-使用-RxJS-优化处理Http请求"
            },
            {
              "text": "Angular-表单1--响应式表单",
              "link": "/Frontend/Angular/Angular-表单1--响应式表单"
            },
            {
              "text": "Angular-表单2--响应式表单-处理异步数据",
              "link": "/Frontend/Angular/Angular-表单2--响应式表单-处理异步数据"
            },
            {
              "text": "Angular-表单3--响应式表单-复杂验证",
              "link": "/Frontend/Angular/Angular-表单3--响应式表单-复杂验证"
            },
            {
              "text": "Angular-依赖注入-初认",
              "link": "/Frontend/Angular/Angular-依赖注入-初认"
            },
            {
              "text": "Angular-依赖注入-运用",
              "link": "/Frontend/Angular/Angular-依赖注入-运用"
            },
            {
              "text": "Angular-实现一个Dialog组件",
              "link": "/Frontend/Angular/Angular-实现一个Dialog组件"
            },
            {
              "text": "Angular-修改build后的静态资源目录路径",
              "link": "/Frontend/Angular/Angular-修改build后的静态资源目录路径"
            },
            {
              "text": "使用CircleCI持续集成Angular项目",
              "link": "/Frontend/Angular/使用CircleCI持续集成Angular项目"
            }
          ]
        }],
      '/Frontend/RxJS-6/': [
        {
          text: 'RxJS-6',
          collapsed: false,
          items: [
            {
              "text": "1--认识-RxJS",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-1--认识-RxJS"
            },
            {
              "text": "2--函数式编程",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-2--函数式编程"
            },
            {
              "text": "3--认识观察者模式和迭代器模式",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-3--认识观察者模式和迭代器模式"
            },
            {
              "text": "4--RxJS-介绍及注意事项",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-4--RxJS-介绍及注意事项"
            },
            {
              "text": "5--创建-Observable",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-5--创建-Observable"
            },
            {
              "text": "6--Observable-和-数组的区别",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-6--Observable-和-数组的区别"
            },
            {
              "text": "7--创建操作符",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-7--创建操作符-from,-of,-range,-interval,-timer,-empty"
            },
            {
              "text": "8--过滤操作符3-1",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-8--过滤操作符-startWith,filter,-last,-first,-skip,-take"
            },
            {
              "text": "9--过滤操作符3-2",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-9--过滤操作符-takeUntil，takeWhile，skipUntil，skipWhile"
            },
            {
              "text": "10--过滤操作符3-3",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-10--过滤操作符-debounce，debounceTime，throttle，throttleTime"
            },
            {
              "text": "11--合并操作符3-1",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-11--合并操作符-concat,-merge,-concatAll"
            },
            {
              "text": "12--合并操作符3-2",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-12--合并操作符-concatAll,-mergeAll,-switchAll"
            },
            {
              "text": "13--合并操作符3-3",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-13--合并打平操作符-switchMap,-mergeMap,-concatMap"
            },
            {
              "text": "14--Subject基本概念",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-14--Subject-基本概念"
            },
            {
              "text": "15--Subject示例",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-15--Subject-示例"
            },
            {
              "text": "16--Subject的变形",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-16--Subject-的变形,-BehaviorSubject,-ReplaySubject,-AsyncSubject"
            },
            {
              "text": "RxJS-5-到-6迁移指导",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-RxJS-5-到-6迁移指导"
            },
            {
              "text": "RxJS在Angular中的使用",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-RxJS-在-Angular-中的使用"
            },
            {
              "text": "使用RxJS要注意的问题",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-使用-RxJS-要注意的问题"
            },
            {
              "text": "资料推荐",
              "link": "/Frontend/RxJS-6/RxJS-学习系列-资料推荐"
            }
          ]
        }],
      '/Frontend/GraphQL/': [
        {
          text: 'GraphQL',
          collapsed: false,
          items: [
            {
              "text": "GraphQL-分享-理论篇",
              "link": "/Frontend/GraphQL/GraphQL-分享-理论篇"
            },
            {
              "text": "GraphQL-分享-实战篇",
              "link": "/Frontend/GraphQL/GraphQL-分享-实战篇"
            },
          ]
        }],
      '/Frontend/JavaScript/': [
        {
          text: 'JavaScript总结',
          collapsed: false,
          items: [
            {
              "text": "ES6技巧总结",
              "link": "/Frontend/JavaScript/ES6技巧总结"
            },
            {
              "text": "JavaScript中reduce的使用",
              "link": "/Frontend/JavaScript/JavaScript中reduce的使用"
            },
            {
              "text": "JavaScript中的事件相关",
              "link": "/Frontend/JavaScript/JavaScript中的事件相关"
            },
            {
              "text": "说下JavaScript中的bind",
              "link": "/Frontend/JavaScript/说下JavaScript中的bind"
            },
            {
              "text": "说说JSON和JSONP，也许你会豁然开朗",
              "link": "/Frontend/JavaScript/说说JSON和JSONP，也许你会豁然开朗"
            },
            {
              "text": "解决setTimeout中的this指向问题",
              "link": "/Frontend/JavaScript/解决setTimeout中的this指向问题"
            },
            {
              "text": "使用StorageEvent解决浏览器标签页数据同步问题",
              "link": "/Frontend/JavaScript/使用StorageEvent解决浏览器标签页数据同步问题"
            },
            {
              "text": "关于JS中的循环",
              "link": "/Frontend/JavaScript/关于JS中的循环"
            },
            {
              "text": "JS-面试总结-理论篇",
              "link": "/Frontend/JavaScript/JS-面试总结-理论篇"
            },
            {
              "text": "前端路由原理之 hash 模式和 history 模式",
              "link": "/Frontend/JavaScript/前端路由原理之 hash 模式和 history 模式"
            },
            {
              "text": "Typescript-技巧(补充中)",
              "link": "/Frontend/JavaScript/Typescript-技巧(补充中)"
            }
          ]
        }],
      '/Frontend/HTML5/': [
        {
          text: 'HTML5',
          collapsed: false,
          items: [
            {
              "text": "CSS3实现未知宽高元素的垂直居中和水平居中",
              "link": "/Frontend/HTML5/CSS3实现未知宽高元素的垂直居中和水平居中"
            },
            {
              "text": "巧解checkbox未选中不提交数据",
              "link": "/Frontend/HTML5/巧解checkbox未选中不提交数据"
            },
            {
              "text": "禁止内部元素的事件响应",
              "link": "/Frontend/HTML5/禁止内部元素的事件响应"
            },
            {
              "text": "前端安全总结",
              "link": "/Frontend/HTML5/前端安全总结"
            },
            {
              "text": "前端项目打包总结",
              "link": "/Frontend/HTML5/前端项目打包总结"
            }
          ]
        }],
      '/Tools/Other/': [
        {
          text: 'Other',
          collapsed: false,
          items: [
            {link: '/Tools/Other/当有个服务器可以干哪些事情', text: '当有个服务器可以干哪些事情?'},
            {link: '/Tools/Other/优质免费软件推荐', text: '优质免费软件推荐'},
            {link: '/Tools/Other/前端-说下browserslist', text: '说下browserslist'},
            {
              link: '/Tools/Other/前端-storybook-介绍和使用-比较火的响应式UI开发及测试环境',
              text: 'storybook-介绍和使用-响应式UI开发及测试环境'
            },
            {link: '/Tools/Other/后端-强大的Postman--API管理工具', text: '强大的Postman--API管理工具'},
            {link: '/Tools/Other/网络-下载youtube视频-yt-dlp', text: '网络-下载youtube视频-yt-dlp'},
            {link: '/Tools/Other/网络-Nginx', text: 'Nginx知识点总结'},
            {link: '/Tools/Other/网络-使用frp内网穿透工具', text: '使用frp内网穿透工具'},
          ]
        }
      ],
      '/Tools/Git/': [
        {
          text: 'Git学习系列',
          collapsed: false,
          items: [
            {link: '/Tools/Git/Git-和-GitHub：从入门到实践1-Git-和-GitHub-基础简介', text: 'Git-和-GitHub-基础简介'},
            {link: '/Tools/Git/Git-和-GitHub：从入门到实践2-Git-和-GitHub-基础配置', text: 'Git-和-GitHub-基础配置'},
            {
              link: '/Tools/Git/Git-和-GitHub：从入门到实践3-Git-分支简介、Git-和-GitHub-日常操作',
              text: 'Git-分支简介、Git-和-GitHub-日常操作'
            },
            {
              link: '/Tools/Git/Git-和-GitHub：从入门到实践4-Git 进阶-比较、回滚、撤销、分支合并和冲突解决',
              text: 'Git 进阶：比较、回滚、撤销、分支合并和冲突解决'
            },
            {link: '/Tools/Git/Git-和-GitHub：从入门到实践5-分支策略管理', text: 'Git 进阶：分支策略管理'},
          ]
        }
      ],
      '/Gitlab/': [
        {
          text: 'Gitlab 系列',
          collapsed: false,
          items: [
            // {text: 'docker方式安装gitlab', link: '/Gitlab/mgt/install-docker方式安装gitlab'},
            {text: 'pipeline-技巧总结', link: '/Gitlab/pipeline-技巧总结'},
            {text: 'runner的executor该如何选择', link: '/Gitlab/runner-runner的executor该如何选择'},
            {text: 'pipeline-自己执行git-commit', link: '/Gitlab/pipeline-自己执行git-commit'},
          ]
        }
      ],
      '/DevOps/K8s/': [{
        text: "K8s 系列",
        collapsed: false,
        items: [
          {
            "text": "k8s-快速入门",
            "link": "/DevOps/K8s/k8s-理论-快速入门"
          },
          {
            "text": "k8s-理论-知识点总结",
            "link": "/DevOps/K8s/k8s-理论-知识点总结"
          },
          {
            "text": "k8s-总结-命令行",
            "link": "/DevOps/K8s/k8s-总结-命令行"
          },
          {
            "text": "k8s-基础-部署容器化Web应用",
            "link": "/DevOps/K8s/k8s-基础-部署容器化Web应用"
          },
          {
            "text": "k8s-基础-PV&PVC理论",
            "link": "/DevOps/K8s/k8s-基础-PV&PVC理论"
          },
          {
            "text": "k8s-基础-安装metrics-server",
            "link": "/DevOps/K8s/k8s-基础-安装metrics-server"
          },
          {
            "text": "k8s-基础-安装OpenEBS",
            "link": "/DevOps/K8s/k8s-基础-安装OpenEBS"
          },
          {
            "text": "k8s-基础-搭建EFK日志系统",
            "link": "/DevOps/K8s/k8s-基础-搭建EFK日志系统"
          },
          {
            "text": "k8s-基础-使用Velero备份恢复集群",
            "link": "/DevOps/K8s/k8s-基础-使用Velero备份恢复集群"
          },
          {
            "text": "k8s-基础-NetworkPolicy网络策略",
            "link": "/DevOps/K8s/k8s-基础-NetworkPolicy网络策略"
          },
          {
            "text": "k8s-基础-nginx-ingress的使用",
            "link": "/DevOps/K8s/k8s-基础-nginx-ingress的使用"
          },
          {
            "text": "k8s-基础-Horizontal-Pod-Autoscaler练习",
            "link": "/DevOps/K8s/k8s-基础-Horizontal-Pod-Autoscaler练习"
          },
          {
            "text": "k8s-基础-使用argocd",
            "link": "/DevOps/K8s/k8s-基础-使用argocd"
          },
          {
            "text": "k8s-考证-CKA心得",
            "link": "/DevOps/K8s/k8s-考证-CKA心得"
          },
          {
            "text": "k8s-工具-使用Kubernetes-Dashboard",
            "link": "/DevOps/K8s/k8s-工具-使用Kubernetes-Dashboard"
          },
          {
            "text": "k8s-工具-helm3-总结",
            "link": "/DevOps/K8s/k8s-工具-helm3-总结"
          },
          {
            "text": "k8s-发布-红蓝部署",
            "link": "/DevOps/K8s/k8s-发布-红蓝部署"
          },
          {
            "text": "k8s-发布-滚动发布",
            "link": "/DevOps/K8s/k8s-发布-滚动发布"
          },
          {
            "text": "Kubesphere3.x添加新agent",
            "link": "/DevOps/K8s/Kubesphere3.x添加新agent"
          },
          {
            "text": "Kubesphere3.x修改logo",
            "link": "/DevOps/K8s/Kubesphere3.x修改logo"
          },
          {
            "text": "Kubesphere3.x调整Jenkins时区",
            "link": "/DevOps/K8s/Kubesphere3.x调整Jenkins时区"
          },
          {
            "text": "Kubesphere3.x公有云添加额外ks-console的LB",
            "link": "/DevOps/K8s/Kubesphere3.x公有云添加额外ks-console的LB"
          }
        ]
      }],
      '/DevOps/GithubActions/': [
        {
          text: 'GithubActions',
          collapsed: false,
          items: [
            {
              "text": "入门",
              "link": "/DevOps/GithubActions/入门"
            },
            {
              "text": "如何手动触发构建",
              "link": "/DevOps/GithubActions/如何手动触发构建"
            },
            {
              "text": "GitHub-Actions的徽章图标",
              "link": "/DevOps/GithubActions/GitHub-Actions的徽章图标"
            },
            {
              "text": "GitHub-Actions编译安卓",
              "link": "/DevOps/GithubActions/GitHub-Actions编译安卓"
            },
            {
              "text": "自用GitHub-Actions-Workflow",
              "link": "/DevOps/GithubActions/自用GitHub-Actions-Workflow"
            },
            {
              "text": "只针对某些提交触发构建",
              "link": "/DevOps/GithubActions/只针对某些提交触发构建"
            },
            {
              "text": "如何调试Github-Actions",
              "link": "/DevOps/GithubActions/如何调试Github-Actions"
            },
            {
              "text": "Docker构建镜像和推送到docker-hub",
              "link": "/DevOps/GithubActions/Docker构建镜像和推送到docker-hub"
            },
            {
              "text": "相关资源",
              "link": "/DevOps/GithubActions/相关资源"
            }
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
      '/DevOps/Ansible2/': [
        {
          text: "Ansible2 系列",
          collapsed: false,
          items: [
            {link: '/Devops/Ansible2/1-介绍与使用场景', text: '1-介绍与使用场景'},
            {link: '/Devops/Ansible2/2-安装与配置', text: '2-安装与配置'},
            {link: '/Devops/Ansible2/3-配置文件', text: '3-配置文件'},
            {link: '/Devops/Ansible2/4-常用模块及常用API', text: '4-常用模块及常用API'},
            {link: '/Devops/Ansible2/5-playbook-语法', text: '5-playbook 语法'},
            {link: '/Devops/Ansible2/6-playbook-管理', text: '6-playbook 管理'},
            {link: '/Devops/Ansible2/运维自动化之Ansible', text: '总结-运维自动化之Ansible'},
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
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列20----通过SSH方法添加Slave节点',
              text: '20 通过SSH方法添加Slave节点'
            },
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列21----通过JNLP协议添加Slave节点',
              text: '21 通过JNLP协议添加Slave节点'
            },
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列22----pipeline-中-agent-使用介绍',
              text: '22 pipeline 中 agent 使用介绍'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列23----Jenkins-定期备份', text: '23 Jenkins 定期备份'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列24----Electron-应用的流水线设计',
              text: '24 Electron-应用的流水线设计'
            },
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列25----添加-Docker-Cloud-并构建镜像',
              text: '25 添加 Docker Cloud 并构建镜像'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列26----使用阿里云容器镜像服务', text: '26 使用阿里云容器镜像服务'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列27----pipeline-中-Docker-操作',
              text: '27 pipeline 中 Docker 操作'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列28----优化多分支流水线任务', text: '28 优化多分支流水线任务'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列29----安装指定版本插件', text: '29 安装指定版本插件'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列30----从Jenkins迁移到GitHubActions',
              text: '30 从Jenkins迁移到GitHub Actions'
            },
            {link: '/DevOps/Jenkins/Jenkins2-学习系列31---DockerInDocker', text: '31 DockerInDocker'},
            {link: '/DevOps/Jenkins/Jenkins2-学习系列32---访问宿主机并执行命令', text: '32 访问宿主机并执行命令'},
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列33---根据git-message中的内容触发构建',
              text: '33 根据git提交内容触发构建'
            },
            {
              link: '/DevOps/Jenkins/Jenkins2-学习系列34---配置仅合并代码后触发流水线',
              text: '34 配置仅合并代码后触发流水线'
            },
            {link: '/DevOps/Jenkins/Jenkins-学习资源', text: 'Jenkins资源收集'},
            {link: '/DevOps/Jenkins/Jenkins-sh-step', text: 'Jenkins内置sh详讲'},
          ]
        }
      ],
      '/DevOps/Docker': [{
        text: 'Docker 系列',
        collapsed: false,
        items: [
          {
            link: '/DevOps/Docker/Docker-学习系列1--为什么要使用Docker',
            text: '1 为什么要使用Docker'
          },
          {link: '/DevOps/Docker/Docker-学习系列2--保存对容器的修改', text: '2 保存对容器的修改'},
          {link: '/DevOps/Docker/Docker-学习系列3--提交并分享自己的镜像', text: '3 提交并分享自己的镜像'},
          {link: '/DevOps/Docker/Docker-学习系列4--简单总结-docker-curriculum', text: '4 简单总结 docker-curriculum'},
          {link: '/DevOps/Docker/Docker-学习系列5--nginx-容器', text: '5 Nginx-容器'},
          {
            link: '/DevOps/Docker/Docker-学习系列6--Docker-Compose-中的环境变量使用注意事项',
            text: '6 Docker Compose 中的环境变量使用注意事项'
          },
          {link: '/DevOps/Docker/Docker-学习系列7--容器化Node项目', text: '7 容器化Node项目'},
          {link: '/DevOps/Docker/Docker-学习系列8--结合daocloud实现持续集成', text: '8 结合daocloud实现持续集成'},
          {link: '/DevOps/Docker/Docker-学习系列9--Docker的技术原理介绍', text: '9 Docker的技术原理介绍'},
          {link: '/DevOps/Docker/Docker-学习系列10-开源图形化管理系统', text: '10 开源图形化管理系统'},
          {link: '/DevOps/Docker/Docker-学习系列11-多阶段镜像构建', text: '11 多阶段镜像构建'},
          {link: '/DevOps/Docker/Docker-学习系列12-轻松实现-MySQL-主从同步', text: '12 轻松实现MySQL主从同步'},
          {
            link: '/DevOps/Docker/Docker-学习系列13-实现-基于pxc-的mysql-多节点主主同步',
            text: '13 实现基于pxc的mysql多节点主主同步'
          },
          {
            link: '/DevOps/Docker/Docker-学习系列14-使用haproxy实现mysql集群的负载均衡',
            text: '14 使用haproxy实现mysql集群的负载均衡'
          },
          {
            link: '/DevOps/Docker/Docker-学习系列15-Docker使用xdebug配合PHPStorm调试PHP',
            text: '15 Docker使用xdebug配合PHPStorm调试PHP'
          },
          {link: '/DevOps/Docker/Docker-学习系列16-使用过程的一些经验总结', text: '16 使用过程的一些经验总结'},
          {link: '/DevOps/Docker/Docker-学习系列17-镜像和容器的导入导出', text: '17 镜像和容器的导入导出'},
          {link: '/DevOps/Docker/Docker-学习系列18-关于PHP5-6', text: '18 关于PHP5.6'},
          {link: '/DevOps/Docker/Docker-学习系列19-容器化Angular项目', text: '19 容器化Angular项目'},
          {
            link: '/DevOps/Docker/Docker-学习系列20-工具推荐，dive--分析镜像层的工具',
            text: '20 工具推荐，dive--分析镜像层的工具'
          },
          {link: '/DevOps/Docker/Docker-学习系列21-配置远程访问Docker', text: '21 配置远程访问Docker'},
          {link: '/DevOps/Docker/Docker-学习系列22-Docker-Layer-Caching.md', text: '22 Docker-Layer-Caching.md'},
          {
            link: '/DevOps/Docker/Docker-学习系列23-推荐一款自动更新 Docker 镜像与容器的神器 Watchtower.md',
            text: '23 推荐一款自动更新 Docker 镜像与容器的神器 Watchtower'
          },
          {
            link: '/DevOps/Docker/Docker-学习系列24-Docker-及-docker-compose-使用总结',
            text: '24 Docker 及 Docker-compose 使用总结'
          },
          {
            link: '/DevOps/Docker/Docker-学习系列25-Dockerfile-中的-COPY-与-ADD-命令',
            text: '25 Dockerfile 中的 COPY 与 ADD 命令'
          },
          {link: '/DevOps/Docker/Docker-学习系列26-hub-tool', text: '26-hub-tool工具介绍'},
          {link: '/DevOps/Docker/Docker-学习系列27-Docker-in-Docker', text: '27-Docker-in-Docker'},
          {
            link: '/DevOps/Docker/Docker-学习系列28-网络故障调试工具的瑞士军刀-netshoot',
            text: '28-网络故障调试工具的瑞士军刀-netshoot'
          },
          {
            link: '/DevOps/Docker/Docker-学习系列29-使用 Docker Buildx 构建多种系统架构镜像',
            text: '29-使用 Docker Buildx 构建多种系统架构镜像'
          },
          {link: '/DevOps/Docker/Docker-学习系列30-镜像同步的几种方式', text: '30-镜像同步的几种方式'},
          {link: '/DevOps/Docker/Docker-学习系列31-如何制作一个高质量image', text: '31-如何制作一个高质量image'},
          {link: '/DevOps/Docker/Docker-学习系列32-误删容器后恢复数据', text: '32-误删容器后恢复数据'},
          {link: '/DevOps/Docker/Docker-学习系列33-镜像制作最佳实践', text: '33-镜像制作最佳实践'},
          {link: '/DevOps/Docker/Docker-学习系列34-使用kaniko构建镜像', text: '34-使用kaniko构建镜像'},
          {link: '/DevOps/Docker/Docker-学习系列35-日志驱动及处理', text: '35-日志驱动及处理'},
          {link: '/DevOps/Docker/Docker-学习系列36-编写高效的Dockerfile', text: '35-编写高效的Dockerfile'},
          {link: '/DevOps/Docker/Docker-学习资源', text: 'Docker学习资源'},
          {link: '/DevOps/Docker/Docker-常见问题', text: 'Docker常见问题'}
        ]
      }],
      '/DevOps/Prometheus/': [{
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
      {icon: 'x', link: 'https://x.com/zzfinley'}
    ]
  }
})
