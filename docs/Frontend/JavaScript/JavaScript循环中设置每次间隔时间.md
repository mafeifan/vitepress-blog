1. 使用setTimeout
```javascript
for(let i = 0 ; i < 5 ; i++){
  setTimeout(function(){
    console.log(i);
  }, i * 1000);
}
```


2. 结合promise写法
```javascript
function sleep(millis) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

for(let i = 0 ; i < 5 ; i++){
  sleep(i * 1000).then(() => {
    console.log(i);
  })
}
```
