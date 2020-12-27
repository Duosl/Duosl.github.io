---
title:      "Android Gradle -- Flavor"
description:   ""
tags:
    - Gradle For Android
    - Flavor
---

# Gradle For Android -- Flavor

## 1. 简介

### 1. 是什么？

> 是一个自动化的Android编译工具，会编译应用资源和源代码，然后将它们打包成可供您测试、部署、签署和分发的 APK

### 2. 编译流程

![Android应用构建流程](https://developer.android.google.cn//images/tools/studio/build-process_2x.png)

### 3. 项目结构

![Android项目基本结构](https://developer.android.google.cn/images/tools/studio/project-structure_2x.png)

- project

  - build.gradle

    > 顶级编译文件：适用于定义适合项目中所有模块的编译配置（公用配置），如
    >  buildScript中的仓库定义，Android gradle插件定义；
    > 通用属性的定义 ext

  - setting.gradle

    > 一般用于指示当前Project包含哪些module

  - gradle.properties

    > Project-wide Gradle Setting （项目范围的gradle配置），如：
    > Gradle守护进程的最大堆大小
    > 项目中是否使用AndroidX等

  - local.properties

    > Gradle的本地配置文件，一般配置Android SDK的本地路径

- moudle

  - build.gradle

    > 用于配置自定义打包选项（BuildType、sourceSets、productFlavors、 dependencies、splits等）

- gradle/wrapper

  - gradle-wrapper.jar

    > gradle脚本运行所需要的jar包

  - gradle-wrapper.properties

    > 一些gradle的参数配置，并能决定使用哪一个版本的Gradle版本

### 4. Android Gradle基本任务

- assemble

  > 为每个构建版本创建一个APK

- check

  > 运行Lint检查，如运行过程中发现问题，则终止构建

- build

  > 同时运行assemble 和 check

- clean

  > 清除所有的构建产物

## 2. Flavor

### 1. build Type (构建类型)

- debug (default)

- release (default)

- test* (default)

  > ERROR: BuildType names cannot start with 'test'

- custom

- 代码示例

  ```java
  buildTypes {
          release {
              minifyEnabled false
              proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
          }
          mytest {
              initWith(buildTypes.debug)
          }
      }
  ```

### 2. sourceSets （源集）

> - 一个源集就是一组源文件（包括源代码和资源），他们会被一起执行和编译
> - 一般用于指定不同flavor，BuildType或者variant下的资源、manifest文件等

- java.srcDir

- res.srcDir

- manifest.srcFile

- jnilibs.srcDir

- assets.srcDir

- ...

- 代码示例

  ```java
  sourceSets {
      free.java.exclude("**/*.java")
      main.res.exclude("**/*.png")
  }
  ```

### 3. flavorDimensions （风格维度）

- 优先级

- 代码示例

  ```java
  flavorDimensions "mode", "gameType"
  ```

### 4. productFlavors （产品风格、产品风味）

- 以defaultConfig为基础，对不同的flavor设置独特的配置

- 代码示例

  ```java
  productFlavors{
          free {
              dimension "mode"
              applicationId getApplicationId()
              applicationIdSuffix ".free"
              versionCode 1
              versionName ""
          }

          full {
              dimension "mode"
          }

          avalon {
              dimension "gameType"
          }
      }
  ```

### 5. dependencies

- flavorImplementation

- buildTypeImplementation

- variantImplementation

  - 需要额外的配置：configurations

    ```
    configurations {
        freeAvalonDebugImplementation {}
    }
    ```

- default

  - main

- 代码示例

  ```java
  dependencies {
      implementation project(':mylibrary')
      implementation fileTree(dir: 'libs', include: ['*.jar'])
      implementation 'androidx.appcompat:appcompat:1.0.2'

      freeImplementation 'com.google.firebase:firebase-ads:9.8.0'
      freeDebugRuntimeOnly fileTree(dir: 'libs', include: ['*.jar'])
  }

  //如果需要为变体添加依赖项，则需要以下配置(与dependences{}同级)
  configurations {
     freeDebugRuntimeOnly {}
  }
  ```

### 6. variants (变体)

- productFlavor1 + productFlavor2 + … + BuildType ==> variant

### 7. variantFilter

- 用于过滤不必要的variant

- 代码示例

  ```java
  variantFilter { variant ->
          println variant.name
          def name = variant.flavors*.name
          if (name.contains("avalon") && name.contains("free")) {
              setIgnore(true)
          }
      }
  ```

### 8. applicationVariants

- 对所有的variants进行重命名等操作

- all 遍历

- 代码示例

  ```java
  applicationVariants.all { variant ->
          def flavor = "debug"
          if (variant.productFlavors.size() > 0) {
              flavor = variant.productFlavors[0].name
          }

          variant.outputs.all { output ->

              if (buildType.name == "release") {
                  outputFileName = "${flavor}_market_V" + variant.versionName.replace(".", "_") + "_${buildType.name}" + ".apk"
              } else {
                  outputFileName = "${flavor}_market_V" + variant.versionName.replace(".", "_") + "_${buildType.name}" + ".apk"
              }

              println outputFileName

          }

          println variant.buildType
          println variant.mergedFlavor
          println variant.name
          println variant.description
          println variant.dirName
          println variant.baseName
      }
  ```

### 9. 合并规则

- 优先级

  > variant > buildType > productFlavor > main > library

### 10. buildType 和 productFlavor 的异同

- 相同点

  - 都是为了是我们的应用能够有适用于不同情况下的独立的包
  - 都继承自BaseConfigImpl类（实现了BaseConfig接口）

- 不同点

  - BuildType是互斥的，而productFlavor可以通过flavorDimensions从而进行组合
  - BuildType继承自DefaultBuildType（继承自BaseConfigImpl）
  - productFlavor继承自DefaultProductFlavor（继承自BaseConfigImpl）

## 3. Merge Manifests

### 优先级

- 同上

### 官方文档：[manifest-merge](https://developer.android.com/studio/build/manifest-merge)

## 4. TIPS & PROBLEMS

### 1. appliction，library 与BuildType 和 productFlavor的区别

```java
apply plugin: 'com.android.application'
apply plugin: 'com.android.library'
```

> -  `application`：表示是一个Android应用，有且只有一个application。
> -  `library`: 库。一个Android应用可以包含有限个library，相应的我们也可以在不同的APP中复用这些library。
> -  `productFlavors` 是用来配置不同风格的产品的。如免费版和付费版，或者说是我们项目中的Alavon，Wolf，WanBa等，我们可以对不同的产品风格（Flavor）指定不同的代码和资源，同时对所有应用版本共有的部分（main）加以共享和重复利用。
> -  一个Android应用通常是由一个Application和若干个library组成


### 2. buildScript中的dependencies和android中的dependencies的区别？

> - buildScript： 顾名思义是构建脚本，里面的dependencies指的是构建所需要的依赖，比如Android Gradle插件版本
> - android 中的dependencies 是项目中所需要使用的jar，aar，本地library，或三方SDK

### 3. 使用Android Studio的run，打包体积 小于command build的打包体积 为什么？

> -  Android Studio Run或者Debug时，必须是要连手机的，Android Studio在构建时会根据当前机型直接匹配出当前机型所需要的资源文件，不匹配的打包时就不包含在内
> -  command 的build 命令不管是否连接手机，只是单纯的执行build（assemble 和 check）命令，是一个完整的包，包含所有机型的资源

### 4. Java中同一个package下不能存在两个相同的Java文件。那么在buildType , productFlavor 和 main包中是否可以存在同名的文件？是会报错还是会通过使用优先级较高的那一个呢？

> -  不管在什么情况下，JVM都不允许同一个package下存在同名文件；
> -  buildType 和 productFlavor的目的是在不能的变体中使用本变体特征的文件，我们可以在不同BuildType（或productFlavor）之间使用同名的文件，最终合并时就不会造成冲突

------

# 分享遗留问题补充

## 问题一

### 1.1 猜想

> 出现昨天问题的根本原因是不是因为在我们生成的变体中并不存在 `*fullMytest*`(`*`表示通配符，意思是名字中包含有fullMytest) 的variant？
> 与full和mytest相关的变体只有fullAvalonMytest, 所以我猜想avalonMytest， fullAvalon， fullAvalonMyTest是不是都会出现我们预想的结果呢？

### 1.2 验证

> 经过验证得到以下结论：
>
> - full, fullmytest ==> true
> - full, fullavalon ==> false
> - full, fullavalonmytest ==> false
> - avalon, avalonmytest ==> true
> - avalon, fullAvalon ==> false
> - avalon, fullavalonmytest ==> false
> - mytest, avalonmytest ==> true
> - mytest, fullmytest ==> true
> - mytest, fullavalonmytest ==> false
> - fullavalon, fullavalonmytest ==> false
> - fullmytest, fullavalonmytest ==> false
> - avalonmytest, fullavalonmytest ==> false

**注：**

>   1. ==> 前面的`full,fullmytest`表示这两个文件夹下有相同的Java文件
>   2. true or false 表示是否编译成功
>   3. full 和 avalon 是productFloavor， mytest是buildType

### 1.3 分析

我们可以把编译成功的单独列出来

> - full, fullmytest ==> true
> - avalon, avalonmytest ==> true
> - mytest, avalonmytest ==> true
> - mytest, fullmytest ==> true

可以发现编译成功的都是单个productFlavor和buildType的组合文件夹，这种适合单个`flavorDimensions`的使用（此时相当于组合后的最终变体），但当我们有两个或多个`flavorDimensions`时，不能使用单个productFlavor和buildType的组合，我们的文件夹的形式只能是flavor, buildType, 包含所有flavorDimensions的flavor的组合和 variant这四类, 而不能是缺少了任何一个维度（`flavorDimensions 的组合`）flavorde组合命名的文件夹

### 1.4 结论

1. 不包含buildType：文件夹的命名必须是单个Flavor，或者是包含所有 flavorDimensions 的flavor的组合的文件名，缺少了任何一个flavorDimensions的Flavor组合文件夹是不生效的
2. 包含buildType：文件夹的命名必须是普通的单个buildType文件夹（如debug，mytest等），或者是variant（包含所有flavorDimensions的flavor组合+buildType）的文件夹名称

## 问题二

productFlavor中的属性冲突，会按照优先级顺序进行合并，比如

```
flavorDimensions "mode", "gameType"
    productFlavors{
        free {
            dimension "mode"
            versionCode 1
        }

        avalon {
            dimension "gameType"
            versionCode 2
        }
    }
```

生成apk的output.json如下：（注意 versionCode）

```
[
  {
    "outputType": {
      "type": "APK"
    },
    "apkData": {
      "type": "MAIN",
      "splits": [],
      "versionCode": 1,
      "versionName": "",
      "enabled": true,
      "outputFile": "app-free-avalon-debug.apk",
      "fullName": "freeAvalonDebug",
      "baseName": "free-avalon-debug"
    },
    "path": "app-free-avalon-debug.apk",
    "properties": {}
  }
]
```

如果我把`free`的`versionCode` 修改为3，则output.json如下:

```
[
  {
    "outputType": {
      "type": "APK"
    },
    "apkData": {
      "type": "MAIN",
      "splits": [],
      "versionCode": 3,
      "versionName": "",
      "enabled": true,
      "outputFile": "app-free-avalon-debug.apk",
      "fullName": "freeAvalonDebug",
      "baseName": "free-avalon-debug"
    },
    "path": "app-free-avalon-debug.apk",
    "properties": {}
  }
]
```

## 问题三

优先级 variant > buildType > profuctFlavor > main > library

> buildType资源合并时的优先级是大于profuctFlavor

## 猜想

>  bulid构建是否是先拿较低优先级的源码和资源（源集），然后一步步合并较高优先级的源集，重复的Java类报错，重复资源使用高优先级的？
