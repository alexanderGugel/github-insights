(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
/* jshint undef: true, unused: true */
/* global d3 */

'use strict';

var $toast = document.getElementById('toast');
var $reset = document.getElementById('reset');
var $form = document.querySelector('nav form');
var $username = $form.querySelector('input');

var NODE_SIZE = 32;

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
        addUserByUsername(d.login);
      }
    });
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cbi8qIGdsb2JhbCBkMyAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciAkdG9hc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9hc3QnKTtcbnZhciAkcmVzZXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncmVzZXQnKTtcbnZhciAkZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ25hdiBmb3JtJyk7XG52YXIgJHVzZXJuYW1lID0gJGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXQnKTtcblxudmFyIE5PREVfU0laRSA9IDMyO1xuXG5mdW5jdGlvbiB0b2FzdChodG1sLCB0eXBlKSB7XG4gICR0b2FzdC5pbm5lckhUTUwgPSBodG1sO1xuICAkdG9hc3QuY2xhc3NOYW1lID0gdHlwZTtcbiAgJHRvYXN0LnN0eWxlLm9wYWNpdHkgPSAxO1xufVxuXG5mdW5jdGlvbiB1c2VybmFtZVRvTGluayh1c2VybmFtZSkge1xuICByZXR1cm4gKCc8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tLycgKyB1c2VybmFtZSArICdcIj4nICsgdXNlcm5hbWUgKyAnPC9hPicpO1xufVxuXG4kcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgcmVzZXQoKTtcbn0pO1xuXG4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBhZGRVc2VyQnlVc2VybmFtZSgkdXNlcm5hbWUudmFsdWUpO1xuICAkdXNlcm5hbWUudmFsdWUgPSAnJztcbn0pO1xuXG52YXIgZm9yY2UsIGNhbnZhcywgY29udGV4dCwgZHJhZztcbnZhciB1c2Vyc0RhdGE7XG52YXIgZm9sbG93ZXJMaW5rc0RhdGE7XG52YXIgX21hcDtcbnZhciBfYWRkZWRCeVVzZXJuYW1lO1xudmFyIFdJRFRIID0gd2luZG93LmlubmVyV2lkdGg7XG52YXIgSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICBkcmFnID0gZDMuYmVoYXZpb3IuZHJhZygpO1xuXG4gIGZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC00MDApXG4gICAgLmxpbmtEaXN0YW5jZSg0MDApXG4gICAgLmxpbmtTdHJlbmd0aCgwLjEpXG4gICAgLmNoYXJnZURpc3RhbmNlKDQwMClcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW1dJRFRILCBIRUlHSFRdKVxuICAgIC5vbigndGljaycsIHRpY2spO1xuXG4gIGNhbnZhcyA9IGQzLnNlbGVjdCgnYm9keScpXG4gICAgLmluc2VydCgnY2FudmFzJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2luZG93LmlubmVyV2lkdGgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIHdpbmRvdy5pbm5lckhlaWdodClcbiAgICAuY2FsbChkcmFnKTtcblxuICBjb250ZXh0ID0gY2FudmFzLm5vZGUoKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIHZhciBkcmFnZ2luZyA9IG51bGw7XG5cbiAgZHJhZy5vbignZHJhZycsIGZ1bmN0aW9uKCkge1xuICAgIGlmICghZHJhZ2dpbmcpIHtcbiAgICAgIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGQzLmV2ZW50LnggPiBkLnggLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgICAgZDMuZXZlbnQueCA8IGQueCArIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgICBkMy5ldmVudC55ID4gZC55IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICAgIGQzLmV2ZW50LnkgPCBkLnkgKyBOT0RFX1NJWkUqMC41XG4gICAgICAgICkge1xuICAgICAgICAgIGRyYWdnaW5nID0gZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKCFkcmFnZ2luZykgcmV0dXJuO1xuICAgIGRyYWdnaW5nLnB4ID0gZDMuZXZlbnQueDtcbiAgICBkcmFnZ2luZy5weSA9IGQzLmV2ZW50Lnk7XG4gICAgZHJhZ2dpbmcueCA9IGQzLmV2ZW50Lng7XG4gICAgZHJhZ2dpbmcueSA9IGQzLmV2ZW50Lnk7IFxuICAgIHRpY2soKTtcbiAgfSk7XG5cbiAgZHJhZy5vbignZHJhZ2VuZCcsIGZ1bmN0aW9uKCkge1xuICAgIGRyYWdnaW5nID0gbnVsbDtcbiAgICBmb3JjZS5yZXN1bWUoKTtcbiAgfSk7XG5cbiAgZHJhZy5vbignZHJhZ3N0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgZHJhZ2dpbmcgPSBudWxsO1xuICAgIGQzLmV2ZW50LnNvdXJjZUV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIGZvcmNlLnN0b3AoKTtcbiAgfSk7XG5cbiAgY2FudmFzLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZDMuZXZlbnQueCA+IGQueCAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueCA8IGQueCArIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueSA+IGQueSAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZDMuZXZlbnQueSA8IGQueSArIE5PREVfU0laRSowLjVcbiAgICAgICkge1xuICAgICAgICBhZGRVc2VyQnlVc2VybmFtZShkLmxvZ2luKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmVzZXQoKTtcbn1cblxuZnVuY3Rpb24gcmVzZXQoKSB7XG4gIHVzZXJzRGF0YSA9IFtdO1xuICBmb2xsb3dlckxpbmtzRGF0YSA9IFtdO1xuICBfbWFwID0ge307XG4gIF9hZGRlZEJ5VXNlcm5hbWUgPSB7fTtcbiAgcmVhcHBseUZvcmNlKCk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKG4sIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChuLCBtaW4pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiB0aWNrKCkge1xuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMubm9kZSgpLndpZHRoLCBjYW52YXMubm9kZSgpLmhlaWdodCk7XG5cbiAgZm9sbG93ZXJMaW5rc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgdmFyIHNvdXJjZSA9IGQuc291cmNlO1xuICAgIHZhciB0YXJnZXQgPSBkLnRhcmdldDtcbiAgICBpZiAoIXRhcmdldC5pbWFnZSB8fCAhc291cmNlLmltYWdlKSByZXR1cm47XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhzb3VyY2UueCxzb3VyY2UueSk7XG4gICAgY29udGV4dC5saW5lVG8odGFyZ2V0LngsdGFyZ2V0LnkpO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnI2NjYyc7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gIH0pO1xuXG4gIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICBkLnggPSBjbGFtcChkLngsIDAsIHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICBkLnkgPSBjbGFtcChkLnksIDAsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgaWYgKGQuaW1hZ2UpIHtcbiAgICAgIC8vIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgLy8gY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIC8vIGNvbnRleHQuYXJjKGQueCwgZC55LCBNYXRoLnNxcnQoTWF0aC5wb3coTk9ERV9TSVpFKjAuNSwgMikgKyBNYXRoLnBvdyhOT0RFX1NJWkUqMC41LCAyKSksIDAsIDIgKiBNYXRoLlBJLCB0cnVlKTtcbiAgICAgIC8vIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAvLyBjb250ZXh0LmNsaXAoKTtcbiAgICAgIFxuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoZC5pbWFnZSwgZC54IC0gTk9ERV9TSVpFKjAuNSwgZC55IC0gTk9ERV9TSVpFKjAuNSwgTk9ERV9TSVpFLCBOT0RFX1NJWkUpO1xuXG4gICAgICAvLyBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgLy8gY29udGV4dC5hcmMoZC54LCBkLnksIE1hdGguc3FydChNYXRoLnBvdyhOT0RFX1NJWkUqMC41LCAyKSArIE1hdGgucG93KE5PREVfU0laRSowLjUsIDIpKSwgMCwgMiAqIE1hdGguUEksIHRydWUpO1xuICAgICAgLy8gY29udGV4dC5jbGlwKCk7XG4gICAgICAvLyBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgLy8gY29udGV4dC5yZXN0b3JlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgaW1hZ2Uuc3JjID0gZC5hdmF0YXJfdXJsO1xuICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGQuaW1hZ2UgPSBpbWFnZTtcbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVhcHBseUZvcmNlKCkge1xuICBmb3JjZSA9IGZvcmNlXG4gICAgLm5vZGVzKHVzZXJzRGF0YSlcbiAgICAubGlua3MoZm9sbG93ZXJMaW5rc0RhdGEpXG4gICAgLnN0YXJ0KCk7XG59XG5cbmZ1bmN0aW9uIF9hZGRVc2VyKHVzZXIpIHtcbiAgaWYgKCFfbWFwW3VzZXIuaWRdKSB7XG4gICAgX21hcFt1c2VyLmlkXSA9IHVzZXI7XG4gICAgdXNlcnNEYXRhLnB1c2godXNlcik7XG4gIH1cbiAgcmV0dXJuIF9tYXBbdXNlci5pZF07XG59XG5cbmZ1bmN0aW9uIF9hZGRGb2xsb3dlckxpbmsodGFyZ2V0VXNlciwgc291cmNlVXNlcikge1xuICB0YXJnZXRVc2VyLmxpbmtzQWRkZWQgPSB0cnVlO1xuICB0YXJnZXRVc2VyID0gX2FkZFVzZXIodGFyZ2V0VXNlcik7XG4gIHNvdXJjZVVzZXIgPSBfYWRkVXNlcihzb3VyY2VVc2VyKTtcbiAgaWYgKCFfbWFwW3NvdXJjZVVzZXIuaW5kZXggKyAnLScgKyB0YXJnZXRVc2VyLmluZGV4XSkge1xuICAgIF9tYXBbc291cmNlVXNlci5pZCArICctJyArIHRhcmdldFVzZXIuaWRdID0gdHJ1ZTtcbiAgICBmb2xsb3dlckxpbmtzRGF0YS5wdXNoKHsgc291cmNlOiBzb3VyY2VVc2VyLCB0YXJnZXQ6IHRhcmdldFVzZXIgfSk7XG4gIH1cbiAgcmVhcHBseUZvcmNlKCk7XG59XG5cbmZ1bmN0aW9uIGFkZFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gIGlmIChfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSkgcmV0dXJuO1xuICBfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSA9IHRydWU7XG4gIHRvYXN0KCdGZXRjaGluZyBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSkgKyAnLi4uJywgJ3Byb2dyZXNzJyk7XG4gIGQzLmpzb24oJ2FwaS91c2Vycy8nICsgdXNlcm5hbWUgKyAnL2ZvbGxvd2luZycsIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB0b2FzdCgnQ291bGQgbm90IGZldGNoIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ2Vycm9yJyk7XG4gICAgfVxuICAgIHRvYXN0KCdGZXRjaGVkIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ3N1Y2Nlc3MnKTtcbiAgICByZXN1bHQuZm9sbG93aW5nLmZvckVhY2goZnVuY3Rpb24oZm9sbG93ZXIpIHtcbiAgICAgIF9hZGRGb2xsb3dlckxpbmsocmVzdWx0LnVzZXIsIGZvbGxvd2VyKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cblxuXG5cbmluaXQoKTtcbmFkZFVzZXJCeVVzZXJuYW1lKCdGYXJoYWRHJyk7XG4iXX0=
