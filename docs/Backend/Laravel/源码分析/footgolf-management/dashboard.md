1. 添加某些地址不受CSRF中间件验证
`profile.blade.php`

```php
<form method="POST" action="{{ route('admin.updateProfile') }}">
    @method('PUT')
    @csrf
    @component('components.form.form-item-input', [
        'fieldLabel' => 'admin.Name',
        'fieldName' => 'name',
        'fieldDefaultValue' => $user->name ?: '',
    ])@endcomponent
    @component('components.form.form-item-input', [
        'fieldLabel' => 'admin.Email',
        'fieldName' => 'email',
        'fieldDefaultValue' => $user->email ?: '',
    ])@endcomponent
    @component('components.form.form-item-submit')@endcomponent
</form>
```

@component相当于php的require_once功能，唯一不同的是你可以带入变量,而且可以复用一些html

`@component("所引用的文件的相对路径。以views文件夹为起点", ["变量名字"=>"变量值"])
 @endcomponent`


控制器部分
更新逻辑写在了模型中，这样比较好

```php
public function updateProfile(UpdateProfileRequest $request) {
    request()->user()->updateProfile($request->only([
        'email',
        'name',
    ]));
    return redirect(route('admin.profile'));
}
```
