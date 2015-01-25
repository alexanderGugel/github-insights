(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
/* jshint undef: true, unused: true */
/* global d3 */

'use strict';

var $toast = document.getElementById('toast');
var $reset = document.getElementById('reset');
var $form = document.querySelector('nav form');
var $username = $form.querySelector('input');
var $userOverlay = document.getElementById('user-overlay');

var NODE_SIZE = 32;

function toast(html, type) {
  $toast.innerHTML = html;
  $toast.className = type;
  $toast.style.opacity = 1;
}

function usernameToLink(username) {
  return '<a target="_blank" href="https://github.com/' + username + '">' + username + '</a>';
}

function displayUser(user) {
  $userOverlay.querySelector('.login').innerHTML = '<a target="_blank" href="https://github.com/' + user.login + '">@' + user.login + '</a>'; 
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

var force, canvas, context, drag;
var usersData;
var followerLinksData;
var _map;
var _addedByUsername;
var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

function init() {
  drag = d3.behavior.drag();

  force = d3.layout.force()
    .charge(-200)
    .linkDistance(150)
    // .linkStrength(0.5)
    .chargeDistance(150)
    .alpha(0.8)
    // .gravity(0.5)
    .size([WIDTH, HEIGHT])
    .on('tick', tick);

  canvas = d3.select('body')
    .insert('canvas', ':first-child')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)
    .call(drag);

  context = canvas.node().getContext('2d');

  var dragging = null;

  drag.on('drag', function() {
    if (!dragging) {
      usersData.forEach(function(d) {
        if (
          d3.event.x > d.x - NODE_SIZE*0.5 &&
          d3.event.x < d.x + NODE_SIZE*0.5 &&
          d3.event.y > d.y - NODE_SIZE*0.5 &&
          d3.event.y < d.y + NODE_SIZE*0.5
        ) {
          dragging = d;
        }
      });
    }

    if (!dragging) return;

    dragging.edges.forEach(function(edge) {
      edge.highlight = true;
    });

    dragging.px = d3.event.x;
    dragging.py = d3.event.y;
    dragging.x = d3.event.x;
    dragging.y = d3.event.y; 
    tick();
  });

  drag.on('dragend', function() {
    if (dragging) {
      dragging.edges.forEach(function(edge) {
        edge.highlight = false;
      });
      dragging = null;
    }
    force.resume();
  });

  drag.on('dragstart', function() {
    dragging = null;
    d3.event.sourceEvent.stopPropagation();
    force.stop();
  });

  canvas.on('click', function() {
    usersData.forEach(function(d) {
      if (
        d3.event.x > d.x - NODE_SIZE*0.5 &&
        d3.event.x < d.x + NODE_SIZE*0.5 &&
        d3.event.y > d.y - NODE_SIZE*0.5 &&
        d3.event.y < d.y + NODE_SIZE*0.5
      ) {
        displayUser(d);
        addUserByUsername(d.login);
      }
    });
  });

  canvas.on('mousemove', function() {
    for (var i = 0; i < usersData.length; i++) {
      var d = usersData[i];
      if (
        d3.event.x > d.x - NODE_SIZE*0.5 &&
        d3.event.x < d.x + NODE_SIZE*0.5 &&
        d3.event.y > d.y - NODE_SIZE*0.5 &&
        d3.event.y < d.y + NODE_SIZE*0.5
      ) {
        canvas.style('cursor', 'pointer');
        return;
      }
    }
    canvas.style('cursor', 'inherit');
  });

  reset();
}

function reset() {
  usersData = [];
  followerLinksData = [];
  _map = {};
  _addedByUsername = {};
  reapplyForce();
}

function clamp(n, min, max) {
  return Math.min(Math.max(n, min), max);
}

function tick() {
  context.clearRect(0, 0, canvas.node().width, canvas.node().height);

  followerLinksData.forEach(function(d) {
    var source = d.source;
    var target = d.target;
    if (!target.image || !source.image) return;
    context.beginPath();
    context.moveTo(source.x,source.y);
    context.lineTo(target.x,target.y);

    if (d.highlight) {
      context.strokeStyle = 'blue';
    } else {
      context.strokeStyle = '#ccc';
    }

    context.lineWidth = 1;
    context.stroke();
  });

  usersData.forEach(function(d) {
    d.x = clamp(d.x, 0, window.innerWidth);
    d.y = clamp(d.y, 0, window.innerHeight);
    if (d.image) {
      context.drawImage(d.image, d.x - NODE_SIZE*0.5, d.y - NODE_SIZE*0.5, NODE_SIZE, NODE_SIZE);
    } else {
      var image = new Image();
      image.onload = function() { d.image = image; };
      image.src = d.avatar_url;
    }
  });
}

function reapplyForce() {
  force = force
    .nodes(usersData)
    .links(followerLinksData)
    .start();
}

function _addUser(user) {
  if (!_map[user.id]) {
    _map[user.id] = user;
    user.edges = [];
    usersData.push(user);
  }
  return _map[user.id];
}

function addUserByUsername(username) {
  if (_addedByUsername[username]) return;
  _addedByUsername[username] = true;
  toast('Fetching following for ' + usernameToLink(username) + '...', 'progress');
  d3.json('api/users/' + username + '/following', function(error, result) {
    if (error) {
      return toast('Could not fetch following for ' + usernameToLink(username), 'error');
    }
    toast('Fetched following for ' + usernameToLink(username), 'success');
    var user = _addUser(result.user);
    result.following.forEach(function(following) {
      following = _addUser(following);
      var edge = { source: user, target: following };
      followerLinksData.push(edge);
      user.edges.push(edge);
      following.edges.push(edge);
    });
    reapplyForce();
  });
}




init();
addUserByUsername('FarhadG');

},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cbi8qIGdsb2JhbCBkMyAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciAkdG9hc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QnKTtcbnZhciAkcmVzZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQnKTtcbnZhciAkZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdiBmb3JtJyk7XG52YXIgJHVzZXJuYW1lID0gJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbnZhciAkdXNlck92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1vdmVybGF5Jyk7XG5cbnZhciBOT0RFX1NJWkUgPSAzMjtcblxuZnVuY3Rpb24gdG9hc3QoaHRtbCwgdHlwZSkge1xuICAkdG9hc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgJHRvYXN0LmNsYXNzTmFtZSA9IHR5cGU7XG4gICR0b2FzdC5zdHlsZS5vcGFjaXR5ID0gMTtcbn1cblxuZnVuY3Rpb24gdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpIHtcbiAgcmV0dXJuICc8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tLycgKyB1c2VybmFtZSArICdcIj4nICsgdXNlcm5hbWUgKyAnPC9hPic7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlVc2VyKHVzZXIpIHtcbiAgJHVzZXJPdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5sb2dpbicpLmlubmVySFRNTCA9ICc8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tLycgKyB1c2VyLmxvZ2luICsgJ1wiPkAnICsgdXNlci5sb2dpbiArICc8L2E+JzsgXG59XG5cbiRyZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICByZXNldCgpO1xufSk7XG5cbiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGFkZFVzZXJCeVVzZXJuYW1lKCR1c2VybmFtZS52YWx1ZSk7XG4gICR1c2VybmFtZS52YWx1ZSA9ICcnO1xufSk7XG5cbnZhciBmb3JjZSwgY2FudmFzLCBjb250ZXh0LCBkcmFnO1xudmFyIHVzZXJzRGF0YTtcbnZhciBmb2xsb3dlckxpbmtzRGF0YTtcbnZhciBfbWFwO1xudmFyIF9hZGRlZEJ5VXNlcm5hbWU7XG52YXIgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbnZhciBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKCk7XG5cbiAgZm9yY2UgPSBkMy5sYXlvdXQuZm9yY2UoKVxuICAgIC5jaGFyZ2UoLTIwMClcbiAgICAubGlua0Rpc3RhbmNlKDE1MClcbiAgICAvLyAubGlua1N0cmVuZ3RoKDAuNSlcbiAgICAuY2hhcmdlRGlzdGFuY2UoMTUwKVxuICAgIC5hbHBoYSgwLjgpXG4gICAgLy8gLmdyYXZpdHkoMC41KVxuICAgIC5zaXplKFtXSURUSCwgSEVJR0hUXSlcbiAgICAub24oJ3RpY2snLCB0aWNrKTtcblxuICBjYW52YXMgPSBkMy5zZWxlY3QoJ2JvZHknKVxuICAgIC5pbnNlcnQoJ2NhbnZhcycsICc6Zmlyc3QtY2hpbGQnKVxuICAgIC5hdHRyKCd3aWR0aCcsIHdpbmRvdy5pbm5lcldpZHRoKVxuICAgIC5hdHRyKCdoZWlnaHQnLCB3aW5kb3cuaW5uZXJIZWlnaHQpXG4gICAgLmNhbGwoZHJhZyk7XG5cbiAgY29udGV4dCA9IGNhbnZhcy5ub2RlKCkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICB2YXIgZHJhZ2dpbmcgPSBudWxsO1xuXG4gIGRyYWcub24oJ2RyYWcnLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoIWRyYWdnaW5nKSB7XG4gICAgICB1c2Vyc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBkMy5ldmVudC54ID4gZC54IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICAgIGQzLmV2ZW50LnggPCBkLnggKyBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgICAgZDMuZXZlbnQueSA+IGQueSAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgICBkMy5ldmVudC55IDwgZC55ICsgTk9ERV9TSVpFKjAuNVxuICAgICAgICApIHtcbiAgICAgICAgICBkcmFnZ2luZyA9IGQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICghZHJhZ2dpbmcpIHJldHVybjtcblxuICAgIGRyYWdnaW5nLmVkZ2VzLmZvckVhY2goZnVuY3Rpb24oZWRnZSkge1xuICAgICAgZWRnZS5oaWdobGlnaHQgPSB0cnVlO1xuICAgIH0pO1xuXG4gICAgZHJhZ2dpbmcucHggPSBkMy5ldmVudC54O1xuICAgIGRyYWdnaW5nLnB5ID0gZDMuZXZlbnQueTtcbiAgICBkcmFnZ2luZy54ID0gZDMuZXZlbnQueDtcbiAgICBkcmFnZ2luZy55ID0gZDMuZXZlbnQueTsgXG4gICAgdGljaygpO1xuICB9KTtcblxuICBkcmFnLm9uKCdkcmFnZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICBkcmFnZ2luZy5lZGdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVkZ2UpIHtcbiAgICAgICAgZWRnZS5oaWdobGlnaHQgPSBmYWxzZTtcbiAgICAgIH0pO1xuICAgICAgZHJhZ2dpbmcgPSBudWxsO1xuICAgIH1cbiAgICBmb3JjZS5yZXN1bWUoKTtcbiAgfSk7XG5cbiAgZHJhZy5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgZHJhZ2dpbmcgPSBudWxsO1xuICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGZvcmNlLnN0b3AoKTtcbiAgfSk7XG5cbiAgY2FudmFzLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZDMuZXZlbnQueCA+IGQueCAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueCA8IGQueCArIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueSA+IGQueSAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueSA8IGQueSArIE5PREVfU0laRSowLjVcbiAgICAgICkge1xuICAgICAgICBkaXNwbGF5VXNlcihkKTtcbiAgICAgICAgYWRkVXNlckJ5VXNlcm5hbWUoZC5sb2dpbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIGNhbnZhcy5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vyc0RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkID0gdXNlcnNEYXRhW2ldO1xuICAgICAgaWYgKFxuICAgICAgICBkMy5ldmVudC54ID4gZC54IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC54IDwgZC54ICsgTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC55ID4gZC55IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC55IDwgZC55ICsgTk9ERV9TSVpFKjAuNVxuICAgICAgKSB7XG4gICAgICAgIGNhbnZhcy5zdHlsZSgnY3Vyc29yJywgJ3BvaW50ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBjYW52YXMuc3R5bGUoJ2N1cnNvcicsICdpbmhlcml0Jyk7XG4gIH0pO1xuXG4gIHJlc2V0KCk7XG59XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICB1c2Vyc0RhdGEgPSBbXTtcbiAgZm9sbG93ZXJMaW5rc0RhdGEgPSBbXTtcbiAgX21hcCA9IHt9O1xuICBfYWRkZWRCeVVzZXJuYW1lID0ge307XG4gIHJlYXBwbHlGb3JjZSgpO1xufVxuXG5mdW5jdGlvbiBjbGFtcChuLCBtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobiwgbWluKSwgbWF4KTtcbn1cblxuZnVuY3Rpb24gdGljaygpIHtcbiAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLm5vZGUoKS53aWR0aCwgY2FudmFzLm5vZGUoKS5oZWlnaHQpO1xuXG4gIGZvbGxvd2VyTGlua3NEYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIHZhciBzb3VyY2UgPSBkLnNvdXJjZTtcbiAgICB2YXIgdGFyZ2V0ID0gZC50YXJnZXQ7XG4gICAgaWYgKCF0YXJnZXQuaW1hZ2UgfHwgIXNvdXJjZS5pbWFnZSkgcmV0dXJuO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oc291cmNlLngsc291cmNlLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRhcmdldC54LHRhcmdldC55KTtcblxuICAgIGlmIChkLmhpZ2hsaWdodCkge1xuICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICdibHVlJztcbiAgICB9IGVsc2Uge1xuICAgICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICcjY2NjJztcbiAgICB9XG5cbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDE7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbiAgfSk7XG5cbiAgdXNlcnNEYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIGQueCA9IGNsYW1wKGQueCwgMCwgd2luZG93LmlubmVyV2lkdGgpO1xuICAgIGQueSA9IGNsYW1wKGQueSwgMCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBpZiAoZC5pbWFnZSkge1xuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoZC5pbWFnZSwgZC54IC0gTk9ERV9TSVpFKjAuNSwgZC55IC0gTk9ERV9TSVpFKjAuNSwgTk9ERV9TSVpFLCBOT0RFX1NJWkUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkgeyBkLmltYWdlID0gaW1hZ2U7IH07XG4gICAgICBpbWFnZS5zcmMgPSBkLmF2YXRhcl91cmw7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVhcHBseUZvcmNlKCkge1xuICBmb3JjZSA9IGZvcmNlXG4gICAgLm5vZGVzKHVzZXJzRGF0YSlcbiAgICAubGlua3MoZm9sbG93ZXJMaW5rc0RhdGEpXG4gICAgLnN0YXJ0KCk7XG59XG5cbmZ1bmN0aW9uIF9hZGRVc2VyKHVzZXIpIHtcbiAgaWYgKCFfbWFwW3VzZXIuaWRdKSB7XG4gICAgX21hcFt1c2VyLmlkXSA9IHVzZXI7XG4gICAgdXNlci5lZGdlcyA9IFtdO1xuICAgIHVzZXJzRGF0YS5wdXNoKHVzZXIpO1xuICB9XG4gIHJldHVybiBfbWFwW3VzZXIuaWRdO1xufVxuXG5mdW5jdGlvbiBhZGRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICBpZiAoX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0pIHJldHVybjtcbiAgX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0gPSB0cnVlO1xuICB0b2FzdCgnRmV0Y2hpbmcgZm9sbG93aW5nIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpICsgJy4uLicsICdwcm9ncmVzcycpO1xuICBkMy5qc29uKCdhcGkvdXNlcnMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3dpbmcnLCBmdW5jdGlvbihlcnJvciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gdG9hc3QoJ0NvdWxkIG5vdCBmZXRjaCBmb2xsb3dpbmcgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdlcnJvcicpO1xuICAgIH1cbiAgICB0b2FzdCgnRmV0Y2hlZCBmb2xsb3dpbmcgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdzdWNjZXNzJyk7XG4gICAgdmFyIHVzZXIgPSBfYWRkVXNlcihyZXN1bHQudXNlcik7XG4gICAgcmVzdWx0LmZvbGxvd2luZy5mb3JFYWNoKGZ1bmN0aW9uKGZvbGxvd2luZykge1xuICAgICAgZm9sbG93aW5nID0gX2FkZFVzZXIoZm9sbG93aW5nKTtcbiAgICAgIHZhciBlZGdlID0geyBzb3VyY2U6IHVzZXIsIHRhcmdldDogZm9sbG93aW5nIH07XG4gICAgICBmb2xsb3dlckxpbmtzRGF0YS5wdXNoKGVkZ2UpO1xuICAgICAgdXNlci5lZGdlcy5wdXNoKGVkZ2UpO1xuICAgICAgZm9sbG93aW5nLmVkZ2VzLnB1c2goZWRnZSk7XG4gICAgfSk7XG4gICAgcmVhcHBseUZvcmNlKCk7XG4gIH0pO1xufVxuXG5cblxuXG5pbml0KCk7XG5hZGRVc2VyQnlVc2VybmFtZSgnRmFyaGFkRycpO1xuIl19
