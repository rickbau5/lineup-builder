const async = require('async');
const express = require('express');
const path = require('path');
const request = require('request');

const app = express();

const clientID = '5ba30de86695458089cdc5d89fe0fe9b';
const redirectURI = 'http://localhost:3000/callback';

app.use(express.static(__dirname + '/public'));
 
app.set('vews', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
    return res.render('index', {
        clientID: clientID,
        redirectURI: redirectURI
    });
});

app.get('/callback', function(req, res) {
    return res.render('creation');
});

app.listen(3000, function () {
    console.log('Listening on port 3000!');
});
