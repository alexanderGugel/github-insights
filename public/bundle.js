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
    console.log(dragging)
    dragging.x = e.x;
    dragging.y = e.y;
  });

  canvas.node().addEventListener('mouseup', function(e) {
    dragging = null;
    reapplyForce();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLyogZ2xvYmFsIGQzICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyICR0b2FzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2FzdCcpO1xudmFyICRyZXNldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldCcpO1xudmFyICRmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbmF2IGZvcm0nKTtcbnZhciAkdXNlcm5hbWUgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuXG52YXIgTk9ERV9TSVpFID0gMzI7XG5cbmZ1bmN0aW9uIHRvYXN0KGh0bWwsIHR5cGUpIHtcbiAgJHRvYXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICR0b2FzdC5jbGFzc05hbWUgPSB0eXBlO1xuICAkdG9hc3Quc3R5bGUub3BhY2l0eSA9IDE7XG59XG5cbmZ1bmN0aW9uIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSB7XG4gIHJldHVybiAoJzxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vJyArIHVzZXJuYW1lICsgJ1wiPicgKyB1c2VybmFtZSArICc8L2E+Jyk7XG59XG5cbiRyZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICByZXNldCgpO1xufSk7XG5cbiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGFkZFVzZXJCeVVzZXJuYW1lKCR1c2VybmFtZS52YWx1ZSk7XG4gICR1c2VybmFtZS52YWx1ZSA9ICcnO1xufSk7XG5cbnZhciBmb3JjZSwgY2FudmFzLCBjb250ZXh0O1xudmFyIHVzZXJzRGF0YTtcbnZhciBmb2xsb3dlckxpbmtzRGF0YTtcbnZhciBfbWFwO1xudmFyIF9hZGRlZEJ5VXNlcm5hbWU7XG52YXIgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbnZhciBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC00MDApXG4gICAgLmxpbmtEaXN0YW5jZSg0MDApXG4gICAgLmxpbmtTdHJlbmd0aCgwLjEpXG4gICAgLmNoYXJnZURpc3RhbmNlKDQwMClcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW1dJRFRILCBIRUlHSFRdKVxuICAgIC5vbigndGljaycsIHRpY2spO1xuXG4gIGNhbnZhcyA9IGQzLnNlbGVjdCgnYm9keScpXG4gICAgLmluc2VydCgnY2FudmFzJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2luZG93LmlubmVyV2lkdGgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cbiAgY29udGV4dCA9IGNhbnZhcy5ub2RlKCkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICB2YXIgZHJhZ2dpbmcgPSBudWxsO1xuICBcbiAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG4gICAgaWYgKCFkcmFnZ2luZykgcmV0dXJuO1xuICAgIGNvbnNvbGUubG9nKGRyYWdnaW5nKVxuICAgIGRyYWdnaW5nLnggPSBlLng7XG4gICAgZHJhZ2dpbmcueSA9IGUueTtcbiAgfSk7XG5cbiAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZSkge1xuICAgIGRyYWdnaW5nID0gbnVsbDtcbiAgICByZWFwcGx5Rm9yY2UoKTtcbiAgfSk7XG5cbiAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgZHJhZ2dpbmcgPSBudWxsO1xuICAgIC8vIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdXNlcnNEYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgICAgaWYgKFxuICAgICAgICBlLnggPiBkLnggLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGUueCA8IGQueCArIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZS55ID4gZC55IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBlLnkgPCBkLnkgKyBOT0RFX1NJWkUqMC41XG4gICAgICApIHtcbiAgICAgICAgZHJhZ2dpbmcgPSBkO1xuICAgICAgICAvLyBhZGRVc2VyQnlVc2VybmFtZShkLmxvZ2luKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmVzZXQoKTtcbn1cblxuZnVuY3Rpb24gcmVzZXQoKSB7XG4gIHVzZXJzRGF0YSA9IFtdO1xuICBmb2xsb3dlckxpbmtzRGF0YSA9IFtdO1xuICBfbWFwID0ge307XG4gIF9hZGRlZEJ5VXNlcm5hbWUgPSB7fTtcbiAgcmVhcHBseUZvcmNlKCk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKG4sIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChuLCBtaW4pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiB0aWNrKCkge1xuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMubm9kZSgpLndpZHRoLCBjYW52YXMubm9kZSgpLmhlaWdodCk7XG5cbiAgZm9sbG93ZXJMaW5rc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgdmFyIHNvdXJjZSA9IGQuc291cmNlO1xuICAgIHZhciB0YXJnZXQgPSBkLnRhcmdldDtcbiAgICBpZiAoIXRhcmdldC5pbWFnZSB8fCAhc291cmNlLmltYWdlKSByZXR1cm47XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhzb3VyY2UueCxzb3VyY2UueSk7XG4gICAgY29udGV4dC5saW5lVG8odGFyZ2V0LngsdGFyZ2V0LnkpO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnI2NjYyc7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gIH0pO1xuXG4gIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICBkLnggPSBjbGFtcChkLngsIDAsIHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICBkLnkgPSBjbGFtcChkLnksIDAsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgaWYgKGQuaW1hZ2UpIHtcbiAgICAgIC8vIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgLy8gY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIC8vIGNvbnRleHQuYXJjKGQueCwgZC55LCBNYXRoLnNxcnQoTWF0aC5wb3coTk9ERV9TSVpFKjAuNSwgMikgKyBNYXRoLnBvdyhOT0RFX1NJWkUqMC41LCAyKSksIDAsIDIgKiBNYXRoLlBJLCB0cnVlKTtcbiAgICAgIC8vIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAvLyBjb250ZXh0LmNsaXAoKTtcbiAgICAgIFxuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoZC5pbWFnZSwgZC54IC0gTk9ERV9TSVpFKjAuNSwgZC55IC0gTk9ERV9TSVpFKjAuNSwgTk9ERV9TSVpFLCBOT0RFX1NJWkUpO1xuXG4gICAgICAvLyBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgLy8gY29udGV4dC5hcmMoZC54LCBkLnksIE1hdGguc3FydChNYXRoLnBvdyhOT0RFX1NJWkUqMC41LCAyKSArIE1hdGgucG93KE5PREVfU0laRSowLjUsIDIpKSwgMCwgMiAqIE1hdGguUEksIHRydWUpO1xuICAgICAgLy8gY29udGV4dC5jbGlwKCk7XG4gICAgICAvLyBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgLy8gY29udGV4dC5yZXN0b3JlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgaW1hZ2Uuc3JjID0gZC5hdmF0YXJfdXJsO1xuICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGQuaW1hZ2UgPSBpbWFnZTtcbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVhcHBseUZvcmNlKCkge1xuICBmb3JjZSA9IGZvcmNlXG4gICAgLm5vZGVzKHVzZXJzRGF0YSlcbiAgICAubGlua3MoZm9sbG93ZXJMaW5rc0RhdGEpXG4gICAgLnN0YXJ0KCk7XG59XG5cbmZ1bmN0aW9uIF9hZGRVc2VyKHVzZXIpIHtcbiAgaWYgKCFfbWFwW3VzZXIuaWRdKSB7XG4gICAgX21hcFt1c2VyLmlkXSA9IHVzZXI7XG4gICAgdXNlcnNEYXRhLnB1c2godXNlcik7XG4gIH1cbiAgcmV0dXJuIF9tYXBbdXNlci5pZF07XG59XG5cbmZ1bmN0aW9uIF9hZGRGb2xsb3dlckxpbmsodGFyZ2V0VXNlciwgc291cmNlVXNlcikge1xuICB0YXJnZXRVc2VyLmxpbmtzQWRkZWQgPSB0cnVlO1xuICB0YXJnZXRVc2VyID0gX2FkZFVzZXIodGFyZ2V0VXNlcik7XG4gIHNvdXJjZVVzZXIgPSBfYWRkVXNlcihzb3VyY2VVc2VyKTtcbiAgaWYgKCFfbWFwW3NvdXJjZVVzZXIuaW5kZXggKyAnLScgKyB0YXJnZXRVc2VyLmluZGV4XSkge1xuICAgIF9tYXBbc291cmNlVXNlci5pZCArICctJyArIHRhcmdldFVzZXIuaWRdID0gdHJ1ZTtcbiAgICBmb2xsb3dlckxpbmtzRGF0YS5wdXNoKHsgc291cmNlOiBzb3VyY2VVc2VyLCB0YXJnZXQ6IHRhcmdldFVzZXIgfSk7XG4gIH1cbiAgcmVhcHBseUZvcmNlKCk7XG59XG5cbmZ1bmN0aW9uIGFkZFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gIGlmIChfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSkgcmV0dXJuO1xuICBfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSA9IHRydWU7XG4gIHRvYXN0KCdGZXRjaGluZyBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSkgKyAnLi4uJywgJ3Byb2dyZXNzJyk7XG4gIGQzLmpzb24oJ2FwaS91c2Vycy8nICsgdXNlcm5hbWUgKyAnL2ZvbGxvd2luZycsIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB0b2FzdCgnQ291bGQgbm90IGZldGNoIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ2Vycm9yJyk7XG4gICAgfVxuICAgIHRvYXN0KCdGZXRjaGVkIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ3N1Y2Nlc3MnKTtcbiAgICByZXN1bHQuZm9sbG93aW5nLmZvckVhY2goZnVuY3Rpb24oZm9sbG93ZXIpIHtcbiAgICAgIF9hZGRGb2xsb3dlckxpbmsocmVzdWx0LnVzZXIsIGZvbGxvd2VyKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cblxuXG5cbmluaXQoKTtcbmFkZFVzZXJCeVVzZXJuYW1lKCdGYXJoYWRHJyk7XG4iXX0=
