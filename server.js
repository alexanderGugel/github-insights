var express = require('express');
var request = require('request');
var redis = require('./redis');
var server = express();

server.use(express.static(__dirname + '/public'));

server.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

server.get('/api/users/:username/following', function(req, res) {
    var username = req.params.username;
    var page = req.query.page || 0;
    github('https://api.github.com/users/' + username + '/following?per_page=100&page=' + page, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            res.status(response.statusCode).send(body);
        }
    });
});

server.get('/api/users/:username', function(req, res) {
    var username = req.params.username;
    github('https://api.github.com/users/' + username, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            res.send(body);
        } else {
            res.status(response.statusCode).send(body);
        }
    });
});

server.listen(process.env.PORT || 3141);

var github = function (url, callback) {
    redis.get('github:' + url, function (error, data) {
        if (data) {
            data = JSON.parse(data);
            callback(data.error, data.response, data.body);
        } else {
            request({
                url: url,
                headers: {
                    'User-Agent': 'alexander.gugel@gmail.com',
                    'Accept': 'application/vnd.github.v3.star+json'
                },
                auth: {
                    user: process.env.PERSONAL_ACCESS_TOKEN || 'b330b9717358384e84f4e5d2bc7394d241738e0e'
                }
            }, function(error, response, body) {
                body = JSON.parse(body);
                redis.set('github:' + url, JSON.stringify({
                    error: error,
                    response: response,
                    body: body
                }));
                redis.expire('github:' + url, 60*60*24*14); // cache for 2 weeks
                callback(error, response, body);
            });
        }
    });
};
