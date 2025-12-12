### Jinja2

无论多么复杂的程序，都是由条件，循环，顺序执行三种组合而成，yaml 本身不支持逻辑运算，运算符等功能。
ansible支持[Jinja2](https://jinja.palletsprojects.com/en/3.0.x/)模板引擎。
类似Laravel中的Blade模板引擎。

可以搜索 Online Jinja2 Parser 或在线体验 https://j2live.ttl255.com/

举个例子，创建 hello.yaml
```yaml
- hosts: cloud
  remote_user: root
  vars:
    ports:
    - 8001
    - 8002
    nginx_conf_path: 'etc/nginx/nginx.conf'
  tasks:
  - name: hello
    tags: demo
    shell: echo "hello world"
  - name: date
    tags: date
    shell: date -R
  - name: jinja2 test
    template: 
      src: demo.j2 
      dest: demo.conf
```

demo.j2 内容
```ninja2
# {{ "hello world" | reverse | upper }}

<p>{{ 'hello every one' | truncate(9)}}</p>

Hi, {{ name | default("mafei")}}

{# 我是注释 #}
{% filter upper %}
  hello world
{% endfilter %}

worker_processes {{ ansible_processor_vcpus }};

{# nginx.conf #}
{{nginx_conf_path | basename}}

{# etc/nginx #}
{{nginx_conf_path | dirname}}

{{ range(1, 51) | random }}

{% for port in ports %}
server {
	listen localhost:{{ port }};
}
{% endfor %}

{% if ansible_os_family == 'Debian' %}
# This is a debian system
{% endif %}
```
当执行`ansible-playbook hello.yaml`
cloud服务器就会多出一个 demo.conf 文件，内容:

```
# DLROW OLLEH

<p>hello...</p>

Hi, mafei

  HELLO WORLD

worker_processes 2;

nginx.conf

etc/nginx

server {
	listen localhost:8001;
}
server {
	listen localhost:8002;
}

# This is a debian system
```

### Role

![](https://pek3b.qingstor.com/hexo-blog/20220213202526.png)

role 需要一个特定的目录结构，执行时会自动加载定义好的文件如 vars_files,tasks,handles 等

通过role进行内容分组方便与其他用户分享role。

roles 可以解决文件混乱和 playbook 臃肿的问题

示例项目结构
```
site.yml
webservers.yml
fooservers.yml
roles/
   common/
     tasks/
     handlers/
     files/
     templates/
     vars/
     defaults/
     meta/
   webservers/
     tasks/
     defaults/
     meta/
```


* tasks 目录：存放task列表。若role要生效，此目录必须要有一个主task文件main.yml，在main.yml中可以使用 include包含同目录(即tasks)中的其他文件。
* handlers 目录: 存放handlers的目录，若要生效，则文件必须名为main.yml文件。
* files目录：在task中执行copy或script模块时，如果使用的是相对路径，则会到此目录中寻找对应的文件。
* templates 目录：在task中执行template模块时，如果使用的是相对路径，则会到此目录中寻找对应的模块文件。
* vars目录：定义专属于该role的变量，如果要有var文件，则必须为main.yml文件。
* defaults 目录：定义角色默认变量，角色默认变量的优先级最低，会被任意其他层次的同名变量覆盖。如果要有var文件，则必须为main.yml文件。
* meta 目录：用于定义角色依赖(dependencies)，如果要有角色依赖关系，则文件必须为main.yml。

### 实例
执行命令

`ansible-galaxy install geerlingguy.redis`

roles目录中多个为`geerlingguy.redis`的目录。可以在各种操作系统安装redis。
里面的 templates 目录中有`redis.conf.j2`文件，可以改变 redis 的配置。

我们可以研究别人写好的role

![](https://pek3b.qingstor.com/hexo-blog/20220215175839.png)

## 参考
https://www.kancloud.cn/willseecloud/ansible/2092474
