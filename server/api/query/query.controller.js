/**
* Using standard naming convention for endpoints.
* GET     /things              ->  index
* POST    /things              ->  create
* GET     /things/:id          ->  show
* PUT     /things/:id          ->  update
* DELETE  /things/:id          ->  destroy
*/

'use strict';

var models = require('../../models');

var setUserName = function (req) {
    if (req.params.username === 'reqHeader') {
        req.params.username = req.headers.user;
    }
}

var deserialize = function (query) {
    query.digState = JSON.parse(query.digState);
    query.elasticUIState = JSON.parse(query.elasticUIState);
    return query;
}

var serialize = function (query) {
    query.digState = JSON.stringify(query.digState);
    query.elasticUIState = JSON.stringify(query.elasticUIState);
    return query;
}

exports.index = function (req, res) {
    setUserName(req);

    models.Query.findAll(
        {where: {UserUsername: req.params.username}}
    ).then(function(queries) {
        var desQueries = [];
        queries.forEach(function(query) {
            desQueries.push(deserialize(query));
        });
        res.status(200).json(desQueries);
    }).catch(function(error) {
        res.status(400).json(error);
    });
}

exports.notifications = function (req, res) {
    setUserName(req);

    models.Query.findAll(
        {where: {UserUsername: req.params.username, notificationHasRun: 0}}
    ).then(function(queries) {
        var desQueries = [];
        queries.forEach(function(query) {
            desQueries.push(deserialize(query));
        });
        res.status(200).json(desQueries);
    }).catch(function(error) {
        res.status(400).json(error);
    });
}

exports.show = function (req, res) {
    models.Query.find({
        where: {id: req.params.queryid}
    }).then(function(query){
        res.status(200).json(deserialize(query));
    }).catch(function(error) {
        res.status(404).json(error);
    });
}

exports.create = function (req, res) {
    if (req.params.username === 'reqHeader') {
        req.params.username = req.headers.user;
    }

    models.User.find({
        where: {username: req.params.username}
    }).then(function(user) {
        models.Query.create(serialize(req.body))
        .then(function(query) {
            query.setUser(user).then(function() {
                res.status(201).json(query);
            });
        }).catch(function (error) {
            res.status(404).json(error);
        });
    }).catch(function (error) {
        res.status(404).json(error);
    });
}

exports.update = function (req, res) {
    models.Query.update(
        serialize(req.body),
        {where: {id: req.params.queryid}}
    ).then(function(user) {
        res.status(204).end();
    }).catch(function(error) {
        console.log(error);
        res.status(404).json(error);
    });
}

exports.delete = function (req, res) {
    models.Query.destroy({
        where: {id: req.params.queryid}
    })
    .then(function(user) {
        if (user) {
            res.status(204).end();
        }
        else {
            res.status(404).end();
        }
    })
    .catch(function(error) {
        res.json(404, error);
    });
}