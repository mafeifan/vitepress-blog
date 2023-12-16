1. 先看[官方文档](https://symfony.com/doc/master/bundles/StofDoctrineExtensionsBundle/index.html)
2. 在config.yml 添加 filter
```
    orm:
        entity_managers:
            default:
                filters:
                    softdeleteable:
                        class: Gedmo\SoftDeleteable\Filter\SoftDeleteableFilter
                        enabled: true
```
并且在最下面的启用
```
stof_doctrine_extensions:
    orm:
        default:
            softdeleteable: true
```
3. 修改要使用软删除功能的setting
在Class上头添加 
```
use Gedmo\Mapping\Annotation as Gedmo;
@Gedmo\SoftDeleteable(fieldName="deleted_at", timeAware=false)/
```
然后配置字段, 注意字段名要一致
```
    /**
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $deleted_at;
```

参考：
https://symfony.com/doc/master/bundles/StofDoctrineExtensionsBundle/index.html
https://www.cnblogs.com/wlemory/p/5224482.html
