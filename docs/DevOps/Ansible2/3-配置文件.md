### 环境配置
Ansible配置以ini格式存储配置数据，在 Ansible 中几乎所有配置都可以通过 Ansible 的 Playbook 或环境变量来重新赋值。
在运行 Ansible 命令时，命令将会按照以下优先级查找配置文件。
* ANSIBLE_CONFIG 这个环境变量所指向的配置文件。 
* ./ansible.cfg：当前目录下的`ansible.cfg`配置文件。
* ~/.ansible.cfg：检查当前用户家目录下的`.ansible.cfg`配置文件。
*  /etc/ansible/ansible.cfg：最后，将会检查在用软件包管理工具安装 Ansible 时自动产生的配置文件。

> 使用 ansible.cfg 来简化你的配置，使用`ansible-config dump`查看配置信息
> 如果没有 ansible.cfg 文件，使用`ansible-config init --disabled > ansible.cfg`生成一个

大多数的Ansible参数可以通过设置带有 ANSIBLE_ 开头的环境变量进行配置，参数名称必须都是大写字母，如下配置:
`export ANSIBLE_SUDO_USER=root`
设置了环境变量之后， ANSIBLE_SUDO_USER 就可以在后续操作中直接引用。

### ansible.cfg 配置文件
Ansible 有很多配置参数，以下是几个默认的配置参数：
```
 inventory = /etc/ansible/hosts
 library = /usr/share/my_modules/
 forks = 5
 sudo_user = root
 remote_port = 22
 host_key_checking = False
 timeout = 20
 log_path = /var/log/ansible.log
```
* inventory :该参数表示inventory文件的位置，资源清单(inventory)就是Ansible需要连接管理的一些主机列表。 
* library :Ansible的所有操作都使用模块来执行实现，这个library参数就是指向存放Ansible模块的目录。
* forks :设置默认情况下Ansible最多能有多少个进程同时工作，默认5个进程并行处理。具体需要设置多少个，可以根据控制端性能和被管理节点的数量来确定。
* sudo_user :设置默认执行命令的用户，也可以在playbook中重新设置这个参数。
* remote_port :指定连接被管理节点的管理端口，默认是22，除非设置了特殊的SSH端口，否则不需要修改此参数。 
* host_key_checking :设置是否检查SSH主机的密钥。可以设置为True或False。即ssh的主机再次验证。
* timeout :设置SSH连接的超时间隔，单位是秒。
* log_path :Ansible默认不记录日志，如果想把Ansible系统的输出记录到日志文件中，需要设置log_path。需要注意，模块将会调用被管节点的(r)syslog来记录，执行Ansible的用户需要有写入日志的权限。

::: warning
建议使用Git等版本控制工具保管你的playbook和inventory文件
:::