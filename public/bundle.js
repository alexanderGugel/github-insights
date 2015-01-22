(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
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


},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIEZvbGxvd2Vyc0dyYXBoID0gZnVuY3Rpb24oKSB7XG4gIHZhciB3aWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoLFxuICBoZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbiAgdGhpcy5jb2xvciA9IGQzLnNjYWxlLmNhdGVnb3J5MjAoKTtcblxuICB0aGlzLmZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC0xMDApXG4gICAgLmxpbmtEaXN0YW5jZSgxMDApXG4gICAgLnNpemUoW3dpZHRoLCBoZWlnaHRdKTtcblxuICB0aGlzLnN2ZyA9IGQzLnNlbGVjdCgnYm9keScpLmFwcGVuZCgnc3ZnJylcbiAgICAuYXR0cignd2lkdGgnLCB3aWR0aClcbiAgICAuYXR0cignaGVpZ2h0JywgaGVpZ2h0KTtcblxuICB0aGlzLmxpbmsgPSB0aGlzLnN2Zy5zZWxlY3RBbGwoJy5saW5rJyk7XG4gIHRoaXMubm9kZSA9IHRoaXMuc3ZnLnNlbGVjdEFsbCgnLm5vZGUnKTtcblxuICB0aGlzLmZvcmNlLm9uKCd0aWNrJywgZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5saW5rXG4gICAgLmF0dHIoJ3gxJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zb3VyY2UueDsgfSlcbiAgICAuYXR0cigneTEnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnNvdXJjZS55OyB9KVxuICAgIC5hdHRyKCd4MicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lng7IH0pXG4gICAgLmF0dHIoJ3kyJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueTsgfSk7XG5cbiAgICB0aGlzLm5vZGVcbiAgICAuYXR0cigneCcsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQueCAtIDMyKjAuNTsgfSlcbiAgICAuYXR0cigneScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQueSAtIDMyKjAuNTsgfSk7XG4gIH0uYmluZCh0aGlzKSk7XG5cbiAgdGhpcy51c2Vyc0RhdGEgPSBbXTtcbiAgdGhpcy5mb2xsb3dlckxpbmtzRGF0YSA9IFtdO1xuXG4gIC8vIGlkOiBpbmRleFxuICB0aGlzLnVzZXJUb0luZGV4ID0ge307XG5cbiAgLy8gc291cmNlLXRhcmdldDogaW5kZXhcbiAgdGhpcy5saW5rVG9JbmRleCA9IHt9O1xufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLnJlbmRlciA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy5mb3JjZSA9IHRoaXMuZm9yY2VcbiAgICAubm9kZXModGhpcy51c2Vyc0RhdGEpXG4gICAgLmxpbmtzKHRoaXMuZm9sbG93ZXJMaW5rc0RhdGEpXG4gICAgLnN0YXJ0KCk7XG5cbiAgdGhpcy5saW5rID0gdGhpcy5saW5rLmRhdGEodGhpcy5mb2xsb3dlckxpbmtzRGF0YSk7XG5cbiAgdGhpcy5saW5rXG4gICAgLmVudGVyKCkuYXBwZW5kKCdsaW5lJylcbiAgICAuYXR0cignY2xhc3MnLCAnbGluaycpXG4gICAgLnN0eWxlKCdzdHJva2Utd2lkdGgnLCBmdW5jdGlvbihkKSB7IHJldHVybiBNYXRoLnNxcnQoOCk7IH0pO1xuXG4gIHRoaXMubm9kZSA9IHRoaXMubm9kZS5kYXRhKHRoaXMudXNlcnNEYXRhKTtcblxuICB0aGlzLm5vZGVcbiAgICAvLyAuZW50ZXIoKVxuICAgIC8vIC5hcHBlbmQoJ2NpcmNsZScpXG4gICAgLy8gLmF0dHIoJ2NsYXNzJywgJ25vZGUnKVxuICAgIC8vIC5hdHRyKCdyJywgNSlcbiAgICAvLyAuc3R5bGUoJ2ZpbGwnLCBmdW5jdGlvbihkKSB7IHJldHVybiAnIzAwMCc7IH0pO1xuXG4gICAgLmVudGVyKCkuYXBwZW5kKCdpbWFnZScpXG4gICAgICAuYXR0cigneGxpbms6aHJlZicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuYXZhdGFyX3VybDsgfSlcbiAgICAgIC8vIC5hdHRyKCd4JywgLTgpXG4gICAgICAvLyAuYXR0cigneScsIC04KVxuICAgICAgLmF0dHIoJ3dpZHRoJywgMzIpXG4gICAgICAuYXR0cignaGVpZ2h0JywgMzIpO1xuXG4gIHRoaXMubm9kZS5jYWxsKHRoaXMuZm9yY2UuZHJhZyk7XG5cbiAgdGhpcy5ub2RlLmFwcGVuZCgndGl0bGUnKVxuICAgIC50ZXh0KGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQubG9naW47IH0pO1xufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLl9hZGRVc2VyID0gZnVuY3Rpb24odXNlcikge1xuICBjb25zb2xlLmxvZyh1c2VyKVxuICAvLyBpZiB1c2VyIGlzIGFscmVhZHkgaW4gdGhlIGdyYXBoLCByZXR1cm4gaWRcbiAgLy8gaWYgdXNlciBpcyBub3QgaW4gZ3JhcGgsIGFkZCBhbmQgcmV0dXJuIGlkXG4gIGlmICh0aGlzLnVzZXJUb0luZGV4W3VzZXIuaWRdKSB7XG4gICAgcmV0dXJuIHRoaXMudXNlclRvSW5kZXhbdXNlci5pZF07XG4gIH0gZWxzZSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy51c2Vyc0RhdGEubGVuZ3RoO1xuICAgIHRoaXMudXNlcnNEYXRhLnB1c2godXNlcik7XG4gICAgdGhpcy51c2VyVG9JbmRleFt1c2VyLmlkXSA9IGluZGV4O1xuICAgIHJldHVybiBpbmRleDtcbiAgfVxufTtcblxuRm9sbG93ZXJzR3JhcGgucHJvdG90eXBlLl9hZGRGb2xsb3dlckxpbmsgPSBmdW5jdGlvbih0YXJnZXRVc2VyLCBmb2xsb3dlclVzZXIpIHtcbiAgdmFyIHRhcmdldFVzZXJJbmRleCA9IHRoaXMuX2FkZFVzZXIodGFyZ2V0VXNlcik7XG4gIHZhciBmb2xsb3dlclVzZXJJbmRleCA9IHRoaXMuX2FkZFVzZXIoZm9sbG93ZXJVc2VyKTtcblxuICB2YXIgbGlua0luZGV4ID0gdGhpcy5saW5rVG9JbmRleFtmb2xsb3dlclVzZXJJbmRleCArICctJyArIHRhcmdldFVzZXJJbmRleF07XG5cbiAgaWYgKCFsaW5rSW5kZXgpIHtcbiAgICBsaW5rSW5kZXggPSB0aGlzLmZvbGxvd2VyTGlua3NEYXRhLmxlbmd0aDtcbiAgICB0aGlzLmxpbmtUb0luZGV4W2ZvbGxvd2VyVXNlckluZGV4ICsgJy0nICsgdGFyZ2V0VXNlckluZGV4XSA9IGxpbmtJbmRleDtcbiAgICB0aGlzLmZvbGxvd2VyTGlua3NEYXRhLnB1c2goe1xuICAgICAgc291cmNlOiBmb2xsb3dlclVzZXJJbmRleCxcbiAgICAgIHRhcmdldDogdGFyZ2V0VXNlckluZGV4XG4gICAgfSk7XG4gIH1cbn07XG5cbkZvbGxvd2Vyc0dyYXBoLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih1c2VybmFtZSkge1xuICBkMy5qc29uKCdhcGkvdXNlcnMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3dlcnMnLCBmdW5jdGlvbihlcnJvciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycm9yKSByZXR1cm4gY29uc29sZS53YXJuKGVycm9yKTtcblxuICAgIHJlc3VsdC5mb2xsb3dlcnMuZm9yRWFjaChmdW5jdGlvbihmb2xsb3dlcikge1xuICAgICAgdGhpcy5fYWRkRm9sbG93ZXJMaW5rKHJlc3VsdC51c2VyLCBmb2xsb3dlcik7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHRoaXMucmVuZGVyKCk7XG4gIH0uYmluZCh0aGlzKSk7XG59O1xuXG5cbnZhciBmb2xsb3dlcnNHcmFwaCA9IG5ldyBGb2xsb3dlcnNHcmFwaCgpO1xuZm9sbG93ZXJzR3JhcGguYWRkKCdtYXJjd2lsaGl0ZScpO1xuXG5cbi8vIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4vLyAgIGZvbGxvd2Vyc0dyYXBoLmFkZCgnbWFya2x1Jyk7XG4vLyB9LCA1MDApO1xuXG4iXX0=
