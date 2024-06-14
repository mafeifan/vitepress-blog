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