'use strict';

var FollowersGraph = function() {
  var width = window.innerWidth,
  height = window.innerHeight;

  this.color = d3.scale.category20();

  this.force = d3.layout.force()
    .charge(-100)
    .linkDistance(100)
    .size([width, height]);

  this.svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

  this.link = this.svg.selectAll('.link');
  this.node = this.svg.selectAll('.node');

  this.force.on('tick', function() {
    this.link
    .attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; });

    this.node
    .attr('x', function(d) { return d.x - 32*0.5; })
    .attr('y', function(d) { return d.y - 32*0.5; });
  }.bind(this));

  this.usersData = [];
  this.followerLinksData = [];

  // id: index
  this.userToIndex = {};

  // source-target: index
  this.linkToIndex = {};
};

FollowersGraph.prototype.render = function () {
  this.force = this.force
    .nodes(this.usersData)
    .links(this.followerLinksData)
    .start();

  this.link = this.link.data(this.followerLinksData);

  this.link
    .enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', function(d) { return Math.sqrt(8); });

  this.node = this.node.data(this.usersData);

  this.node
    // .enter()
    // .append('circle')
    // .attr('class', 'node')
    // .attr('r', 5)
    // .style('fill', function(d) { return '#000'; });

    .enter().append('image')
      .attr('xlink:href', function(d) { return d.avatar_url; })
      // .attr('x', -8)
      // .attr('y', -8)
      .attr('width', 32)
      .attr('height', 32);

  this.node.call(this.force.drag);

  this.node.append('title')
    .text(function(d) { return d.login; });
};

FollowersGraph.prototype._addUser = function(user) {
  console.log(user)
  // if user is already in the graph, return id
  // if user is not in graph, add and return id
  if (this.userToIndex[user.id]) {
    return this.userToIndex[user.id];
  } else {
    var index = this.usersData.length;
    this.usersData.push(user);
    this.userToIndex[user.id] = index;
    return index;
  }
};

FollowersGraph.prototype._addFollowerLink = function(targetUser, followerUser) {
  var targetUserIndex = this._addUser(targetUser);
  var followerUserIndex = this._addUser(followerUser);

  var linkIndex = this.linkToIndex[followerUserIndex + '-' + targetUserIndex];

  if (!linkIndex) {
    linkIndex = this.followerLinksData.length;
    this.linkToIndex[followerUserIndex + '-' + targetUserIndex] = linkIndex;
    this.followerLinksData.push({
      source: followerUserIndex,
      target: targetUserIndex
    });
  }
};

FollowersGraph.prototype.add = function(username) {
  d3.json('api/users/' + username + '/followers', function(error, result) {
    if (error) return console.warn(error);

    result.followers.forEach(function(follower) {
      this._addFollowerLink(result.user, follower);
    }.bind(this));

    this.render();
  }.bind(this));
};


var followersGraph = new FollowersGraph();
followersGraph.add('marcwilhite');


// setTimeout(function() {
//   followersGraph.add('marklu');
// }, 500);

