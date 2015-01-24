(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
'use strict';


/* jshint undef: true, unused: true */
/* global d3 */

var $toast = document.getElementById('toast');
var $reset = document.getElementById('reset');
var $form = document.querySelector('nav form');

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
  var username = $form.querySelector('input').value;
  addUserByUsername(username);
  $form.querySelector('input').value = '';
});

var force, svg, edge, node;
var usersData;
var followerLinksData;
var _map;
var zoom;
var _addedByUsername;

function init() {
  force = d3.layout.force()
    .charge(-500)
    .linkDistance(50)
    .gravity(0.5)
    .size([window.innerWidth, window.innerHeight]);


  zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on('zoom', onZoom);

  svg = d3.select('body').insert('svg', ':first-child')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)
    .call(zoom);

  edge = svg.selectAll('.edge');
  node = svg.selectAll('.node');

  force.on('tick', tick);

  reset();
}

function reset() {
  usersData = [];
  followerLinksData = [];
  _map = {};
  _addedByUsername = {};
  render();
}

function tick() {
  edge
    .attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; });

  node
    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
}

function render() {
  force = force
    .nodes(usersData)
    .links(followerLinksData)
    .start();

  edge = edge.data(followerLinksData);

  edge
    .enter().insert('line', ':first-child')
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
      .on('click', _onNodeClick)
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

function _addFollowerLink(targetUser, sourceUser) {
  targetUser = _addUser(targetUser);
  sourceUser = _addUser(sourceUser);
  if (!_map[sourceUser.index + '-' + targetUser.index]) {
    _map[sourceUser.id + '-' + targetUser.id] = true;
    followerLinksData.push({ source: sourceUser, target: targetUser });
  }
}

function addUserByUsername(username) {
  if (_addedByUsername[username]) return;
  _addedByUsername[username] = true;
  toast('Fetching followers for ' + usernameToLink(username) + '...', 'progress');
  d3.json('api/users/' + username + '/followers', function(error, result) {
    if (error) {
      return toast('Could not fetch followers for ' + usernameToLink(username), 'error');
    }
    toast('Fetched followers for ' + usernameToLink(username), 'success');
    result.followers.forEach(function(follower) {
      _addFollowerLink(result.user, follower);
    });
    render();
  });
}


init();
addUserByUsername('FarhadG');

},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbi8qIGpzaGludCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKiBnbG9iYWwgZDMgKi9cblxudmFyICR0b2FzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2FzdCcpO1xudmFyICRyZXNldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldCcpO1xudmFyICRmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbmF2IGZvcm0nKTtcblxuZnVuY3Rpb24gdG9hc3QoaHRtbCwgdHlwZSkge1xuICAkdG9hc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgJHRvYXN0LmNsYXNzTmFtZSA9IHR5cGU7XG4gICR0b2FzdC5zdHlsZS5vcGFjaXR5ID0gMTtcbn1cblxuZnVuY3Rpb24gdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpIHtcbiAgcmV0dXJuICgnPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS8nICsgdXNlcm5hbWUgKyAnXCI+JyArIHVzZXJuYW1lICsgJzwvYT4nKTtcbn1cblxuJHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIHJlc2V0KCk7XG59KTtcblxuJGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgdmFyIHVzZXJuYW1lID0gJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXQnKS52YWx1ZTtcbiAgYWRkVXNlckJ5VXNlcm5hbWUodXNlcm5hbWUpO1xuICAkZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpLnZhbHVlID0gJyc7XG59KTtcblxudmFyIGZvcmNlLCBzdmcsIGVkZ2UsIG5vZGU7XG52YXIgdXNlcnNEYXRhO1xudmFyIGZvbGxvd2VyTGlua3NEYXRhO1xudmFyIF9tYXA7XG52YXIgem9vbTtcbnZhciBfYWRkZWRCeVVzZXJuYW1lO1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICBmb3JjZSA9IGQzLmxheW91dC5mb3JjZSgpXG4gICAgLmNoYXJnZSgtNTAwKVxuICAgIC5saW5rRGlzdGFuY2UoNTApXG4gICAgLmdyYXZpdHkoMC41KVxuICAgIC5zaXplKFt3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0XSk7XG5cblxuICB6b29tID0gZDMuYmVoYXZpb3Iuem9vbSgpXG4gICAgLnNjYWxlRXh0ZW50KFsxLCAxMF0pXG4gICAgLm9uKCd6b29tJywgb25ab29tKTtcblxuICBzdmcgPSBkMy5zZWxlY3QoJ2JvZHknKS5pbnNlcnQoJ3N2ZycsICc6Zmlyc3QtY2hpbGQnKVxuICAgIC5hdHRyKCd3aWR0aCcsIHdpbmRvdy5pbm5lcldpZHRoKVxuICAgIC5hdHRyKCdoZWlnaHQnLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gICAgLmNhbGwoem9vbSk7XG5cbiAgZWRnZSA9IHN2Zy5zZWxlY3RBbGwoJy5lZGdlJyk7XG4gIG5vZGUgPSBzdmcuc2VsZWN0QWxsKCcubm9kZScpO1xuXG4gIGZvcmNlLm9uKCd0aWNrJywgdGljayk7XG5cbiAgcmVzZXQoKTtcbn1cblxuZnVuY3Rpb24gcmVzZXQoKSB7XG4gIHVzZXJzRGF0YSA9IFtdO1xuICBmb2xsb3dlckxpbmtzRGF0YSA9IFtdO1xuICBfbWFwID0ge307XG4gIF9hZGRlZEJ5VXNlcm5hbWUgPSB7fTtcbiAgcmVuZGVyKCk7XG59XG5cbmZ1bmN0aW9uIHRpY2soKSB7XG4gIGVkZ2VcbiAgICAuYXR0cigneDEnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnNvdXJjZS54OyB9KVxuICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnk7IH0pXG4gICAgLmF0dHIoJ3gyJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC50YXJnZXQueDsgfSlcbiAgICAuYXR0cigneTInLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC55OyB9KTtcblxuICBub2RlXG4gICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuICd0cmFuc2xhdGUoJyArIGQueCArICcsJyArIGQueSArICcpJzsgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgZm9yY2UgPSBmb3JjZVxuICAgIC5ub2Rlcyh1c2Vyc0RhdGEpXG4gICAgLmxpbmtzKGZvbGxvd2VyTGlua3NEYXRhKVxuICAgIC5zdGFydCgpO1xuXG4gIGVkZ2UgPSBlZGdlLmRhdGEoZm9sbG93ZXJMaW5rc0RhdGEpO1xuXG4gIGVkZ2VcbiAgICAuZW50ZXIoKS5pbnNlcnQoJ2xpbmUnLCAnOmZpcnN0LWNoaWxkJylcbiAgICAgIC5hdHRyKCdjbGFzcycsICdlZGdlJyk7XG4gIGVkZ2VcbiAgICAuZXhpdCgpLnJlbW92ZSgpO1xuXG4gIG5vZGUgPSBub2RlLmRhdGEodXNlcnNEYXRhKTtcblxuICBub2RlXG4gICAgLmVudGVyKCkuYXBwZW5kKCdpbWFnZScpXG4gICAgICAuYXR0cigneGxpbms6aHJlZicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuYXZhdGFyX3VybDsgfSlcbiAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlJylcbiAgICAgIC5hdHRyKCd3aWR0aCcsIDMyKVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIDMyKVxuICAgICAgLmF0dHIoJ3gnLCAtMzIqMC41KVxuICAgICAgLmF0dHIoJ3knLCAtMzIqMC41KVxuICAgICAgLm9uKCdjbGljaycsIF9vbk5vZGVDbGljaylcbiAgbm9kZVxuICAgIC5leGl0KCkucmVtb3ZlKCk7XG5cbiAgbm9kZS5jYWxsKGZvcmNlLmRyYWcpO1xufVxuXG5mdW5jdGlvbiBvblpvb20oKSB7XG4gIHN2Zy5zdHlsZSgndHJhbnNmb3JtJywgJ3NjYWxlKCcgKyBkMy5ldmVudC5zY2FsZSArICcpJyk7XG59XG5cbmZ1bmN0aW9uIF9vbk5vZGVDbGljayhkKSB7XG4gIGFkZFVzZXJCeVVzZXJuYW1lKGQubG9naW4pO1xufVxuXG5mdW5jdGlvbiBfYWRkVXNlcih1c2VyKSB7XG4gIGlmICghX21hcFt1c2VyLmlkXSkge1xuICAgIF9tYXBbdXNlci5pZF0gPSB1c2VyO1xuICAgIHVzZXJzRGF0YS5wdXNoKHVzZXIpO1xuICB9XG4gIHJldHVybiBfbWFwW3VzZXIuaWRdO1xufVxuXG5mdW5jdGlvbiBfYWRkRm9sbG93ZXJMaW5rKHRhcmdldFVzZXIsIHNvdXJjZVVzZXIpIHtcbiAgdGFyZ2V0VXNlciA9IF9hZGRVc2VyKHRhcmdldFVzZXIpO1xuICBzb3VyY2VVc2VyID0gX2FkZFVzZXIoc291cmNlVXNlcik7XG4gIGlmICghX21hcFtzb3VyY2VVc2VyLmluZGV4ICsgJy0nICsgdGFyZ2V0VXNlci5pbmRleF0pIHtcbiAgICBfbWFwW3NvdXJjZVVzZXIuaWQgKyAnLScgKyB0YXJnZXRVc2VyLmlkXSA9IHRydWU7XG4gICAgZm9sbG93ZXJMaW5rc0RhdGEucHVzaCh7IHNvdXJjZTogc291cmNlVXNlciwgdGFyZ2V0OiB0YXJnZXRVc2VyIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFkZFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gIGlmIChfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSkgcmV0dXJuO1xuICBfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSA9IHRydWU7XG4gIHRvYXN0KCdGZXRjaGluZyBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSkgKyAnLi4uJywgJ3Byb2dyZXNzJyk7XG4gIGQzLmpzb24oJ2FwaS91c2Vycy8nICsgdXNlcm5hbWUgKyAnL2ZvbGxvd2VycycsIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB0b2FzdCgnQ291bGQgbm90IGZldGNoIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ2Vycm9yJyk7XG4gICAgfVxuICAgIHRvYXN0KCdGZXRjaGVkIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ3N1Y2Nlc3MnKTtcbiAgICByZXN1bHQuZm9sbG93ZXJzLmZvckVhY2goZnVuY3Rpb24oZm9sbG93ZXIpIHtcbiAgICAgIF9hZGRGb2xsb3dlckxpbmsocmVzdWx0LnVzZXIsIGZvbGxvd2VyKTtcbiAgICB9KTtcbiAgICByZW5kZXIoKTtcbiAgfSk7XG59XG5cblxuaW5pdCgpO1xuYWRkVXNlckJ5VXNlcm5hbWUoJ0ZhcmhhZEcnKTtcbiJdfQ==
