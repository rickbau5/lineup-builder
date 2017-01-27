const async = require('async');
const bodyParser = require('body-parser')
const express = require('express');
const path = require('path');
const request = require('request');

const app = express();

const clientID = '6f6011b81eaa4ccd934c2f64fbbaa9d9';
const redirectURI = 'http://localhost:3000/callback';

const api = 'https://api.spotify.com';
const artistSearchEndpoint = '/v1/search?q={artist-name}&type=artist';
const topTracksEndpoint = '/v1/artists/{artist-id}/top-tracks?country=US';

const topTracksLimit = 3;

function topTracksQuery(artistID) {
    return api + topTracksEndpoint.replace('{artist-id}', artistID);
}

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 

app.use(express.static(__dirname + '/public'));
 
app.set('vews', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

function redirectGET(path, target = '/') {
    app.get(path, function(req, res) { res.redirect(target); } );
}

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
