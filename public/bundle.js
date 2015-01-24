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

var force, canvas, context;
var usersData;
var followerLinksData;
var _map;
var _addedByUsername;
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

  canvas = d3.select('body')
    .insert('canvas', ':first-child')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight);

  context = canvas.node().getContext('2d');

  var dragging = null;
  
  canvas.node().addEventListener('mousemove', function(e) {
    if (!dragging) return;
    dragging.px = e.x;
    dragging.py = e.y;
    dragging.x = e.x;
    dragging.y = e.y; 
    tick();
  });

  canvas.node().addEventListener('mouseup', function(e) {
    dragging = null;
    // reapplyForce();
    force.resume();
  });

  canvas.node().addEventListener('mousedown', function(e) {
    dragging = null;
    // event.stopPropagation();

    usersData.forEach(function(d) {
      if (
        e.x > d.x - NODE_SIZE*0.5 &&
        e.x < d.x + NODE_SIZE*0.5 &&
        e.y > d.y - NODE_SIZE*0.5 &&
        e.y < d.y + NODE_SIZE*0.5
      ) {
        dragging = d;
        // addUserByUsername(d.login);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLyogZ2xvYmFsIGQzICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyICR0b2FzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2FzdCcpO1xudmFyICRyZXNldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldCcpO1xudmFyICRmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbmF2IGZvcm0nKTtcbnZhciAkdXNlcm5hbWUgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuXG52YXIgTk9ERV9TSVpFID0gMzI7XG5cbmZ1bmN0aW9uIHRvYXN0KGh0bWwsIHR5cGUpIHtcbiAgJHRvYXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICR0b2FzdC5jbGFzc05hbWUgPSB0eXBlO1xuICAkdG9hc3Quc3R5bGUub3BhY2l0eSA9IDE7XG59XG5cbmZ1bmN0aW9uIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSB7XG4gIHJldHVybiAoJzxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vJyArIHVzZXJuYW1lICsgJ1wiPicgKyB1c2VybmFtZSArICc8L2E+Jyk7XG59XG5cbiRyZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICByZXNldCgpO1xufSk7XG5cbiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGFkZFVzZXJCeVVzZXJuYW1lKCR1c2VybmFtZS52YWx1ZSk7XG4gICR1c2VybmFtZS52YWx1ZSA9ICcnO1xufSk7XG5cbnZhciBmb3JjZSwgY2FudmFzLCBjb250ZXh0O1xudmFyIHVzZXJzRGF0YTtcbnZhciBmb2xsb3dlckxpbmtzRGF0YTtcbnZhciBfbWFwO1xudmFyIF9hZGRlZEJ5VXNlcm5hbWU7XG52YXIgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbnZhciBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC00MDApXG4gICAgLmxpbmtEaXN0YW5jZSg0MDApXG4gICAgLmxpbmtTdHJlbmd0aCgwLjEpXG4gICAgLmNoYXJnZURpc3RhbmNlKDQwMClcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW1dJRFRILCBIRUlHSFRdKVxuICAgIC5vbigndGljaycsIHRpY2spO1xuXG4gIGNhbnZhcyA9IGQzLnNlbGVjdCgnYm9keScpXG4gICAgLmluc2VydCgnY2FudmFzJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2luZG93LmlubmVyV2lkdGgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cbiAgY29udGV4dCA9IGNhbnZhcy5ub2RlKCkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICB2YXIgZHJhZ2dpbmcgPSBudWxsO1xuICBcbiAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCFkcmFnZ2luZykgcmV0dXJuO1xuICAgIGRyYWdnaW5nLnB4ID0gZS54O1xuICAgIGRyYWdnaW5nLnB5ID0gZS55O1xuICAgIGRyYWdnaW5nLnggPSBlLng7XG4gICAgZHJhZ2dpbmcueSA9IGUueTsgXG4gICAgdGljaygpO1xuICB9KTtcblxuICBjYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCBmdW5jdGlvbihlKSB7XG4gICAgZHJhZ2dpbmcgPSBudWxsO1xuICAgIC8vIHJlYXBwbHlGb3JjZSgpO1xuICAgIGZvcmNlLnJlc3VtZSgpO1xuICB9KTtcblxuICBjYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICBkcmFnZ2luZyA9IG51bGw7XG4gICAgLy8gZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB1c2Vyc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGUueCA+IGQueCAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZS54IDwgZC54ICsgTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBlLnkgPiBkLnkgLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGUueSA8IGQueSArIE5PREVfU0laRSowLjVcbiAgICAgICkge1xuICAgICAgICBkcmFnZ2luZyA9IGQ7XG4gICAgICAgIC8vIGFkZFVzZXJCeVVzZXJuYW1lKGQubG9naW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICByZXNldCgpO1xufVxuXG5mdW5jdGlvbiByZXNldCgpIHtcbiAgdXNlcnNEYXRhID0gW107XG4gIGZvbGxvd2VyTGlua3NEYXRhID0gW107XG4gIF9tYXAgPSB7fTtcbiAgX2FkZGVkQnlVc2VybmFtZSA9IHt9O1xuICByZWFwcGx5Rm9yY2UoKTtcbn1cblxuZnVuY3Rpb24gY2xhbXAobiwgbWluLCBtYXgpIHtcbiAgcmV0dXJuIE1hdGgubWluKE1hdGgubWF4KG4sIG1pbiksIG1heCk7XG59XG5cbmZ1bmN0aW9uIHRpY2soKSB7XG4gIGNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIGNhbnZhcy5ub2RlKCkud2lkdGgsIGNhbnZhcy5ub2RlKCkuaGVpZ2h0KTtcblxuICBmb2xsb3dlckxpbmtzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICB2YXIgc291cmNlID0gZC5zb3VyY2U7XG4gICAgdmFyIHRhcmdldCA9IGQudGFyZ2V0O1xuICAgIGlmICghdGFyZ2V0LmltYWdlIHx8ICFzb3VyY2UuaW1hZ2UpIHJldHVybjtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKHNvdXJjZS54LHNvdXJjZS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0YXJnZXQueCx0YXJnZXQueSk7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9ICcjY2NjJztcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDE7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbiAgfSk7XG5cbiAgdXNlcnNEYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIGQueCA9IGNsYW1wKGQueCwgMCwgd2luZG93LmlubmVyV2lkdGgpO1xuICAgIGQueSA9IGNsYW1wKGQueSwgMCwgd2luZG93LmlubmVySGVpZ2h0KTtcbiAgICBpZiAoZC5pbWFnZSkge1xuICAgICAgLy8gY29udGV4dC5zYXZlKCk7XG4gICAgICAvLyBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgLy8gY29udGV4dC5hcmMoZC54LCBkLnksIE1hdGguc3FydChNYXRoLnBvdyhOT0RFX1NJWkUqMC41LCAyKSArIE1hdGgucG93KE5PREVfU0laRSowLjUsIDIpKSwgMCwgMiAqIE1hdGguUEksIHRydWUpO1xuICAgICAgLy8gY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgIC8vIGNvbnRleHQuY2xpcCgpO1xuICAgICAgXG4gICAgICBjb250ZXh0LmRyYXdJbWFnZShkLmltYWdlLCBkLnggLSBOT0RFX1NJWkUqMC41LCBkLnkgLSBOT0RFX1NJWkUqMC41LCBOT0RFX1NJWkUsIE5PREVfU0laRSk7XG5cbiAgICAgIC8vIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAvLyBjb250ZXh0LmFyYyhkLngsIGQueSwgTWF0aC5zcXJ0KE1hdGgucG93KE5PREVfU0laRSowLjUsIDIpICsgTWF0aC5wb3coTk9ERV9TSVpFKjAuNSwgMikpLCAwLCAyICogTWF0aC5QSSwgdHJ1ZSk7XG4gICAgICAvLyBjb250ZXh0LmNsaXAoKTtcbiAgICAgIC8vIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAvLyBjb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICBpbWFnZS5zcmMgPSBkLmF2YXRhcl91cmw7XG4gICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZC5pbWFnZSA9IGltYWdlO1xuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZWFwcGx5Rm9yY2UoKSB7XG4gIGZvcmNlID0gZm9yY2VcbiAgICAubm9kZXModXNlcnNEYXRhKVxuICAgIC5saW5rcyhmb2xsb3dlckxpbmtzRGF0YSlcbiAgICAuc3RhcnQoKTtcbn1cblxuZnVuY3Rpb24gX2FkZFVzZXIodXNlcikge1xuICBpZiAoIV9tYXBbdXNlci5pZF0pIHtcbiAgICBfbWFwW3VzZXIuaWRdID0gdXNlcjtcbiAgICB1c2Vyc0RhdGEucHVzaCh1c2VyKTtcbiAgfVxuICByZXR1cm4gX21hcFt1c2VyLmlkXTtcbn1cblxuZnVuY3Rpb24gX2FkZEZvbGxvd2VyTGluayh0YXJnZXRVc2VyLCBzb3VyY2VVc2VyKSB7XG4gIHRhcmdldFVzZXIubGlua3NBZGRlZCA9IHRydWU7XG4gIHRhcmdldFVzZXIgPSBfYWRkVXNlcih0YXJnZXRVc2VyKTtcbiAgc291cmNlVXNlciA9IF9hZGRVc2VyKHNvdXJjZVVzZXIpO1xuICBpZiAoIV9tYXBbc291cmNlVXNlci5pbmRleCArICctJyArIHRhcmdldFVzZXIuaW5kZXhdKSB7XG4gICAgX21hcFtzb3VyY2VVc2VyLmlkICsgJy0nICsgdGFyZ2V0VXNlci5pZF0gPSB0cnVlO1xuICAgIGZvbGxvd2VyTGlua3NEYXRhLnB1c2goeyBzb3VyY2U6IHNvdXJjZVVzZXIsIHRhcmdldDogdGFyZ2V0VXNlciB9KTtcbiAgfVxuICByZWFwcGx5Rm9yY2UoKTtcbn1cblxuZnVuY3Rpb24gYWRkVXNlckJ5VXNlcm5hbWUodXNlcm5hbWUpIHtcbiAgaWYgKF9hZGRlZEJ5VXNlcm5hbWVbdXNlcm5hbWVdKSByZXR1cm47XG4gIF9hZGRlZEJ5VXNlcm5hbWVbdXNlcm5hbWVdID0gdHJ1ZTtcbiAgdG9hc3QoJ0ZldGNoaW5nIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSArICcuLi4nLCAncHJvZ3Jlc3MnKTtcbiAgZDMuanNvbignYXBpL3VzZXJzLycgKyB1c2VybmFtZSArICcvZm9sbG93aW5nJywgZnVuY3Rpb24oZXJyb3IsIHJlc3VsdCkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIHRvYXN0KCdDb3VsZCBub3QgZmV0Y2ggZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpLCAnZXJyb3InKTtcbiAgICB9XG4gICAgdG9hc3QoJ0ZldGNoZWQgZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpLCAnc3VjY2VzcycpO1xuICAgIHJlc3VsdC5mb2xsb3dpbmcuZm9yRWFjaChmdW5jdGlvbihmb2xsb3dlcikge1xuICAgICAgX2FkZEZvbGxvd2VyTGluayhyZXN1bHQudXNlciwgZm9sbG93ZXIpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuXG5cblxuaW5pdCgpO1xuYWRkVXNlckJ5VXNlcm5hbWUoJ0ZhcmhhZEcnKTtcbiJdfQ==
