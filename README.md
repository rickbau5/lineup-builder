# Lineup Builder
WIP app for making playlists of the top songs of a list of artists. The original idea comes from needing to create playlists for each festival I keep track of - this makes it much simpler.

Check out the live version [here](http://labs.rickboss.com/lineupbuilder).

## Running Locally
This uses NodeJS for a backend, probably overkill but that's ok. Also Pug is fun. 

1. Ensure `npm` is installed.
2. Clone this repo: `git clone git@github.com:rickbau5/lineup-builder.git`
3. `cd` into `lineup-builder`
4. Run `npm install`
5. Now run the app with `node app`

## The Gist
- All of the logic is done client-side. Why make my server do all the work when there's so many browsers willing to do it?!
- Searching for artists is done using the Spotify API. If a close match is found, it'll take that. 
  
  Note: If you want the band "Islands" but misspell it "Islnds", it will probably return "Future Islands" as that is the closest match _with the highest popularity_. 
- Sometimes it acts wiggity creating the playlist when there are a lot of songs to process, i.e. 400+. From what I can tell, it's the Spotify API being a bit finicky. 
- The user _must_ authenticate to create the playlist. Nothing is stored on the server, and only a temporary token is granted. 

## Contributing
Feel free to submit an issue if any is found.
