在插入和更新数据表时要实现 create_at, update_at 字段的自动更新，一般框架都有这个功能。

Symfony中一般有两种方法：
1. 使用 doctrine 的事件机制
2. 使用 doctrine-extensions-bundle 类库提供的 timestampable 功能。

第一种，比较麻烦你需要在每个entity文件中定义时间类型的set，get方法还有，调用PrePersist 和 PreUpdate 生命周期钩子的方法。
例子如下：
```
<?php

namespace Finley\BlogBundle\Entity;
use Doctrine\ORM\Mapping as ORM;

/**
 * Setting
 *
 * @ORM\Table(name="setting")
 * @ORM\Entity(repositoryClass="Finley\BlogBundle\Repository\SettingRepository")
*  不要忘了这行, 表示启用声明周期钩子
 * @ORM\HasLifecycleCallbacks
 */
class Setting
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var \DateTime $created
     *
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $created;

    /**
     * @var \DateTime $updated

     */
    private $updated;

    public function setCreated($created)
    {
        $this->created = $created;
        return $this;
    }

    public function getCreated()
    {
        return $this->created;
    }


    public function getUpdated()
    {
        return $this->updated;
    }

    public function setUpdated($updated)
    {
        $this->updated = $updated;
        return $this;
    }

    /**
     * 自动更新时间类型，不要忘了在 Class 上面加注解 ORM\HasLifecycleCallbacks
     *
     * @ORM\PrePersist
     * @ORM\PreUpdate
     */
    public function updatedTimestamps()
    {
        $this->setUpdated(new \DateTime('now'));

        if ($this->getCreated() == null) {
            $this->setCreated(new \DateTime('now'));
        }
    }
}
```

第二种:
需要安装配置 [doctrine-extensions-bundle](https://symfony.com/doc/master/bundles/StofDoctrineExtensionsBundle/index.html)
我因为对 Symfony 还不熟悉，所以花了一些时间。
在`config.yml`中，原来的内容是
```
orm:
  auto_generate_proxy_classes: '%kernel.debug%'
  naming_strategy: doctrine.orm.naming_strategy.underscore
  auto_mapping: true   # 默认是在 Entity 命名空间下找 entity 文件
```
需要定义如何找entity文件，FinleyBlogBundle是我的自定义Bundle。
```
    orm:
        entity_managers:
            default:
                mappings:  #  php bin/console doctrine:mapping:info
                    FinleyBlogBundle:
                        type: annotation
                        prefix: Finley\BlogBundle\Entity
                        is_bundle: true
                    gedmo_translatable:
                        type: annotation
                        prefix: Gedmo\Translatable\Entity
                        dir: "%kernel.root_dir%/../vendor/gedmo/doctrine-extensions/lib/Gedmo/Translatable/Entity"
                        alias: GedmoTranslatable # (optional) it will default to the name set for the mapping
                        is_bundle: false
                    gedmo_translator:
                        type: annotation
                        prefix: Gedmo\Translator\Entity
                        dir: "%kernel.root_dir%/../vendor/gedmo/doctrine-extensions/lib/Gedmo/Translator/Entity"
                        alias: GedmoTranslator # (optional) it will default to the name set for the mapping
                        is_bundle: false
                    gedmo_loggable:
                        type: annotation
                        prefix: Gedmo\Loggable\Entity
                        dir: "%kernel.root_dir%/../vendor/gedmo/doctrine-extensions/lib/Gedmo/Loggable/Entity"
                        alias: GedmoLoggable # (optional) it will default to the name set for the mapping
                        is_bundle: false
                    gedmo_tree:
                        type: annotation
                        prefix: Gedmo\Tree\Entity
                        dir: "%kernel.root_dir%/../vendor/gedmo/doctrine-extensions/lib/Gedmo/Tree/Entity"
                        alias: GedmoTree # (optional) it will default to the name set for the mapping
                        is_bundle: false
```
同时，记得在最下面添加，开启功能
```
stof_doctrine_extensions:
    orm:
        default:
            timestampable: true
```
然后entity文件就清爽了许多，只需为create和update添加注解。不需要set和get方法了。
```
    /**
     * @var \DateTime $created
     *
     * @Gedmo\Timestampable(on="create")
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $created;

    /**
     * @var \DateTime $updated
     *
     * @Gedmo\Timestampable(on="update")
     * @ORM\Column(type="datetime", nullable=true)
     */
    private $updated;
```

有个小细节：
使用第一种方法，只要执行update更新，updated字段的值就会改变。
而使用第二种方法，如果更新之后影响的行数 afftectd rows 是0，updated字段的值不会发生改变。

参考：
https://www.doctrine-project.org/projects/doctrine-orm/en/current/tutorials/getting-started.html
https://symfonycasts.com/screencast/symfony2-ep3/doctrine-extensions
