收集一些模型的使用技巧，应该Laravel6以上都支持，以官方文档为准

### 1. 嵌套作用域查询

Laravel 支持将查用的查询封装为[作用域](https://learnku.com/docs/laravel/6.x/eloquent/5176#local-scopes)

此技巧从[larabbs源码](https://github.com/summerblue/larabbs/blob/L02_8.x/app/Models/Topic.php#L30)中学到
功能需求：首页的列表排序功能，可按照发布时间和回复时间排序

Controller中
```php
    public function index(Request $request, Topic $topic, User $user)
    {
        // scopeWithOrder
        $topics = $topic->withOrder($request->order)
                        ->with('user', 'category')  // 预加载防止 N+1 问题
                        ->paginate(20);

        return view('topics.index', compact('topics'));
    }
```
其中 withOrder 是 本地作用域

Model 中 scopeWithOrder 又包含了两个小作用域
```php
    public function scopeWithOrder($query, $order)
    {
        // 不同的排序，使用不同的数据读取逻辑
        switch ($order) {
            case 'recent':
                $query->recent();
                break;

            default:
                $query->recentReplied();
                break;
        }
    }
    
    public function scopeRecentReplied($query)
    {
        // 当话题有新回复时，我们将编写逻辑来更新话题模型的 reply_count 属性，
        // 此时会自动触发框架对数据模型 updated_at 时间戳的更新
        return $query->orderBy('updated_at', 'desc');
    }

    public function scopeRecent($query)
    {
        // 按照创建时间排序
        return $query->orderBy('created_at', 'desc');
    }
    
```

### 2. 在 find 方法中指定属性

```php
User::find(1, ['name', 'email']);
User::findOrFail(1, ['name', 'email']);
```

### 3. Clone 一个 Model

```php
$user = User::find(1);
$newUser = $user->replicate();
$newUser->save();
```

### 4. 判断两个 Model 是否相同

```php
$user = User::find(1);
$sameUser = User::find(1);
$diffUser = User::find(2);
$user->is($sameUser); // true
$user->is($diffUser); // false;
```

### 5. 重新加载一个 Model

```php
$user = User::find(1);
$user->name; // 'Peter'
// 如果 name 更新过，比如由 peter 更新为 John
$user->refresh();
$user->name; // John
```

### 6. 加载新的 Model

```php
$user = App\User::first();
$user->name;    // John
//
$updatedUser = $user->fresh(); 
$updatedUser->name;  // Peter
$user->name;    // John
```

### 7. 更新带关联的 Model

在更新关联的时候，使用 push 方法可以更新所有 Model

```php
class User extends Model
{
  public function phone()
  {
    return $this->hasOne('App\Phone');
  }
}
$user = User::first();
$user->name = "Peter";
$user->phone->number = '1234567890';
$user->save(); // 只更新 User Model
$user->push(); // 更新 User 和 Phone Model
```
 
### 8. 自定义软删除字段

Laravel 默认使用 deleted_at 作为软删除字段，我们通过以下方式将 deleted_at 改成 is_deleted

```php
class User extends Model
{
 use SoftDeletes;
  * deleted_at 字段.
  *
  * @var string
  */
 const DELETED_AT = 'is_deleted';
}
```

或者使用访问器

```php
class User extends Model
{
  use SoftDeletes;
  
  public function getDeletedAtColumn(){
    return 'is_deleted';
  }
}
```


### 9. 查询 Model 更改的属性


```php
$user = User::first();
$user->name; // John
$user->name = 'Peter';
$user->save();
 
dd($user->getChanges());
// 输出：
[
 'name' => 'John',
 'updated_at' => '...'
]
```


### 10. 查询 Model 是否已更改

```php
$user = User::first();
$user->name;    // John
$user->isDirty();  // false 
$user->name = 'Peter'; 
$user->isDirty();  // true
$user->getDirty();  // ['name' => 'Peter']
$user->save();   
$user->isDirty();  // false
```

getChanges() 与 getDirty() 的区别

getChanges() 方法用在 save() 方法之后输出结果集

getDirty() 方法用在 save() 方法之前输出结果集

### 11. 查询修改前的 Model 信息

```php
$user = App\User::first();
$user->name;     //John
$user->name = "Peter";   //Peter
$user->getOriginal('name'); //John
$user->getOriginal();   //Original $user record
```

### 12. 使用 withDefault 保持返回格式统一

```php
public function _city()
{
    return $this->hasOne(City::class, 'id', 'city_id');
}
```

比如 student 和 city 是一对一关系，如果一个 student 表中 city 字段为空，返回的结果可能是

`{name: "jack", _city: null}`

这样会造成的问题是前端如果使用了`student._city.name`会造成undefined等错误。
为了避免可以改为
```php
public function _city()
{
    return $this
        ->hasOne(City::class, 'id', 'city_id')
        ->withDefault([
          'name' => '',
        ]);
}
```
这样即使找不到也不会报错
返回的结果是:
`{name: "jack", _city: {id: null, name: ""}}`

### 13. 使用 wasRecentlyCreated 判断model刚刚是更新还是插入

```php
  $model = Message::updateOrCreate(
      [
          'msgNr' => $request->input('msgNr')
      ],
      [
          'msgTitle' => $request->input('msgTitle'),
          'msgText' => $request->input('msgText'),
          'msgTimeStamp' => date('Y-m-d H:i:s'),
      ]);
  
  $result = Message::with('Employee:empNr,empName','MessageOpened:msoMsgNr,msoTimeStamp')
      ->whereRaw('now() between msgFrom and msgTo')
      ->orderBy('msgFrom')
      ->get();;
  // 只有更新message记录了才发广播
  if ($model->wasRecentlyCreated) {
      broadcast(new \App\Events\MessageCreatedEvent($result));
  }
  return $this->sendOk($result);
```

### 14. 使用 withCount 动态插入属性

Flight 和 FlightPlayers是一对多关系，需要获取某Flight下所有的players，并包含players的个数
```php
Flight::withCount('flightPlayers')->where('fltNr', 9451973)->get()

//  传递到 withCount() 方法的每一个参数，最终都会在模型实例中创建一个参数名添加了 _count  后缀的属性。

// 返回的记录，flight_players_count动态创建的
/*
[{
	"fltNr": 9451973,
	"fltComNr": 9,
	"fltRefType": null,
	"fltRefNr": null,
	"fltDate": 738084,
   ......
	"flight_players_count": 2
}]
*/

//  获取属性
Flight::withCount('flightPlayers')->where('fltNr', 9451973)->first()->flight_players_count;

//  支持别名

Flight::withCount('flightPlayers as count')->where('fltNr', 9451973)->get();
```
