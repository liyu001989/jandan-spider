##学者爬一下煎蛋

看着这个课程尝试一下, 下载煎蛋的妹子图

### usage

npm install 然后根据命令提示操作

会下载到images目录中，按页数分文件夹

	node jandan.js --help

	Usage: jandan [options]

	Options:

    -h, --help           output usage information
    -V, --version        output the version number
    -s, --start [value]  start page
    -e, --end [value]    end page
    -d, --divide         是否按页数分目录
    -g, --gzip           打包输出为images.tar.gz
    -t, --type [value]   meizi or wuliao default meizi

例: node jandan.js --start=1500 --end=1600 --type=meizi -d

### TODO
- 存入数据库，避免抓重复的
- 结构太乱了，一点都不优雅

### 参考资料

- [https://github.com/alsotang/node-lessons](https://github.com/alsotang/node-lessons)
- [superagent](http://visionmedia.github.io/superagent/)
- [cheerio](https://github.com/cheeriojs/cheerio)
- [async](https://github.com/caolan/async)
- [eventproxy](https://github.com/JacksonTian/eventproxy)

### License

[MIT license](http://opensource.org/licenses/MIT)
