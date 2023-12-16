
### 图片验证码(也依赖了下面的图片类库)
https://github.com/mewebstudio/captcha

### 图片处理 裁剪，加水印
http://image.intervention.io/
https://learnku.com/articles/14292/laravel-uses-interventionimage-to-process-pictures

### 媒体库
https://github.com/spatie/laravel-medialibrary

### XSS 安全漏洞处理组件
https://packagist.org/packages/mews/purifier

有时候需要对用户自己输入的内容做限制或过滤
使用方法
1. composer install mews/purifier
2. config目录下新建 purifier.php
配置允许的html内容
```php
<?php

return [
    'encoding'      => 'UTF-8',
    'finalize'      => true,
    'cachePath'     => storage_path('app/purifier'),
    'cacheFileMode' => 0755,
    'settings'      => [
        'user_topic_body' => [
            'HTML.Doctype'             => 'XHTML 1.0 Transitional',
            'HTML.Allowed'             => 'div,b,strong,i,em,a[href|title],ul,ol,ol[start],li,p[style],br,span[style],img[width|height|alt|src],*[style|class],pre,hr,code,h2,h3,h4,h5,h6,blockquote,del,table,thead,tbody,tr,th,td',
            'CSS.AllowedProperties'    => 'font,font-size,font-weight,font-style,margin,width,height,font-family,text-decoration,padding-left,color,background-color,text-align',
            'AutoFormat.AutoParagraph' => true,
            'AutoFormat.RemoveEmpty'   => true,
        ],
    ],
];

```

3. 在需要过滤的地方
`$topic->body = clean($topic->body);`

