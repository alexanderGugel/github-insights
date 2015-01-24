(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
'use strict';

var $toast = document.getElementById('toast');

function toast(html, type) {
  $toast.innerHTML = html;
  $toast.className = type;
  $toast.style.opacity = 1;
}

function usernameToLink(username) {
  return ('<a target="_blank" href="https://github.com/' + username + '">' + username + '</a>');
}

var FollowersGraph = function() {
  var width = window.innerWidth,
  height = window.innerHeight;

  this._scale = 1;
  this._translate = [0, 0];

  this.color = d3.scale.category20();

  this.force = d3.layout.force()
    .charge(-500)
    .linkDistance(50)
    .gravity(0.5)
    .size([width, height]);

  this.svg = d3.select('body').insert('svg', ':first-child')
    .attr('width', width)
    .attr('height', height);

  this.link = this.svg.selectAll('.link');
  this.node = this.svg.selectAll('.node');

  this._onNodeClickBound = this._onNodeClick.bind(this);

  this.zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on('zoom', function() {
      this._scale = d3.event.scale;
      this._translate = d3.event.translate;
      this.svg.style('transform', 'scale(' + this._scale + ')');
    }.bind(this));

  this.drag = d3.behavior.drag();

  this.svg.call(this.drag);
  this.svg.call(this.zoom);

  var self = this;

  this.force.on('tick', function() {
    // var q = d3.geom.quadtree(this.node),
    //     i = 0,
    //     n = this.node;

    // this.node.each(function(node) {
    //   q.visit(collide(node));
    // });

    self.link
      .attr('x1', function(d) { return d.source.x + self._translate[0]; })
      .attr('y1', function(d) { return d.source.y + self._translate[1]; })
      .attr('x2', function(d) { return d.target.x + self._translate[0]; })
      .attr('y2', function(d) { return d.target.y + self._translate[1]; });

    self.node
      .attr('transform', function(d) {
        return 'translate(' + (d.x + self._translate[0]) + ',' + (d.y + self._translate[1]) + ')';
      });
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
    .enter().insert('line', ':first-child')
    .attr('class', 'edge');

  this.node = this.node.data(this.usersData);

  this.node
    .enter().append('image')
      .attr('xlink:href', function(d) { return d.avatar_url; })
      .attr('class', 'node')
      .attr('width', 32)
      .attr('height', 32)
      .attr('x', -32*0.5)
      .attr('y', -32*0.5)
      .on('click', this._onNodeClickBound);

  this.node.call(this.force.drag);

  this.node.append('title')
    .text(function(d) { return d.login; });
};

FollowersGraph.prototype._onNodeClick = function(d) {
  console.log(d);
  this.addUserByUsername(d.login);
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

FollowersGraph.prototype.addUserByUsername = function(username) {
  toast('Fetching followers for ' + usernameToLink(username) + '...', 'progress');
  d3.json('api/users/' + username + '/followers', function(error, result) {
    if (error) return console.warn(error);

    toast('Fetched followers for ' + usernameToLink(username), 'success');

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
followersGraph.addUserByUsername('FarhadG');

},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciAkdG9hc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QnKTtcblxuZnVuY3Rpb24gdG9hc3QoaHRtbCwgdHlwZSkge1xuICAkdG9hc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgJHRvYXN0LmNsYXNzTmFtZSA9IHR5cGU7XG4gICR0b2FzdC5zdHlsZS5vcGFjaXR5ID0gMTtcbn1cblxuZnVuY3Rpb24gdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpIHtcbiAgcmV0dXJuICgnPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS8nICsgdXNlcm5hbWUgKyAnXCI+JyArIHVzZXJuYW1lICsgJzwvYT4nKTtcbn1cblxudmFyIEZvbGxvd2Vyc0dyYXBoID0gZnVuY3Rpb24oKSB7XG4gIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoLFxuICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgdGhpcy5fc2NhbGUgPSAxO1xuICB0aGlzLl90cmFuc2xhdGUgPSBbMCwgMF07XG5cbiAgdGhpcy5jb2xvciA9IGQzLnNjYWxlLmNhdGVnb3J5MjAoKTtcblxuICB0aGlzLmZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC01MDApXG4gICAgLmxpbmtEaXN0YW5jZSg1MClcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW3dpZHRoLCBoZWlnaHRdKTtcblxuICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCgnYm9keScpLmluc2VydCgnc3ZnJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgdGhpcy5saW5rID0gdGhpcy5zdmcuc2VsZWN0QWxsKCcubGluaycpO1xuICB0aGlzLm5vZGUgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5ub2RlJyk7XG5cbiAgdGhpcy5fb25Ob2RlQ2xpY2tCb3VuZCA9IHRoaXMuX29uTm9kZUNsaWNrLmJpbmQodGhpcyk7XG5cbiAgdGhpcy56b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgLm9uKCd6b29tJywgZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLl9zY2FsZSA9IGQzLmV2ZW50LnNjYWxlO1xuICAgICAgdGhpcy5fdHJhbnNsYXRlID0gZDMuZXZlbnQudHJhbnNsYXRlO1xuICAgICAgdGhpcy5zdmcuc3R5bGUoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgdGhpcy5fc2NhbGUgKyAnKScpO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgdGhpcy5kcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpO1xuXG4gIHRoaXMuc3ZnLmNhbGwodGhpcy5kcmFnKTtcbiAgdGhpcy5zdmcuY2FsbCh0aGlzLnpvb20pO1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLmZvcmNlLm9uKCd0aWNrJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gdmFyIHEgPSBkMy5nZW9tLnF1YWR0cmVlKHRoaXMubm9kZSksXG4gICAgLy8gICAgIGkgPSAwLFxuICAgIC8vICAgICBuID0gdGhpcy5ub2RlO1xuXG4gICAgLy8gdGhpcy5ub2RlLmVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgIC8vICAgcS52aXNpdChjb2xsaWRlKG5vZGUpKTtcbiAgICAvLyB9KTtcblxuICAgIHNlbGYubGlua1xuICAgICAgLmF0dHIoJ3gxJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zb3VyY2UueCArIHNlbGYuX3RyYW5zbGF0ZVswXTsgfSlcbiAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnkgKyBzZWxmLl90cmFuc2xhdGVbMV07IH0pXG4gICAgICAuYXR0cigneDInLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC54ICsgc2VsZi5fdHJhbnNsYXRlWzBdOyB9KVxuICAgICAgLmF0dHIoJ3kyJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueSArIHNlbGYuX3RyYW5zbGF0ZVsxXTsgfSk7XG5cbiAgICBzZWxmLm5vZGVcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyAoZC54ICsgc2VsZi5fdHJhbnNsYXRlWzBdKSArICcsJyArIChkLnkgKyBzZWxmLl90cmFuc2xhdGVbMV0pICsgJyknO1xuICAgICAgfSk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgdGhpcy51c2Vyc0RhdGEgPSBbXTtcbiAgdGhpcy5mb2xsb3dlckxpbmtzRGF0YSA9IFtdO1xuXG4gIHRoaXMuX21hcCA9IHt9O1xufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5mb3JjZSA9IHRoaXMuZm9yY2VcbiAgICAubm9kZXModGhpcy51c2Vyc0RhdGEpXG4gICAgLmxpbmtzKHRoaXMuZm9sbG93ZXJMaW5rc0RhdGEpXG4gICAgLnN0YXJ0KCk7XG5cbiAgdGhpcy5saW5rID0gdGhpcy5saW5rLmRhdGEodGhpcy5mb2xsb3dlckxpbmtzRGF0YSk7XG5cbiAgdGhpcy5saW5rXG4gICAgLmVudGVyKCkuaW5zZXJ0KCdsaW5lJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ2NsYXNzJywgJ2VkZ2UnKTtcblxuICB0aGlzLm5vZGUgPSB0aGlzLm5vZGUuZGF0YSh0aGlzLnVzZXJzRGF0YSk7XG5cbiAgdGhpcy5ub2RlXG4gICAgLmVudGVyKCkuYXBwZW5kKCdpbWFnZScpXG4gICAgICAuYXR0cigneGxpbms6aHJlZicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuYXZhdGFyX3VybDsgfSlcbiAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlJylcbiAgICAgIC5hdHRyKCd3aWR0aCcsIDMyKVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIDMyKVxuICAgICAgLmF0dHIoJ3gnLCAtMzIqMC41KVxuICAgICAgLmF0dHIoJ3knLCAtMzIqMC41KVxuICAgICAgLm9uKCdjbGljaycsIHRoaXMuX29uTm9kZUNsaWNrQm91bmQpO1xuXG4gIHRoaXMubm9kZS5jYWxsKHRoaXMuZm9yY2UuZHJhZyk7XG5cbiAgdGhpcy5ub2RlLmFwcGVuZCgndGl0bGUnKVxuICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQubG9naW47IH0pO1xufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLl9vbk5vZGVDbGljayA9IGZ1bmN0aW9uKGQpIHtcbiAgY29uc29sZS5sb2coZCk7XG4gIHRoaXMuYWRkVXNlckJ5VXNlcm5hbWUoZC5sb2dpbik7XG59O1xuXG5Gb2xsb3dlcnNHcmFwaC5wcm90b3R5cGUuX2FkZFVzZXIgPSBmdW5jdGlvbih1c2VyKSB7XG4gIGlmICghdGhpcy5fbWFwW3VzZXIuaWRdKSB7XG4gICAgdGhpcy5fbWFwW3VzZXIuaWRdID0gdXNlcjtcbiAgICB0aGlzLnVzZXJzRGF0YS5wdXNoKHVzZXIpO1xuICB9XG4gIHJldHVybiB0aGlzLl9tYXBbdXNlci5pZF07XG59O1xuXG5Gb2xsb3dlcnNHcmFwaC5wcm90b3R5cGUuX2FkZEZvbGxvd2VyTGluayA9IGZ1bmN0aW9uKHRhcmdldFVzZXIsIHNvdXJjZVVzZXIpIHtcbiAgdGFyZ2V0VXNlciA9IHRoaXMuX2FkZFVzZXIodGFyZ2V0VXNlcik7XG4gIHNvdXJjZVVzZXIgPSB0aGlzLl9hZGRVc2VyKHNvdXJjZVVzZXIpO1xuXG4gIHZhciBleGlzdHMgPSB0aGlzLl9tYXBbc291cmNlVXNlci5pbmRleCArICctJyArIHRhcmdldFVzZXIuaW5kZXhdO1xuXG4gIGlmICghZXhpc3RzKSB7XG4gICAgdGhpcy5fbWFwW3NvdXJjZVVzZXIuaWQgKyAnLScgKyB0YXJnZXRVc2VyLmlkXSA9IHRydWU7XG4gICAgdGhpcy5mb2xsb3dlckxpbmtzRGF0YS5wdXNoKHsgc291cmNlOiBzb3VyY2VVc2VyLCB0YXJnZXQ6IHRhcmdldFVzZXIgfSk7XG4gIH1cbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5hZGRVc2VyQnlVc2VybmFtZSA9IGZ1bmN0aW9uKHVzZXJuYW1lKSB7XG4gIHRvYXN0KCdGZXRjaGluZyBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSkgKyAnLi4uJywgJ3Byb2dyZXNzJyk7XG4gIGQzLmpzb24oJ2FwaS91c2Vycy8nICsgdXNlcm5hbWUgKyAnL2ZvbGxvd2VycycsIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICBpZiAoZXJyb3IpIHJldHVybiBjb25zb2xlLndhcm4oZXJyb3IpO1xuXG4gICAgdG9hc3QoJ0ZldGNoZWQgZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpLCAnc3VjY2VzcycpO1xuXG4gICAgcmVzdWx0LmZvbGxvd2Vycy5mb3JFYWNoKGZ1bmN0aW9uKGZvbGxvd2VyKSB7XG4gICAgICB0aGlzLl9hZGRGb2xsb3dlckxpbmsocmVzdWx0LnVzZXIsIGZvbGxvd2VyKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5yZW5kZXIoKTtcbiAgfS5iaW5kKHRoaXMpKTtcbn07XG5cbmZ1bmN0aW9uIGNvbGxpZGUobm9kZSkge1xuICB2YXIgciA9IG5vZGUucmFkaXVzICsgMTAsXG4gICAgICBueDEgPSBub2RlLnggLSByLFxuICAgICAgbngyID0gbm9kZS54ICsgcixcbiAgICAgIG55MSA9IG5vZGUueSAtIHIsXG4gICAgICBueTIgPSBub2RlLnkgKyByO1xuICByZXR1cm4gZnVuY3Rpb24ocXVhZCwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICBpZiAocXVhZC5wb2ludCAmJiAocXVhZC5wb2ludCAhPT0gbm9kZSkpIHtcbiAgICAgIHZhciB4ID0gbm9kZS54IC0gcXVhZC5wb2ludC54LFxuICAgICAgICAgIHkgPSBub2RlLnkgLSBxdWFkLnBvaW50LnksXG4gICAgICAgICAgbCA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSxcbiAgICAgICAgICByID0gbm9kZS5yYWRpdXMgKyBxdWFkLnBvaW50LnJhZGl1cztcbiAgICAgIGlmIChsIDwgcikge1xuICAgICAgICBsID0gKGwgLSByKSAvIGwgKiAuNTtcbiAgICAgICAgbm9kZS54IC09IHggKj0gbDtcbiAgICAgICAgbm9kZS55IC09IHkgKj0gbDtcbiAgICAgICAgcXVhZC5wb2ludC54ICs9IHg7XG4gICAgICAgIHF1YWQucG9pbnQueSArPSB5O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geDEgPiBueDIgfHwgeDIgPCBueDEgfHwgeTEgPiBueTIgfHwgeTIgPCBueTE7XG4gIH07XG59XG5cblxuXG52YXIgZm9sbG93ZXJzR3JhcGggPSBuZXcgRm9sbG93ZXJzR3JhcGgoKTtcbmZvbGxvd2Vyc0dyYXBoLmFkZFVzZXJCeVVzZXJuYW1lKCdGYXJoYWRHJyk7XG4iXX0=
