'use strict';


/* jshint undef: true, unused: true */
/* global d3 */

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

var force, svg, edge, node;
var usersData;
var followerLinksData;
var _map;
var zoom;
var _addedByUsername;
var _addFollowerLinkQueue;
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

  zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on('zoom', onZoom);

  svg = d3.select('body').insert('svg', ':first-child')
    .attr('width', WIDTH)
    .attr('height', HEIGHT)
    .call(zoom);


  // build the arrow.
  svg.append('svg:defs').selectAll('marker')
      .data(['end'])      // Different link/path types can be defined here
    .enter().append('svg:marker')    // This section adds in the arrows
      .attr('id', String)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 32+3)
      .attr('refY', -0.5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

  edge = svg.selectAll('.edge');
  node = svg.selectAll('.node');

  reset();
}

function reset() {
  usersData = [];
  followerLinksData = [];
  _map = {};
  _addedByUsername = {};
  _addFollowerLinkQueue = [];
  render();
}

function tick() {
  var nextFollowerLink = _addFollowerLinkQueue.pop();
  if (nextFollowerLink) _addFollowerLink.apply(null, nextFollowerLink);
  node
    .attr('opacity', function(d) {
      return d.linksAdded ? 1 : 0.4;
    })
    .attr('transform', function(d) {
      d.x = Math.max(32*0.5, Math.min(WIDTH - 32*0.5, d.x));
      d.y = Math.max(32*0.5, Math.min(HEIGHT - 32*0.5, d.y));;
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  edge
    .attr('x2', function(d) { return d.source.x; })
    .attr('y2', function(d) { return d.source.y; })
    .attr('x1', function(d) { return d.target.x; })
    .attr('y1', function(d) { return d.target.y; });
}

function render() {
  force = force
    .nodes(usersData)
    .links(followerLinksData)
    .start();

  edge = edge.data(followerLinksData);

  edge
    .enter().insert('line', ':first-child')
      // .attr("marker-end", "url(#end)")
      .attr('class', 'edge');
  edge
    .exit().remove();

  node = node.data(usersData);

  node
    .enter().append('image')
      .attr('xlink:href', function(d) { return d.avatar_url; })
      .attr('class', 'node')
      .attr('width', 32)
      .attr('height', 32)
      .attr('x', -32*0.5)
      .attr('y', -32*0.5)
      .on('click', _onNodeClick);
  node
    .exit().remove();

  node.call(force.drag);
}

function onZoom() {
  svg.style('transform', 'scale(' + d3.event.scale + ')');
}

function _onNodeClick(d) {
  addUserByUsername(d.login);
}

function _addUser(user) {
  if (!_map[user.id]) {
    _map[user.id] = user;
    usersData.push(user);
  }
  return _map[user.id];
}

setInterval(function() {
  console.log(_addFollowerLinkQueue.length)
}, 100)

function _addFollowerLink(targetUser, sourceUser) {
  targetUser.linksAdded = true;
  targetUser = _addUser(targetUser);
  sourceUser = _addUser(sourceUser);
  if (!_map[sourceUser.index + '-' + targetUser.index]) {
    _map[sourceUser.id + '-' + targetUser.id] = true;
    followerLinksData.push({ source: sourceUser, target: targetUser });
  }
  render();
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
      // Preload image
      var image = new Image();
      image.src = follower.avatar_url;
      image.onload = _addFollowerLink.bind(null, result.user, follower);
    });
    render();
  });
}


init();
addUserByUsername('FarhadG');
