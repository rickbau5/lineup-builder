const api = 'https://api.spotify.com';
const searchEndpoint = '/v1/search?q={artist-name}&type=artist';

const createBtn = $("#create-playlist");
createBtn.prop("disabled", true);

const loading = '<i class="glyphicon glyphicon-refresh spinning"></i>';

var found = [];

$("#create-playlist").click(function() {
    const request = "https://accounts.spotify.com/authorize" +
      "?client_id=" + clientID +
      "&response_type=token" +
      "&redirect_uri=" + encodeURIComponent(redirectURI) +
      "&scope=playlist-read-private%20playlist-modify-public%20playlist-modify-private";
      //"&show_dialog=false";

    localStorage.setItem("artists-found", JSON.stringify(found));
    location.href = request;
    //window.open(request, 'asdf', 'WIDTH=400,HEIGHT=500');
});

$(document).on('click', 'button.artist-remove', function() {
    createBtn.prop("disabled", found.length == 0);
});


function artistQuery(artistName) {
    return api + 
      searchEndpoint.replace('{artist-name}', encodeURIComponent(artistName));
}

$("#add-artists").click(function () {
    const artists = $("#artists").val()
      .split(/[,\n]/)
      .map(str => { return str.trim().toLowerCase(); })
      .filter(entry => { return entry !== '' });

    artists.forEach(function (artist) {
      const row = addArtistToTable(artist, "glyphicon glyphicon-refresh spinning");
      const tdName = row.find(".artist-name"); 
      const tdFound = row.find(".artist-found");
      const tdRemove = row.find(".artist-remove");

      $.get(artistQuery(artist), function(response) {
          if (response.artists && response.artists.items.length > 0) {
              const exact = response.artists.items.filter(item=> {
                    return item.name.toLowerCase() === artist.toLowerCase()
              });
              var theArtist;
              if (exact.length > 0) {
                  theArtist = exact[0];
              } else {
                  theArtist = response.artists.items[0];
              }
              const matches = found.filter(function (obj) { return obj.name === theArtist.name; });
              if (matches.length > 0) {
                console.log("Already have " + artist);
                row.remove();

                return;
              }

              tdFound.find("i").prop("class", "glyphicon glyphicon-ok");
              tdName.html(theArtist.name);

              found.push(theArtist);
              createBtn.prop("disabled", found.length == 0);
          } else {
              tdFound.find("i").prop("class", "glyphicon glyphicon-remove");
              console.log("Not found: " + artist);
          }
          tdRemove.prop("disabled", false);
      })
      .fail(function(response) {
          console.log("Failed");
          console.log(response);
          tdFound.find("i").prop("class", "glyphicon glyphicon-remove");
          tdRemove.prop("disabled", false);
      })
    })
});
