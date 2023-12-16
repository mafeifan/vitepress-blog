nginx每个location都是一个匹配目录
nginx的策略是：访问请求来时，会对访问地址进行解析，从上到下逐个匹配，匹配上就执行对应location大括号中的策略，并根据策略对请求作出相应。

总结
location目录后加"/",只能匹配目录，不加“/”不仅可以匹配目录还对目录进行模糊匹配。

而proxy_pass无论加不加“/”,代理跳转地址都直接拼接。为了加深大家印象可以用下面的配置实验测试下：
```
server {   
  listen       80;   
  server_name  localhost;   

  # http://localhost/wddd01/xxx -> http://localhost:8080/wddd01/xxx
  location /wddd01/ {           
    proxy_pass http://localhost:8080;   
  }

  # http://localhost/wddd02/xxx -> http://localhost:8080/xxx   
  location /wddd02/ {           
    proxy_pass http://localhost:8080/;    
  }

  # http://localhost/wddd03/xxx -> http://localhost:8080/wddd03*/xxx   
  location /wddd03 {           
    proxy_pass http://localhost:8080;   
  }

  # http://localhost/wddd04/xxx -> http://localhost:8080//xxx，请注意这里的双斜线，好好分析一下。
  location /wddd04 {           
    proxy_pass http://localhost:8080/;   
  }

  # http://localhost/wddd05/xxx -> http://localhost:8080/hahaxxx，请注意这里的haha和xxx之间没有斜杠，分析一下原因。
  location /wddd05/ {           
    proxy_pass http://localhost:8080/haha;    
  }

  # http://localhost/api6/xxx -> http://localhost:8080/haha/xxx   
  location /wddd06/ {           
    proxy_pass http://localhost:8080/haha/;   
  }

  # http://localhost/wddd07/xxx -> http://localhost:8080/haha/xxx   
  location /wddd07 {           
    proxy_pass http://localhost:8080/haha;   
  } 
        
  # http://localhost/wddd08/xxx -> http://localhost:8080/haha//xxx，请注意这里的双斜杠。
  location /wddd08 {           
    proxy_pass http://localhost:8080/haha/;   
  }
}
```
