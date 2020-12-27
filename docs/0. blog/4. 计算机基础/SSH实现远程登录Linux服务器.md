---
title:      "SSH实现远程登录Linux服务器"
description:   ""
tags:
    - SSH
    - Linux
---

# 1. 生成SSH
```shell
ssh-keygen
```
# 2. 使用SSH进行远程登录
### 2.1 使用ssh直接进行登录
```shell
ssh username@ip -p ${port}
```
> 需要输入密码

### 2.2 免密登录
##### 2.2.1 将本地的公钥发送到远程服务器
```shell
ssh-copy-id -i ${id-rsa.pub} username@ip
```
> 或者使用scp命令将`id-rsa.pub`文件拷贝到远程服务器对应用户的`~/.ssh/`下,并重命名为`authorized_keys`       
> `scp -p 22 id-rsa.pub username@ip:~/.shh/authorized_keys`        
>`scp -p ${port} ${localFilePath} username@ip:${remoteFilePath}`

> 现在就可以使用命令进行免密登录了，直接输入`ssh username@ip -p ${port}`即可直接登录成功，但每一次还需要牢记ip地址，不是很方便，下面介绍使用别名进行登录，我们只需要对该用户和ip设置一个别名，下次登录的时候直接使用`ssh 别名`即可

##### 2.2.2 使用别名
- 配置别名
> 在`~/.ssh/`文件夹下创建config文件，并在文件中添加以下内容：
```
Host 别名
HostName ip或域名
Port 端口号
User 登录用户
IdentityFile ~/.ssh/id_rsa //认证文件（私钥地址）
IdentitiesOnly yes  //只允许在SSH下认证成功
```
