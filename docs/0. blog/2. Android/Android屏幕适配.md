---
title:      "Andorid 屏幕适配（显示大小恢复）"
description: "Android APP中显示大小和字体大小导致布局错乱的恢复方法"
author:     Duosl
tags:
    - Android屏幕适配
---
### 1. 前言

国内越来越多的Android手机厂商对用户暴露了修改手机显示大小和字体大小的设置，如果用户将显示大小调整为最大，我们的某一个页面布局比较复杂时，难免会出现一些布局错乱问题，本文要讨论的是如何针对某一个Activity对用户的显示大小进行恢复，避免出现布局错乱的问题。当然在使用该方案时，需要经过产品和交互的确认，他们同意在用户修改显示大小后恢复到默认大小。

### 2. 源码阅读

```java
// TextView.java
public void setTextSize(int unit, float size) {
   if (!isAutoSizeEnabled()) {
       setTextSizeInternal(unit, size, true);
   }
}

// TextView.java
private void setTextSizeInternal(int unit, float size, boolean shouldRequestLayout) {
   Context c = getContext();
   Resources r;

   if (c == null) {
       r = Resources.getSystem();
   } else {
       r = c.getResources();
   }

   setRawTextSize(TypedValue.applyDimension(unit, size, r.getDisplayMetrics()),
           shouldRequestLayout);
}

// TypedValue.java
public static float applyDimension(int unit, float value,
                                      DisplayMetrics metrics)
   {
       switch (unit) {
       case COMPLEX_UNIT_PX:
           return value;
       case COMPLEX_UNIT_DIP:
           return value * metrics.density;
       case COMPLEX_UNIT_SP:
           return value * metrics.scaledDensity;
       case COMPLEX_UNIT_PT:
           return value * metrics.xdpi * (1.0f/72);
       case COMPLEX_UNIT_IN:
           return value * metrics.xdpi;
       case COMPLEX_UNIT_MM:
           return value * metrics.xdpi * (1.0f/25.4f);
       }
       return 0;
   }
```

通过查看`TextView#setTextSize()`方法可知：

    1. Android中的字体大小单位`sp`是通过`DisplayMetrics.scaledDensity`的值来控制的；
    2. Android中的长度单位`dp`是通过`DisplayMetrics.density`的值来控制的；

但是当用户修改手机中的显示大小时，修改的是`Configuration#densityDpi`，修改手机设置中的字体大小，实际上修改的是`Configuration#fontScale`。这之间有什么关系呢？

```java
// ResourcesImpl.java
public void updateConfiguration(Configuration config, DisplayMetrics metrics,CompatibilityInfo compat) {
 ...
   // 关键代码
   if (mConfiguration.densityDpi != Configuration.DENSITY_DPI_UNDEFINED) {
     mMetrics.densityDpi = mConfiguration.densityDpi;
     mMetrics.density = mConfiguration.densityDpi * DisplayMetrics.DENSITY_DEFAULT_SCALE;
   }

 // 此处防止未设置fontScale
 mMetrics.scaledDensity = mMetrics.density * (mConfiguration.fontScale != 0 ? mConfiguration.fontScale : 1.0f);
 ...
}
```

通过阅读源码`ResourceImpl#updateConfiguration()`发现：

`density`的值是通过`densityDpi`来确定的; 而`scaledDensity`的值是通过`density `和 `fontScale`来确定的;（默认情况下是等于density的，fontSize == 1）。所以我们需要 **修改或还原用户的显示大小要修改的实际上是`densityDpi`**。（`DisplayMetrics`中的`densityDpi`是来自`Configuration`的）

### 3. 解决方案

   1. 恢复字体大小

   ```java
      Resources resources = getResources();
      Configuration configuration = resources.getConfiguration();
      if (resources != null && resources.getConfiguration().fontScale != 1.0f) {
       configuration.fontScale = 1.0f; // 恢复字体大小
       resources.updateConfiguration(configuration, getResources().getDisplayMetrics());
      }
   ```

   2. 恢复显示大小

   > 经过查阅资料和测试，暂时发现`DisplayMetrics.DENSITY_DEVICE_STABLE`这个值，无论如何修改显示大小，这个值都是不会发生变化的，都等于用户手机默认的显示大小所对应的densityDpi，因此如果为了临时解决用户修改显示大小而出现的布局错乱问题，可以临时通过这种方式对显示大小进行还原。如果时间充足和项目结构支持的话，还是推荐使用[头条适配方案](https://mp.weixin.qq.com/s/d9QCoBP6kV9VSWvVldVVwA)或者其他比较成熟的屏幕适配方案来彻底解决这种UI的适配问题。

   ```java
   Resources resources = getResources();
   Configuration configuration = resources.getConfiguration();
   if (resources.getDisplayMetrics().densityDpi != DisplayMetrics.DENSITY_DEVICE_STABLE) {
       configuration.densityDpi = DisplayMetrics.DENSITY_DEVICE_STABLE; // 恢复显示大小
       resources.updateConfiguration(configuration, resources.getDisplayMetrics());
   }
   ```

>  **注意：** 这两段代码①要么写在`activity`的`@Override getResource()`中，(缺点：每次使用`getResource()`都会重复执行，当然可以限制这段代码的执行次数，第一次触发时只执行一次即可)；②要么写在`onCreate()`的`setContentView(R.layout.demo);`这行代码之前，否则会导致xml中的dp和sp不能生效


4. ### 注意

   如果只需要在当前Activity生效的话，记得要在页面销毁时，把配置还原，避免造成其他影响

   ```java
   @Override
   protected void onDestroy() {
       super.onDestroy();
     	// 该方案只修改了当前Activity的Configuration，可以用application的进行还原
       getResources().updateConfiguration(getApplication().getResources().getConfiguration(), getApplication().getResources().getDisplayMetrics());
   }
   ```
