var express = require('express');
var request = require('request');
var redis = require('./redis');
var server = express();
var _ = require('lodash');

server.use(express.static(__dirname + '/public'));

server.get('/api/users/:username/followers', function(req, res) {
    followers(req.params.username, function(error, followers) {
        if (error) {
            res.status(400).send({error: 'Something went wrong'});
        } else {
            res.send(followers);
        }
    });
});

server.get('/api/repos/:repo', function() {

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

var user = function(username, callback) {
    github('https://api.github.com/users/' + username, function(error, response, body) {
        if (error) return callback(error);
        callback(null, body);
    });
};

var followers = function(username, callback) {
    var result = {};
    var progress = _.after(2, function() {
        callback(null, result);
    });

    user(username, function(error, user) {
        result.user = user;
        progress();
    });
    githubPaginate('https://api.github.com/users/' + username + '/followers?per_page=100&page=0', function(error, _bodies) {
        if (error) return callback(error);
        var followers = {};
        var addToFollowers = function(follower) {
            followers[follower.id] = follower;
        };
        for (var bodyUrl in _bodies) {
            _bodies[bodyUrl].forEach(addToFollowers);
        }
        var followersArray = [];
        for (var id in followers) {
            followersArray.push(followers[id]);
        }
        result.followers = followersArray;
        progress();
    });
};

var stargazers = function(owner, repo, callback) {
    githubPaginate('https://api.github.com/repos/' + owner + '/' + repo + '/stargazers?per_page=100&page=0', callback);
};

var githubPaginate = function(url, callback, _bodies) {
    _bodies = _bodies || {};
    github(url, function (error, response, body) {
        if (!error || response.statusCode === 200) {
            // TODO refactor
            if (!response.headers.link) {
                return callback(null, [body]);
            }
            var nextUrl = response.headers.link.match(/(?:^<)(.+?)(?:>)/)[1];
            if (_bodies[nextUrl]) {
                callback(null, _bodies);
            } else {
                _bodies[url] = body;
                githubPaginate(nextUrl, callback, _bodies);
            }
        } else {
            callback(error);
        }
    });
};

// followers('alexanderGugel', function(error, followers) {
//     console.log(followers);
// });

// stargazers('Famous', 'famous', function(error, stargazers) {
//     console.log(stargazers);
// });




// var stargazers = function (owner, repo, page, callback) {
//     github('repos/' + owner + '/' + repo + '/stargazers?page=' + page, function (error, response, body) {
//         if (!error || response.statusCode === 200) {
//             callback(null, body);
//         } else {
//             callback(new Error('Couldn\'t access repo'));
//         }
//     });
// };




// stargazers('Famous', 'famous', 1, function(error, data) {
//     console.log(error, data);
// });