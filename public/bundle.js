(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
'use strict';

var $toast = document.getElementById('toast');

function toast(html, type) {
  $toast.innerHTML = html;
  $toast.className = type;
  $toast.style.opacity = 1;
}

var FollowersGraph = function() {
  var width = window.innerWidth,
  height = window.innerHeight;

  this.color = d3.scale.category20();

  this.force = d3.layout.force()
    .charge(-300)
    .linkDistance(32)
    // .linkStrength(0.1)
    .gravity(0.5)
    .size([width, height]);

  this.svg = d3.select('body').append('svg')
    .attr('width', width)
    .attr('height', height);

  this.link = this.svg.selectAll('.link');
  this.node = this.svg.selectAll('.node');

  this._onNodeClickBound = this._onNodeClick.bind(this);

  this.zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on('zoom', function() {
      console.log('zoom')
      // this.svg.style('transform', 'translate(' + d3.event.translate + ')' + 'scale(' + d3.event.scale + ')');
    }.bind(this));

  this.drag = d3.behavior.drag();

  // this.svg.call(this.drag);
  // this.svg.call(this.zoom);

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
    .enter().insert('line', ':first-child')
    .attr('stroke-width', function(d) { return 1; })
    .attr('stroke', '#000')
    .attr('opacity', 0.3);


  this.node = this.node.data(this.usersData);

  this.node
    .enter().append('image')
      .attr('xlink:href', function(d) { return d.avatar_url; })
      .attr('x', -32*0.5)
      .attr('y', -32*0.5)
      .attr('width', 32)
      .attr('height', 32)
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
  d3.json('api/users/' + username + '/followers', function(error, result) {
    if (error) return console.warn(error);

    toast('Fetched followers for ' + username, 'success');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgJHRvYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvYXN0Jyk7XG5cbmZ1bmN0aW9uIHRvYXN0KGh0bWwsIHR5cGUpIHtcbiAgJHRvYXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICR0b2FzdC5jbGFzc05hbWUgPSB0eXBlO1xuICAkdG9hc3Quc3R5bGUub3BhY2l0eSA9IDE7XG59XG5cbnZhciBGb2xsb3dlcnNHcmFwaCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgd2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aCxcbiAgaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG4gIHRoaXMuY29sb3IgPSBkMy5zY2FsZS5jYXRlZ29yeTIwKCk7XG5cbiAgdGhpcy5mb3JjZSA9IGQzLmxheW91dC5mb3JjZSgpXG4gICAgLmNoYXJnZSgtMzAwKVxuICAgIC5saW5rRGlzdGFuY2UoMzIpXG4gICAgLy8gLmxpbmtTdHJlbmd0aCgwLjEpXG4gICAgLmdyYXZpdHkoMC41KVxuICAgIC5zaXplKFt3aWR0aCwgaGVpZ2h0XSk7XG5cbiAgdGhpcy5zdmcgPSBkMy5zZWxlY3QoJ2JvZHknKS5hcHBlbmQoJ3N2ZycpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2lkdGgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIGhlaWdodCk7XG5cbiAgdGhpcy5saW5rID0gdGhpcy5zdmcuc2VsZWN0QWxsKCcubGluaycpO1xuICB0aGlzLm5vZGUgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5ub2RlJyk7XG5cbiAgdGhpcy5fb25Ob2RlQ2xpY2tCb3VuZCA9IHRoaXMuX29uTm9kZUNsaWNrLmJpbmQodGhpcyk7XG5cbiAgdGhpcy56b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgLm9uKCd6b29tJywgZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZygnem9vbScpXG4gICAgICAvLyB0aGlzLnN2Zy5zdHlsZSgndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgZDMuZXZlbnQudHJhbnNsYXRlICsgJyknICsgJ3NjYWxlKCcgKyBkMy5ldmVudC5zY2FsZSArICcpJyk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICB0aGlzLmRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKCk7XG5cbiAgLy8gdGhpcy5zdmcuY2FsbCh0aGlzLmRyYWcpO1xuICAvLyB0aGlzLnN2Zy5jYWxsKHRoaXMuem9vbSk7XG5cbiAgdGhpcy5mb3JjZS5vbigndGljaycsIGZ1bmN0aW9uKCkge1xuICAgIC8vIHZhciBxID0gZDMuZ2VvbS5xdWFkdHJlZSh0aGlzLm5vZGUpLFxuICAgIC8vICAgICBpID0gMCxcbiAgICAvLyAgICAgbiA9IHRoaXMubm9kZTtcblxuICAgIC8vIHRoaXMubm9kZS5lYWNoKGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAvLyAgIHEudmlzaXQoY29sbGlkZShub2RlKSk7XG4gICAgLy8gfSk7XG5cbiAgICB0aGlzLmxpbmtcbiAgICAgIC5hdHRyKCd4MScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLng7IH0pXG4gICAgICAuYXR0cigneTEnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnNvdXJjZS55OyB9KVxuICAgICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueDsgfSlcbiAgICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lnk7IH0pO1xuXG4gICAgdGhpcy5ub2RlXG4gICAgICAuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgZC54ICsgJywnICsgZC55ICsgJyknOyB9KTtcbiAgfS5iaW5kKHRoaXMpKTtcblxuICB0aGlzLnVzZXJzRGF0YSA9IFtdO1xuICB0aGlzLmZvbGxvd2VyTGlua3NEYXRhID0gW107XG5cbiAgdGhpcy5fbWFwID0ge307XG59O1xuXG5Gb2xsb3dlcnNHcmFwaC5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmZvcmNlID0gdGhpcy5mb3JjZVxuICAgIC5ub2Rlcyh0aGlzLnVzZXJzRGF0YSlcbiAgICAubGlua3ModGhpcy5mb2xsb3dlckxpbmtzRGF0YSlcbiAgICAuc3RhcnQoKTtcblxuICB0aGlzLmxpbmsgPSB0aGlzLmxpbmsuZGF0YSh0aGlzLmZvbGxvd2VyTGlua3NEYXRhKTtcblxuICB0aGlzLmxpbmtcbiAgICAuZW50ZXIoKS5pbnNlcnQoJ2xpbmUnLCAnOmZpcnN0LWNoaWxkJylcbiAgICAuYXR0cignc3Ryb2tlLXdpZHRoJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gMTsgfSlcbiAgICAuYXR0cignc3Ryb2tlJywgJyMwMDAnKVxuICAgIC5hdHRyKCdvcGFjaXR5JywgMC4zKTtcblxuXG4gIHRoaXMubm9kZSA9IHRoaXMubm9kZS5kYXRhKHRoaXMudXNlcnNEYXRhKTtcblxuICB0aGlzLm5vZGVcbiAgICAuZW50ZXIoKS5hcHBlbmQoJ2ltYWdlJylcbiAgICAgIC5hdHRyKCd4bGluazpocmVmJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5hdmF0YXJfdXJsOyB9KVxuICAgICAgLmF0dHIoJ3gnLCAtMzIqMC41KVxuICAgICAgLmF0dHIoJ3knLCAtMzIqMC41KVxuICAgICAgLmF0dHIoJ3dpZHRoJywgMzIpXG4gICAgICAuYXR0cignaGVpZ2h0JywgMzIpXG4gICAgICAub24oJ2NsaWNrJywgdGhpcy5fb25Ob2RlQ2xpY2tCb3VuZCk7XG5cbiAgdGhpcy5ub2RlLmNhbGwodGhpcy5mb3JjZS5kcmFnKTtcblxuICB0aGlzLm5vZGUuYXBwZW5kKCd0aXRsZScpXG4gICAgLnRleHQoZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5sb2dpbjsgfSk7XG59O1xuXG5Gb2xsb3dlcnNHcmFwaC5wcm90b3R5cGUuX29uTm9kZUNsaWNrID0gZnVuY3Rpb24oZCkge1xuICBjb25zb2xlLmxvZyhkKTtcbiAgdGhpcy5hZGRVc2VyQnlVc2VybmFtZShkLmxvZ2luKTtcbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5fYWRkVXNlciA9IGZ1bmN0aW9uKHVzZXIpIHtcbiAgaWYgKCF0aGlzLl9tYXBbdXNlci5pZF0pIHtcbiAgICB0aGlzLl9tYXBbdXNlci5pZF0gPSB1c2VyO1xuICAgIHRoaXMudXNlcnNEYXRhLnB1c2godXNlcik7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX21hcFt1c2VyLmlkXTtcbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5fYWRkRm9sbG93ZXJMaW5rID0gZnVuY3Rpb24odGFyZ2V0VXNlciwgc291cmNlVXNlcikge1xuICB0YXJnZXRVc2VyID0gdGhpcy5fYWRkVXNlcih0YXJnZXRVc2VyKTtcbiAgc291cmNlVXNlciA9IHRoaXMuX2FkZFVzZXIoc291cmNlVXNlcik7XG5cbiAgdmFyIGV4aXN0cyA9IHRoaXMuX21hcFtzb3VyY2VVc2VyLmluZGV4ICsgJy0nICsgdGFyZ2V0VXNlci5pbmRleF07XG5cbiAgaWYgKCFleGlzdHMpIHtcbiAgICB0aGlzLl9tYXBbc291cmNlVXNlci5pZCArICctJyArIHRhcmdldFVzZXIuaWRdID0gdHJ1ZTtcbiAgICB0aGlzLmZvbGxvd2VyTGlua3NEYXRhLnB1c2goeyBzb3VyY2U6IHNvdXJjZVVzZXIsIHRhcmdldDogdGFyZ2V0VXNlciB9KTtcbiAgfVxufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLmFkZFVzZXJCeVVzZXJuYW1lID0gZnVuY3Rpb24odXNlcm5hbWUpIHtcbiAgZDMuanNvbignYXBpL3VzZXJzLycgKyB1c2VybmFtZSArICcvZm9sbG93ZXJzJywgZnVuY3Rpb24oZXJyb3IsIHJlc3VsdCkge1xuICAgIGlmIChlcnJvcikgcmV0dXJuIGNvbnNvbGUud2FybihlcnJvcik7XG5cbiAgICB0b2FzdCgnRmV0Y2hlZCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZSwgJ3N1Y2Nlc3MnKTtcblxuICAgIHJlc3VsdC5mb2xsb3dlcnMuZm9yRWFjaChmdW5jdGlvbihmb2xsb3dlcikge1xuICAgICAgdGhpcy5fYWRkRm9sbG93ZXJMaW5rKHJlc3VsdC51c2VyLCBmb2xsb3dlcik7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0uYmluZCh0aGlzKSk7XG59O1xuXG5mdW5jdGlvbiBjb2xsaWRlKG5vZGUpIHtcbiAgdmFyIHIgPSBub2RlLnJhZGl1cyArIDEwLFxuICAgICAgbngxID0gbm9kZS54IC0gcixcbiAgICAgIG54MiA9IG5vZGUueCArIHIsXG4gICAgICBueTEgPSBub2RlLnkgLSByLFxuICAgICAgbnkyID0gbm9kZS55ICsgcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKHF1YWQsIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgaWYgKHF1YWQucG9pbnQgJiYgKHF1YWQucG9pbnQgIT09IG5vZGUpKSB7XG4gICAgICB2YXIgeCA9IG5vZGUueCAtIHF1YWQucG9pbnQueCxcbiAgICAgICAgICB5ID0gbm9kZS55IC0gcXVhZC5wb2ludC55LFxuICAgICAgICAgIGwgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSksXG4gICAgICAgICAgciA9IG5vZGUucmFkaXVzICsgcXVhZC5wb2ludC5yYWRpdXM7XG4gICAgICBpZiAobCA8IHIpIHtcbiAgICAgICAgbCA9IChsIC0gcikgLyBsICogLjU7XG4gICAgICAgIG5vZGUueCAtPSB4ICo9IGw7XG4gICAgICAgIG5vZGUueSAtPSB5ICo9IGw7XG4gICAgICAgIHF1YWQucG9pbnQueCArPSB4O1xuICAgICAgICBxdWFkLnBvaW50LnkgKz0geTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHgxID4gbngyIHx8IHgyIDwgbngxIHx8IHkxID4gbnkyIHx8IHkyIDwgbnkxO1xuICB9O1xufVxuXG5cblxudmFyIGZvbGxvd2Vyc0dyYXBoID0gbmV3IEZvbGxvd2Vyc0dyYXBoKCk7XG5mb2xsb3dlcnNHcmFwaC5hZGRVc2VyQnlVc2VybmFtZSgnRmFyaGFkRycpO1xuIl19
