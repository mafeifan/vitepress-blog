### 记录请求参数和请求内容
默认morgan没有提供记录请求参数和请求内容的方法，
但是他提供了扩展方法，如下：
```
morgan.token('requestParameters', function(req, res){
  return JSON.stringify(req.query) || '-';
});

morgan.token('requestBody', function(req, res){
  return JSON.stringify(req.body) || '-';
});

// create custom format，includes the custom token
morgan.format('live-api', ':method :url :status :requestParameters :requestBody');

app.use(morgan('live-api'));
```

### 输出日志到数据库或将日志作为参数发送到其他请求
默认日志信息是输出到命令行窗口中，能否输出到文件或数据库中呢？答案是肯定的
定义morgan的options中有个stream配置项，我们可以利用他做文章。
```
const request = require('request')
const split = require('split')

// 将日志信息作为请求参数传给其他地址，比如 Elasticsearch 日志分析系统
let httpLogStream = split().on('data', function (line) {
  request({
    url: 'localhost://192.168.1.1:8080',
    method: 'POST',
    body: line
  })
  .on('response', function(response) {
    console.log(response.statusCode) // 200
  })
});

app.use(morgan('common', {
  stream: httpLogStream
}));


// 将日志写入数据库
// 带write方法的对象
let dbStream = {
  write: function(line){
    saveToDatabase(line);  // 伪代码，保存到数据库
  }
};

// 将 dbStream 作为 stream 配置项的值
app.use(morgan('short', {stream: dbStream}));
```
