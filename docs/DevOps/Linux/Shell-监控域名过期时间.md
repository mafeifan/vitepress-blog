两个脚本都可以使用，任选一个就行。

使用方法 `check.sh baidu.com` 输出剩余天数


```bash
#! /usr/bin/env bash
# host baidu.com，不用带 https://www
host=$1
port=${2:-"443"}

end_date=`timeout 6 openssl s_client -host $host -port $port -showcerts  </dev/null 2>/dev/null |
        sed -n '/BEGIN CERTIFICATE/,/END CERT/p' |
        openssl x509 -text 2> /dev/null |
        sed -n 's/ *Not After : *//p'`

if [ -n "$end_date" ];then
   # 把时间转换为时间戳
   end_date_seconds=`date '+%s' --date "$end_date"`
   # 获取当前时间
   now_seconds=`date '+%s'`
   echo "($end_date_seconds-$now_seconds)/24/3600" | bc
fi
```


```bash
#! /usr/bin/env bash

host=$1
port=${2:-"443"}


end_date=`echo | timeout 6 openssl s_client -servername ${host} -connect ${host}:${port} 2>/dev/null |
	openssl x509 -noout -dates | grep notAfter | awk -F "=" '{print $NF}'`

if [ -n "$end_date" ];then
   # 把时间转换为时间戳
   end_date_seconds=`date '+%s' --date "$end_date"`
   # 获取当前时间
   now_seconds=`date '+%s'`
   echo "($end_date_seconds-$now_seconds)/24/3600" | bc
fi
```

