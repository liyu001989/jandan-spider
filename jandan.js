var superagent = require('superagent'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    path = require('path'),
    crypto = require('crypto'),
    request = require('request');

var hash = function(str) {
    return crypto.createHash('md5').update(str).digest('hex');
}

var download = function(uri, filename, callback){
    console.log(uri);
    console.log(filename);
    request.head(uri, function(err, res, body){
        //console.log('content-type:', res.headers['content-type']);
        //console.log('content-length:', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename));
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

            download(imageUrl, filename);

            items.push({
                image: $element.find('img').attr('src'),
                oo: oo,
                xx: xx
            });
        });
    });
