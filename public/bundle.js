(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
'use strict';

var FollowersGraph = function() {
  var width = window.innerWidth,
  height = window.innerHeight;

  this.color = d3.scale.category20();

  this.force = d3.layout.force()
    .charge(-300)
    .linkDistance(10)
    // .linkStrength(0.1)
    .gravity(0.5)
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

  // this.svg.call(this.drag);
  // this.svg.call(this.zoom);


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

},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEZvbGxvd2Vyc0dyYXBoID0gZnVuY3Rpb24oKSB7XG4gIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoLFxuICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgdGhpcy5jb2xvciA9IGQzLnNjYWxlLmNhdGVnb3J5MjAoKTtcblxuICB0aGlzLmZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC0zMDApXG4gICAgLmxpbmtEaXN0YW5jZSgxMClcbiAgICAvLyAubGlua1N0cmVuZ3RoKDAuMSlcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW3dpZHRoLCBoZWlnaHRdKTtcblxuICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCgnYm9keScpLmFwcGVuZCgnc3ZnJylcbiAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICB0aGlzLm1haW4gPSB0aGlzLnN2Zy5hcHBlbmQoJ2cnKTtcblxuICB0aGlzLmxpbmsgPSB0aGlzLm1haW4uYXBwZW5kKCdnJykuc2VsZWN0QWxsKCcubGluaycpO1xuICB0aGlzLm5vZGUgPSB0aGlzLm1haW4uYXBwZW5kKCdnJykuc2VsZWN0QWxsKCcubm9kZScpO1xuXG4gIHRoaXMuem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgIC5zY2FsZUV4dGVudChbMSwgMTBdKVxuICAgIC5vbignem9vbScsIGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5tYWluLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIGQzLmV2ZW50LnRyYW5zbGF0ZSArICcpJyArICdzY2FsZSgnICsgZDMuZXZlbnQuc2NhbGUgKyAnKScpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgdGhpcy5kcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpO1xuXG4gIC8vIHRoaXMuc3ZnLmNhbGwodGhpcy5kcmFnKTtcbiAgLy8gdGhpcy5zdmcuY2FsbCh0aGlzLnpvb20pO1xuXG5cbiAgdGhpcy5zdmdcbiAgICAuYXBwZW5kKCdkZWZzJylcbiAgICAgIC5hcHBlbmQoJ2NsaXBQYXRoJylcbiAgICAgIC5hdHRyKCdpZCcsICdhdmF0YXItbWFzaycpXG4gICAgICAgIC5hcHBlbmQoJ3JlY3QnKVxuICAgICAgICAuYXR0cigncngnLCAzMilcbiAgICAgICAgLmF0dHIoJ3gnLCAtMzIqMC41KVxuICAgICAgICAuYXR0cigneScsIC0zMiowLjUpXG4gICAgICAgIC5hdHRyKCd3aWR0aCcsIDMyKVxuICAgICAgICAuYXR0cignaGVpZ2h0JywgMzIpO1xuXG4gIHRoaXMuZm9yY2Uub24oJ3RpY2snLCBmdW5jdGlvbigpIHtcbiAgICAvLyB2YXIgcSA9IGQzLmdlb20ucXVhZHRyZWUodGhpcy5ub2RlKSxcbiAgICAvLyAgICAgaSA9IDAsXG4gICAgLy8gICAgIG4gPSB0aGlzLm5vZGU7XG5cbiAgICAvLyB0aGlzLm5vZGUuZWFjaChmdW5jdGlvbihub2RlKSB7XG4gICAgLy8gICBxLnZpc2l0KGNvbGxpZGUobm9kZSkpO1xuICAgIC8vIH0pO1xuXG4gICAgdGhpcy5saW5rXG4gICAgICAuYXR0cigneDEnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnNvdXJjZS54OyB9KVxuICAgICAgLmF0dHIoJ3kxJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zb3VyY2UueTsgfSlcbiAgICAgIC5hdHRyKCd4MicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lng7IH0pXG4gICAgICAuYXR0cigneTInLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC55OyB9KTtcblxuICAgIHRoaXMubm9kZVxuICAgICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuICd0cmFuc2xhdGUoJyArIGQueCArICcsJyArIGQueSArICcpJzsgfSk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgdGhpcy51c2Vyc0RhdGEgPSBbXTtcbiAgdGhpcy5mb2xsb3dlckxpbmtzRGF0YSA9IFtdO1xuXG4gIHRoaXMuX21hcCA9IHt9O1xufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5mb3JjZSA9IHRoaXMuZm9yY2VcbiAgICAubm9kZXModGhpcy51c2Vyc0RhdGEpXG4gICAgLmxpbmtzKHRoaXMuZm9sbG93ZXJMaW5rc0RhdGEpXG4gICAgLnN0YXJ0KCk7XG5cbiAgdGhpcy5saW5rID0gdGhpcy5saW5rLmRhdGEodGhpcy5mb2xsb3dlckxpbmtzRGF0YSk7XG5cbiAgdGhpcy5saW5rXG4gICAgLmVudGVyKCkuYXBwZW5kKCdsaW5lJylcbiAgICAuYXR0cignY2xhc3MnLCAnbGluaycpXG4gICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCBmdW5jdGlvbihkKSB7IHJldHVybiAxOyB9KTtcblxuICB0aGlzLm5vZGUgPSB0aGlzLm5vZGUuZGF0YSh0aGlzLnVzZXJzRGF0YSk7XG5cbiAgdGhpcy5ub2RlXG4gICAgLmVudGVyKCkuYXBwZW5kKCdnJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlJylcbiAgICAgIC5hdHRyKCd3aWR0aCcsIDMyKVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIDMyKTtcblxuICB0aGlzLm5vZGUuY2FsbCh0aGlzLmZvcmNlLmRyYWcpO1xuXG4gIHRoaXMubm9kZS5hcHBlbmQoJ2ltYWdlJylcbiAgICAuYXR0cigneGxpbms6aHJlZicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuYXZhdGFyX3VybDsgfSlcbiAgICAuYXR0cignY2xpcC1wYXRoJywgJ3VybCgjYXZhdGFyLW1hc2spJylcbiAgICAuYXR0cigneCcsIC0zMiowLjUpXG4gICAgLmF0dHIoJ3knLCAtMzIqMC41KVxuICAgIC5hdHRyKCd3aWR0aCcsIDMyKVxuICAgIC5hdHRyKCdoZWlnaHQnLCAzMilcbiAgICAub24oJ2NsaWNrJywgZnVuY3Rpb24oZCkge1xuICAgICAgdGhpcy5hZGQoZC5sb2dpbik7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICB0aGlzLm5vZGUuYXBwZW5kKCd0aXRsZScpXG4gICAgLnRleHQoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5sb2dpbjsgfSk7XG59O1xuXG5Gb2xsb3dlcnNHcmFwaC5wcm90b3R5cGUuX2FkZFVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gIGlmICghdGhpcy5fbWFwW3VzZXIuaWRdKSB7XG4gICAgdGhpcy5fbWFwW3VzZXIuaWRdID0gdXNlcjtcbiAgICB0aGlzLnVzZXJzRGF0YS5wdXNoKHVzZXIpO1xuICB9XG4gIHJldHVybiB0aGlzLl9tYXBbdXNlci5pZF07XG59O1xuXG5Gb2xsb3dlcnNHcmFwaC5wcm90b3R5cGUuX2FkZEZvbGxvd2VyTGluayA9IGZ1bmN0aW9uKHRhcmdldFVzZXIsIHNvdXJjZVVzZXIpIHtcbiAgdGFyZ2V0VXNlciA9IHRoaXMuX2FkZFVzZXIodGFyZ2V0VXNlcik7XG4gIHNvdXJjZVVzZXIgPSB0aGlzLl9hZGRVc2VyKHNvdXJjZVVzZXIpO1xuXG4gIHZhciBleGlzdHMgPSB0aGlzLl9tYXBbc291cmNlVXNlci5pbmRleCArICctJyArIHRhcmdldFVzZXIuaW5kZXhdO1xuXG4gIGlmICghZXhpc3RzKSB7XG4gICAgdGhpcy5fbWFwW3NvdXJjZVVzZXIuaWQgKyAnLScgKyB0YXJnZXRVc2VyLmlkXSA9IHRydWU7XG4gICAgdGhpcy5mb2xsb3dlckxpbmtzRGF0YS5wdXNoKHsgc291cmNlOiBzb3VyY2VVc2VyLCB0YXJnZXQ6IHRhcmdldFVzZXIgfSk7XG4gIH1cbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih1c2VybmFtZSkge1xuICBkMy5qc29uKCdhcGkvdXNlcnMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3dlcnMnLCBmdW5jdGlvbihlcnJvciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycm9yKSByZXR1cm4gY29uc29sZS53YXJuKGVycm9yKTtcblxuICAgIHJlc3VsdC5mb2xsb3dlcnMuZm9yRWFjaChmdW5jdGlvbihmb2xsb3dlcikge1xuICAgICAgdGhpcy5fYWRkRm9sbG93ZXJMaW5rKHJlc3VsdC51c2VyLCBmb2xsb3dlcik7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0uYmluZCh0aGlzKSk7XG59O1xuXG5mdW5jdGlvbiBjb2xsaWRlKG5vZGUpIHtcbiAgdmFyIHIgPSBub2RlLnJhZGl1cyArIDEwLFxuICAgICAgbngxID0gbm9kZS54IC0gcixcbiAgICAgIG54MiA9IG5vZGUueCArIHIsXG4gICAgICBueTEgPSBub2RlLnkgLSByLFxuICAgICAgbnkyID0gbm9kZS55ICsgcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKHF1YWQsIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgaWYgKHF1YWQucG9pbnQgJiYgKHF1YWQucG9pbnQgIT09IG5vZGUpKSB7XG4gICAgICB2YXIgeCA9IG5vZGUueCAtIHF1YWQucG9pbnQueCxcbiAgICAgICAgICB5ID0gbm9kZS55IC0gcXVhZC5wb2ludC55LFxuICAgICAgICAgIGwgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSksXG4gICAgICAgICAgciA9IG5vZGUucmFkaXVzICsgcXVhZC5wb2ludC5yYWRpdXM7XG4gICAgICBpZiAobCA8IHIpIHtcbiAgICAgICAgbCA9IChsIC0gcikgLyBsICogLjU7XG4gICAgICAgIG5vZGUueCAtPSB4ICo9IGw7XG4gICAgICAgIG5vZGUueSAtPSB5ICo9IGw7XG4gICAgICAgIHF1YWQucG9pbnQueCArPSB4O1xuICAgICAgICBxdWFkLnBvaW50LnkgKz0geTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHgxID4gbngyIHx8IHgyIDwgbngxIHx8IHkxID4gbnkyIHx8IHkyIDwgbnkxO1xuICB9O1xufVxuXG5cblxudmFyIGZvbGxvd2Vyc0dyYXBoID0gbmV3IEZvbGxvd2Vyc0dyYXBoKCk7XG5mb2xsb3dlcnNHcmFwaC5hZGQoJ0ZhcmhhZEcnKTtcbiJdfQ==
