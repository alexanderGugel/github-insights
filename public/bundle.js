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
  $userOverlay.querySelector('.login').textContent = '@' + user.login;
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
    .charge(-400)
    .linkDistance(400)
    .linkStrength(0.1)
    .chargeDistance(400)
    .gravity(0.5)
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
    dragging.px = d3.event.x;
    dragging.py = d3.event.y;
    dragging.x = d3.event.x;
    dragging.y = d3.event.y; 
    tick();
  });

  drag.on('dragend', function() {
    dragging = null;
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
    context.strokeStyle = '#ccc';
    context.lineWidth = 1;
    context.stroke();
  });

  usersData.forEach(function(d) {
    d.x = clamp(d.x, 0, window.innerWidth);
    d.y = clamp(d.y, 0, window.innerHeight);
    if (d.image) {
      // context.save();
      // context.beginPath();
      // context.arc(d.x, d.y, Math.sqrt(Math.pow(NODE_SIZE*0.5, 2) + Math.pow(NODE_SIZE*0.5, 2)), 0, 2 * Math.PI, true);
      // context.closePath();
      // context.clip();
      
      context.drawImage(d.image, d.x - NODE_SIZE*0.5, d.y - NODE_SIZE*0.5, NODE_SIZE, NODE_SIZE);

      // context.beginPath();
      // context.arc(d.x, d.y, Math.sqrt(Math.pow(NODE_SIZE*0.5, 2) + Math.pow(NODE_SIZE*0.5, 2)), 0, 2 * Math.PI, true);
      // context.clip();
      // context.closePath();
      // context.restore();
    } else {
      var image = new Image();
      image.src = d.avatar_url;
      image.onload = function() {
        d.image = image;
      };
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
    usersData.push(user);
  }
  return _map[user.id];
}

function _addFollowerLink(targetUser, sourceUser) {
  targetUser.linksAdded = true;
  targetUser = _addUser(targetUser);
  sourceUser = _addUser(sourceUser);
  if (!_map[sourceUser.index + '-' + targetUser.index]) {
    _map[sourceUser.id + '-' + targetUser.id] = true;
    followerLinksData.push({ source: sourceUser, target: targetUser });
  }
  reapplyForce();
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
  });
}




init();
addUserByUsername('FarhadG');

},{}]},{},["/Users/alexandergugel/repos/github-insights/public/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLyogZ2xvYmFsIGQzICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyICR0b2FzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2FzdCcpO1xudmFyICRyZXNldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldCcpO1xudmFyICRmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbmF2IGZvcm0nKTtcbnZhciAkdXNlcm5hbWUgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xudmFyICR1c2VyT3ZlcmxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyLW92ZXJsYXknKTtcblxudmFyIE5PREVfU0laRSA9IDMyO1xuXG5mdW5jdGlvbiB0b2FzdChodG1sLCB0eXBlKSB7XG4gICR0b2FzdC5pbm5lckhUTUwgPSBodG1sO1xuICAkdG9hc3QuY2xhc3NOYW1lID0gdHlwZTtcbiAgJHRvYXN0LnN0eWxlLm9wYWNpdHkgPSAxO1xufVxuXG5mdW5jdGlvbiB1c2VybmFtZVRvTGluayh1c2VybmFtZSkge1xuICByZXR1cm4gJzxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vJyArIHVzZXJuYW1lICsgJ1wiPicgKyB1c2VybmFtZSArICc8L2E+Jztcbn1cblxuZnVuY3Rpb24gZGlzcGxheVVzZXIodXNlcikge1xuICAkdXNlck92ZXJsYXkucXVlcnlTZWxlY3RvcignLmxvZ2luJykudGV4dENvbnRlbnQgPSAnQCcgKyB1c2VyLmxvZ2luO1xufVxuXG4kcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgcmVzZXQoKTtcbn0pO1xuXG4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBhZGRVc2VyQnlVc2VybmFtZSgkdXNlcm5hbWUudmFsdWUpO1xuICAkdXNlcm5hbWUudmFsdWUgPSAnJztcbn0pO1xuXG52YXIgZm9yY2UsIGNhbnZhcywgY29udGV4dCwgZHJhZztcbnZhciB1c2Vyc0RhdGE7XG52YXIgZm9sbG93ZXJMaW5rc0RhdGE7XG52YXIgX21hcDtcbnZhciBfYWRkZWRCeVVzZXJuYW1lO1xudmFyIFdJRFRIID0gd2luZG93LmlubmVyV2lkdGg7XG52YXIgSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICBkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpO1xuXG4gIGZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC00MDApXG4gICAgLmxpbmtEaXN0YW5jZSg0MDApXG4gICAgLmxpbmtTdHJlbmd0aCgwLjEpXG4gICAgLmNoYXJnZURpc3RhbmNlKDQwMClcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW1dJRFRILCBIRUlHSFRdKVxuICAgIC5vbigndGljaycsIHRpY2spO1xuXG4gIGNhbnZhcyA9IGQzLnNlbGVjdCgnYm9keScpXG4gICAgLmluc2VydCgnY2FudmFzJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2luZG93LmlubmVyV2lkdGgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIHdpbmRvdy5pbm5lckhlaWdodClcbiAgICAuY2FsbChkcmFnKTtcblxuICBjb250ZXh0ID0gY2FudmFzLm5vZGUoKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIHZhciBkcmFnZ2luZyA9IG51bGw7XG5cbiAgZHJhZy5vbignZHJhZycsIGZ1bmN0aW9uKCkge1xuICAgIGlmICghZHJhZ2dpbmcpIHtcbiAgICAgIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGQzLmV2ZW50LnggPiBkLnggLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgICAgZDMuZXZlbnQueCA8IGQueCArIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgICBkMy5ldmVudC55ID4gZC55IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICAgIGQzLmV2ZW50LnkgPCBkLnkgKyBOT0RFX1NJWkUqMC41XG4gICAgICAgICkge1xuICAgICAgICAgIGRyYWdnaW5nID0gZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFkcmFnZ2luZykgcmV0dXJuO1xuICAgIGRyYWdnaW5nLnB4ID0gZDMuZXZlbnQueDtcbiAgICBkcmFnZ2luZy5weSA9IGQzLmV2ZW50Lnk7XG4gICAgZHJhZ2dpbmcueCA9IGQzLmV2ZW50Lng7XG4gICAgZHJhZ2dpbmcueSA9IGQzLmV2ZW50Lnk7IFxuICAgIHRpY2soKTtcbiAgfSk7XG5cbiAgZHJhZy5vbignZHJhZ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgIGRyYWdnaW5nID0gbnVsbDtcbiAgICBmb3JjZS5yZXN1bWUoKTtcbiAgfSk7XG5cbiAgZHJhZy5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgZHJhZ2dpbmcgPSBudWxsO1xuICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGZvcmNlLnN0b3AoKTtcbiAgfSk7XG5cbiAgY2FudmFzLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZDMuZXZlbnQueCA+IGQueCAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueCA8IGQueCArIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueSA+IGQueSAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueSA8IGQueSArIE5PREVfU0laRSowLjVcbiAgICAgICkge1xuICAgICAgICBkaXNwbGF5VXNlcihkKTtcbiAgICAgICAgYWRkVXNlckJ5VXNlcm5hbWUoZC5sb2dpbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIGNhbnZhcy5vbignbW91c2Vtb3ZlJywgZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vyc0RhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkID0gdXNlcnNEYXRhW2ldO1xuICAgICAgaWYgKFxuICAgICAgICBkMy5ldmVudC54ID4gZC54IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC54IDwgZC54ICsgTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC55ID4gZC55IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBkMy5ldmVudC55IDwgZC55ICsgTk9ERV9TSVpFKjAuNVxuICAgICAgKSB7XG4gICAgICAgIGNhbnZhcy5zdHlsZSgnY3Vyc29yJywgJ3BvaW50ZXInKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBjYW52YXMuc3R5bGUoJ2N1cnNvcicsICdpbmhlcml0Jyk7XG4gIH0pO1xuXG4gIHJlc2V0KCk7XG59XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICB1c2Vyc0RhdGEgPSBbXTtcbiAgZm9sbG93ZXJMaW5rc0RhdGEgPSBbXTtcbiAgX21hcCA9IHt9O1xuICBfYWRkZWRCeVVzZXJuYW1lID0ge307XG4gIHJlYXBwbHlGb3JjZSgpO1xufVxuXG5mdW5jdGlvbiBjbGFtcChuLCBtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobiwgbWluKSwgbWF4KTtcbn1cblxuZnVuY3Rpb24gdGljaygpIHtcbiAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLm5vZGUoKS53aWR0aCwgY2FudmFzLm5vZGUoKS5oZWlnaHQpO1xuXG4gIGZvbGxvd2VyTGlua3NEYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIHZhciBzb3VyY2UgPSBkLnNvdXJjZTtcbiAgICB2YXIgdGFyZ2V0ID0gZC50YXJnZXQ7XG4gICAgaWYgKCF0YXJnZXQuaW1hZ2UgfHwgIXNvdXJjZS5pbWFnZSkgcmV0dXJuO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oc291cmNlLngsc291cmNlLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRhcmdldC54LHRhcmdldC55KTtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJyNjY2MnO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuICB9KTtcblxuICB1c2Vyc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgZC54ID0gY2xhbXAoZC54LCAwLCB3aW5kb3cuaW5uZXJXaWR0aCk7XG4gICAgZC55ID0gY2xhbXAoZC55LCAwLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIGlmIChkLmltYWdlKSB7XG4gICAgICAvLyBjb250ZXh0LnNhdmUoKTtcbiAgICAgIC8vIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAvLyBjb250ZXh0LmFyYyhkLngsIGQueSwgTWF0aC5zcXJ0KE1hdGgucG93KE5PREVfU0laRSowLjUsIDIpICsgTWF0aC5wb3coTk9ERV9TSVpFKjAuNSwgMikpLCAwLCAyICogTWF0aC5QSSwgdHJ1ZSk7XG4gICAgICAvLyBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgLy8gY29udGV4dC5jbGlwKCk7XG4gICAgICBcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGQuaW1hZ2UsIGQueCAtIE5PREVfU0laRSowLjUsIGQueSAtIE5PREVfU0laRSowLjUsIE5PREVfU0laRSwgTk9ERV9TSVpFKTtcblxuICAgICAgLy8gY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIC8vIGNvbnRleHQuYXJjKGQueCwgZC55LCBNYXRoLnNxcnQoTWF0aC5wb3coTk9ERV9TSVpFKjAuNSwgMikgKyBNYXRoLnBvdyhOT0RFX1NJWkUqMC41LCAyKSksIDAsIDIgKiBNYXRoLlBJLCB0cnVlKTtcbiAgICAgIC8vIGNvbnRleHQuY2xpcCgpO1xuICAgICAgLy8gY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgIC8vIGNvbnRleHQucmVzdG9yZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGltYWdlLnNyYyA9IGQuYXZhdGFyX3VybDtcbiAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkLmltYWdlID0gaW1hZ2U7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlYXBwbHlGb3JjZSgpIHtcbiAgZm9yY2UgPSBmb3JjZVxuICAgIC5ub2Rlcyh1c2Vyc0RhdGEpXG4gICAgLmxpbmtzKGZvbGxvd2VyTGlua3NEYXRhKVxuICAgIC5zdGFydCgpO1xufVxuXG5mdW5jdGlvbiBfYWRkVXNlcih1c2VyKSB7XG4gIGlmICghX21hcFt1c2VyLmlkXSkge1xuICAgIF9tYXBbdXNlci5pZF0gPSB1c2VyO1xuICAgIHVzZXJzRGF0YS5wdXNoKHVzZXIpO1xuICB9XG4gIHJldHVybiBfbWFwW3VzZXIuaWRdO1xufVxuXG5mdW5jdGlvbiBfYWRkRm9sbG93ZXJMaW5rKHRhcmdldFVzZXIsIHNvdXJjZVVzZXIpIHtcbiAgdGFyZ2V0VXNlci5saW5rc0FkZGVkID0gdHJ1ZTtcbiAgdGFyZ2V0VXNlciA9IF9hZGRVc2VyKHRhcmdldFVzZXIpO1xuICBzb3VyY2VVc2VyID0gX2FkZFVzZXIoc291cmNlVXNlcik7XG4gIGlmICghX21hcFtzb3VyY2VVc2VyLmluZGV4ICsgJy0nICsgdGFyZ2V0VXNlci5pbmRleF0pIHtcbiAgICBfbWFwW3NvdXJjZVVzZXIuaWQgKyAnLScgKyB0YXJnZXRVc2VyLmlkXSA9IHRydWU7XG4gICAgZm9sbG93ZXJMaW5rc0RhdGEucHVzaCh7IHNvdXJjZTogc291cmNlVXNlciwgdGFyZ2V0OiB0YXJnZXRVc2VyIH0pO1xuICB9XG4gIHJlYXBwbHlGb3JjZSgpO1xufVxuXG5mdW5jdGlvbiBhZGRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICBpZiAoX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0pIHJldHVybjtcbiAgX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0gPSB0cnVlO1xuICB0b2FzdCgnRmV0Y2hpbmcgZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpICsgJy4uLicsICdwcm9ncmVzcycpO1xuICBkMy5qc29uKCdhcGkvdXNlcnMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3dpbmcnLCBmdW5jdGlvbihlcnJvciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gdG9hc3QoJ0NvdWxkIG5vdCBmZXRjaCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdlcnJvcicpO1xuICAgIH1cbiAgICB0b2FzdCgnRmV0Y2hlZCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdzdWNjZXNzJyk7XG4gICAgcmVzdWx0LmZvbGxvd2luZy5mb3JFYWNoKGZ1bmN0aW9uKGZvbGxvd2VyKSB7XG4gICAgICBfYWRkRm9sbG93ZXJMaW5rKHJlc3VsdC51c2VyLCBmb2xsb3dlcik7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5cblxuXG5pbml0KCk7XG5hZGRVc2VyQnlVc2VybmFtZSgnRmFyaGFkRycpO1xuIl19
