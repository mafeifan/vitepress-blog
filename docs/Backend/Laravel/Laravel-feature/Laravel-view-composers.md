通常情况下，我们都是在`Controller`中获取数据然后使用view方法将数据传送到视图中，比如下面

TopicsController.php

```php
  public function create(Topic $topic)
  {
    $categories = Category::all();
    return view('topics.create_and_edit', compact('topic', 'categories'));
  }
```

这种思路是：路由->控制器->获取数据->渲染到视图

但是有时候有某一个视图片段需要在好几个页面中共同使用，有没有方法先指定视图中，然后告诉从哪加载数据呢？

使用[视图合成器view composers](https://learnku.com/docs/laravel/6.x/views/5141#view-composers)可以轻松实现

## 需求

项目中的左侧菜单栏，是一个单独的组件view,位置在`resources/views/includes/_sidebar.blade.php`
其数据需要单独获取，不希望放到controller中。

注意，这里有一个menu表，用来存放具体的一二级菜单信息，因为系统需求是根据不同用户角色加载并显示不同的菜单列表，存到数据库而不是写死到代码中。
Menu模型中的getMenuItems方法用来根据角色查询菜单项

1. 创建一个`App\Http\View\Composers\SidebarComposer`类

```php
<?php

namespace App\Http\View\Composers;

use App\Models\Employee;
use Illuminate\View\View;

class SidebarComposer
{

    protected $menuList;

    public function __construct(Menu $menu)
    {
        $this->menuList = $menu->getMenuItems();
    }

    public function compose(View $view)
    {
        $view->with('menuList', $this->menuList);
    }
}
```

2. 修改`app/Providers/AppServiceProvider.php`
boot方法内添加
```php
view()->composer('includes._sidebar', 'App\Http\View\Composers\SidebarComposer');
```

3. `includes._sidebar` 可以放到`layous/backend.blade.php`等任何需要的地方


## 参考

https://learnku.com/docs/laravel/6.x/views/5141#view-composers
