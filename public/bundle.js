(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/alexandergugel/repos/github-insights/public/index.js":[function(require,module,exports){
/* jshint undef: true, unused: true */
/* global d3 */

'use strict';

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

  canvas.node().addEventListener('click', function(e) {
    usersData.forEach(function(d) {
      if (
        e.x > d.x - 32*0.5 &&
        e.x < d.x + 32*0.5 &&
        e.y > d.y - 32*0.5 &&
        e.y < d.y + 32*0.5
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
      context.save();
      context.beginPath();
      context.arc(d.x, d.y, Math.sqrt(Math.pow(32*0.5, 2) + Math.pow(32*0.5, 2)) - 5, 0, 2 * Math.PI, true);
      context.closePath();
      context.clip();
      
      context.drawImage(d.image, d.x - 32*0.5, d.y - 32*0.5, 32, 32);

      context.beginPath();
      context.arc(d.x, d.y, Math.sqrt(Math.pow(32*0.5, 2) + Math.pow(32*0.5, 2)) - 5, 0, 2 * Math.PI, true);
      context.clip();
      context.closePath();
      context.restore();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKiBnbG9iYWwgZDMgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgJHRvYXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RvYXN0Jyk7XG52YXIgJHJlc2V0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Jlc2V0Jyk7XG52YXIgJGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCduYXYgZm9ybScpO1xudmFyICR1c2VybmFtZSA9ICRmb3JtLnF1ZXJ5U2VsZWN0b3IoJ2lucHV0Jyk7XG5cbmZ1bmN0aW9uIHRvYXN0KGh0bWwsIHR5cGUpIHtcbiAgJHRvYXN0LmlubmVySFRNTCA9IGh0bWw7XG4gICR0b2FzdC5jbGFzc05hbWUgPSB0eXBlO1xuICAkdG9hc3Quc3R5bGUub3BhY2l0eSA9IDE7XG59XG5cbmZ1bmN0aW9uIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSB7XG4gIHJldHVybiAoJzxhIHRhcmdldD1cIl9ibGFua1wiIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vJyArIHVzZXJuYW1lICsgJ1wiPicgKyB1c2VybmFtZSArICc8L2E+Jyk7XG59XG5cbiRyZXNldC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICByZXNldCgpO1xufSk7XG5cbiRmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIGFkZFVzZXJCeVVzZXJuYW1lKCR1c2VybmFtZS52YWx1ZSk7XG4gICR1c2VybmFtZS52YWx1ZSA9ICcnO1xufSk7XG5cbnZhciBmb3JjZSwgY2FudmFzLCBjb250ZXh0O1xudmFyIHVzZXJzRGF0YTtcbnZhciBmb2xsb3dlckxpbmtzRGF0YTtcbnZhciBfbWFwO1xudmFyIF9hZGRlZEJ5VXNlcm5hbWU7XG52YXIgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbnZhciBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGZvcmNlID0gZDMubGF5b3V0LmZvcmNlKClcbiAgICAuY2hhcmdlKC00MDApXG4gICAgLmxpbmtEaXN0YW5jZSg0MDApXG4gICAgLmxpbmtTdHJlbmd0aCgwLjEpXG4gICAgLmNoYXJnZURpc3RhbmNlKDQwMClcbiAgICAuZ3Jhdml0eSgwLjUpXG4gICAgLnNpemUoW1dJRFRILCBIRUlHSFRdKVxuICAgIC5vbigndGljaycsIHRpY2spO1xuXG4gIGNhbnZhcyA9IGQzLnNlbGVjdCgnYm9keScpXG4gICAgLmluc2VydCgnY2FudmFzJywgJzpmaXJzdC1jaGlsZCcpXG4gICAgLmF0dHIoJ3dpZHRoJywgd2luZG93LmlubmVyV2lkdGgpXG4gICAgLmF0dHIoJ2hlaWdodCcsIHdpbmRvdy5pbm5lckhlaWdodCk7XG5cbiAgY29udGV4dCA9IGNhbnZhcy5ub2RlKCkuZ2V0Q29udGV4dCgnMmQnKTtcblxuICBjYW52YXMubm9kZSgpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICAgIGlmIChcbiAgICAgICAgZS54ID4gZC54IC0gMzIqMC41ICYmXG4gICAgICAgIGUueCA8IGQueCArIDMyKjAuNSAmJlxuICAgICAgICBlLnkgPiBkLnkgLSAzMiowLjUgJiZcbiAgICAgICAgZS55IDwgZC55ICsgMzIqMC41XG4gICAgICApIHtcbiAgICAgICAgYWRkVXNlckJ5VXNlcm5hbWUoZC5sb2dpbik7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xuXG4gIHJlc2V0KCk7XG59XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICB1c2Vyc0RhdGEgPSBbXTtcbiAgZm9sbG93ZXJMaW5rc0RhdGEgPSBbXTtcbiAgX21hcCA9IHt9O1xuICBfYWRkZWRCeVVzZXJuYW1lID0ge307XG4gIHJlYXBwbHlGb3JjZSgpO1xufVxuXG5mdW5jdGlvbiBjbGFtcChuLCBtaW4sIG1heCkge1xuICByZXR1cm4gTWF0aC5taW4oTWF0aC5tYXgobiwgbWluKSwgbWF4KTtcbn1cblxuZnVuY3Rpb24gdGljaygpIHtcbiAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLm5vZGUoKS53aWR0aCwgY2FudmFzLm5vZGUoKS5oZWlnaHQpO1xuXG4gIGZvbGxvd2VyTGlua3NEYXRhLmZvckVhY2goZnVuY3Rpb24oZCkge1xuICAgIHZhciBzb3VyY2UgPSBkLnNvdXJjZTtcbiAgICB2YXIgdGFyZ2V0ID0gZC50YXJnZXQ7XG4gICAgaWYgKCF0YXJnZXQuaW1hZ2UgfHwgIXNvdXJjZS5pbWFnZSkgcmV0dXJuO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8oc291cmNlLngsc291cmNlLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRhcmdldC54LHRhcmdldC55KTtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gJyNjY2MnO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xuICB9KTtcblxuICB1c2Vyc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgZC54ID0gY2xhbXAoZC54LCAwLCB3aW5kb3cuaW5uZXJXaWR0aCk7XG4gICAgZC55ID0gY2xhbXAoZC55LCAwLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIGlmIChkLmltYWdlKSB7XG4gICAgICBjb250ZXh0LnNhdmUoKTtcbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBjb250ZXh0LmFyYyhkLngsIGQueSwgTWF0aC5zcXJ0KE1hdGgucG93KDMyKjAuNSwgMikgKyBNYXRoLnBvdygzMiowLjUsIDIpKSAtIDUsIDAsIDIgKiBNYXRoLlBJLCB0cnVlKTtcbiAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICBjb250ZXh0LmNsaXAoKTtcbiAgICAgIFxuICAgICAgY29udGV4dC5kcmF3SW1hZ2UoZC5pbWFnZSwgZC54IC0gMzIqMC41LCBkLnkgLSAzMiowLjUsIDMyLCAzMik7XG5cbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBjb250ZXh0LmFyYyhkLngsIGQueSwgTWF0aC5zcXJ0KE1hdGgucG93KDMyKjAuNSwgMikgKyBNYXRoLnBvdygzMiowLjUsIDIpKSAtIDUsIDAsIDIgKiBNYXRoLlBJLCB0cnVlKTtcbiAgICAgIGNvbnRleHQuY2xpcCgpO1xuICAgICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICAgIGNvbnRleHQucmVzdG9yZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICAgIGltYWdlLnNyYyA9IGQuYXZhdGFyX3VybDtcbiAgICAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBkLmltYWdlID0gaW1hZ2U7XG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlYXBwbHlGb3JjZSgpIHtcbiAgZm9yY2UgPSBmb3JjZVxuICAgIC5ub2Rlcyh1c2Vyc0RhdGEpXG4gICAgLmxpbmtzKGZvbGxvd2VyTGlua3NEYXRhKVxuICAgIC5zdGFydCgpO1xufVxuXG5mdW5jdGlvbiBfYWRkVXNlcih1c2VyKSB7XG4gIGlmICghX21hcFt1c2VyLmlkXSkge1xuICAgIF9tYXBbdXNlci5pZF0gPSB1c2VyO1xuICAgIHVzZXJzRGF0YS5wdXNoKHVzZXIpO1xuICB9XG4gIHJldHVybiBfbWFwW3VzZXIuaWRdO1xufVxuXG5mdW5jdGlvbiBfYWRkRm9sbG93ZXJMaW5rKHRhcmdldFVzZXIsIHNvdXJjZVVzZXIpIHtcbiAgdGFyZ2V0VXNlci5saW5rc0FkZGVkID0gdHJ1ZTtcbiAgdGFyZ2V0VXNlciA9IF9hZGRVc2VyKHRhcmdldFVzZXIpO1xuICBzb3VyY2VVc2VyID0gX2FkZFVzZXIoc291cmNlVXNlcik7XG4gIGlmICghX21hcFtzb3VyY2VVc2VyLmluZGV4ICsgJy0nICsgdGFyZ2V0VXNlci5pbmRleF0pIHtcbiAgICBfbWFwW3NvdXJjZVVzZXIuaWQgKyAnLScgKyB0YXJnZXRVc2VyLmlkXSA9IHRydWU7XG4gICAgZm9sbG93ZXJMaW5rc0RhdGEucHVzaCh7IHNvdXJjZTogc291cmNlVXNlciwgdGFyZ2V0OiB0YXJnZXRVc2VyIH0pO1xuICB9XG4gIHJlYXBwbHlGb3JjZSgpO1xufVxuXG5mdW5jdGlvbiBhZGRVc2VyQnlVc2VybmFtZSh1c2VybmFtZSkge1xuICBpZiAoX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0pIHJldHVybjtcbiAgX2FkZGVkQnlVc2VybmFtZVt1c2VybmFtZV0gPSB0cnVlO1xuICB0b2FzdCgnRmV0Y2hpbmcgZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpICsgJy4uLicsICdwcm9ncmVzcycpO1xuICBkMy5qc29uKCdhcGkvdXNlcnMvJyArIHVzZXJuYW1lICsgJy9mb2xsb3dpbmcnLCBmdW5jdGlvbihlcnJvciwgcmVzdWx0KSB7XG4gICAgaWYgKGVycm9yKSB7XG4gICAgICByZXR1cm4gdG9hc3QoJ0NvdWxkIG5vdCBmZXRjaCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdlcnJvcicpO1xuICAgIH1cbiAgICB0b2FzdCgnRmV0Y2hlZCBmb2xsb3dlcnMgZm9yICcgKyB1c2VybmFtZVRvTGluayh1c2VybmFtZSksICdzdWNjZXNzJyk7XG4gICAgcmVzdWx0LmZvbGxvd2luZy5mb3JFYWNoKGZ1bmN0aW9uKGZvbGxvd2VyKSB7XG4gICAgICBfYWRkRm9sbG93ZXJMaW5rKHJlc3VsdC51c2VyLCBmb2xsb3dlcik7XG4gICAgfSk7XG4gIH0pO1xufVxuXG5cblxuXG5pbml0KCk7XG5hZGRVc2VyQnlVc2VybmFtZSgnRmFyaGFkRycpO1xuIl19
