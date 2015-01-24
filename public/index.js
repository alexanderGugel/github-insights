'use strict';

var $toast = document.getElementById('toast');

function toast(html, type) {
  $toast.innerHTML = html;
  $toast.className = type;
  $toast.style.opacity = 1;
}

function usernameToLink(username) {
  return ('<a target="_blank" href="https://github.com/' + username + '">' + username + '</a>');
}

var force, svg, edge, node;
var usersData = [];
var followerLinksData = [];
var _map = {};
var zoom;

function init() {
  force = d3.layout.force()
    .charge(-500)
    .linkDistance(50)
    .gravity(0.5)
    .size([window.innerWidth, window.innerHeight]);


  zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on('zoom', onZoom);

  svg = d3.select('body').insert('svg', ':first-child')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight)
    .call(zoom);

  edge = svg.selectAll('.edge');
  node = svg.selectAll('.node');

  force.on('tick', tick);
}

function tick() {
  edge
    .attr('x1', function(d) { return d.source.x; })
    .attr('y1', function(d) { return d.source.y; })
    .attr('x2', function(d) { return d.target.x; })
    .attr('y2', function(d) { return d.target.y; });

  node
    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });
}

function render() {
  force = force
    .nodes(usersData)
    .links(followerLinksData)
    .start();

  edge = edge.data(followerLinksData);

  edge
    .enter().insert('line', ':first-child')
    .attr('class', 'edge');

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

  node.call(force.drag);
  node.append('title')
    .text(function(d) { return d.login; });
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

function _addFollowerLink(targetUser, sourceUser) {
  targetUser = _addUser(targetUser);
  sourceUser = _addUser(sourceUser);
  if (!_map[sourceUser.index + '-' + targetUser.index]) {
    _map[sourceUser.id + '-' + targetUser.id] = true;
    followerLinksData.push({ source: sourceUser, target: targetUser });
  }
}

function addUserByUsername(username) {
  toast('Fetching followers for ' + usernameToLink(username) + '...', 'progress');
  d3.json('api/users/' + username + '/followers', function(error, result) {
    if (error) {
      return toast('Could not fetch followers for ' + usernameToLink(username), 'error');
    }
    toast('Fetched followers for ' + usernameToLink(username), 'success');
    result.followers.forEach(function(follower) {
      _addFollowerLink(result.user, follower);
    });
    render();
  });
}


init();
addUserByUsername('FarhadG');
