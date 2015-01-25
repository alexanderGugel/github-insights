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
    .charge(-500)
    .linkDistance(150)
    .linkStrength(0.5)
    .chargeDistance(150)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKiBnbG9iYWwgZDMgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgJHRvYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvYXN0Jyk7XG52YXIgJHJlc2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0Jyk7XG52YXIgJGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYgZm9ybScpO1xudmFyICR1c2VybmFtZSA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Jyk7XG52YXIgJHVzZXJPdmVybGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXItb3ZlcmxheScpO1xuXG52YXIgTk9ERV9TSVpFID0gMzI7XG5cbmZ1bmN0aW9uIHRvYXN0KGh0bWwsIHR5cGUpIHtcbiAgJHRvYXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICR0b2FzdC5jbGFzc05hbWUgPSB0eXBlO1xuICAkdG9hc3Quc3R5bGUub3BhY2l0eSA9IDE7XG59XG5cbmZ1bmN0aW9uIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSB7XG4gIHJldHVybiAnPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS8nICsgdXNlcm5hbWUgKyAnXCI+JyArIHVzZXJuYW1lICsgJzwvYT4nO1xufVxuXG5mdW5jdGlvbiBkaXNwbGF5VXNlcih1c2VyKSB7XG4gICR1c2VyT3ZlcmxheS5xdWVyeVNlbGVjdG9yKCcubG9naW4nKS5pbm5lckhUTUwgPSAnPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS8nICsgdXNlci5sb2dpbiArICdcIj5AJyArIHVzZXIubG9naW4gKyAnPC9hPic7XG59XG5cbiRyZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICByZXNldCgpO1xufSk7XG5cbiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGFkZFVzZXJCeVVzZXJuYW1lKCR1c2VybmFtZS52YWx1ZSk7XG4gICR1c2VybmFtZS52YWx1ZSA9ICcnO1xufSk7XG5cbnZhciBmb3JjZSwgY2FudmFzLCBjb250ZXh0LCBkcmFnO1xudmFyIHVzZXJzRGF0YTtcbnZhciBmb2xsb3dlckxpbmtzRGF0YTtcbnZhciBfbWFwO1xudmFyIF9hZGRlZEJ5VXNlcm5hbWU7XG52YXIgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbnZhciBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGRyYWcgPSBkMy5iZWhhdmlvci5kcmFnKCk7XG5cbiAgZm9yY2UgPSBkMy5sYXlvdXQuZm9yY2UoKVxuICAgIC5jaGFyZ2UoLTUwMClcbiAgICAubGlua0Rpc3RhbmNlKDE1MClcbiAgICAubGlua1N0cmVuZ3RoKDAuNSlcbiAgICAuY2hhcmdlRGlzdGFuY2UoMTUwKVxuICAgIC8vIC5ncmF2aXR5KDAuNSlcbiAgICAuc2l6ZShbV0lEVEgsIEhFSUdIVF0pXG4gICAgLm9uKCd0aWNrJywgdGljayk7XG5cbiAgY2FudmFzID0gZDMuc2VsZWN0KCdib2R5JylcbiAgICAuaW5zZXJ0KCdjYW52YXMnLCAnOmZpcnN0LWNoaWxkJylcbiAgICAuYXR0cignd2lkdGgnLCB3aW5kb3cuaW5uZXJXaWR0aClcbiAgICAuYXR0cignaGVpZ2h0Jywgd2luZG93LmlubmVySGVpZ2h0KVxuICAgIC5jYWxsKGRyYWcpO1xuXG4gIGNvbnRleHQgPSBjYW52YXMubm9kZSgpLmdldENvbnRleHQoJzJkJyk7XG5cbiAgdmFyIGRyYWdnaW5nID0gbnVsbDtcblxuICBkcmFnLm9uKCdkcmFnJywgZnVuY3Rpb24oKSB7XG4gICAgaWYgKCFkcmFnZ2luZykge1xuICAgICAgdXNlcnNEYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZDMuZXZlbnQueCA+IGQueCAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgICBkMy5ldmVudC54IDwgZC54ICsgTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICAgIGQzLmV2ZW50LnkgPiBkLnkgLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgICAgZDMuZXZlbnQueSA8IGQueSArIE5PREVfU0laRSowLjVcbiAgICAgICAgKSB7XG4gICAgICAgICAgZHJhZ2dpbmcgPSBkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoIWRyYWdnaW5nKSByZXR1cm47XG5cbiAgICBkcmFnZ2luZy5lZGdlcy5mb3JFYWNoKGZ1bmN0aW9uKGVkZ2UpIHtcbiAgICAgIGVkZ2UuaGlnaGxpZ2h0ID0gdHJ1ZTtcbiAgICB9KTtcblxuICAgIGRyYWdnaW5nLnB4ID0gZDMuZXZlbnQueDtcbiAgICBkcmFnZ2luZy5weSA9IGQzLmV2ZW50Lnk7XG4gICAgZHJhZ2dpbmcueCA9IGQzLmV2ZW50Lng7XG4gICAgZHJhZ2dpbmcueSA9IGQzLmV2ZW50Lnk7IFxuICAgIHRpY2soKTtcbiAgfSk7XG5cbiAgZHJhZy5vbignZHJhZ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgZHJhZ2dpbmcuZWRnZXMuZm9yRWFjaChmdW5jdGlvbihlZGdlKSB7XG4gICAgICAgIGVkZ2UuaGlnaGxpZ2h0ID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICAgIGRyYWdnaW5nID0gbnVsbDtcbiAgICB9XG4gICAgZm9yY2UucmVzdW1lKCk7XG4gIH0pO1xuXG4gIGRyYWcub24oJ2RyYWdzdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgIGRyYWdnaW5nID0gbnVsbDtcbiAgICBkMy5ldmVudC5zb3VyY2VFdmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBmb3JjZS5zdG9wKCk7XG4gIH0pO1xuXG4gIGNhbnZhcy5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICB1c2Vyc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGQzLmV2ZW50LnggPiBkLnggLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGQzLmV2ZW50LnggPCBkLnggKyBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGQzLmV2ZW50LnkgPiBkLnkgLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGQzLmV2ZW50LnkgPCBkLnkgKyBOT0RFX1NJWkUqMC41XG4gICAgICApIHtcbiAgICAgICAgZGlzcGxheVVzZXIoZCk7XG4gICAgICAgIGFkZFVzZXJCeVVzZXJuYW1lKGQubG9naW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICBjYW52YXMub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXNlcnNEYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZCA9IHVzZXJzRGF0YVtpXTtcbiAgICAgIGlmIChcbiAgICAgICAgZDMuZXZlbnQueCA+IGQueCAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueCA8IGQueCArIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueSA+IGQueSAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueSA8IGQueSArIE5PREVfU0laRSowLjVcbiAgICAgICkge1xuICAgICAgICBjYW52YXMuc3R5bGUoJ2N1cnNvcicsICdwb2ludGVyJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgY2FudmFzLnN0eWxlKCdjdXJzb3InLCAnaW5oZXJpdCcpO1xuICB9KTtcblxuICByZXNldCgpO1xufVxuXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgdXNlcnNEYXRhID0gW107XG4gIGZvbGxvd2VyTGlua3NEYXRhID0gW107XG4gIF9tYXAgPSB7fTtcbiAgX2FkZGVkQnlVc2VybmFtZSA9IHt9O1xuICByZWFwcGx5Rm9yY2UoKTtcbn1cblxuZnVuY3Rpb24gY2xhbXAobiwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KG4sIG1pbiksIG1heCk7XG59XG5cbmZ1bmN0aW9uIHRpY2soKSB7XG4gIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy5ub2RlKCkud2lkdGgsIGNhbnZhcy5ub2RlKCkuaGVpZ2h0KTtcblxuICBmb2xsb3dlckxpbmtzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICB2YXIgc291cmNlID0gZC5zb3VyY2U7XG4gICAgdmFyIHRhcmdldCA9IGQudGFyZ2V0O1xuICAgIGlmICghdGFyZ2V0LmltYWdlIHx8ICFzb3VyY2UuaW1hZ2UpIHJldHVybjtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKHNvdXJjZS54LHNvdXJjZS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0YXJnZXQueCx0YXJnZXQueSk7XG5cbiAgICBpZiAoZC5oaWdobGlnaHQpIHtcbiAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnYmx1ZSc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnI2NjYyc7XG4gICAgfVxuXG4gICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gIH0pO1xuXG4gIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICBkLnggPSBjbGFtcChkLngsIDAsIHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICBkLnkgPSBjbGFtcChkLnksIDAsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgaWYgKGQuaW1hZ2UpIHtcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGQuaW1hZ2UsIGQueCAtIE5PREVfU0laRSowLjUsIGQueSAtIE5PREVfU0laRSowLjUsIE5PREVfU0laRSwgTk9ERV9TSVpFKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHsgZC5pbWFnZSA9IGltYWdlOyB9O1xuICAgICAgaW1hZ2Uuc3JjID0gZC5hdmF0YXJfdXJsO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlYXBwbHlGb3JjZSgpIHtcbiAgZm9yY2UgPSBmb3JjZVxuICAgIC5ub2Rlcyh1c2Vyc0RhdGEpXG4gICAgLmxpbmtzKGZvbGxvd2VyTGlua3NEYXRhKVxuICAgIC5zdGFydCgpO1xufVxuXG5mdW5jdGlvbiBfYWRkVXNlcih1c2VyKSB7XG4gIGlmICghX21hcFt1c2VyLmlkXSkge1xuICAgIF9tYXBbdXNlci5pZF0gPSB1c2VyO1xuICAgIHVzZXIuZWRnZXMgPSBbXTtcbiAgICB1c2Vyc0RhdGEucHVzaCh1c2VyKTtcbiAgfVxuICByZXR1cm4gX21hcFt1c2VyLmlkXTtcbn1cblxuZnVuY3Rpb24gYWRkVXNlckJ5VXNlcm5hbWUodXNlcm5hbWUpIHtcbiAgaWYgKF9hZGRlZEJ5VXNlcm5hbWVbdXNlcm5hbWVdKSByZXR1cm47XG4gIF9hZGRlZEJ5VXNlcm5hbWVbdXNlcm5hbWVdID0gdHJ1ZTtcbiAgdG9hc3QoJ0ZldGNoaW5nIGZvbGxvd2luZyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSArICcuLi4nLCAncHJvZ3Jlc3MnKTtcbiAgZDMuanNvbignYXBpL3VzZXJzLycgKyB1c2VybmFtZSArICcvZm9sbG93aW5nJywgZnVuY3Rpb24oZXJyb3IsIHJlc3VsdCkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIHRvYXN0KCdDb3VsZCBub3QgZmV0Y2ggZm9sbG93aW5nIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpLCAnZXJyb3InKTtcbiAgICB9XG4gICAgdG9hc3QoJ0ZldGNoZWQgZm9sbG93aW5nIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpLCAnc3VjY2VzcycpO1xuICAgIHZhciB1c2VyID0gX2FkZFVzZXIocmVzdWx0LnVzZXIpO1xuICAgIHJlc3VsdC5mb2xsb3dpbmcuZm9yRWFjaChmdW5jdGlvbihmb2xsb3dpbmcpIHtcbiAgICAgIGZvbGxvd2luZyA9IF9hZGRVc2VyKGZvbGxvd2luZyk7XG4gICAgICB2YXIgZWRnZSA9IHsgc291cmNlOiB1c2VyLCB0YXJnZXQ6IGZvbGxvd2luZyB9O1xuICAgICAgZm9sbG93ZXJMaW5rc0RhdGEucHVzaChlZGdlKTtcbiAgICAgIHVzZXIuZWRnZXMucHVzaChlZGdlKTtcbiAgICAgIGZvbGxvd2luZy5lZGdlcy5wdXNoKGVkZ2UpO1xuICAgIH0pO1xuICAgIHJlYXBwbHlGb3JjZSgpO1xuICB9KTtcbn1cblxuXG5cblxuaW5pdCgpO1xuYWRkVXNlckJ5VXNlcm5hbWUoJ0ZhcmhhZEcnKTtcbiJdfQ==
