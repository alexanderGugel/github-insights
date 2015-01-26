GitHub Insights
===============

[Demo](http://github-insights.herokuapp.com)

What is this?
-------------

An interactive graph of all the people you (or anyone else) is following.

![Demo](https://raw.githubusercontent.com/alexanderGugel/github-insights/master/demo.gif)

How does this work?
-------------------

* D3
* custom Canvas renderer
* GitHub API
* Express + LevelDB for caching
* Magic

To run it locally, create a new personal access token for GitHub (you can grab
one [here](https://github.com/settings/tokens/new)) and set it as an
environment variable (`export PERSONAL_ACCESS_TOKEN=123`). Then you can simply
`git clone` this repo, `npm install` the dependencies and `npm start` the app.
