1. Promise 与 Observable
Promise 不多解释，这俩对象都可以处理异步数据，Observable 因为可以接收更多的操作符，功能更强些。
Observable 提供的 toPromise 方法，将 Observable 转换为 Promise

例1：
```javascript
  async testOf() {
    return await this.service.getUserList().toPromise().then(res => {
      return res;
    })
  }

```
读数据
```javascript
ngOnInit() {
    this.testOf().then(res => {
      console.log(res);
    })
}
```

例2
```javascript
ngOnInit() {
  this.initData(response.creativeId)
}


async initData(creativeId) {
    const detailResponse = await this.service.getCreativeDetail(creativeId).toPromise();
    const assetResponse = await this.service.getCreativeVideoImageUrl(creativeId).toPromise();
    const {data: detailData} = detailResponse;
    const {data: assetData} = assetResponse;
```
