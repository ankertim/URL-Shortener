# URL Shortener (持續更新)

Demo 網址: https://dcardhw.herokuapp.com/api/urls (已部屬)


## 前言

最近看到了 dcard backend intern 職位的招募，作業要求用 Golang or Nodejs 來完成，不過以前只碰過 Flask，因此匆忙找了資料學習 Nodejs 來做這次的作業。


## 說明

database: mysql

3rd party lib: validUrl, shortid

framework: express

介面:
![](https://i.imgur.com/KyrDsUV.png)


## 遇到問題

- 同步與非同步
- heroku mysql: can not import, because only support utf8, do not support utf8mb4.

## 待解決項目 跟 想增加功能

- 過期的網址沒有從 database 刪除，之後沒辦法轉換短網址
- Unit test
