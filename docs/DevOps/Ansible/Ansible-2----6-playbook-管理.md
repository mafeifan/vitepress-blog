可以为 playbook 中的任务打 tag 标签，方便在 ansible-playbook 中设置只执行哪些被打上tag的任务或忽略被打上tag的任务。

### 使用 tag 为 task 分类

```yaml
tasks:
    - name: make sure apache is running
      service: name=httpd state=started
      tags: apache
    - name: make sure mysql is running
      service: name=mysqld state=started
      tags: mysql
```
以下是 ansible-playbook 命令关于tag的选项。
```
--list-tags           # list all available tags
-t TAGS, --tags=TAGS  # only run plays and tasks tagged with these values
--skip-tags=SKIP_TAGS # only run plays and tasks whose tags do not match these values
```

### 使用 include，import 和 roles 提高 playbook 的复用性
如果playbook很大，task很多，或者某task要经常使用，可以考虑拆分位独立文件。

Ansible 2.4 起引入 include 和 import 的概念

* import 是静态导入，会在playbooks解析阶段将父和子task变量全部读取并加载
  import_playbook, import_tasks 等
* include 是动态导入，执行play之前才加载变量
  include_tasks, include_role 等
###### 导入 task
导入task可以使用
import_tasks：
include_tasks
```yaml
# playbook.yaml
# -- task/ntupdate.yml
---
     - hosts: centos7
       tasks:
        - import_tasks: task/ntupdate.yaml

# ntupdate.yml
---
     - name: execute ntpdate
       shell: /usr/sbin/ntpdate ntp1.aliyun.com
```

> 虽然仍然可以用 `include: task/ntupdate.yaml` 来直接导入 task 或 playbook 已经不推荐这么做，将来会被废弃

###### 导入 playbook
即加载一个或多个play
导入playbook可以使用  import_playbook
```yaml
---
  - name: first demo
    hosts: cloud
    vars:
      name: finley
    tasks:
      - name: execute date cmd
        shell: echo date
      - name: create hello
        shell: touch helloworld.txt
        args:
          creates: /tmp/hello.txt # 存在此文件就不执行 shell
      - include_tasks: tasks/task-hello.yml
  - import_playbook: playbooks/web.yml
```

### 参考
[https://docs.ansible.com/ansible/latest/user_guide/playbooks_reuse.html](https://docs.ansible.com/ansible/latest/user_guide/playbooks_reuse.html)
