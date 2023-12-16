## 聚合
将多个项目同时运行就称为聚合。

只需在 pom 中作如下配置即可实现聚合：
```xml
<modules>
    <module>web-connection-pool</module>
    <module>web-java-crawler</module>
</modules>
```

## 继承

在聚合多个项目时，如果这些被聚合的项目中需要引入相同的Jar，那么可以将这些Jar写入父pom中，各个子项目继承该pom即可。

父 pom 配置如下
```xml
<dependencyManagement>
    <dependencies>
          <dependency>
            <groupId>cn.missbe.web.search</groupId>
            <artifactId>resource-search</artifactId>
            <packaging>pom</packaging>
            <version>1.0-SNAPSHOT</version>
          </dependency> 
    </dependencies>
</dependencyManagement>
```

子项目 pom 配置

```xml
<parent>
  <groupId>父pom所在项目的groupId</groupId>
  <artifactId>父pom所在项目的artifactId</artifactId>
  <version>父pom所在项目的版本号</version>
</parent>
 <parent>
  <artifactId>resource-search</artifactId>
  <groupId>cn.missbe.web.search</groupId>
  <version>1.0-SNAPSHOT</version>
</parent>

```