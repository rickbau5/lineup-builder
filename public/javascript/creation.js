$("#select").val(5);
const api = 'https://api.spotify.com';
const topTracksEndpoint = '/v1/artists/{artist-id}/top-tracks?country=US'
var found = [];
var completed = 0;
var access_token = '';
var playlistTitle = '';
var limitTracks = 5;

$("#create-playlist").click(function() {
    if (verifyTitle() && verifyLimit()) {
        $("#create-playlist").hide();
        $("#progress").show();

        go((uri) => {
            $("#progress").hide();
            $("#finished").show();
            $("#playlist-link a").attr('href', uri);
            $("#playlist-link").show();
        });
    }
});

$(document).on('click', 'button.artist-remove', function() {
    $("#create-playlist").prop("disabled", found.length == 0);
});

function topTracksQuery(id) {
    return api + topTracksEndpoint.replace("{artist-id}", id);
}

function getUsername(callback) {
  $.ajax('https://api.spotify.com/v1/me', {
      dataType: 'json',
      headers: {
          'Authorization': 'Bearer ' + access_token
      },
      success: function(response) {
        console.log('Got username response', response);
        callback(response.id);
      },
      error: function(response) {
        console.log("Failed.", response);
        callback(null);
      }
  });
}

function collectTopTracks(artists, callback) {
    var promises = artists.map(function (artist) {
        return getTopTracks(artist, function(topTracks) {
            return topTracks;
        });
    });
    Promise.all(promises)
        .then(results => {
            const limited = results.map(list => {
                var end = limitTracks;
                if (limitTracks > list.tracks.length)
                    end = list.tracks.length;
                return list.tracks.slice(0, end);
            });
            console.log("Results:", limited);
            callback(limited);
        }, error => { 
            console.log(error);
            callback([]);
            alert("An error occurred. Please try again, the playlist may not be complete.");
        });
}

function getTopTracks(artist, callback) {
    const query = topTracksQuery(artist.id)
    var promise = 
        $.get(query, function (response) {
            return callback(response.tracks);
        })
        .fail(function (response) {
            console.log(response);
            return callback([]);
        });

    return promise;
}

function createPlaylist(title, username, callback) {
    $.ajax('https://api.spotify.com/v1/users/' + username + '/playlists', {
        method: 'POST',
        data: JSON.stringify({
            'name': title,
            'public': false
        }),
        dataType: 'json',
        headers: {
          'Authorization': 'Bearer ' + access_token,
          'Content-Type': 'application/json'
        },
        success: function(r) {
            console.log('create playlist response', r);
            callback(r.id);
        },
        error: function(r) {
            callback(null);
        }
    });
}

function addTracksToPlaylist(username, playlist, allTracks, callback) {
    var chunks = [], size = 100;
    while (allTracks.length > 0) {
        chunks.push(allTracks.splice(0, size));
    }

    const url = 'https://api.spotify.com/v1/users/' + username +
        '/playlists/' + playlist +
        '/tracks';

    const promises = chunks.map(chunk => {
        const uris = chunk.map(track => {
            return track.uri;
        });
        console.log(uris);
        return $.ajax(url, {
            method: 'POST',
            data: JSON.stringify({
              uris: uris
            }),
            dataType: 'text',
            headers: {
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            },
            success: function(r) {
                console.log('Add response:', r);
            },
            error: function(r) {
                console.log('Failed response:', r);
            }
        });
    });
    Promise.all(promises)
        .then(results => {
            callback(results);
        }, error => {
            console.log(error);
            callback([]);
            alert("An error occurred. Please try again, the playlist may not be complete.");
        });
}

function verifyTitle() {
    const input = $("#title")
    if (input.val() === '') {
        $("#title-help").removeClass("hidden");       
        return false;
    } else {
        $("#title-help").addClass("hidden");       
        playlistTitle = input.val();
        return true;
    }
}

function verifyLimit() {
    const input = $("#select");
    if (input.val() > 0 && input.val() <= 10) {
        limitTracks = input.val();
        return true;
    } else {
        input.val(5);
        return false;
    }
}

function populateArtistTable() {
    found = JSON.parse(localStorage.getItem('artists-found'));
    if (typeof found === "undefined" ||found.length == 0) {
        alert("No artists found. Please start over.");
    } else {
        found .forEach(artist => {
            const row = addArtistToTable(artist.name);
            row.find(".artist-remove").prop("disabled", false);
        });
    }
}

function go(callback) {
    var path = window.location.href
    var parts = path.substring(path.lastIndexOf("#") + 1).split("&");
    var params = {};
    parts.forEach(function (pair) {
      var kv = pair.split("=");
      params[kv[0]] = kv[1];
    });


    if (found.length == 0) {
        alert("No artists found? Please start over.");
        return;
    }

    if (typeof(params['access_token']) === 'undefined') {
        alert("Token not found? Please start over.");
        return;
    }

    access_token = params['access_token'];

    getUsername(function(username) {
      collectTopTracks(found, function(allTracks) {
          const sum = allTracks.map(tracks => { return tracks.length })
              .reduce((a, b) => { return a + b; }, 0);
          if (sum == 0) {
              alert("No songs found.");
          } else {
              createPlaylist(playlistTitle, username, function(playlistID) {
                  if (playlistID == null) {
                      alert("Couldn't create the playlist. Please start over.");
                  } else {
                      const tracks = allTracks.reduce((a, b) => {return a.concat(b);}, []);
                      addTracksToPlaylist(username, playlistID, tracks, function(addRes) {
                          callback("spotify:user:" + username + ":playlist:" + playlistID);
                      });
                  }
              });
          }
      });
    })
}
