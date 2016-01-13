##学者爬一下煎蛋

看着这个课程尝试一下, 下载煎蛋的妹子图

- [https://github.com/alsotang/node-lessons](https://github.com/alsotang/node-lessons)
- [superagent](http://visionmedia.github.io/superagent/)
- [cheerio](https://github.com/cheeriojs/cheerio)
- [async](https://github.com/caolan/async)

### usage
会下载到images目录中，按页数分文件夹

    Usage: jandan [options]

    Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -s, --start [value]  start page
    -e, --end [value]    end page

例: node jandan.js --start=1500 --end=1600

### TODO
- 存入数据库，避免抓重复的
- 增加参数，可以选择都放入一个文件夹
- 增加参数，支持直接打包

### License

[MIT license](http://opensource.org/licenses/MIT)
