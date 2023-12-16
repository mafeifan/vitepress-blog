目前，Linux内核里面实现了7种不同类型的namespace。
```
名称        宏定义             隔离内容
Cgroup      CLONE_NEWCGROUP   Cgroup root directory (since Linux 4.6)
IPC         CLONE_NEWIPC      System V IPC, POSIX message queues (since Linux 2.6.19)
Network     CLONE_NEWNET      Network devices, stacks, ports, etc. (since Linux 2.6.24)
Mount       CLONE_NEWNS       Mount points (since Linux 2.4.19)
PID         CLONE_NEWPID      Process IDs (since Linux 2.6.24)
User        CLONE_NEWUSER     User and group IDs (started in Linux 2.6.23 and completed in Linux 3.8)
UTS         CLONE_NEWUTS      Hostname and NIS domain name (since Linux 2.6.19)

# 查看当前bash进程所属的namespace

ls -l /proc/$$/ns     

total 0
lrwxrwxrwx 1 500 ubuntu 0 Mar 12 12:07 cgroup -> 'cgroup:[4026531835]'
lrwxrwxrwx 1 500 ubuntu 0 Mar 12 12:07 ipc -> 'ipc:[4026531839]'
lrwxrwxrwx 1 500 ubuntu 0 Mar 12 12:07 mnt -> 'mnt:[4026531840]'
lrwxrwxrwx 1 500 ubuntu 0 Mar 12 12:07 net -> 'net:[4026531993]'
lrwxrwxrwx 1 500 ubuntu 0 Mar 12 12:07 pid -> 'pid:[4026531836]'
lrwxrwxrwx 1 500 ubuntu 0 Mar 12 12:07 pid_for_children -> 'pid:[4026531836]'
lrwxrwxrwx 1 500 ubuntu 0 Mar 12 12:07 user -> 'user:[4026531837]'
lrwxrwxrwx 1 500 ubuntu 0 Mar 12 12:07 uts -> 'uts:[4026531838]'

```