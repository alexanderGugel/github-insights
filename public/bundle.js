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
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

function init() {
  force = d3.layout.force()
    .charge(-500)
    .linkDistance(50)
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
  render();
}

function tick() {
  node
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
      .attr("marker-end", "url(#end)")
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
  d3.json('api/users/' + username + '/following', function(error, result) {
    if (error) {
      return toast('Could not fetch followers for ' + usernameToLink(username), 'error');
    }
    toast('Fetched followers for ' + usernameToLink(username), 'success');
    result.following.forEach(function(follower) {
      _addFollowerLink(result.user, follower);
    });
    render();
  });
}


init();
addUserByUsername('FarhadG');

},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5cbi8qIGpzaGludCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKiBnbG9iYWwgZDMgKi9cblxudmFyICR0b2FzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2FzdCcpO1xudmFyICRyZXNldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldCcpO1xudmFyICRmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbmF2IGZvcm0nKTtcbnZhciAkdXNlcm5hbWUgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuXG5mdW5jdGlvbiB0b2FzdChodG1sLCB0eXBlKSB7XG4gICR0b2FzdC5pbm5lckhUTUwgPSBodG1sO1xuICAkdG9hc3QuY2xhc3NOYW1lID0gdHlwZTtcbiAgJHRvYXN0LnN0eWxlLm9wYWNpdHkgPSAxO1xufVxuXG5mdW5jdGlvbiB1c2VybmFtZVRvTGluayh1c2VybmFtZSkge1xuICByZXR1cm4gKCc8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tLycgKyB1c2VybmFtZSArICdcIj4nICsgdXNlcm5hbWUgKyAnPC9hPicpO1xufVxuXG4kcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgcmVzZXQoKTtcbn0pO1xuXG4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBhZGRVc2VyQnlVc2VybmFtZSgkdXNlcm5hbWUudmFsdWUpO1xuICAkdXNlcm5hbWUudmFsdWUgPSAnJztcbn0pO1xuXG52YXIgZm9yY2UsIHN2ZywgZWRnZSwgbm9kZTtcbnZhciB1c2Vyc0RhdGE7XG52YXIgZm9sbG93ZXJMaW5rc0RhdGE7XG52YXIgX21hcDtcbnZhciB6b29tO1xudmFyIF9hZGRlZEJ5VXNlcm5hbWU7XG52YXIgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbnZhciBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC01MDApXG4gICAgLmxpbmtEaXN0YW5jZSg1MClcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW1dJRFRILCBIRUlHSFRdKVxuICAgIC5vbigndGljaycsIHRpY2spO1xuXG4gIHpvb20gPSBkMy5iZWhhdmlvci56b29tKClcbiAgICAuc2NhbGVFeHRlbnQoWzEsIDEwXSlcbiAgICAub24oJ3pvb20nLCBvblpvb20pO1xuXG4gIHN2ZyA9IGQzLnNlbGVjdCgnYm9keScpLmluc2VydCgnc3ZnJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ3dpZHRoJywgV0lEVEgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIEhFSUdIVClcbiAgICAuY2FsbCh6b29tKTtcblxuXG4gIC8vIGJ1aWxkIHRoZSBhcnJvdy5cbiAgc3ZnLmFwcGVuZCgnc3ZnOmRlZnMnKS5zZWxlY3RBbGwoJ21hcmtlcicpXG4gICAgICAuZGF0YShbJ2VuZCddKSAgICAgIC8vIERpZmZlcmVudCBsaW5rL3BhdGggdHlwZXMgY2FuIGJlIGRlZmluZWQgaGVyZVxuICAgIC5lbnRlcigpLmFwcGVuZCgnc3ZnOm1hcmtlcicpICAgIC8vIFRoaXMgc2VjdGlvbiBhZGRzIGluIHRoZSBhcnJvd3NcbiAgICAgIC5hdHRyKCdpZCcsIFN0cmluZylcbiAgICAgIC5hdHRyKCd2aWV3Qm94JywgJzAgLTUgMTAgMTAnKVxuICAgICAgLmF0dHIoJ3JlZlgnLCAzMiszKVxuICAgICAgLmF0dHIoJ3JlZlknLCAtMC41KVxuICAgICAgLmF0dHIoJ21hcmtlcldpZHRoJywgNilcbiAgICAgIC5hdHRyKCdtYXJrZXJIZWlnaHQnLCA2KVxuICAgICAgLmF0dHIoJ29yaWVudCcsICdhdXRvJylcbiAgICAuYXBwZW5kKCdzdmc6cGF0aCcpXG4gICAgICAuYXR0cignZCcsICdNMCwtNUwxMCwwTDAsNScpO1xuXG5cbiAgZWRnZSA9IHN2Zy5zZWxlY3RBbGwoJy5lZGdlJyk7XG4gIG5vZGUgPSBzdmcuc2VsZWN0QWxsKCcubm9kZScpO1xuXG4gIHJlc2V0KCk7XG59XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICB1c2Vyc0RhdGEgPSBbXTtcbiAgZm9sbG93ZXJMaW5rc0RhdGEgPSBbXTtcbiAgX21hcCA9IHt9O1xuICBfYWRkZWRCeVVzZXJuYW1lID0ge307XG4gIHJlbmRlcigpO1xufVxuXG5mdW5jdGlvbiB0aWNrKCkge1xuICBub2RlXG4gICAgLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcbiAgICAgIGQueCA9IE1hdGgubWF4KDMyKjAuNSwgTWF0aC5taW4oV0lEVEggLSAzMiowLjUsIGQueCkpO1xuICAgICAgZC55ID0gTWF0aC5tYXgoMzIqMC41LCBNYXRoLm1pbihIRUlHSFQgLSAzMiowLjUsIGQueSkpOztcbiAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyBkLnggKyAnLCcgKyBkLnkgKyAnKSc7XG4gICAgfSk7XG5cbiAgZWRnZVxuICAgIC5hdHRyKCd4MicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLng7IH0pXG4gICAgLmF0dHIoJ3kyJywgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC5zb3VyY2UueTsgfSlcbiAgICAuYXR0cigneDEnLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLnRhcmdldC54OyB9KVxuICAgIC5hdHRyKCd5MScsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lnk7IH0pO1xufVxuXG5mdW5jdGlvbiByZW5kZXIoKSB7XG4gIGZvcmNlID0gZm9yY2VcbiAgICAubm9kZXModXNlcnNEYXRhKVxuICAgIC5saW5rcyhmb2xsb3dlckxpbmtzRGF0YSlcbiAgICAuc3RhcnQoKTtcblxuICBlZGdlID0gZWRnZS5kYXRhKGZvbGxvd2VyTGlua3NEYXRhKTtcblxuICBlZGdlXG4gICAgLmVudGVyKCkuaW5zZXJ0KCdsaW5lJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgICAuYXR0cihcIm1hcmtlci1lbmRcIiwgXCJ1cmwoI2VuZClcIilcbiAgICAgIC5hdHRyKCdjbGFzcycsICdlZGdlJyk7XG4gIGVkZ2VcbiAgICAuZXhpdCgpLnJlbW92ZSgpO1xuXG4gIG5vZGUgPSBub2RlLmRhdGEodXNlcnNEYXRhKTtcblxuICBub2RlXG4gICAgLmVudGVyKCkuYXBwZW5kKCdpbWFnZScpXG4gICAgICAuYXR0cigneGxpbms6aHJlZicsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuYXZhdGFyX3VybDsgfSlcbiAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlJylcbiAgICAgIC5hdHRyKCd3aWR0aCcsIDMyKVxuICAgICAgLmF0dHIoJ2hlaWdodCcsIDMyKVxuICAgICAgLmF0dHIoJ3gnLCAtMzIqMC41KVxuICAgICAgLmF0dHIoJ3knLCAtMzIqMC41KVxuICAgICAgLm9uKCdjbGljaycsIF9vbk5vZGVDbGljayk7XG4gIG5vZGVcbiAgICAuZXhpdCgpLnJlbW92ZSgpO1xuXG4gIG5vZGUuY2FsbChmb3JjZS5kcmFnKTtcbn1cblxuZnVuY3Rpb24gb25ab29tKCkge1xuICBzdmcuc3R5bGUoJ3RyYW5zZm9ybScsICdzY2FsZSgnICsgZDMuZXZlbnQuc2NhbGUgKyAnKScpO1xufVxuXG5mdW5jdGlvbiBfb25Ob2RlQ2xpY2soZCkge1xuICBhZGRVc2VyQnlVc2VybmFtZShkLmxvZ2luKTtcbn1cblxuZnVuY3Rpb24gX2FkZFVzZXIodXNlcikge1xuICBpZiAoIV9tYXBbdXNlci5pZF0pIHtcbiAgICBfbWFwW3VzZXIuaWRdID0gdXNlcjtcbiAgICB1c2Vyc0RhdGEucHVzaCh1c2VyKTtcbiAgfVxuICByZXR1cm4gX21hcFt1c2VyLmlkXTtcbn1cblxuZnVuY3Rpb24gX2FkZEZvbGxvd2VyTGluayh0YXJnZXRVc2VyLCBzb3VyY2VVc2VyKSB7XG4gIHRhcmdldFVzZXIgPSBfYWRkVXNlcih0YXJnZXRVc2VyKTtcbiAgc291cmNlVXNlciA9IF9hZGRVc2VyKHNvdXJjZVVzZXIpO1xuICBpZiAoIV9tYXBbc291cmNlVXNlci5pbmRleCArICctJyArIHRhcmdldFVzZXIuaW5kZXhdKSB7XG4gICAgX21hcFtzb3VyY2VVc2VyLmlkICsgJy0nICsgdGFyZ2V0VXNlci5pZF0gPSB0cnVlO1xuICAgIGZvbGxvd2VyTGlua3NEYXRhLnB1c2goeyBzb3VyY2U6IHNvdXJjZVVzZXIsIHRhcmdldDogdGFyZ2V0VXNlciB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhZGRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICBpZiAoX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0pIHJldHVybjtcbiAgX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0gPSB0cnVlO1xuICB0b2FzdCgnRmV0Y2hpbmcgZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpICsgJy4uLicsICdwcm9ncmVzcycpO1xuICBkMy5qc29uKCdhcGkvdXNlcnMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3dpbmcnLCBmdW5jdGlvbihlcnJvciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gdG9hc3QoJ0NvdWxkIG5vdCBmZXRjaCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdlcnJvcicpO1xuICAgIH1cbiAgICB0b2FzdCgnRmV0Y2hlZCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdzdWNjZXNzJyk7XG4gICAgcmVzdWx0LmZvbGxvd2luZy5mb3JFYWNoKGZ1bmN0aW9uKGZvbGxvd2VyKSB7XG4gICAgICBfYWRkRm9sbG93ZXJMaW5rKHJlc3VsdC51c2VyLCBmb2xsb3dlcik7XG4gICAgfSk7XG4gICAgcmVuZGVyKCk7XG4gIH0pO1xufVxuXG5cbmluaXQoKTtcbmFkZFVzZXJCeVVzZXJuYW1lKCdGYXJoYWRHJyk7XG4iXX0=
