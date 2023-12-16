[wkhtmltopdf](https://wkhtmltopdf.org/)
是用C实现的生成pdf的开源软件。可以基于网址或html生成对应的PDF文件。
对OSX, linux, windows平台都提供了对应的支持。

[snappy](https://github.com/KnpLabs/snappy)是一个对wkhtmltopdf封装的类库，使用非常简单。

而这里介绍的 [laravel-snappy](https://github.com/barryvdh/laravel-snappy) 则又是对snappy的封装，只不过方便集成到`Laravel`框架中。

在使用 laravel-snappy 之前我建议先浏览下 [wkhtmltopdf官方文档](https://wkhtmltopdf.org/usage/wkhtmltopdf.txt)
wkhtmltopdf下载后之后就是一个bin二进制文件，提供了非常多的参数。

这里介绍下怎么在Laravel6中使用laravel-snappy并生成pdf文件

1. 首先下载安装wkhtmltopdf，以Ubuntu为例，来到https://wkhtmltopdf.org/downloads.html下载对应的版本
```shell
# 下载安装包
wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1.
bionic_amd64.deb
# 安装
sudo dpkg -i wkhtmltox_0.12.6-1.bionic_amd64.deb
# 如果报错，如缺少依赖，可以执行下面这个
sudo apt-get -f install

# 检查是否安装成功 
which wkhtmltopdf
# 输出
/usr/local/bin/wkhtmltopdf
which wkhtmltoimage
# 输出
/usr/local/bin/wkhtmltoimage

```

2. 按照 laravel-snappy 教程，添加Facade，生成config/snappy.php

3. 新建`resources/views/pos/receipt-pdf.blade.php`模板, 这里面有一些变量需要Controller传给视图，需要注意字体和图片的引用。
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>RECEIPT</title>
    <style type="text/css">
        .container-fluid {
            width: 100%;
            padding-right: 15px;
            padding-left: 15px;
            margin-right: auto;
            margin-left: auto;
        }
        @font-face {
            font-family: 'Microsoft YaHei';
            src: url('file://{{ public_path('fonts/msyh.ttc') }}') format('truetype');
            font-weight: normal;
            font-style: normal;
        }
        body {
            font-family: 'Microsoft YaHei';
            margin: 20px 40px;
            color: #222222;
        }
        thead {
            display: table-header-group;
        }
        tfoot {
            display: table-row-group;
        }
        tr {
            page-break-inside: avoid;
        }
        .mt-5 {
            margin-top: 3rem;
        }
        .mb-5 {
            margin-bottom: 3rem;
        }
        .font-bolder {
            font-weight: bolder;
        }
        .text-center {
            text-align: center;
        }
        .bottom-none {
            border-bottom: none !important;
        }
        .float-left {
            float: left !important;
        }
        .float-right {
            float: right !important;
        }
        .text-gray {
            color: #95aac9;
        }
        .text-danger {
            color: #dc3545 !important;
        }
        .table-receipt td {
            padding: 5px;
        }
        .table-items tr > td {
            border-bottom: 1px solid #dee2e6;
            padding: 15px;
        }
        .table-items tr > td:first-child {
            padding-left: 0;
        }
        .table-items tr > td:last-child {
            padding-right: 0;
        }
        tr.header {
            color: #95aac9;
        }
        tr.header > td {
            padding-top: 25px
        }
    </style>
</head>
<body>
<div class="container-fluid">
    <div class="text-center">
        <img height="auto" src="{{ public_path('images/logo-black.png') }}"/>
        <h1>Receipt from {{data_get($companyInfo, 'comName')}}</h1>
        <p class="text-gray" style="font-size: 18pt">Transaction ID: {{ $transactionID }}</p>
    </div>
    <table border="0" cellpadding="0" cellspacing="0" style="width: 100%" class="table-receipt">
        <thead>
        <tr class="header">
            <td align="left">INVOICED FROM</td>
            <td align="right">INVOICED TO</td>
        </tr>
        </thead>
        <tbody>
        <tr class="font-bolder">
            <td>{{ data_get($companyInfo, 'comName')}}</td>
            <td align="right">Guest</td>
        </tr>
        <tr>
            <td>{{ data_get($companyInfo, 'comAddress1')}}</td>
            <td align="right">--</td>
        </tr>
        <tr>
            <td>{{ data_get($companyInfo, 'comAddress2')}}</td>
            <td align="right">--</td>
        </tr>
        <tr class="header">
            <td>INVOICE ID</td>
            <td align="right">PAYMENT AT</td>
        </tr>
        <tr class="font-bolder">
            <td>{{ $transactionID }}</td>
            <td align="right">{{ date('m-d-Y') }} at {{ date('H:i:s') }}</td>
        </tr>
        <tr class="header">
            <td>PAGE</td>
            <td align="right">PAYMENT METHOD</td>
        </tr>
        <tr class="font-bolder">
            <td>1 of 1</td>
            <td align="right">{{ data_get($payMethod, 'label') }}</td>
        </tr>
        </tbody>
    </table>
    <hr class="mt-5" style="border: 1px solid #95aac9;opacity: 10%;">
    <h3 class="text-gray text-center">THANK YOU FOR YOUR ORDER!</h3>
    <h3 class="text-gray text-center">WE HOPE TO SEE YOU AGAIN SOON!</h3>
</div>
</body>
</html>
```

4. Controller中添加生成pdf方法
sendReceiptEmail是发送发票到客户邮箱中，需要先调用exportToPDF生成pdf格式的发票，然后作为邮箱附件发送出去。

```php
    public function exportToPDF($pdfData) {
        $blade = 'pos.receipt-pdf';
        $pdf = \App::make('snappy.pdf.wrapper');
        // 传给pdf视图模板的变量，有可能是从数据库或session中获取，这里不展开
        $body = \View::make($blade, $pdfData)->render();
        $pdf->loadHTML($body)->setPaper('a4');
        // 这里的参数其实是wkhtmltopdf的，文档里都可以查到，由于我们引用了本地图片和字体，需要开启本地访问文件权限
        $pdf->setOption('enable-local-file-access', true);
        $pdf->setOption('margin-top', '5mm');
        $pdf->setOption('margin-bottom', '5mm');
        $pdf->setOption('margin-left', '5mm');
        $pdf->setOption('margin-right', '5mm');
        return $pdf;
    }

    public function sendReceiptEmail(Request $request) {
        // 保存pdf的临时路径
        $pdfPath = storage_path('app/order-receipt/tmp/tmp.pdf');
        if (file_exists($pdfPath)) {
            \File::delete($pdfPath);
        }
        
        // 先获取pdf需要的数据
        $pdfData = $this->processPdfData($request);
        
        // 生成pdf
        $pdf = $this->exportToPDF($pdfData);

        // 保存成功，作为附件发送出去
        if ($pdf->save($pdfPath)) {
            Mail::to('mafeifan@qq.com')
                ->send(new PosOrderReceipt());
        }
    }

```

app/Mail/PosOrderReceipt.php
```php
<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PosOrderReceipt extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * Create a new message instance.
     *
     * @return void
     */
    public function __construct()
    {

    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        $location = storage_path('app/order-receipt/tmp/tmp.pdf');
        return $this
            ->view('emails.pos.order-receipt', [
            ])
            ->attach($location, [
                'as' => 'receipt.pdf',
                'mime' => 'application/pdf']);
    }
}

```


### 注意事项
1. 如果不开启`enable-local-file-access`引用本地文件时会报类似`Blocked access to file /DemoProjectPath/public/images/logo-black.png↵`的错误
2. 而且路径`storage_path('app/order-receipt/tmp/tmp.pdf')`也需要有访问权限，可使用chmod 755解决


### 参考
https://segmentfault.com/a/1190000018988358

https://wkhtmltopdf.org/usage/wkhtmltopdf.txt
