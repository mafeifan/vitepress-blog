媒体文件管理扩展包

支持多媒体文件上传，下载，多个上传，图片压缩，转换处理(需安装依赖)

缺点：如果要结合Vue或React进行上传，需要使用的Pro版本，但是要额外收费

使用起来比较简单，以v7版本为例

1. 运行下面的命令
```bash
composer require spatie/laravel-medialibrary

php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="migrations"

php artisan migrate
```

主要是生成一个media表

2. 建议添加一个filesystem配置项，与其他的区分开

config/filesystems.php
```php
'media' => [
    'driver' => 'local',
    'root'   => storage_path('app/public/media'),
    'url' => env('APP_URL').'/storage/media',
    'visibility' => 'public',
],
```

3. 运行`php artisan storage:link `

4. 以Note模块为例，添加封面图功能

```php
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia\HasMedia;
use Spatie\MediaLibrary\HasMedia\HasMediaTrait;

class Note extends Model implements HasMedia
{
    // 对应filesystem的配置项
    const COVER_MEDIA_DISK = 'media';

    // 图集名称
    const COVER_MEDIA_COLLECTION_NAME = 'note.cover';

    use HasMediaTrait;

    /**
     * 上传图片到media
     * @param Request $request
     * @throws \Spatie\MediaLibrary\Exceptions\FileCannotBeAdded\DiskDoesNotExist
     * @throws \Spatie\MediaLibrary\Exceptions\FileCannotBeAdded\FileDoesNotExist
     * @throws \Spatie\MediaLibrary\Exceptions\FileCannotBeAdded\FileIsTooBig
     */
    public function updateCoverFromRequest(Request $request)
    {
        if ($request->hasFile('cover')) {
            $this->addMedia($request->file('cover'))
                ->preservingOriginal()
                ->toMediaCollection(self::COVER_MEDIA_COLLECTION_NAME, self::COVER_MEDIA_DISK);
        }
    }

    /**
     * 获取图片
     * @return string
     */
    public function getCoverAttribute()
    {
        return $this->getFirstMediaUrl(self::COVER_MEDIA_COLLECTION_NAME);
    }
```

5. 更新控制器

```php
    ...

    public function edit(Note $note)
    {
        return view('notes.edit', compact('note'));
    }

    public function store(Request $request)
    {
        $this->validate($request, [
            'cover' => 'file',
            'title' => 'required',
            'body'  => 'required'
        ]);

        $note = Note::create([
            'user_id' => $request->user()->id,
            'title'   => $request->title,
            'slug'    => Str::slug(($request->title) . Str::random(10)),
            'body'    => $request->body
        ]);

        // 更新封面图
        $note->updateCoverFromRequest($request);

        return redirect('/');
    }
```

6. 更新view

```html
 <img src="{{$note->cover}}" alt="">
```

laravel-medialibrary的功能还是比较强大的，对接也比较方便，详细内容可以参照官方文档

## 参考
https://spatie.be/docs/laravel-medialibrary/v7/installation-setup
