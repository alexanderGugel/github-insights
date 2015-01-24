(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
'use strict';


/* jshint undef: true, unused: true */
/* global d3 */

var $toast = document.getElementById('toast');
var $reset = document.getElementById('reset');
var $form = document.querySelector('nav form');
var $username = $form.querySelector('input');

function toast(html, type) {
  $toast.innerHTML = html;
  $toast.className = type;
  $toast.style.opacity = 1;
}

function usernameToLink(username) {
  return ('<a target="_blank" href="https://github.com/' + username + '">' + username + '</a>');
}

$reset.addEventListener('click', function(event) {
  event.preventDefault();
  event.stopPropagation();
  reset();
});

$form.addEventListener('submit', function(event) {
  event.preventDefault();
  addUserByUsername($username.value);
  $username.value = '';
});

var force, svg, edge, node;
var usersData;
var followerLinksData;
var _map;
var zoom;
var _addedByUsername;
var _addFollowerLinkQueue;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

function init() {
  force = d3.layout.force()
    .charge(-400)
    .linkDistance(400)
    .linkStrength(0.1)
    .chargeDistance(400)
    .gravity(0.5)
    .size([WIDTH, HEIGHT])
    .on('tick', tick);

  zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on('zoom', onZoom);

  svg = d3.select('body').insert('svg', ':first-child')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
    .call(zoom);


  // build the arrow.
  svg.append('svg:defs').selectAll('marker')
      .data(['end'])      // Different link/path types can be defined here
    .enter().append('svg:marker')    // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 32+3)
      .attr('refY', -0.5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

  edge = svg.selectAll('.edge');
  node = svg.selectAll('.node');

  reset();
}

function reset() {
  usersData = [];
  followerLinksData = [];
  _map = {};
  _addedByUsername = {};
  _addFollowerLinkQueue = [];
  render();
}

function tick() {
  var nextFollowerLink = _addFollowerLinkQueue.pop();
  if (nextFollowerLink) _addFollowerLink.apply(null, nextFollowerLink);
  node
    .attr('opacity', function(d) {
      return d.linksAdded ? 1 : 0.4;
    })
    .attr('transform', function(d) {
      d.x = Math.max(32*0.5, Math.min(WIDTH - 32*0.5, d.x));
      d.y = Math.max(32*0.5, Math.min(HEIGHT - 32*0.5, d.y));;
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  edge
    .attr('x2', function(d) { return d.source.x; })
    .attr('y2', function(d) { return d.source.y; })
    .attr('x1', function(d) { return d.target.x; })
    .attr('y1', function(d) { return d.target.y; });
}

function render() {
  force = force
    .nodes(usersData)
    .links(followerLinksData)
    .start();

  edge = edge.data(followerLinksData);

  edge
    .enter().insert('line', ':first-child')
      // .attr("marker-end", "url(#end)")
      .attr('class', 'edge');
  edge
    .exit().remove();

  node = node.data(usersData);

  node
    .enter().append('image')
      .attr('xlink:href', function(d) { return d.avatar_url; })
      .attr('class', 'node')
      .attr('width', 32)
      .attr('height', 32)
      .attr('x', -32*0.5)
      .attr('y', -32*0.5)
      .on('click', _onNodeClick);
  node
    .exit().remove();

  node.call(force.drag);
}

function onZoom() {
  svg.style('transform', 'scale(' + d3.event.scale + ')');
}

function _onNodeClick(d) {
  addUserByUsername(d.login);
}

function _addUser(user) {
  if (!_map[user.id]) {
    _map[user.id] = user;
    usersData.push(user);
  }
  return _map[user.id];
}

setInterval(function() {
  console.log(_addFollowerLinkQueue.length)
}, 100)

function _addFollowerLink(targetUser, sourceUser) {
  targetUser.linksAdded = true;
  targetUser = _addUser(targetUser);
  sourceUser = _addUser(sourceUser);
  if (!_map[sourceUser.index + '-' + targetUser.index]) {
    _map[sourceUser.id + '-' + targetUser.id] = true;
    followerLinksData.push({ source: sourceUser, target: targetUser });
  }
  render();
}

function addUserByUsername(username) {
  if (_addedByUsername[username]) return;
  _addedByUsername[username] = true;
  toast('Fetching followers for ' + usernameToLink(username) + '...', 'progress');
  d3.json('api/users/' + username + '/following', function(error, result) {
    if (error) {
      return toast('Could not fetch followers for ' + usernameToLink(username), 'error');
    }
    toast('Fetched followers for ' + usernameToLink(username), 'success');
    result.following.forEach(function(follower) {
      // Preload image
      var image = new Image();
      image.src = follower.avatar_url;
      image.onload = _addFollowerLink.bind(null, result.user, follower);
    });
    render();
  });
}


init();
addUserByUsername('FarhadG');

},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuXG4vKiBqc2hpbnQgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLyogZ2xvYmFsIGQzICovXG5cbnZhciAkdG9hc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QnKTtcbnZhciAkcmVzZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQnKTtcbnZhciAkZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdiBmb3JtJyk7XG52YXIgJHVzZXJuYW1lID0gJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcblxuZnVuY3Rpb24gdG9hc3QoaHRtbCwgdHlwZSkge1xuICAkdG9hc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgJHRvYXN0LmNsYXNzTmFtZSA9IHR5cGU7XG4gICR0b2FzdC5zdHlsZS5vcGFjaXR5ID0gMTtcbn1cblxuZnVuY3Rpb24gdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpIHtcbiAgcmV0dXJuICgnPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS8nICsgdXNlcm5hbWUgKyAnXCI+JyArIHVzZXJuYW1lICsgJzwvYT4nKTtcbn1cblxuJHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIHJlc2V0KCk7XG59KTtcblxuJGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgYWRkVXNlckJ5VXNlcm5hbWUoJHVzZXJuYW1lLnZhbHVlKTtcbiAgJHVzZXJuYW1lLnZhbHVlID0gJyc7XG59KTtcblxudmFyIGZvcmNlLCBzdmcsIGVkZ2UsIG5vZGU7XG52YXIgdXNlcnNEYXRhO1xudmFyIGZvbGxvd2VyTGlua3NEYXRhO1xudmFyIF9tYXA7XG52YXIgem9vbTtcbnZhciBfYWRkZWRCeVVzZXJuYW1lO1xudmFyIF9hZGRGb2xsb3dlckxpbmtRdWV1ZTtcbnZhciBXSURUSCA9IHdpbmRvdy5pbm5lcldpZHRoO1xudmFyIEhFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgZm9yY2UgPSBkMy5sYXlvdXQuZm9yY2UoKVxuICAgIC5jaGFyZ2UoLTQwMClcbiAgICAubGlua0Rpc3RhbmNlKDQwMClcbiAgICAubGlua1N0cmVuZ3RoKDAuMSlcbiAgICAuY2hhcmdlRGlzdGFuY2UoNDAwKVxuICAgIC5ncmF2aXR5KDAuNSlcbiAgICAuc2l6ZShbV0lEVEgsIEhFSUdIVF0pXG4gICAgLm9uKCd0aWNrJywgdGljayk7XG5cbiAgem9vbSA9IGQzLmJlaGF2aW9yLnpvb20oKVxuICAgIC5zY2FsZUV4dGVudChbMSwgMTBdKVxuICAgIC5vbignem9vbScsIG9uWm9vbSk7XG5cbiAgc3ZnID0gZDMuc2VsZWN0KCdib2R5JykuaW5zZXJ0KCdzdmcnLCAnOmZpcnN0LWNoaWxkJylcbiAgICAuYXR0cignd2lkdGgnLCBXSURUSClcbiAgICAuYXR0cignaGVpZ2h0JywgSEVJR0hUKVxuICAgIC5jYWxsKHpvb20pO1xuXG5cbiAgLy8gYnVpbGQgdGhlIGFycm93LlxuICBzdmcuYXBwZW5kKCdzdmc6ZGVmcycpLnNlbGVjdEFsbCgnbWFya2VyJylcbiAgICAgIC5kYXRhKFsnZW5kJ10pICAgICAgLy8gRGlmZmVyZW50IGxpbmsvcGF0aCB0eXBlcyBjYW4gYmUgZGVmaW5lZCBoZXJlXG4gICAgLmVudGVyKCkuYXBwZW5kKCdzdmc6bWFya2VyJykgICAgLy8gVGhpcyBzZWN0aW9uIGFkZHMgaW4gdGhlIGFycm93c1xuICAgICAgLmF0dHIoJ2lkJywgU3RyaW5nKVxuICAgICAgLmF0dHIoJ3ZpZXdCb3gnLCAnMCAtNSAxMCAxMCcpXG4gICAgICAuYXR0cigncmVmWCcsIDMyKzMpXG4gICAgICAuYXR0cigncmVmWScsIC0wLjUpXG4gICAgICAuYXR0cignbWFya2VyV2lkdGgnLCA2KVxuICAgICAgLmF0dHIoJ21hcmtlckhlaWdodCcsIDYpXG4gICAgICAuYXR0cignb3JpZW50JywgJ2F1dG8nKVxuICAgIC5hcHBlbmQoJ3N2ZzpwYXRoJylcbiAgICAgIC5hdHRyKCdkJywgJ00wLC01TDEwLDBMMCw1Jyk7XG5cbiAgZWRnZSA9IHN2Zy5zZWxlY3RBbGwoJy5lZGdlJyk7XG4gIG5vZGUgPSBzdmcuc2VsZWN0QWxsKCcubm9kZScpO1xuXG4gIHJlc2V0KCk7XG59XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICB1c2Vyc0RhdGEgPSBbXTtcbiAgZm9sbG93ZXJMaW5rc0RhdGEgPSBbXTtcbiAgX21hcCA9IHt9O1xuICBfYWRkZWRCeVVzZXJuYW1lID0ge307XG4gIF9hZGRGb2xsb3dlckxpbmtRdWV1ZSA9IFtdO1xuICByZW5kZXIoKTtcbn1cblxuZnVuY3Rpb24gdGljaygpIHtcbiAgdmFyIG5leHRGb2xsb3dlckxpbmsgPSBfYWRkRm9sbG93ZXJMaW5rUXVldWUucG9wKCk7XG4gIGlmIChuZXh0Rm9sbG93ZXJMaW5rKSBfYWRkRm9sbG93ZXJMaW5rLmFwcGx5KG51bGwsIG5leHRGb2xsb3dlckxpbmspO1xuICBub2RlXG4gICAgLmF0dHIoJ29wYWNpdHknLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gZC5saW5rc0FkZGVkID8gMSA6IDAuNDtcbiAgICB9KVxuICAgIC5hdHRyKCd0cmFuc2Zvcm0nLCBmdW5jdGlvbihkKSB7XG4gICAgICBkLnggPSBNYXRoLm1heCgzMiowLjUsIE1hdGgubWluKFdJRFRIIC0gMzIqMC41LCBkLngpKTtcbiAgICAgIGQueSA9IE1hdGgubWF4KDMyKjAuNSwgTWF0aC5taW4oSEVJR0hUIC0gMzIqMC41LCBkLnkpKTs7XG4gICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgZC54ICsgJywnICsgZC55ICsgJyknO1xuICAgIH0pO1xuXG4gIGVkZ2VcbiAgICAuYXR0cigneDInLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnNvdXJjZS54OyB9KVxuICAgIC5hdHRyKCd5MicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnk7IH0pXG4gICAgLmF0dHIoJ3gxJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueDsgfSlcbiAgICAuYXR0cigneTEnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC55OyB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyKCkge1xuICBmb3JjZSA9IGZvcmNlXG4gICAgLm5vZGVzKHVzZXJzRGF0YSlcbiAgICAubGlua3MoZm9sbG93ZXJMaW5rc0RhdGEpXG4gICAgLnN0YXJ0KCk7XG5cbiAgZWRnZSA9IGVkZ2UuZGF0YShmb2xsb3dlckxpbmtzRGF0YSk7XG5cbiAgZWRnZVxuICAgIC5lbnRlcigpLmluc2VydCgnbGluZScsICc6Zmlyc3QtY2hpbGQnKVxuICAgICAgLy8gLmF0dHIoXCJtYXJrZXItZW5kXCIsIFwidXJsKCNlbmQpXCIpXG4gICAgICAuYXR0cignY2xhc3MnLCAnZWRnZScpO1xuICBlZGdlXG4gICAgLmV4aXQoKS5yZW1vdmUoKTtcblxuICBub2RlID0gbm9kZS5kYXRhKHVzZXJzRGF0YSk7XG5cbiAgbm9kZVxuICAgIC5lbnRlcigpLmFwcGVuZCgnaW1hZ2UnKVxuICAgICAgLmF0dHIoJ3hsaW5rOmhyZWYnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmF2YXRhcl91cmw7IH0pXG4gICAgICAuYXR0cignY2xhc3MnLCAnbm9kZScpXG4gICAgICAuYXR0cignd2lkdGgnLCAzMilcbiAgICAgIC5hdHRyKCdoZWlnaHQnLCAzMilcbiAgICAgIC5hdHRyKCd4JywgLTMyKjAuNSlcbiAgICAgIC5hdHRyKCd5JywgLTMyKjAuNSlcbiAgICAgIC5vbignY2xpY2snLCBfb25Ob2RlQ2xpY2spO1xuICBub2RlXG4gICAgLmV4aXQoKS5yZW1vdmUoKTtcblxuICBub2RlLmNhbGwoZm9yY2UuZHJhZyk7XG59XG5cbmZ1bmN0aW9uIG9uWm9vbSgpIHtcbiAgc3ZnLnN0eWxlKCd0cmFuc2Zvcm0nLCAnc2NhbGUoJyArIGQzLmV2ZW50LnNjYWxlICsgJyknKTtcbn1cblxuZnVuY3Rpb24gX29uTm9kZUNsaWNrKGQpIHtcbiAgYWRkVXNlckJ5VXNlcm5hbWUoZC5sb2dpbik7XG59XG5cbmZ1bmN0aW9uIF9hZGRVc2VyKHVzZXIpIHtcbiAgaWYgKCFfbWFwW3VzZXIuaWRdKSB7XG4gICAgX21hcFt1c2VyLmlkXSA9IHVzZXI7XG4gICAgdXNlcnNEYXRhLnB1c2godXNlcik7XG4gIH1cbiAgcmV0dXJuIF9tYXBbdXNlci5pZF07XG59XG5cbnNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZyhfYWRkRm9sbG93ZXJMaW5rUXVldWUubGVuZ3RoKVxufSwgMTAwKVxuXG5mdW5jdGlvbiBfYWRkRm9sbG93ZXJMaW5rKHRhcmdldFVzZXIsIHNvdXJjZVVzZXIpIHtcbiAgdGFyZ2V0VXNlci5saW5rc0FkZGVkID0gdHJ1ZTtcbiAgdGFyZ2V0VXNlciA9IF9hZGRVc2VyKHRhcmdldFVzZXIpO1xuICBzb3VyY2VVc2VyID0gX2FkZFVzZXIoc291cmNlVXNlcik7XG4gIGlmICghX21hcFtzb3VyY2VVc2VyLmluZGV4ICsgJy0nICsgdGFyZ2V0VXNlci5pbmRleF0pIHtcbiAgICBfbWFwW3NvdXJjZVVzZXIuaWQgKyAnLScgKyB0YXJnZXRVc2VyLmlkXSA9IHRydWU7XG4gICAgZm9sbG93ZXJMaW5rc0RhdGEucHVzaCh7IHNvdXJjZTogc291cmNlVXNlciwgdGFyZ2V0OiB0YXJnZXRVc2VyIH0pO1xuICB9XG4gIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiBhZGRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICBpZiAoX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0pIHJldHVybjtcbiAgX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0gPSB0cnVlO1xuICB0b2FzdCgnRmV0Y2hpbmcgZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpICsgJy4uLicsICdwcm9ncmVzcycpO1xuICBkMy5qc29uKCdhcGkvdXNlcnMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3dpbmcnLCBmdW5jdGlvbihlcnJvciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gdG9hc3QoJ0NvdWxkIG5vdCBmZXRjaCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdlcnJvcicpO1xuICAgIH1cbiAgICB0b2FzdCgnRmV0Y2hlZCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdzdWNjZXNzJyk7XG4gICAgcmVzdWx0LmZvbGxvd2luZy5mb3JFYWNoKGZ1bmN0aW9uKGZvbGxvd2VyKSB7XG4gICAgICAvLyBQcmVsb2FkIGltYWdlXG4gICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGltYWdlLnNyYyA9IGZvbGxvd2VyLmF2YXRhcl91cmw7XG4gICAgICBpbWFnZS5vbmxvYWQgPSBfYWRkRm9sbG93ZXJMaW5rLmJpbmQobnVsbCwgcmVzdWx0LnVzZXIsIGZvbGxvd2VyKTtcbiAgICB9KTtcbiAgICByZW5kZXIoKTtcbiAgfSk7XG59XG5cblxuaW5pdCgpO1xuYWRkVXNlckJ5VXNlcm5hbWUoJ0ZhcmhhZEcnKTtcbiJdfQ==
