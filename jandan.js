var superagent = require('superagent'),
    cheerio = require('cheerio'),
    fs = require('fs'),
    request = require('request');

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
      console.log('content-type:', res.headers['content-type']);
      console.log('content-length:', res.headers['content-length']);

      request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
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

            var image = $element.find('img').attr('src');
            var oo = $element.find('#cos_support-'+id).html();
            var xx = $element.find('#cos_unsupport-'+id).html();

            items.push({
                image: $element.find('img').attr('src'),
                oo: oo,
                xx: xx
            });
        });
        console.log(items);
    });
