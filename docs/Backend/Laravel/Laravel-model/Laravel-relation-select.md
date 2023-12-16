关联查询指定表的字段

Flight表关联了多张表，如果不指定字段，默认会返回所有，显得找起来很麻烦，尤其是表中很多字段的情况！
```php
$result = Flight::query()
->where(['fltNr' => $id])->with([
    'flightPlayers',
    'flightPlayers.relation',
    'flightPlayers.greenfee',
    'flightPlayers.sales',
    'flightPlayers.sales.item',
    'flightPlayers.sales.salesTransaction',
])->first();
```

输出结果

```json
{
	"fltNr": 9451976,
	"fltComNr": 9,
	"fltRefType": null,
	"fltRefNr": null,
	"fltDate": 738084,
	"fltTime1Booked": 580,
	"fltTimeFixedYN": null,
	"fltTime1": 580,
	"fltBreakTime": null,
	"fltTime2": 720,
	"fltCrlNr1": 44,
	"fltCrlNr2": 0,
	"fltAloneYN": null,
	"fltHole": null,
	"fltOrigin": null,
	"fltSize": 3,
	"fltCheckedIn": 0,
	"fltTimestamp": "2020-08-20 15:51:37",
	"fltCarNr": null,
	"fltNotes": null,
	"fltDownPaymentPerc": null,
	"fltPaid": null,
	"fltAgtNr": null,
	"fltHotNr": null,
	"fltOptionDate": null,
	"fltCcard1": null,
	"fltCcard2": null,
	"fltCcardExpMonth": null,
	"fltCcardExpYear": null,
	"fltCcardCode": null,
	"fltCcard3": null,
	"fltCcard4": null,
	"fltResNr": null,
	"fltCost": null,
	"fltStatus": null,
	"fltHosNrLocked": 94,
	"fltCheckResult": null,
	"fltHosNr": 94,
	"fltEmpNr": 24,
	"flight_players": [{
		"flpNr": 29803563,
		"flpFltNr": 9451976,
		"flpMatch": null,
		"flpSide": 1,
		"flpRelNr": 309,
		"flpRelNrWildcard": null,
		"flpName": "Slof",
		"flpGrpNr1": null,
		"flpGrpNr2": null,
		"flpGrpNr3": null,
		"flpExtra": null,
		"flpPhone": "0172617000",
		"flpEmail": "595@mms.nl",
		"flpHandicap": 25.1,
		"flpGrfNr": 7,
		"flpGfcNr": null,
		"flpItmNr": 212,
		"flpPrice": 25,
		"flpBilNr": null,
		"flpGrfNrDiscount": null,
		"flpGfcNrDiscount": null,
		"flpItmNrDiscount": null,
		"flpDiscount": null,
		"flpSalNrDiscount": null,
		"flpVoucher": null,
		"flpScorecard": null,
		"flpQualifying": null,
		"flpCarNr": null,
		"flpIntro": null,
		"flpTeebox": null,
		"flpCheckResult": null,
		"flpRelNrMain": null,
		"flpEmailMarkNY": 1,
		"relation": {
			"relNr": 309,
			"relRelNrMain": null,
			"relComNr": 9,
			"relType": null,
			"relName": "Slof",
			"relGender": 1,
			"relFirstName": "D",
			"relPrefix": "",
			"relRtlNr": 1,
			"relAddress1": "Stik van Linschoten 22",
			"relAddress2": "Stik van Linschoten 22",
			"relCity": "Bergdorp",
			"relPostalCode": "2411 PZ",
			"relState": null,
			"relCouNr": 1,
			"relPhone": "0172617000",
			"relPhoneMobile": "0172617000",
			"relPhoneWork": "0172617000",
			"relFax": null,
			"relEmail": "595@mms.nl",
			"relEmailVerifyCode": null,
			"relEmailWork": null,
			"relDateBirth": 717929,
			"relCreatedDate": null,
			"relHandicap": 25.1,
			"relGolferId": null,
			"relMemberCode": "142",
			"relMemberType": "a",
			"relExternalId": null,
			"relDebtorId": null,
			"relMaxCredit": null,
			"relValue1": null,
			"relValue2": null,
			"relValue3": null,
			"relGrfNr": null,
			"relGrfNrDiscount": null,
			"relRelNrCompany": null,
			"relDftContactYN": null,
			"relRelNrDebtor": null,
			"relRelNrMail": null,
			"relLngNr": null,
			"relEmpNr": null,
			"relRbrNr": null,
			"relEndBlockDate": null,
			"relGrpNr1": 136,
			"relGrpNr2": 2580,
			"relGrpNr3": 2581,
			"relDontCheckYN": null,
			"relPliNr": null,
			"relSupplierYN": null,
			"relImage": "https:\/\/s3-eu-west-1.amazonaws.com\/intogolf.nl\/new-avatar\/IoXwfFyPPg545W5LGDmhfy67ksQNCncor9e7e10C.jpeg",
			"relNotes": null,
			"relActualYN": 1,
			"relHandicapYN": null,
			"relCoursePermissionYN": null,
			"relBankAccount": null,
			"relChargeBankYN": null,
			"relRttNr": null,
			"relCallName": "Dirk",
			"relVatId": null,
			"relLastChanged": null,
			"relIBAN": null,
			"relBIC": null,
			"relGolfPermitDate": null,
			"relCoursePermDate": null,
			"relRulesExam": null,
			"relHomeclub": null,
			"full_name": "D Slof",
			"age": 55
		},
		"greenfee": {
			"grfNr": 1,
			"grfComNr": 9,
			"grfOrdering": 10,
			"grfName": "Standaard Greenfee",
			"grfDateFrom": 737790,
			"grfDateTo": 738155,
			"grfIntroYN": 0,
			"grfDiscountYN": 0,
			"grfCardYN": 0,
			"grfDiscountCardYN": 0,
			"grfRounds": 0,
			"grfRoundType": 1,
			"grfCardPrice": 0,
			"grfCardDuration": 12,
			"grfCardDurationType": 0,
			"grfActualYN": 0,
			"grfWildcardYN": 0,
			"grfFreePriceYN": 1,
			"grfCardDiscount": 0,
			"grfMlaNrCard": null,
			"grfMaxPerPeriod": 0,
			"grfMaxPeriod": 0
		},
		"sales": [],
		"rateList": {
			"1": {
				"grfNr": 7,
				"grfName": "Greenfeee",
				"grfCard": 0,
				"grfDiscountCard": 0,
				"grfDiscount": 0,
				"price": 0.02,
				"itmNr": 212,
				"gfcNr": null
			}
		},
		"discountList": [{
			"grfNr": 0,
			"grfName": "...",
			"grfCard": 0,
			"grfDiscountCard": 0,
			"grfDiscount": 1,
			"price": 0,
			"itmNr": 0
		}],
		"isSelected": false,
		"flpFullName": "D Slof (Dirk)"
	}]
}
```

下面我们优化，只输出前台用到的字段
```php
$result = Flight::query()
    ->select('fltNr', 'fltDate', 'fltTime1', 'fltTime2', 'fltCrlNr1', 'fltCrlNr2')
    ->with(['flightPlayers:flpNr,flpFltNr,flpBilNr,flpRelNr,flpGrfNr,flpScorecard',
        'flightPlayers.greenfee:grfNr,grfName,grfCardPrice,grfRoundType,grfOrdering,grfDateFrom,grfDateTo',
        'flightPlayers.relation:relNr,relName,relImage,relRtlNr,relMemberCode,relCity,relPhone,relGolferId,relAddress1,relDateBirth,relEmail,relHandicap,relFirstName,relCallName,relGender,relGrpNr1,relLastChanged',
        'flightPlayers.sales:salNr,salTrnNr,salBilNr,salItmNr,salVat,salBilNr,salAmount,salTrnNr',
        'flightPlayers.sales.item:itmNr,itmName,itmPrice,itmIsgNr,itmSellYN',
        'flightPlayers.sales.salesTransaction:trnNr,trnTimestamp'
    ])
    ->where(['fltNr' => $id])
    ->first()
```

需要注意，我们需要指定主键名称。
如 Flight 表和 flightPlayers 表是一对多关联，flpNr字段是flightPlayers表的主键，大概格式就是
```
->with[
'关联表1:关联表主键1,字段1,字段2'
'多级关联表1.多级关联表2:关联表主键2,字段1,字段2'
]
```
