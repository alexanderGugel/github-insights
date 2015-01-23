(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
'use strict';

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

  this.svg.call(this.drag);
  this.svg.call(this.zoom);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEZvbGxvd2Vyc0dyYXBoID0gZnVuY3Rpb24oKSB7XG4gIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoLFxuICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgdGhpcy5jb2xvciA9IGQzLnNjYWxlLmNhdGVnb3J5MjAoKTtcblxuICB0aGlzLmZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC0zMDApXG4gICAgLmxpbmtEaXN0YW5jZSgzMilcbiAgICAvLyAubGlua1N0cmVuZ3RoKDAuMSlcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW3dpZHRoLCBoZWlnaHRdKTtcblxuICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCgnYm9keScpLmFwcGVuZCgnc3ZnJylcbiAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICB0aGlzLmxpbmsgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5saW5rJyk7XG4gIHRoaXMubm9kZSA9IHRoaXMuc3ZnLnNlbGVjdEFsbCgnLm5vZGUnKTtcblxuICB0aGlzLl9vbk5vZGVDbGlja0JvdW5kID0gdGhpcy5fb25Ob2RlQ2xpY2suYmluZCh0aGlzKTtcblxuICB0aGlzLnpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSlcbiAgICAub24oJ3pvb20nLCBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd6b29tJylcbiAgICAgIC8vIHRoaXMuc3ZnLnN0eWxlKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyBkMy5ldmVudC50cmFuc2xhdGUgKyAnKScgKyAnc2NhbGUoJyArIGQzLmV2ZW50LnNjYWxlICsgJyknKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gIHRoaXMuZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKTtcblxuICB0aGlzLnN2Zy5jYWxsKHRoaXMuZHJhZyk7XG4gIHRoaXMuc3ZnLmNhbGwodGhpcy56b29tKTtcblxuICB0aGlzLmZvcmNlLm9uKCd0aWNrJywgZnVuY3Rpb24oKSB7XG4gICAgLy8gdmFyIHEgPSBkMy5nZW9tLnF1YWR0cmVlKHRoaXMubm9kZSksXG4gICAgLy8gICAgIGkgPSAwLFxuICAgIC8vICAgICBuID0gdGhpcy5ub2RlO1xuXG4gICAgLy8gdGhpcy5ub2RlLmVhY2goZnVuY3Rpb24obm9kZSkge1xuICAgIC8vICAgcS52aXNpdChjb2xsaWRlKG5vZGUpKTtcbiAgICAvLyB9KTtcblxuICAgIHRoaXMubGlua1xuICAgICAgLmF0dHIoJ3gxJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zb3VyY2UueDsgfSlcbiAgICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnk7IH0pXG4gICAgICAuYXR0cigneDInLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC54OyB9KVxuICAgICAgLmF0dHIoJ3kyJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueTsgfSk7XG5cbiAgICB0aGlzLm5vZGVcbiAgICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7IHJldHVybiAndHJhbnNsYXRlKCcgKyBkLnggKyAnLCcgKyBkLnkgKyAnKSc7IH0pO1xuICB9LmJpbmQodGhpcykpO1xuXG4gIHRoaXMudXNlcnNEYXRhID0gW107XG4gIHRoaXMuZm9sbG93ZXJMaW5rc0RhdGEgPSBbXTtcblxuICB0aGlzLl9tYXAgPSB7fTtcbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuZm9yY2UgPSB0aGlzLmZvcmNlXG4gICAgLm5vZGVzKHRoaXMudXNlcnNEYXRhKVxuICAgIC5saW5rcyh0aGlzLmZvbGxvd2VyTGlua3NEYXRhKVxuICAgIC5zdGFydCgpO1xuXG4gIHRoaXMubGluayA9IHRoaXMubGluay5kYXRhKHRoaXMuZm9sbG93ZXJMaW5rc0RhdGEpO1xuXG4gIHRoaXMubGlua1xuICAgIC5lbnRlcigpLmluc2VydCgnbGluZScsICc6Zmlyc3QtY2hpbGQnKVxuICAgIC5hdHRyKCdzdHJva2Utd2lkdGgnLCBmdW5jdGlvbihkKSB7IHJldHVybiAxOyB9KVxuICAgIC5hdHRyKCdzdHJva2UnLCAnIzAwMCcpXG4gICAgLmF0dHIoJ29wYWNpdHknLCAwLjMpO1xuXG5cbiAgdGhpcy5ub2RlID0gdGhpcy5ub2RlLmRhdGEodGhpcy51c2Vyc0RhdGEpO1xuXG4gIHRoaXMubm9kZVxuICAgIC5lbnRlcigpLmFwcGVuZCgnaW1hZ2UnKVxuICAgICAgLmF0dHIoJ3hsaW5rOmhyZWYnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmF2YXRhcl91cmw7IH0pXG4gICAgICAuYXR0cigneCcsIC0zMiowLjUpXG4gICAgICAuYXR0cigneScsIC0zMiowLjUpXG4gICAgICAuYXR0cignd2lkdGgnLCAzMilcbiAgICAgIC5hdHRyKCdoZWlnaHQnLCAzMilcbiAgICAgIC5vbignY2xpY2snLCB0aGlzLl9vbk5vZGVDbGlja0JvdW5kKTtcblxuICB0aGlzLm5vZGUuY2FsbCh0aGlzLmZvcmNlLmRyYWcpO1xuXG4gIHRoaXMubm9kZS5hcHBlbmQoJ3RpdGxlJylcbiAgICAudGV4dChmdW5jdGlvbihkKSB7IHJldHVybiBkLmxvZ2luOyB9KTtcbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5fb25Ob2RlQ2xpY2sgPSBmdW5jdGlvbihkKSB7XG4gIGNvbnNvbGUubG9nKGQpO1xuICB0aGlzLmFkZFVzZXJCeVVzZXJuYW1lKGQubG9naW4pO1xufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLl9hZGRVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICBpZiAoIXRoaXMuX21hcFt1c2VyLmlkXSkge1xuICAgIHRoaXMuX21hcFt1c2VyLmlkXSA9IHVzZXI7XG4gICAgdGhpcy51c2Vyc0RhdGEucHVzaCh1c2VyKTtcbiAgfVxuICByZXR1cm4gdGhpcy5fbWFwW3VzZXIuaWRdO1xufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLl9hZGRGb2xsb3dlckxpbmsgPSBmdW5jdGlvbih0YXJnZXRVc2VyLCBzb3VyY2VVc2VyKSB7XG4gIHRhcmdldFVzZXIgPSB0aGlzLl9hZGRVc2VyKHRhcmdldFVzZXIpO1xuICBzb3VyY2VVc2VyID0gdGhpcy5fYWRkVXNlcihzb3VyY2VVc2VyKTtcblxuICB2YXIgZXhpc3RzID0gdGhpcy5fbWFwW3NvdXJjZVVzZXIuaW5kZXggKyAnLScgKyB0YXJnZXRVc2VyLmluZGV4XTtcblxuICBpZiAoIWV4aXN0cykge1xuICAgIHRoaXMuX21hcFtzb3VyY2VVc2VyLmlkICsgJy0nICsgdGFyZ2V0VXNlci5pZF0gPSB0cnVlO1xuICAgIHRoaXMuZm9sbG93ZXJMaW5rc0RhdGEucHVzaCh7IHNvdXJjZTogc291cmNlVXNlciwgdGFyZ2V0OiB0YXJnZXRVc2VyIH0pO1xuICB9XG59O1xuXG5Gb2xsb3dlcnNHcmFwaC5wcm90b3R5cGUuYWRkVXNlckJ5VXNlcm5hbWUgPSBmdW5jdGlvbih1c2VybmFtZSkge1xuICBkMy5qc29uKCdhcGkvdXNlcnMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3dlcnMnLCBmdW5jdGlvbihlcnJvciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycm9yKSByZXR1cm4gY29uc29sZS53YXJuKGVycm9yKTtcblxuICAgIHJlc3VsdC5mb2xsb3dlcnMuZm9yRWFjaChmdW5jdGlvbihmb2xsb3dlcikge1xuICAgICAgdGhpcy5fYWRkRm9sbG93ZXJMaW5rKHJlc3VsdC51c2VyLCBmb2xsb3dlcik7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0uYmluZCh0aGlzKSk7XG59O1xuXG5mdW5jdGlvbiBjb2xsaWRlKG5vZGUpIHtcbiAgdmFyIHIgPSBub2RlLnJhZGl1cyArIDEwLFxuICAgICAgbngxID0gbm9kZS54IC0gcixcbiAgICAgIG54MiA9IG5vZGUueCArIHIsXG4gICAgICBueTEgPSBub2RlLnkgLSByLFxuICAgICAgbnkyID0gbm9kZS55ICsgcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKHF1YWQsIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgaWYgKHF1YWQucG9pbnQgJiYgKHF1YWQucG9pbnQgIT09IG5vZGUpKSB7XG4gICAgICB2YXIgeCA9IG5vZGUueCAtIHF1YWQucG9pbnQueCxcbiAgICAgICAgICB5ID0gbm9kZS55IC0gcXVhZC5wb2ludC55LFxuICAgICAgICAgIGwgPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSksXG4gICAgICAgICAgciA9IG5vZGUucmFkaXVzICsgcXVhZC5wb2ludC5yYWRpdXM7XG4gICAgICBpZiAobCA8IHIpIHtcbiAgICAgICAgbCA9IChsIC0gcikgLyBsICogLjU7XG4gICAgICAgIG5vZGUueCAtPSB4ICo9IGw7XG4gICAgICAgIG5vZGUueSAtPSB5ICo9IGw7XG4gICAgICAgIHF1YWQucG9pbnQueCArPSB4O1xuICAgICAgICBxdWFkLnBvaW50LnkgKz0geTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHgxID4gbngyIHx8IHgyIDwgbngxIHx8IHkxID4gbnkyIHx8IHkyIDwgbnkxO1xuICB9O1xufVxuXG5cblxudmFyIGZvbGxvd2Vyc0dyYXBoID0gbmV3IEZvbGxvd2Vyc0dyYXBoKCk7XG5mb2xsb3dlcnNHcmFwaC5hZGRVc2VyQnlVc2VybmFtZSgnRmFyaGFkRycpO1xuIl19
