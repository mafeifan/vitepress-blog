VAT (Value Added Tax)，是欧盟各国联邦税务局规定的“销售增值税”。海外商家和个人纳税者在欧盟各国本地的经营和服务活动，都需要注册VAT税号并履行税务申报义务。

如果您的产品使用欧盟各国本地仓储进行发货或物品所在地为欧盟各国，就属于欧盟VAT销售增值税应缴范畴，即便您使用的海外仓储服务是由第三方物流公司提供，也从未在欧盟各国当地开设办公室或者聘用当地员工，您仍然需要交纳VAT增值税。

不缴纳 VAT 的危害：
1、货物出口无法享受进口增值税退税；

2、货物可能被扣无法清关；

3、难以保证电商平台正常销售；

4、不能提供有效的VAT发票，降低海外客户成交率及好评率...

在线验证：https://ec.europa.eu/taxation_customs/vies/?locale=en

使用代码
```php
$client = new \SoapClient('http://ec.europa.eu/taxation_customs/vies/checkVatService.wsdl');
$a = $client->checkVat(array(
    'countryCode' => 'NL',
    'vatNumber' => '807705111B01',
));

var_dump($a->valid);
```
