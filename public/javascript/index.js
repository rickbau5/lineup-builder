const api = 'https://api.spotify.com';
const searchEndpoint = '/v1/search?q={artist-name}&type=artist';

const createBtn = $("#create-playlist");
createBtn.prop("disabled", true);

const loading = '<i class="glyphicon glyphicon-refresh spinning"></i>';

var found = [];

$("#create-playlist").click(function() {
    console.log("Creating playlist...");

    const request = "https://accounts.spotify.com/authorize" +
      "?client_id=" + clientID +
      "&response_type=token" +
      "&redirect_uri=" + encodeURIComponent(redirectURI) +
      "&scope=playlist-read-private%20playlist-modify-public%20playlist-modify-private";
      //"&show_dialog=false";

    localStorage.setItem("artists-found", JSON.stringify(found));
    window.open(request, 'asdf', 'WIDTH=400,HEIGHT=500');
});

$(document).on('click', 'button.artist-remove', function() {
    // before deleting, remove it from the list of found artists
    const name = $(this).closest('tr').children('td.artist-name').text();
    found = found.filter(function (artist) { return name !== artist.name; });

    $(this).closest('tr').remove();

    createBtn.prop("disabled", found.length == 0);
});

function artistQuery(artistName) {
    return api + 
      searchEndpoint.replace('{artist-name}', encodeURIComponent(artistName));
}

$("#add-artists").click(function () {
    const artists = $("#artists").val()
      .split(/[,\n]/)
      .map(function (str) { return str.trim().toLowerCase(); });

    artists.forEach(function (artist) {
      const rowHtml = '<tr><td class="artist-name">' + artist + '</td>' + 
        '<td class="artist-found">' + loading + '</td>' +
        '<td><button class="btn btn-xs btn-danger artist-remove" disabled=true><span class="glyphicon glyphicon-trash"></span></button></td></tr>';
      $("#fill").append(rowHtml);

      const row = $("#fill").children().slice(-1);
      const tdName = row.find(".artist-name"); 
      const tdFound = row.find(".artist-found");
      const tdRemove = row.find(".artist-remove");

      $.get(artistQuery(artist), function(response) {
          if (response.artists && response.artists.items.length > 0) {
              const artistName = response.artists.items[0].name;
              const matches = found.filter(function (obj) { return obj.name === artistName; });
              if (matches.length > 0) {
                console.log("Already have " + artist);
                row.remove();

                return;
              }

              tdFound.find("i").prop("class", "glyphicon glyphicon-ok");
              tdName.html(artistName);

              found.push(response.artists.items[0]);
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
