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
    .charge(0)
    .linkDistance(400)
    // .linkStrength(0.1)
    .chargeDistance(400)
    .gravity(0.5)
    .size([WIDTH, HEIGHT])
    .on('tick', tick);

  canvas = d3.select('body')
    .append('canvas')
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwicHVibGljL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLyogZ2xvYmFsIGQzICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyICR0b2FzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b2FzdCcpO1xudmFyICRyZXNldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdyZXNldCcpO1xudmFyICRmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignbmF2IGZvcm0nKTtcbnZhciAkdXNlcm5hbWUgPSAkZm9ybS5xdWVyeVNlbGVjdG9yKCdpbnB1dCcpO1xuXG5mdW5jdGlvbiB0b2FzdChodG1sLCB0eXBlKSB7XG4gICR0b2FzdC5pbm5lckhUTUwgPSBodG1sO1xuICAkdG9hc3QuY2xhc3NOYW1lID0gdHlwZTtcbiAgJHRvYXN0LnN0eWxlLm9wYWNpdHkgPSAxO1xufVxuXG5mdW5jdGlvbiB1c2VybmFtZVRvTGluayh1c2VybmFtZSkge1xuICByZXR1cm4gKCc8YSB0YXJnZXQ9XCJfYmxhbmtcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tLycgKyB1c2VybmFtZSArICdcIj4nICsgdXNlcm5hbWUgKyAnPC9hPicpO1xufVxuXG4kcmVzZXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgcmVzZXQoKTtcbn0pO1xuXG4kZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBmdW5jdGlvbihldmVudCkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICBhZGRVc2VyQnlVc2VybmFtZSgkdXNlcm5hbWUudmFsdWUpO1xuICAkdXNlcm5hbWUudmFsdWUgPSAnJztcbn0pO1xuXG52YXIgZm9yY2UsIGNhbnZhcywgY29udGV4dDtcbnZhciB1c2Vyc0RhdGE7XG52YXIgZm9sbG93ZXJMaW5rc0RhdGE7XG52YXIgX21hcDtcbnZhciBfYWRkZWRCeVVzZXJuYW1lO1xudmFyIFdJRFRIID0gd2luZG93LmlubmVyV2lkdGg7XG52YXIgSEVJR0hUID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICBmb3JjZSA9IGQzLmxheW91dC5mb3JjZSgpXG4gICAgLmNoYXJnZSgtNDAwKVxuICAgIC5jaGFyZ2UoMClcbiAgICAubGlua0Rpc3RhbmNlKDQwMClcbiAgICAvLyAubGlua1N0cmVuZ3RoKDAuMSlcbiAgICAuY2hhcmdlRGlzdGFuY2UoNDAwKVxuICAgIC5ncmF2aXR5KDAuNSlcbiAgICAuc2l6ZShbV0lEVEgsIEhFSUdIVF0pXG4gICAgLm9uKCd0aWNrJywgdGljayk7XG5cbiAgY2FudmFzID0gZDMuc2VsZWN0KCdib2R5JylcbiAgICAuYXBwZW5kKCdjYW52YXMnKVxuICAgIC5hdHRyKCd3aWR0aCcsIHdpbmRvdy5pbm5lcldpZHRoKVxuICAgIC5hdHRyKCdoZWlnaHQnLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuXG4gIGNvbnRleHQgPSBjYW52YXMubm9kZSgpLmdldENvbnRleHQoJzJkJyk7XG5cbiAgY2FudmFzLm5vZGUoKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICB1c2Vyc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGUueCA+IGQueCAtIDMyKjAuNSAmJlxuICAgICAgICBlLnggPCBkLnggKyAzMiowLjUgJiZcbiAgICAgICAgZS55ID4gZC55IC0gMzIqMC41ICYmXG4gICAgICAgIGUueSA8IGQueSArIDMyKjAuNVxuICAgICAgKSB7XG4gICAgICAgIGFkZFVzZXJCeVVzZXJuYW1lKGQubG9naW4pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuXG4gIHJlc2V0KCk7XG59XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICB1c2Vyc0RhdGEgPSBbXTtcbiAgZm9sbG93ZXJMaW5rc0RhdGEgPSBbXTtcbiAgX21hcCA9IHt9O1xuICBfYWRkZWRCeVVzZXJuYW1lID0ge307XG4gIHJlYXBwbHlGb3JjZSgpO1xufVxuXG5mdW5jdGlvbiB0aWNrKCkge1xuICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMubm9kZSgpLndpZHRoLCBjYW52YXMubm9kZSgpLmhlaWdodCk7XG5cbiAgZm9sbG93ZXJMaW5rc0RhdGEuZm9yRWFjaChmdW5jdGlvbihkKSB7XG4gICAgdmFyIHNvdXJjZSA9IGQuc291cmNlO1xuICAgIHZhciB0YXJnZXQgPSBkLnRhcmdldDtcbiAgICBpZiAoIXRhcmdldC5pbWFnZSB8fCAhc291cmNlLmltYWdlKSByZXR1cm47XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyhzb3VyY2UueCxzb3VyY2UueSk7XG4gICAgY29udGV4dC5saW5lVG8odGFyZ2V0LngsdGFyZ2V0LnkpO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSAnI2NjYyc7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAxO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gIH0pO1xuXG4gIHVzZXJzRGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGQpIHtcbiAgICBpZiAoZC5pbWFnZSkge1xuICAgICAgY29udGV4dC5zYXZlKCk7XG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5hcmMoZC54LCBkLnksIE1hdGguc3FydChNYXRoLnBvdygzMiowLjUsIDIpICsgTWF0aC5wb3coMzIqMC41LCAyKSkgLSA1LCAwLCAyICogTWF0aC5QSSwgdHJ1ZSk7XG4gICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgICAgY29udGV4dC5jbGlwKCk7XG4gICAgICBcbiAgICAgIGNvbnRleHQuZHJhd0ltYWdlKGQuaW1hZ2UsIGQueCAtIDMyKjAuNSwgZC55IC0gMzIqMC41LCAzMiwgMzIpO1xuXG4gICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgY29udGV4dC5hcmMoZC54LCBkLnksIE1hdGguc3FydChNYXRoLnBvdygzMiowLjUsIDIpICsgTWF0aC5wb3coMzIqMC41LCAyKSkgLSA1LCAwLCAyICogTWF0aC5QSSwgdHJ1ZSk7XG4gICAgICBjb250ZXh0LmNsaXAoKTtcbiAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICBjb250ZXh0LnJlc3RvcmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICBpbWFnZS5zcmMgPSBkLmF2YXRhcl91cmw7XG4gICAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgZC5pbWFnZSA9IGltYWdlO1xuICAgICAgfTtcbiAgICB9XG4gIH0pO1xufVxuXG5mdW5jdGlvbiByZWFwcGx5Rm9yY2UoKSB7XG4gIGZvcmNlID0gZm9yY2VcbiAgICAubm9kZXModXNlcnNEYXRhKVxuICAgIC5saW5rcyhmb2xsb3dlckxpbmtzRGF0YSlcbiAgICAuc3RhcnQoKTtcbn1cblxuZnVuY3Rpb24gX2FkZFVzZXIodXNlcikge1xuICBpZiAoIV9tYXBbdXNlci5pZF0pIHtcbiAgICBfbWFwW3VzZXIuaWRdID0gdXNlcjtcbiAgICB1c2Vyc0RhdGEucHVzaCh1c2VyKTtcbiAgfVxuICByZXR1cm4gX21hcFt1c2VyLmlkXTtcbn1cblxuZnVuY3Rpb24gX2FkZEZvbGxvd2VyTGluayh0YXJnZXRVc2VyLCBzb3VyY2VVc2VyKSB7XG4gIHRhcmdldFVzZXIubGlua3NBZGRlZCA9IHRydWU7XG4gIHRhcmdldFVzZXIgPSBfYWRkVXNlcih0YXJnZXRVc2VyKTtcbiAgc291cmNlVXNlciA9IF9hZGRVc2VyKHNvdXJjZVVzZXIpO1xuICBpZiAoIV9tYXBbc291cmNlVXNlci5pbmRleCArICctJyArIHRhcmdldFVzZXIuaW5kZXhdKSB7XG4gICAgX21hcFtzb3VyY2VVc2VyLmlkICsgJy0nICsgdGFyZ2V0VXNlci5pZF0gPSB0cnVlO1xuICAgIGZvbGxvd2VyTGlua3NEYXRhLnB1c2goeyBzb3VyY2U6IHNvdXJjZVVzZXIsIHRhcmdldDogdGFyZ2V0VXNlciB9KTtcbiAgfVxuICByZWFwcGx5Rm9yY2UoKTtcbn1cblxuZnVuY3Rpb24gYWRkVXNlckJ5VXNlcm5hbWUodXNlcm5hbWUpIHtcbiAgaWYgKF9hZGRlZEJ5VXNlcm5hbWVbdXNlcm5hbWVdKSByZXR1cm47XG4gIF9hZGRlZEJ5VXNlcm5hbWVbdXNlcm5hbWVdID0gdHJ1ZTtcbiAgdG9hc3QoJ0ZldGNoaW5nIGZvbGxvd2VycyBmb3IgJyArIHVzZXJuYW1lVG9MaW5rKHVzZXJuYW1lKSArICcuLi4nLCAncHJvZ3Jlc3MnKTtcbiAgZDMuanNvbignYXBpL3VzZXJzLycgKyB1c2VybmFtZSArICcvZm9sbG93aW5nJywgZnVuY3Rpb24oZXJyb3IsIHJlc3VsdCkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgcmV0dXJuIHRvYXN0KCdDb3VsZCBub3QgZmV0Y2ggZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpLCAnZXJyb3InKTtcbiAgICB9XG4gICAgdG9hc3QoJ0ZldGNoZWQgZm9sbG93ZXJzIGZvciAnICsgdXNlcm5hbWVUb0xpbmsodXNlcm5hbWUpLCAnc3VjY2VzcycpO1xuICAgIHJlc3VsdC5mb2xsb3dpbmcuZm9yRWFjaChmdW5jdGlvbihmb2xsb3dlcikge1xuICAgICAgX2FkZEZvbGxvd2VyTGluayhyZXN1bHQudXNlciwgZm9sbG93ZXIpO1xuICAgIH0pO1xuICB9KTtcbn1cblxuXG5cblxuaW5pdCgpO1xuYWRkVXNlckJ5VXNlcm5hbWUoJ0ZhcmhhZEcnKTtcbiJdfQ==
