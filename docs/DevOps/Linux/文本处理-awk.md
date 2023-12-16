测试文件 awk1.txt, 内容如下：
```
root:x:0:0:root:/root:/usr/bin/zsh
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
```

```bash
# -F 指定分隔符为:然后提取第一个字段。
awk -F ':' '{ print $1 }' awk1.txt

root
daemon
bin
sys
sync

# 提取最后一个字段
awk -F ":" '{print $NF}' awk1.txt

/usr/bin/zsh
/usr/sbin/nologin
/usr/sbin/nologin
/usr/sbin/nologin
/bin/sync


# 提取倒数第二字段
awk -F ":" '{print $(NF-1)}' awk1.txt

/root
/usr/sbin
/bin
/dev
/bin

# 带上行号和分隔符
awk -F ":" '{print NR ")" $1}' awk1.txt

1)root
2)daemon
3)bin
4)sys
5)sync

# 输出最后一行
awk 'END {print}' awk1.txt

tail -n 1 filename

1)root
2)daemon
3)bin
4)sys
5)sync


# awk提供了函数

awk -F ':' '{ print toupper($1) }' awk1.txt

ROOT
DAEMON
BIN
SYS
SYNC

# print命令前面是一个正则表达式，只输出包含usr的行。

awk -F ':' '/usr/ {print $1}' awk1.txt

# 也可以结合 grep 达到同样的效果
cat awk1.txt | grep "/usr/" | awk -F ':' '{print $1}'

# 输出奇数行， NR 理解成 number row 
awk -F ':' 'NR % 2 == 1 {print $1}' awk1.txt

# 输出第三行以后的行
awk -F ':' 'NR >3 {print $1}' awk1.txt

输出第一个字段等于指定值的行
awk -F ':' '$1 == "root" || $1 == "bin" {print $1}' awk1.txt

root
bin


# 输出第一个字段的第一个字符大于m的行
awk -F ':' '{if ($1 > "m") print $1}' awk1.txt

root
sys
sync

cat test
a
aa
ab
b

$ awk '{if ($1>"a") print $1}' test
aa
ab
b
c

$ awk '{if ($1>"aa") print $1}' test
ab
b
c

# 使用else
awk -F ':' '{if ($1 > "m") print $1; else print "---"}' awk1.txt

root
---
---
sys
sync
```