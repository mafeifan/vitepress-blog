今天我们来爬取专供初学者练习爬虫的网站 [http://books.toscrape.com/](http://books.toscrape.com/)
这是一个图书网站，默认有50页，每页会展示20本书，我们要一次性把所有图书的标题和价格全部抓取下来。
> ![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-a9e30e5c213f396a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

过程其实非常简单
1. 新建项目 `scrapy startproject book`
2. `cd book; tree # 查看下项目结构`
3. spiders 目录下新建文件 `book_spider.py` 或者使用命令
`scrapy genspider books books.toscrape.com` 会生成 books.py文件
```
# -*- coding: utf-8 -*-
import scrapy


class BooksSpider(scrapy.Spider):
    name = 'books'
    allowed_domains = ['books.toscrape.com']
    start_urls = ['http://books.toscrape.com/']

    def parse(self, response):
        pass

```
4. 分析 html 结构，先通过chrome的开发者工具的审查元素功能
结合命令行 `scrapy shell "http://books.toscrape.com/"`

更新 book_spider.py 为如下，内容非常简单
```
import scrapy


class BooksSpider(scrapy.Spider):
    name = "books"
    start_urls = [
        'http://books.toscrape.com/',
    ]

    def parse(self, response):
        for book in response.css('article.product_pod'):
            # 选择器可以通过命令行工具就行调试
            yield {
                # xpath 语法 @ATTR 为选中为名ATTR的属性节点
                'name': book.xpath('h3/a/@title').get(),
                'price': book.css('p.price_color::text').get(),
            }
```

5. 测试输出结果 `scrapy crawl books -o book.jl`
> jl 是 json line格式
6. 为了完整抓取，来处理分页
```
class BooksSpider(scrapy.Spider):
    # 爬取命令 scrapy crawl books
    name = "books"

    start_urls = [
        'http://books.toscrape.com/',
    ]

    def parse(self, response):
        for book in response.css('article.product_pod'):
            yield {
                'name': book.xpath('h3/a/@title').get(),
                'price': book.css('p.price_color::text').get(),
            }

        # 检查分页
        # 提取下一页的链接
        next_url = response.css('ul.pager li.next a::attr(href)').extract_first()
        if next_url:
            next_url = response.urljoin(next_url)
            # 构造新的 Request 对象
            yield scrapy.Request(next_url, callback=self.parse)

```
解释
urljoin 是 response 对象提供的方法，传入相对地址生成绝对地址，然后再生成新的Request对象
Scrapy 本身不难，重点还是Python的基础
