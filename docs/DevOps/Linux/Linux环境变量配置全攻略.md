## Linux环境变量配置

在自定义安装软件的时候，经常需要配置环境变量，下面列举出各种对环境变量的配置方法。

下面所有例子的环境说明如下：

* 系统：Ubuntu 16.0
* 用户名：ubuntu
* 需要配置MySQL环境变量路径：/home/ubuntu/mysql/bin

#### Linux读取环境变量

读取环境变量的方法：

* `export`命令显示当前系统定义的所有环境变量
* `echo $PATH`命令输出当前的`PATH`环境变量的值

这两个命令执行的效果如下

```
ubuntu@VM-16-4-ubuntu:~$ export
declare -x HISTSIZE="3000"
declare -x HISTTIMEFORMAT="%F %T "
declare -x HOME="/home/ubuntu"
declare -x LANG="C.UTF-8"
declare -x LC_CTYPE="C.UTF-8"
declare -x LC_TERMINAL="iTerm2"
declare -x LC_TERMINAL_VERSION="3.4.8"
declare -x LOGNAME="ubuntu"
declare -x MAIL="/var/mail/ubuntu"
declare -x OLDPWD
declare -x PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"
declare -x PROMPT_COMMAND="history -a; history -a; history -a; "
declare -x PWD="/home/ubuntu"
declare -x SHELL="/bin/bash"
declare -x SHLVL="1"
declare -x SSH_TTY="/dev/pts/3"
declare -x TERM="xterm-256color"
declare -x USER="ubuntu"
declare -x XDG_DATA_DIRS="/usr/local/share:/usr/share:/var/lib/snapd/desktop"
declare -x XDG_RUNTIME_DIR="/run/user/500"
declare -x XDG_SESSION_ID="143335"

ubuntu@VM-16-4-ubuntu:~$ echo $PATH
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
```

其中`PATH`变量定义了运行命令的查找路径，以冒号`:`分割不同的路径，使用`export`定义的时候可加双引号也可不加。


#### Linux环境变量配置方法一：export PATH

使用export命令直接修改PATH的值，配置MySQL进入环境变量的方法:
```
export PATH=/home/ubuntu/mysql/bin:$PATH
# 或者把PATH放在前面
export PATH=$PATH:/home/ubuntu/mysql/bin
```

注意事项：

* 生效时间：立即生效
* 生效期限：当前终端有效，窗口关闭后无效
* 生效范围：仅对当前用户有效
* 配置的环境变量中不要忘了加上原来的配置，即$PATH部分，避免覆盖原来配置

#### Linux环境变量配置方法二：vim ~/.bashrc

通过修改用户目录下的`~/.bashrc`文件进行配置：

```
vim ~/.bashrc

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

* 生效时间：使用相同的用户打开新的终端时生效，或者手动`source ~/.bashrc`生效
* 生效期限：永久有效
* 生效范围：仅对当前用户有效
* 如果有后续的环境变量加载文件覆盖了PATH定义，则可能不生效

#### Linux环境变量配置方法三：vim ~/.bash_profile


和修改`~/.bashrc`文件类似，也是要在文件最后加上新的路径即可：
```
vim ~/.bash_profile

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

* 生效时间：使用相同的用户打开新的终端时生效，或者手动`source ~/.bash_profile`生效
* 生效期限：永久有效
* 生效范围：仅对当前用户有效
* 如果没有`~/.bash_profile`文件，则可以编辑`~/.profile`文件或者新建一个


#### Linux环境变量配置方法四：vim /etc/bashrc

该方法是修改系统配置，需要管理员权限（如root）或者对该文件的写入权限：

```
# 如果/etc/bash.bashrc文件不可编辑，需要修改为可编辑
chmod -v u+w /etc/bash.bashrc

vim /etc/bash.bashrc

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

* 生效时间：新开终端生效，或者手动`source /etc/bash.bashrc`生效
* 生效期限：永久有效
* 生效范围：对所有用户有效

::: warning
如果系统是 ubuntu 或者 debian 的话, 就不会有 /etc/bashrc 而会有 /etc/bash.bashrc 文件.
:::

#### Linux环境变量配置方法五：vim /etc/profile

该方法修改系统配置，需要管理员权限或者对该文件的写入权限，和`vim /etc/bash.bashrc`类似：
```
# 如果/etc/profile文件不可编辑，需要修改为可编辑
chmod -v u+w /etc/profile

vim /etc/profile

# 在最后一行加上
export PATH=$PATH:/home/uusama/mysql/bin
```

注意事项：

* 生效时间：新开终端生效，或者手动source /etc/profile生效
* 生效期限：永久有效
* 生效范围：对所有用户有效

## Linux环境变量加载原理解析

上面列出了环境变量的各种配置方法，那么Linux是如何加载这些配置的呢？是以什么样的顺序加载的呢？

特定的加载顺序会导致相同名称的环境变量定义被覆盖或者不生效。

环境变量的分类
环境变量可以简单的分成用户自定义的环境变量以及系统级别的环境变量。

* 用户级别环境变量定义文件：`~/.bashrc`、`~/.profile`（部分系统为：`~/.bash_profile`）
* 系统级别环境变量定义文件：`/etc/bashrc`、`/etc/profile`(部分系统为：`/etc/bash_profile`）
另外在用户环境变量中，系统会首先读取`~/.bash_profile`（或者`~/.profile`）文件，如果没有该文件则读取`~/.bash_login`，根据这些文件中内容再去读取`~/.bashrc`。

## Linux环境变量文件加载详解
打开`/etc/profile`文件你会发现，该文件的代码中会加载`/etc/bash.bashrc`文件，然后检查`/etc/profile.d/`目录下的`.sh`文件并加载。

/etc/profile源码
```bash
# /etc/profile: system-wide .profile file for the Bourne shell (sh(1))
# and Bourne compatible shells (bash(1), ksh(1), ash(1), ...).

if [ "${PS1-}" ]; then
  if [ "${BASH-}" ] && [ "$BASH" != "/bin/sh" ]; then
    # The file bash.bashrc already sets the default PS1.
    # PS1='\h:\w\$ '
    if [ -f /etc/bash.bashrc ]; then
      . /etc/bash.bashrc
    fi
  else
    if [ "`id -u`" -eq 0 ]; then
      PS1='# '
    else
      PS1='$ '
    fi
  fi
fi

if [ -d /etc/profile.d ]; then
  for i in /etc/profile.d/*.sh; do
    if [ -r $i ]; then
      . $i
    fi
  done
  unset i
fi
```

技巧：我在`/etc/profile.d`创建了`finley.sh`，方便任何登录用户使用
内容：
```bash
alias ll='ls -alhS'
alias la='ls -A'
alias l='ls -CF'
alias k='kubectl'
```


## 理解 bashrc 和 profile

#### Shell 的模式
系统的 shell 有很多种, 比如 bash, sh, zsh 之类的, 
如果要查看某一个用户使用的是什么 shell 可以通过 finger [USERNAME] 命令来查看. 
我们这里只说 shell 是 bash 的情况, 因为如果是 sh 或者其他 shell 显然不会运行 bashrc 的.

#### login shell 和 no-login shell

`login shell`代表用户登入, 比如使用`su -`命令, 或者用 ssh 连接到某一个服务器上, 都会使用该用户默认 shell 启动 login shell 模式.

该模式下的 shell 会去自动执行`/etc/profile`和`~/.profile`文件, 但不会执行任何的`bashrc`文件, 所以一般在`/etc/profile`或者` ~/.profile`里我们会手动去`source bashrc`文件.

而 no-login shell 的情况是我们在终端下直接输入`bash`或者`bash -c "command"`来启动的 shell.
**该模式下是不会自动去运行任何的 profile 文件**

#### interactive shell 和 non-interactive shell

interactive shell 是交互式shell, 顾名思义就是用来和用户交互的, 提供了命令提示符可以输入命令.

该模式下会存在一个叫 PS1 的环境变量, 如果还不是`login shell`的则会去`source /etc/bash.bashrc`和`~/.bashrc`文件

non-interactive shell 则一般是通过`bash -c "command"`来执行的bash.

#### bashrc和profile的用途和区别

* ~/.profile: executed by Bourne-compatible login shells.

其实看名字就能了解大概了, profile 是某个用户唯一的用来设置环境变量的地方
因为用户可以有多个 shell 比如 bash, sh, zsh 之类的, 但像环境变量这种其实只需要在统一的一个地方初始化就可以了, 而这就是 profile.

* ~/.bashrc: executed by bash(1) for non-login shells.

bashrc 也是看名字就知道, 是专门用来给 bash 做初始化的比如用来初始化 bash 的设置, bash 的代码补全, bash 的别名, bash 的颜色. 
以此类推也就还会有 shrc, zshrc 这样的文件存在了, 只是 bash 太常用了而已.

`cat ~/.profile`查看该文件的源码

```
# ~/.profile: executed by Bourne-compatible login shells.

if [ "$BASH" ]; then
  if [ -f ~/.bashrc ]; then
    . ~/.bashrc
  fi
fi

mesg n || true
```

结论:

1. profile是包含bashrc
2. `~/.profile`文件只在用户登录的时候读取一次,profile是在用户登录后才会运行。有些Linux的发行版本不一定有profile这个文件
3.  `~/.bashrc`会在每次运行Shell脚本的时候读取一次。bashrc是在系统启动后就会自动运行

#### 一些小技巧
可以自定义一个环境变量文件，比如在某个项目下定义uusama.profile，在这个文件中使用export定义一系列变量，然后在~/.profile文件后面加上：sourc uusama.profile，这样你每次登陆都可以在Shell脚本中使用自己定义的一系列变量。

也可以使用alias命令定义一些命令的别名，比如alias rm="rm -i"（双引号必须），并把这个代码加入到~/.profile中，这样你每次使用rm命令的时候，都相当于使用rm -i命令，非常方便。

## 参考 

https://www.cnblogs.com/youyoui/p/10680329.html

https://wido.me/sunteya/understand-bashrc-and-profile
