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
    .linkStrength(0.5)
    .chargeDistance(150)
    .alpha(0.5)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cbi8qIGdsb2JhbCBkMyAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciAkdG9hc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QnKTtcbnZhciAkcmVzZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQnKTtcbnZhciAkZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdiBmb3JtJyk7XG52YXIgJHVzZXJuYW1lID0gJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcbnZhciAkdXNlck92ZXJsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlci1vdmVybGF5Jyk7XG5cbnZhciBOT0RFX1NJWkUgPSAzMjtcblxuZnVuY3Rpb24gdG9hc3QoaHRtbCwgdHlwZSkge1xuICAkdG9hc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgJHRvYXN0LmNsYXNzTmFtZSA9IHR5cGU7XG4gICR0b2FzdC5zdHlsZS5vcGFjaXR5ID0gMTtcbn1cblxuZnVuY3Rpb24gdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpIHtcbiAgcmV0dXJuICc8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tLycgKyB1c2VybmFtZSArICdcIj4nICsgdXNlcm5hbWUgKyAnPC9hPic7XG59XG5cbmZ1bmN0aW9uIGRpc3BsYXlVc2VyKHVzZXIpIHtcbiAgJHVzZXJPdmVybGF5LnF1ZXJ5U2VsZWN0b3IoJy5sb2dpbicpLmlubmVySFRNTCA9ICc8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tLycgKyB1c2VyLmxvZ2luICsgJ1wiPkAnICsgdXNlci5sb2dpbiArICc8L2E+Jztcbn1cblxuJHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIHJlc2V0KCk7XG59KTtcblxuJGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgYWRkVXNlckJ5VXNlcm5hbWUoJHVzZXJuYW1lLnZhbHVlKTtcbiAgJHVzZXJuYW1lLnZhbHVlID0gJyc7XG59KTtcblxudmFyIGZvcmNlLCBjYW52YXMsIGNvbnRleHQsIGRyYWc7XG52YXIgdXNlcnNEYXRhO1xudmFyIGZvbGxvd2VyTGlua3NEYXRhO1xudmFyIF9tYXA7XG52YXIgX2FkZGVkQnlVc2VybmFtZTtcbnZhciBXSURUSCA9IHdpbmRvdy5pbm5lcldpZHRoO1xudmFyIEhFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKTtcblxuICBmb3JjZSA9IGQzLmxheW91dC5mb3JjZSgpXG4gICAgLmNoYXJnZSgtMjAwKVxuICAgIC5saW5rRGlzdGFuY2UoMTUwKVxuICAgIC5saW5rU3RyZW5ndGgoMC41KVxuICAgIC5jaGFyZ2VEaXN0YW5jZSgxNTApXG4gICAgLmFscGhhKDAuNSlcbiAgICAvLyAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW1dJRFRILCBIRUlHSFRdKVxuICAgIC5vbigndGljaycsIHRpY2spO1xuXG4gIGNhbnZhcyA9IGQzLnNlbGVjdCgnYm9keScpXG4gICAgLmluc2VydCgnY2FudmFzJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2luZG93LmlubmVyV2lkdGgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIHdpbmRvdy5pbm5lckhlaWdodClcbiAgICAuY2FsbChkcmFnKTtcblxuICBjb250ZXh0ID0gY2FudmFzLm5vZGUoKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIHZhciBkcmFnZ2luZyA9IG51bGw7XG5cbiAgZHJhZy5vbignZHJhZycsIGZ1bmN0aW9uKCkge1xuICAgIGlmICghZHJhZ2dpbmcpIHtcbiAgICAgIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGQzLmV2ZW50LnggPiBkLnggLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgICAgZDMuZXZlbnQueCA8IGQueCArIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgICBkMy5ldmVudC55ID4gZC55IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICAgIGQzLmV2ZW50LnkgPCBkLnkgKyBOT0RFX1NJWkUqMC41XG4gICAgICAgICkge1xuICAgICAgICAgIGRyYWdnaW5nID0gZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFkcmFnZ2luZykgcmV0dXJuO1xuXG4gICAgZHJhZ2dpbmcuZWRnZXMuZm9yRWFjaChmdW5jdGlvbihlZGdlKSB7XG4gICAgICBlZGdlLmhpZ2hsaWdodCA9IHRydWU7XG4gICAgfSk7XG5cbiAgICBkcmFnZ2luZy5weCA9IGQzLmV2ZW50Lng7XG4gICAgZHJhZ2dpbmcucHkgPSBkMy5ldmVudC55O1xuICAgIGRyYWdnaW5nLnggPSBkMy5ldmVudC54O1xuICAgIGRyYWdnaW5nLnkgPSBkMy5ldmVudC55OyBcbiAgICB0aWNrKCk7XG4gIH0pO1xuXG4gIGRyYWcub24oJ2RyYWdlbmQnLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgIGRyYWdnaW5nLmVkZ2VzLmZvckVhY2goZnVuY3Rpb24oZWRnZSkge1xuICAgICAgICBlZGdlLmhpZ2hsaWdodCA9IGZhbHNlO1xuICAgICAgfSk7XG4gICAgICBkcmFnZ2luZyA9IG51bGw7XG4gICAgfVxuICAgIGZvcmNlLnJlc3VtZSgpO1xuICB9KTtcblxuICBkcmFnLm9uKCdkcmFnc3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICBkcmFnZ2luZyA9IG51bGw7XG4gICAgZDMuZXZlbnQuc291cmNlRXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgZm9yY2Uuc3RvcCgpO1xuICB9KTtcblxuICBjYW52YXMub24oJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gICAgdXNlcnNEYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgaWYgKFxuICAgICAgICBkMy5ldmVudC54ID4gZC54IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC54IDwgZC54ICsgTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC55ID4gZC55IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC55IDwgZC55ICsgTk9ERV9TSVpFKjAuNVxuICAgICAgKSB7XG4gICAgICAgIGRpc3BsYXlVc2VyKGQpO1xuICAgICAgICBhZGRVc2VyQnlVc2VybmFtZShkLmxvZ2luKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgY2FudmFzLm9uKCdtb3VzZW1vdmUnLCBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzRGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGQgPSB1c2Vyc0RhdGFbaV07XG4gICAgICBpZiAoXG4gICAgICAgIGQzLmV2ZW50LnggPiBkLnggLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGQzLmV2ZW50LnggPCBkLnggKyBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGQzLmV2ZW50LnkgPiBkLnkgLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGQzLmV2ZW50LnkgPCBkLnkgKyBOT0RFX1NJWkUqMC41XG4gICAgICApIHtcbiAgICAgICAgY2FudmFzLnN0eWxlKCdjdXJzb3InLCAncG9pbnRlcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIGNhbnZhcy5zdHlsZSgnY3Vyc29yJywgJ2luaGVyaXQnKTtcbiAgfSk7XG5cbiAgcmVzZXQoKTtcbn1cblxuZnVuY3Rpb24gcmVzZXQoKSB7XG4gIHVzZXJzRGF0YSA9IFtdO1xuICBmb2xsb3dlckxpbmtzRGF0YSA9IFtdO1xuICBfbWFwID0ge307XG4gIF9hZGRlZEJ5VXNlcm5hbWUgPSB7fTtcbiAgcmVhcHBseUZvcmNlKCk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKG4sIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChuLCBtaW4pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiB0aWNrKCkge1xuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMubm9kZSgpLndpZHRoLCBjYW52YXMubm9kZSgpLmhlaWdodCk7XG5cbiAgZm9sbG93ZXJMaW5rc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgdmFyIHNvdXJjZSA9IGQuc291cmNlO1xuICAgIHZhciB0YXJnZXQgPSBkLnRhcmdldDtcbiAgICBpZiAoIXRhcmdldC5pbWFnZSB8fCAhc291cmNlLmltYWdlKSByZXR1cm47XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhzb3VyY2UueCxzb3VyY2UueSk7XG4gICAgY29udGV4dC5saW5lVG8odGFyZ2V0LngsdGFyZ2V0LnkpO1xuXG4gICAgaWYgKGQuaGlnaGxpZ2h0KSB7XG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJ2JsdWUnO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJyNjY2MnO1xuICAgIH1cblxuICAgIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuICB9KTtcblxuICB1c2Vyc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgZC54ID0gY2xhbXAoZC54LCAwLCB3aW5kb3cuaW5uZXJXaWR0aCk7XG4gICAgZC55ID0gY2xhbXAoZC55LCAwLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIGlmIChkLmltYWdlKSB7XG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShkLmltYWdlLCBkLnggLSBOT0RFX1NJWkUqMC41LCBkLnkgLSBOT0RFX1NJWkUqMC41LCBOT0RFX1NJWkUsIE5PREVfU0laRSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7IGQuaW1hZ2UgPSBpbWFnZTsgfTtcbiAgICAgIGltYWdlLnNyYyA9IGQuYXZhdGFyX3VybDtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZWFwcGx5Rm9yY2UoKSB7XG4gIGZvcmNlID0gZm9yY2VcbiAgICAubm9kZXModXNlcnNEYXRhKVxuICAgIC5saW5rcyhmb2xsb3dlckxpbmtzRGF0YSlcbiAgICAuc3RhcnQoKTtcbn1cblxuZnVuY3Rpb24gX2FkZFVzZXIodXNlcikge1xuICBpZiAoIV9tYXBbdXNlci5pZF0pIHtcbiAgICBfbWFwW3VzZXIuaWRdID0gdXNlcjtcbiAgICB1c2VyLmVkZ2VzID0gW107XG4gICAgdXNlcnNEYXRhLnB1c2godXNlcik7XG4gIH1cbiAgcmV0dXJuIF9tYXBbdXNlci5pZF07XG59XG5cbmZ1bmN0aW9uIGFkZFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gIGlmIChfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSkgcmV0dXJuO1xuICBfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSA9IHRydWU7XG4gIHRvYXN0KCdGZXRjaGluZyBmb2xsb3dpbmcgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSkgKyAnLi4uJywgJ3Byb2dyZXNzJyk7XG4gIGQzLmpzb24oJ2FwaS91c2Vycy8nICsgdXNlcm5hbWUgKyAnL2ZvbGxvd2luZycsIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB0b2FzdCgnQ291bGQgbm90IGZldGNoIGZvbGxvd2luZyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ2Vycm9yJyk7XG4gICAgfVxuICAgIHRvYXN0KCdGZXRjaGVkIGZvbGxvd2luZyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ3N1Y2Nlc3MnKTtcbiAgICB2YXIgdXNlciA9IF9hZGRVc2VyKHJlc3VsdC51c2VyKTtcbiAgICByZXN1bHQuZm9sbG93aW5nLmZvckVhY2goZnVuY3Rpb24oZm9sbG93aW5nKSB7XG4gICAgICBmb2xsb3dpbmcgPSBfYWRkVXNlcihmb2xsb3dpbmcpO1xuICAgICAgdmFyIGVkZ2UgPSB7IHNvdXJjZTogdXNlciwgdGFyZ2V0OiBmb2xsb3dpbmcgfTtcbiAgICAgIGZvbGxvd2VyTGlua3NEYXRhLnB1c2goZWRnZSk7XG4gICAgICB1c2VyLmVkZ2VzLnB1c2goZWRnZSk7XG4gICAgICBmb2xsb3dpbmcuZWRnZXMucHVzaChlZGdlKTtcbiAgICB9KTtcbiAgICByZWFwcGx5Rm9yY2UoKTtcbiAgfSk7XG59XG5cblxuXG5cbmluaXQoKTtcbmFkZFVzZXJCeVVzZXJuYW1lKCdGYXJoYWRHJyk7XG4iXX0=
