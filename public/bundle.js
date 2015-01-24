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
    force.resume();
  });

  canvas.node().addEventListener('mousedown', function(e) {
    dragging = null;
    force.stop();

    usersData.forEach(function(d) {
      if (
        e.x > d.x - NODE_SIZE*0.5 &&
        e.x < d.x + NODE_SIZE*0.5 &&
        e.y > d.y - NODE_SIZE*0.5 &&
        e.y < d.y + NODE_SIZE*0.5
      ) {
        dragging = d;
      }
    });
  });

  canvas.node().addEventListener('click', function(e) {
    usersData.forEach(function(d) {
      if (
        e.x > d.x - NODE_SIZE*0.5 &&
        e.x < d.x + NODE_SIZE*0.5 &&
        e.y > d.y - NODE_SIZE*0.5 &&
        e.y < d.y + NODE_SIZE*0.5
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKiBnbG9iYWwgZDMgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgJHRvYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvYXN0Jyk7XG52YXIgJHJlc2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0Jyk7XG52YXIgJGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYgZm9ybScpO1xudmFyICR1c2VybmFtZSA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Jyk7XG5cbnZhciBOT0RFX1NJWkUgPSAzMjtcblxuZnVuY3Rpb24gdG9hc3QoaHRtbCwgdHlwZSkge1xuICAkdG9hc3QuaW5uZXJIVE1MID0gaHRtbDtcbiAgJHRvYXN0LmNsYXNzTmFtZSA9IHR5cGU7XG4gICR0b2FzdC5zdHlsZS5vcGFjaXR5ID0gMTtcbn1cblxuZnVuY3Rpb24gdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpIHtcbiAgcmV0dXJuICgnPGEgdGFyZ2V0PVwiX2JsYW5rXCIgaHJlZj1cImh0dHBzOi8vZ2l0aHViLmNvbS8nICsgdXNlcm5hbWUgKyAnXCI+JyArIHVzZXJuYW1lICsgJzwvYT4nKTtcbn1cblxuJHJlc2V0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gIHJlc2V0KCk7XG59KTtcblxuJGZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgYWRkVXNlckJ5VXNlcm5hbWUoJHVzZXJuYW1lLnZhbHVlKTtcbiAgJHVzZXJuYW1lLnZhbHVlID0gJyc7XG59KTtcblxudmFyIGZvcmNlLCBjYW52YXMsIGNvbnRleHQ7XG52YXIgdXNlcnNEYXRhO1xudmFyIGZvbGxvd2VyTGlua3NEYXRhO1xudmFyIF9tYXA7XG52YXIgX2FkZGVkQnlVc2VybmFtZTtcbnZhciBXSURUSCA9IHdpbmRvdy5pbm5lcldpZHRoO1xudmFyIEhFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgZm9yY2UgPSBkMy5sYXlvdXQuZm9yY2UoKVxuICAgIC5jaGFyZ2UoLTQwMClcbiAgICAubGlua0Rpc3RhbmNlKDQwMClcbiAgICAubGlua1N0cmVuZ3RoKDAuMSlcbiAgICAuY2hhcmdlRGlzdGFuY2UoNDAwKVxuICAgIC5ncmF2aXR5KDAuNSlcbiAgICAuc2l6ZShbV0lEVEgsIEhFSUdIVF0pXG4gICAgLm9uKCd0aWNrJywgdGljayk7XG5cbiAgY2FudmFzID0gZDMuc2VsZWN0KCdib2R5JylcbiAgICAuaW5zZXJ0KCdjYW52YXMnLCAnOmZpcnN0LWNoaWxkJylcbiAgICAuYXR0cignd2lkdGgnLCB3aW5kb3cuaW5uZXJXaWR0aClcbiAgICAuYXR0cignaGVpZ2h0Jywgd2luZG93LmlubmVySGVpZ2h0KTtcblxuICBjb250ZXh0ID0gY2FudmFzLm5vZGUoKS5nZXRDb250ZXh0KCcyZCcpO1xuXG4gIHZhciBkcmFnZ2luZyA9IG51bGw7XG4gIGNhbnZhcy5ub2RlKCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuICAgIGlmICghZHJhZ2dpbmcpIHJldHVybjtcbiAgICBkcmFnZ2luZy5weCA9IGUueDtcbiAgICBkcmFnZ2luZy5weSA9IGUueTtcbiAgICBkcmFnZ2luZy54ID0gZS54O1xuICAgIGRyYWdnaW5nLnkgPSBlLnk7IFxuICAgIHRpY2soKTtcbiAgfSk7XG5cbiAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgZnVuY3Rpb24oZSkge1xuICAgIGRyYWdnaW5nID0gbnVsbDtcbiAgICBmb3JjZS5yZXN1bWUoKTtcbiAgfSk7XG5cbiAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgZHJhZ2dpbmcgPSBudWxsO1xuICAgIGZvcmNlLnN0b3AoKTtcblxuICAgIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZS54ID4gZC54IC0gTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBlLnggPCBkLnggKyBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGUueSA+IGQueSAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZS55IDwgZC55ICsgTk9ERV9TSVpFKjAuNVxuICAgICAgKSB7XG4gICAgICAgIGRyYWdnaW5nID0gZDtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB1c2Vyc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGUueCA+IGQueCAtIE5PREVfU0laRSowLjUgJiZcbiAgICAgICAgZS54IDwgZC54ICsgTk9ERV9TSVpFKjAuNSAmJlxuICAgICAgICBlLnkgPiBkLnkgLSBOT0RFX1NJWkUqMC41ICYmXG4gICAgICAgIGUueSA8IGQueSArIE5PREVfU0laRSowLjVcbiAgICAgICkge1xuICAgICAgICBhZGRVc2VyQnlVc2VybmFtZShkLmxvZ2luKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgcmVzZXQoKTtcbn1cblxuZnVuY3Rpb24gcmVzZXQoKSB7XG4gIHVzZXJzRGF0YSA9IFtdO1xuICBmb2xsb3dlckxpbmtzRGF0YSA9IFtdO1xuICBfbWFwID0ge307XG4gIF9hZGRlZEJ5VXNlcm5hbWUgPSB7fTtcbiAgcmVhcHBseUZvcmNlKCk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wKG4sIG1pbiwgbWF4KSB7XG4gIHJldHVybiBNYXRoLm1pbihNYXRoLm1heChuLCBtaW4pLCBtYXgpO1xufVxuXG5mdW5jdGlvbiB0aWNrKCkge1xuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMubm9kZSgpLndpZHRoLCBjYW52YXMubm9kZSgpLmhlaWdodCk7XG5cbiAgZm9sbG93ZXJMaW5rc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgdmFyIHNvdXJjZSA9IGQuc291cmNlO1xuICAgIHZhciB0YXJnZXQgPSBkLnRhcmdldDtcbiAgICBpZiAoIXRhcmdldC5pbWFnZSB8fCAhc291cmNlLmltYWdlKSByZXR1cm47XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhzb3VyY2UueCxzb3VyY2UueSk7XG4gICAgY29udGV4dC5saW5lVG8odGFyZ2V0LngsdGFyZ2V0LnkpO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnI2NjYyc7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gIH0pO1xuXG4gIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICBkLnggPSBjbGFtcChkLngsIDAsIHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICBkLnkgPSBjbGFtcChkLnksIDAsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgaWYgKGQuaW1hZ2UpIHtcbiAgICAgIC8vIGNvbnRleHQuc2F2ZSgpO1xuICAgICAgLy8gY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgIC8vIGNvbnRleHQuYXJjKGQueCwgZC55LCBNYXRoLnNxcnQoTWF0aC5wb3coTk9ERV9TSVpFKjAuNSwgMikgKyBNYXRoLnBvdyhOT0RFX1NJWkUqMC41LCAyKSksIDAsIDIgKiBNYXRoLlBJLCB0cnVlKTtcbiAgICAgIC8vIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAvLyBjb250ZXh0LmNsaXAoKTtcbiAgICAgIFxuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoZC5pbWFnZSwgZC54IC0gTk9ERV9TSVpFKjAuNSwgZC55IC0gTk9ERV9TSVpFKjAuNSwgTk9ERV9TSVpFLCBOT0RFX1NJWkUpO1xuXG4gICAgICAvLyBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgLy8gY29udGV4dC5hcmMoZC54LCBkLnksIE1hdGguc3FydChNYXRoLnBvdyhOT0RFX1NJWkUqMC41LCAyKSArIE1hdGgucG93KE5PREVfU0laRSowLjUsIDIpKSwgMCwgMiAqIE1hdGguUEksIHRydWUpO1xuICAgICAgLy8gY29udGV4dC5jbGlwKCk7XG4gICAgICAvLyBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgLy8gY29udGV4dC5yZXN0b3JlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgaW1hZ2Uuc3JjID0gZC5hdmF0YXJfdXJsO1xuICAgICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGQuaW1hZ2UgPSBpbWFnZTtcbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVhcHBseUZvcmNlKCkge1xuICBmb3JjZSA9IGZvcmNlXG4gICAgLm5vZGVzKHVzZXJzRGF0YSlcbiAgICAubGlua3MoZm9sbG93ZXJMaW5rc0RhdGEpXG4gICAgLnN0YXJ0KCk7XG59XG5cbmZ1bmN0aW9uIF9hZGRVc2VyKHVzZXIpIHtcbiAgaWYgKCFfbWFwW3VzZXIuaWRdKSB7XG4gICAgX21hcFt1c2VyLmlkXSA9IHVzZXI7XG4gICAgdXNlcnNEYXRhLnB1c2godXNlcik7XG4gIH1cbiAgcmV0dXJuIF9tYXBbdXNlci5pZF07XG59XG5cbmZ1bmN0aW9uIF9hZGRGb2xsb3dlckxpbmsodGFyZ2V0VXNlciwgc291cmNlVXNlcikge1xuICB0YXJnZXRVc2VyLmxpbmtzQWRkZWQgPSB0cnVlO1xuICB0YXJnZXRVc2VyID0gX2FkZFVzZXIodGFyZ2V0VXNlcik7XG4gIHNvdXJjZVVzZXIgPSBfYWRkVXNlcihzb3VyY2VVc2VyKTtcbiAgaWYgKCFfbWFwW3NvdXJjZVVzZXIuaW5kZXggKyAnLScgKyB0YXJnZXRVc2VyLmluZGV4XSkge1xuICAgIF9tYXBbc291cmNlVXNlci5pZCArICctJyArIHRhcmdldFVzZXIuaWRdID0gdHJ1ZTtcbiAgICBmb2xsb3dlckxpbmtzRGF0YS5wdXNoKHsgc291cmNlOiBzb3VyY2VVc2VyLCB0YXJnZXQ6IHRhcmdldFVzZXIgfSk7XG4gIH1cbiAgcmVhcHBseUZvcmNlKCk7XG59XG5cbmZ1bmN0aW9uIGFkZFVzZXJCeVVzZXJuYW1lKHVzZXJuYW1lKSB7XG4gIGlmIChfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSkgcmV0dXJuO1xuICBfYWRkZWRCeVVzZXJuYW1lW3VzZXJuYW1lXSA9IHRydWU7XG4gIHRvYXN0KCdGZXRjaGluZyBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSkgKyAnLi4uJywgJ3Byb2dyZXNzJyk7XG4gIGQzLmpzb24oJ2FwaS91c2Vycy8nICsgdXNlcm5hbWUgKyAnL2ZvbGxvd2luZycsIGZ1bmN0aW9uKGVycm9yLCByZXN1bHQpIHtcbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgIHJldHVybiB0b2FzdCgnQ291bGQgbm90IGZldGNoIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ2Vycm9yJyk7XG4gICAgfVxuICAgIHRvYXN0KCdGZXRjaGVkIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSwgJ3N1Y2Nlc3MnKTtcbiAgICByZXN1bHQuZm9sbG93aW5nLmZvckVhY2goZnVuY3Rpb24oZm9sbG93ZXIpIHtcbiAgICAgIF9hZGRGb2xsb3dlckxpbmsocmVzdWx0LnVzZXIsIGZvbGxvd2VyKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cblxuXG5cbmluaXQoKTtcbmFkZFVzZXJCeVVzZXJuYW1lKCdGYXJoYWRHJyk7XG4iXX0=
