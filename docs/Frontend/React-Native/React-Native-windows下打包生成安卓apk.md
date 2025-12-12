 [create-react-native-app](https://github.com/react-community/create-react-native-app) 运行`npm run eject`后根目录会产生一个andriod目录和ios目录。里面就是运行打包的配置文件。
如果你是用react-native-cli 开发RN的应该一开始就有这俩目录。

比如 android 目录里面会有build.gradle，gradle.properties 等
简单说 gradle 是一个依赖管理/自动化编译测试部署打包工具。

#### 首先生成签名key
` .\keytool.exe -genkey -v -keystore D:/my-release-key.keystore -alias my-key-a
lias -keyalg RSA -keysize 2048 -validity 10000`
有个小坑是生成key的路径是D盘，因为在当前C盘生成的话在windows下可能会有权限问题。

![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-54d89723e11f1f26.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后按照这个 [教程](http://facebook.github.io/react-native/docs/signed-apk-android.html)，改动一些配置文件。

### 修改相关配置文件
在根目录的android目录下执行 ` ./gradlew assembleRelease`
后面就踩了很多坑，大多数版本问题。
比如java jdk从最新的9改为了8
gradle版本改为了最新的4.3
还报了一些缺少npm包的错误，直接npm install缺哪个装哪个就行了。

具体的见下面的文件改动

> android/build.gradle
```javascript
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    repositories {
        jcenter()
    }
    dependencies {
        /*
        这里之前是 2.2.3
        卡在这里半天，老是报 com.android.build.gradle.tasks.factory.AndroidJavaCompile.setDependencyCacheDir(Ljava/io/File;)V
        */ 
        classpath 'com.android.tools.build:gradle:2.3.2'
        // NOTE: Do not place your application dependencies here; they belong
        // in the individual module build.gradle files
    }
}

allprojects {
    repositories {
        mavenLocal()
        jcenter()
        maven {
            // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
            url "$rootDir/../node_modules/react-native/android"
        }
    }
}
```

> android/app/build.gradle
```javascript
android {
    // 这里之前是
    // compileSdkVersion 23
    // buildToolsVersion "23.0.1
    compileSdkVersion 25
    buildToolsVersion "25.0.1"
    ...
```

> android\gradle\wrapper
```javascript
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
# distributionUrl=https\://services.gradle.org/distributions/gradle-2.14.1-all.zip
distributionUrl=https\://services.gradle.org/distributions/gradle-4.3-all.zip
```

### 执行最后的打包命令 `./gradlew assembleRelease`
切换到android目录 打包成功画面
![image.png](https://pek3b.qingstor.com/hexo-blog/upload_images/71414-c8d051c756f5e652.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

注意事项：打包过程会占用大量内存，把WebStorm等大的程序关掉。
