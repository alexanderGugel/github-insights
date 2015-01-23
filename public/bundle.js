(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
'use strict';

var FollowersGraph = function() {
  var width = window.innerWidth,
  height = window.innerHeight;

  this.color = d3.scale.category20();

  this.force = d3.layout.force()
    .charge(-120)
    .linkDistance(100)
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
      console.log(d3.event.translate)
      this.main.attr('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')');
    }.bind(this));

  this.drag = d3.behavior.drag()
    .on('drag', function() {
      // this.svg.style('transform', 'translate(' + d3.event.translate + ')');
    }.bind(this));

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
    var q = d3.geom.quadtree(this.node),
        i = 0,
        n = this.node;

    this.node.each(function(node) {
      q.visit(collide(node));
    });

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
followersGraph.add('marcwilhite');

},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBGb2xsb3dlcnNHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gIHRoaXMuY29sb3IgPSBkMy5zY2FsZS5jYXRlZ29yeTIwKCk7XG5cbiAgdGhpcy5mb3JjZSA9IGQzLmxheW91dC5mb3JjZSgpXG4gICAgLmNoYXJnZSgtMTIwKVxuICAgIC5saW5rRGlzdGFuY2UoMTAwKVxuICAgIC5saW5rU3RyZW5ndGgoMC4xKVxuICAgIC5ncmF2aXR5KDAuMDUpXG4gICAgLnNpemUoW3dpZHRoLCBoZWlnaHRdKTtcblxuICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCgnYm9keScpLmFwcGVuZCgnc3ZnJylcbiAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICB0aGlzLm1haW4gPSB0aGlzLnN2Zy5hcHBlbmQoJ2cnKTtcblxuICB0aGlzLmxpbmsgPSB0aGlzLm1haW4uYXBwZW5kKCdnJykuc2VsZWN0QWxsKCcubGluaycpO1xuICB0aGlzLm5vZGUgPSB0aGlzLm1haW4uYXBwZW5kKCdnJykuc2VsZWN0QWxsKCcubm9kZScpO1xuXG5cbiAgdGhpcy56b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgLm9uKCd6b29tJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZyhkMy5ldmVudC50cmFuc2xhdGUpXG4gICAgICB0aGlzLm1haW4uYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgZDMuZXZlbnQudHJhbnNsYXRlICsgJyknICsgJ3NjYWxlKCcgKyBkMy5ldmVudC5zY2FsZSArICcpJyk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICB0aGlzLmRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKClcbiAgICAub24oJ2RyYWcnLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIHRoaXMuc3ZnLnN0eWxlKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBkMy5ldmVudC50cmFuc2xhdGUgKyAnKScpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgdGhpcy5zdmcuY2FsbCh0aGlzLmRyYWcpO1xuICB0aGlzLnN2Zy5jYWxsKHRoaXMuem9vbSk7XG5cblxuXG5cblxuICB0aGlzLnN2Z1xuICAgIC5hcHBlbmQoJ2RlZnMnKVxuICAgICAgLmFwcGVuZCgnY2xpcFBhdGgnKVxuICAgICAgLmF0dHIoJ2lkJywgJ2F2YXRhci1tYXNrJylcbiAgICAgICAgLmFwcGVuZCgncmVjdCcpXG4gICAgICAgIC5hdHRyKCdyeCcsIDMyKVxuICAgICAgICAuYXR0cigneCcsIC0zMiowLjUpXG4gICAgICAgIC5hdHRyKCd5JywgLTMyKjAuNSlcbiAgICAgICAgLmF0dHIoJ3dpZHRoJywgMzIpXG4gICAgICAgIC5hdHRyKCdoZWlnaHQnLCAzMik7XG5cbiAgdGhpcy5mb3JjZS5vbigndGljaycsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBxID0gZDMuZ2VvbS5xdWFkdHJlZSh0aGlzLm5vZGUpLFxuICAgICAgICBpID0gMCxcbiAgICAgICAgbiA9IHRoaXMubm9kZTtcblxuICAgIHRoaXMubm9kZS5lYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIHEudmlzaXQoY29sbGlkZShub2RlKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmxpbmtcbiAgICAgIC5hdHRyKCd4MScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLng7IH0pXG4gICAgICAuYXR0cigneTEnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnNvdXJjZS55OyB9KVxuICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueDsgfSlcbiAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lnk7IH0pO1xuXG4gICAgdGhpcy5ub2RlXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgZC54ICsgJywnICsgZC55ICsgJyknOyB9KTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICB0aGlzLnVzZXJzRGF0YSA9IFtdO1xuICB0aGlzLmZvbGxvd2VyTGlua3NEYXRhID0gW107XG5cbiAgdGhpcy5fbWFwID0ge307XG59O1xuXG5Gb2xsb3dlcnNHcmFwaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmZvcmNlID0gdGhpcy5mb3JjZVxuICAgIC5ub2Rlcyh0aGlzLnVzZXJzRGF0YSlcbiAgICAubGlua3ModGhpcy5mb2xsb3dlckxpbmtzRGF0YSlcbiAgICAuc3RhcnQoKTtcblxuICB0aGlzLmxpbmsgPSB0aGlzLmxpbmsuZGF0YSh0aGlzLmZvbGxvd2VyTGlua3NEYXRhKTtcblxuICB0aGlzLmxpbmtcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2xpbmUnKVxuICAgIC5hdHRyKCdjbGFzcycsICdsaW5rJylcbiAgICAuc3R5bGUoJ3N0cm9rZS13aWR0aCcsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIDE7IH0pO1xuXG4gIHRoaXMubm9kZSA9IHRoaXMubm9kZS5kYXRhKHRoaXMudXNlcnNEYXRhKTtcblxuICB0aGlzLm5vZGVcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2cnKVxuICAgICAgLmF0dHIoJ2NsYXNzJywgJ25vZGUnKVxuICAgICAgLmF0dHIoJ3dpZHRoJywgMzIpXG4gICAgICAuYXR0cignaGVpZ2h0JywgMzIpO1xuXG4gIHRoaXMubm9kZS5jYWxsKHRoaXMuZm9yY2UuZHJhZyk7XG5cbiAgdGhpcy5ub2RlLmFwcGVuZCgnaW1hZ2UnKVxuICAgIC5hdHRyKCd4bGluazpocmVmJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5hdmF0YXJfdXJsOyB9KVxuICAgIC5hdHRyKCdjbGlwLXBhdGgnLCAndXJsKCNhdmF0YXItbWFzayknKVxuICAgIC5hdHRyKCd4JywgLTMyKjAuNSlcbiAgICAuYXR0cigneScsIC0zMiowLjUpXG4gICAgLmF0dHIoJ3dpZHRoJywgMzIpXG4gICAgLmF0dHIoJ2hlaWdodCcsIDMyKVxuICAgIC5vbignY2xpY2snLCBmdW5jdGlvbihkKSB7XG4gICAgICB0aGlzLmFkZChkLmxvZ2luKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gIHRoaXMubm9kZS5hcHBlbmQoJ3RpdGxlJylcbiAgICAudGV4dChmdW5jdGlvbihkKSB7IHJldHVybiBkLmxvZ2luOyB9KTtcbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5fYWRkVXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgaWYgKCF0aGlzLl9tYXBbdXNlci5pZF0pIHtcbiAgICB0aGlzLl9tYXBbdXNlci5pZF0gPSB1c2VyO1xuICAgIHRoaXMudXNlcnNEYXRhLnB1c2godXNlcik7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX21hcFt1c2VyLmlkXTtcbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5fYWRkRm9sbG93ZXJMaW5rID0gZnVuY3Rpb24odGFyZ2V0VXNlciwgc291cmNlVXNlcikge1xuICB0YXJnZXRVc2VyID0gdGhpcy5fYWRkVXNlcih0YXJnZXRVc2VyKTtcbiAgc291cmNlVXNlciA9IHRoaXMuX2FkZFVzZXIoc291cmNlVXNlcik7XG5cbiAgdmFyIGV4aXN0cyA9IHRoaXMuX21hcFtzb3VyY2VVc2VyLmluZGV4ICsgJy0nICsgdGFyZ2V0VXNlci5pbmRleF07XG5cbiAgaWYgKCFleGlzdHMpIHtcbiAgICB0aGlzLl9tYXBbc291cmNlVXNlci5pZCArICctJyArIHRhcmdldFVzZXIuaWRdID0gdHJ1ZTtcbiAgICB0aGlzLmZvbGxvd2VyTGlua3NEYXRhLnB1c2goeyBzb3VyY2U6IHNvdXJjZVVzZXIsIHRhcmdldDogdGFyZ2V0VXNlciB9KTtcbiAgfVxufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHVzZXJuYW1lKSB7XG4gIGQzLmpzb24oJ2FwaS91c2Vycy8nICsgdXNlcm5hbWUgKyAnL2ZvbGxvd2VycycsIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICBpZiAoZXJyb3IpIHJldHVybiBjb25zb2xlLndhcm4oZXJyb3IpO1xuXG4gICAgcmVzdWx0LmZvbGxvd2Vycy5mb3JFYWNoKGZ1bmN0aW9uKGZvbGxvd2VyKSB7XG4gICAgICB0aGlzLl9hZGRGb2xsb3dlckxpbmsocmVzdWx0LnVzZXIsIGZvbGxvd2VyKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbmZ1bmN0aW9uIGNvbGxpZGUobm9kZSkge1xuICB2YXIgciA9IG5vZGUucmFkaXVzICsgMTAsXG4gICAgICBueDEgPSBub2RlLnggLSByLFxuICAgICAgbngyID0gbm9kZS54ICsgcixcbiAgICAgIG55MSA9IG5vZGUueSAtIHIsXG4gICAgICBueTIgPSBub2RlLnkgKyByO1xuICByZXR1cm4gZnVuY3Rpb24ocXVhZCwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICBpZiAocXVhZC5wb2ludCAmJiAocXVhZC5wb2ludCAhPT0gbm9kZSkpIHtcbiAgICAgIHZhciB4ID0gbm9kZS54IC0gcXVhZC5wb2ludC54LFxuICAgICAgICAgIHkgPSBub2RlLnkgLSBxdWFkLnBvaW50LnksXG4gICAgICAgICAgbCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSxcbiAgICAgICAgICByID0gbm9kZS5yYWRpdXMgKyBxdWFkLnBvaW50LnJhZGl1cztcbiAgICAgIGlmIChsIDwgcikge1xuICAgICAgICBsID0gKGwgLSByKSAvIGwgKiAuNTtcbiAgICAgICAgbm9kZS54IC09IHggKj0gbDtcbiAgICAgICAgbm9kZS55IC09IHkgKj0gbDtcbiAgICAgICAgcXVhZC5wb2ludC54ICs9IHg7XG4gICAgICAgIHF1YWQucG9pbnQueSArPSB5O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geDEgPiBueDIgfHwgeDIgPCBueDEgfHwgeTEgPiBueTIgfHwgeTIgPCBueTE7XG4gIH07XG59XG5cblxuXG52YXIgZm9sbG93ZXJzR3JhcGggPSBuZXcgRm9sbG93ZXJzR3JhcGgoKTtcbmZvbGxvd2Vyc0dyYXBoLmFkZCgnbWFyY3dpbGhpdGUnKTtcbiJdfQ==
