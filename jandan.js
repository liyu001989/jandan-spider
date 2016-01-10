#! /usr/bin/env node
var superagent = require('superagent'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
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

var jandanUrl = 'http://jandan.net/ooxx/page-1500';

superagent.get(jandanUrl)
    .end(function(err, sres) {
        if (err) {
            return next(err);
        }

        var $ = cheerio.load(sres.text);
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
            //url hash
            var imageHash = crypto.createHash('md5').update(url).digest('hex');
            var filename = 'images/'+imageHash+extension;
            download(url, filename, callback);
        }, function (err, result) {
            console.log('final:');
            console.log(result);
        });
    });

