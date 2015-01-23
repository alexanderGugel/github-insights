'use strict';

var FollowersGraph = function() {
  var width = window.innerWidth*2,
  height = window.innerHeight*2;

  this.color = d3.scale.category20();

  this.force = d3.layout.force()
    .charge(-120)
    .linkDistance(window.innerWidth*0.5)
    .linkStrength(0.1)
    .gravity(0.05)
    .size([width, height]);

  this.svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

  this.main = this.svg.append('g');

  this.link = this.main.append('g').selectAll('.link');
  this.node = this.main.append('g').selectAll('.node');

  this.zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on('zoom', function() {
      this.main.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')');
    }.bind(this));

  this.drag = d3.behavior.drag();

  this.svg.call(this.drag);
  this.svg.call(this.zoom);


  this.svg
    .append('defs')
      .append('clipPath')
      .attr('id', 'avatar-mask')
        .append('rect')
        .attr('rx', 32)
        .attr('x', -32*0.5)
        .attr('y', -32*0.5)
        .attr('width', 32)
        .attr('height', 32);

  this.force.on('tick', function() {
    // var q = d3.geom.quadtree(this.node),
    //     i = 0,
    //     n = this.node;

    // this.node.each(function(node) {
    //   q.visit(collide(node));
    // });

    this.link
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    this.node
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
  }.bind(this));

  this.usersData = [];
  this.followerLinksData = [];

  this._map = {};
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
    .style('stroke-width', function(d) { return 1; });

  this.node = this.node.data(this.usersData);

  this.node
    .enter().append('g')
      .attr('class', 'node')
      .attr('width', 32)
      .attr('height', 32);

  this.node.call(this.force.drag);

  this.node.append('image')
    .attr('xlink:href', function(d) { return d.avatar_url; })
    .attr('clip-path', 'url(#avatar-mask)')
    .attr('x', -32*0.5)
    .attr('y', -32*0.5)
    .attr('width', 32)
    .attr('height', 32)
    .on('click', function(d) {
      this.add(d.login);
    }.bind(this));

  this.node.append('title')
    .text(function(d) { return d.login; });
};

FollowersGraph.prototype._addUser = function(user) {
  if (!this._map[user.id]) {
    this._map[user.id] = user;
    this.usersData.push(user);
  }
  return this._map[user.id];
};

FollowersGraph.prototype._addFollowerLink = function(targetUser, sourceUser) {
  targetUser = this._addUser(targetUser);
  sourceUser = this._addUser(sourceUser);

  var exists = this._map[sourceUser.index + '-' + targetUser.index];

  if (!exists) {
    this._map[sourceUser.id + '-' + targetUser.id] = true;
    this.followerLinksData.push({ source: sourceUser, target: targetUser });
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

function collide(node) {
  var r = node.radius + 10,
      nx1 = node.x - r,
      nx2 = node.x + r,
      ny1 = node.y - r,
      ny2 = node.y + r;
  return function(quad, x1, y1, x2, y2) {
    if (quad.point && (quad.point !== node)) {
      var x = node.x - quad.point.x,
          y = node.y - quad.point.y,
          l = Math.sqrt(x * x + y * y),
          r = node.radius + quad.point.radius;
      if (l < r) {
        l = (l - r) / l * .5;
        node.x -= x *= l;
        node.y -= y *= l;
        quad.point.x += x;
        quad.point.y += y;
      }
    }
    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
  };
}



var followersGraph = new FollowersGraph();
followersGraph.add('FarhadG');
