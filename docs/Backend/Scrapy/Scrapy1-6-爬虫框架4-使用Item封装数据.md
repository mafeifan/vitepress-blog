```
    def parse(self, response):
        for book in response.css('article.product_pod'):
            book_item = BookItem()
            book_item['name'] = book.xpath('h3/a/@title').get(),
            book_item['price'] = book.css('p.price_color::text').get(),
            yield book_item
```
