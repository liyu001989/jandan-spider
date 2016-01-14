#! /usr/bin/env node
var program = require('commander');
program
    .version('0.0.1')
    .option('-s, --start [value]', 'start page')
    .option('-e, --end [value]', 'end page')
    .option('-d, --divide', '是否按页数分目录')
    .option('-t, --type [value]', 'meizi or wuliao default meizi', /^(meizi|wuliao)$/i, 'meizi')
    .parse(process.argv);

if (!program.end || !program.start || program.start >= program.end) {
    console.log('请输入正确的参数 例:node jandan.js --start=1500  --end=1600');
    return
}

// 起始页
var page = program.start;
// 终止页
var end = program.end;
// 妹子或无聊图地址
var meiziUrl = 'http://jandan.net/ooxx/page-';
var wuliaoUrl = 'http://jandan.net/pic/page-';

var defaultUrl = program.type == 'meizi' ? meiziUrl : wuliaoUrl;
var defaultDir = program.type == 'meizi' ? 'images/meizi' : 'images/wuliao';
// 不知道这个词对不对，每页的图片一个目录
var divide = program.divide;

var superagent = require('superagent'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    mkdirp = require('mkdirp'),
    async = require('async');

// 图片名字hash一下，避免重名
var hash = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

// 下载图片
var download = function(uri, filename, callback){
    superagent.get(uri)
        .end(function(err, res) {
            if (!err && 'body' in res) {
                fs.writeFile(filename, res.body)
            }
            callback(null, uri);
        });
};

var parseContent = function(content, page)
{
    var $ = cheerio.load(content);
    var items = [];
    var urls = [];

    $('.commentlist li').each(function(index, element) {
        $element = $(element);
        // 取得图片的id
        var id = $element.attr('id').split("-")[1];

        // 没id的是广告
        if (!id) return true;

        // 找到图片
        var $img = $element.find('img');
        if (!$img) return true;

        var imageUrl = $img.attr('src');
        // 简单的gif会有一张缩略图, 所以这里不要缩略图
        var extension=path.extname(imageUrl);
        if (extension == '.gif' && $img.attr('org_src')) {
            var imageUrl = $img.attr('org_src');
        }

        var imageHash = crypto.createHash('md5').update(imageUrl).digest('hex');
        var filename = 'images/'+imageHash+extension;

        //oo xx 数量可以存下来，也可以做个过滤
        var oo = $element.find('#cos_support-'+id).html();
        var xx = $element.find('#cos_unsupport-'+id).html();

        items.push({
            image: imageUrl,
            oo: oo,
            xx: xx
        });

        urls.push(imageUrl);
    });

    // 并发下载所有的图片，控制再5个并发
    async.mapLimit(urls, 5, function (url, callback) {
        //后缀
        var extension=path.extname(url);
        // 暂时认为煎蛋的url会唯一对应一个图片，抓过的就不抓了
        //url hash
        var imageHash = crypto.createHash('md5').update(url).digest('hex');

        // 放在images目录下面
        var dir = defaultDir;
        if (divide) {
            var dir = dir+'/'+page;
        }
        if (!fs.existsSync(dir)){
            mkdirp(dir);
        }
        var filename = dir +'/'+imageHash+extension;

        download(url, filename, callback);
    }, function (err, result) {
        if (err) console.log(err);

        console.log(page + ' done');
    });

}

async.whilst(
    function () {return page <= end; },
    function (callback) {
        var targetUrl = defaultUrl + page;

        superagent.get(targetUrl)
            .end(function(err, sres) {
                if (err) {
                    return next(err);
                }

                parseContent(sres.text, page);
                page++;
                callback(null, page);
            });
    },
    function (err, n) {
    }
)
