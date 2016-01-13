#! /usr/bin/env node
var superagent = require('superagent'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    mongoose = require('mongoose'),
    mkdirp = require('mkdirp'),
    program = require('commander'),
    async = require('async');

// 图片名字hash一下，避免重名
var hash = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

// 下载图片
var download = function(uri, filename, callback){
    superagent.get(uri)
        .end(function(err, res) {
            fs.writeFile(filename, res.body)
            callback(null, uri);
        });
};

var parseContent = function(page, url, content)
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

        var imageUrl = $element.find('img').attr('src');
        var oo = $element.find('#cos_support-'+id).html();
        var xx = $element.find('#cos_unsupport-'+id).html();

        var extension=path.extname(imageUrl);
        var imageHash = crypto.createHash('md5').update(imageUrl).digest('hex');
        var filename = 'images/'+imageHash+extension;

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
        mkdirp('images/'+page);
        var filename = 'images/'+ page +'/'+imageHash+extension;
        download(url, filename, callback);
    }, function (err, result) {
        console.log('final:');
        console.log(result);
    });

}

// 妹子图地址
var meiziUrl = 'http://jandan.net/ooxx/page-';
// 起始页
var page = 1500;
// 终止页
var end = 1504;

async.whilst(
    function () {return page < end; },
    function (callback) {
        page++;

        var targetUrl = meiziUrl + page;
        superagent.get(targetUrl)
            .end(function(err, sres) {
                if (err) {
                    return next(err);
                }

                parseContent(page, meiziUrl, sres.text);
                 callback(null, page);
            });
    },
    function (err, n) {
    }
)
