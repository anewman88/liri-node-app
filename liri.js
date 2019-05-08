var DebugON = true;

//*******************************************************************************/
//  Require all of the needed library packages
require("dotenv").config();  // read and set any environment variables with the dotenv package
var keys = require("./keys.js"); // import the spotify keys.js file and store it in a variable.
var Spotify = require('node-spotify-api');
var axios = require("axios");
var moment = require("moment");
var inquirer = require("inquirer");

var spotify = new Spotify(keys.spotify);

var exitFlag = false;

var NumInputParams = process.argv.length;

if (DebugON) {
    for (var i=0; i<NumInputParams;i++)
        console.log ("*** " + process.argv[i]);
} // if DebugON    


// Check the input parameters
if (NumInputParams>=2) {  //  check for valid input action
    var Action = process.argv[2];
    var SearchStr = process.argv.slice(3).join(" ");

    if (DebugON) console.log ("** Action: " + Action + "\n** SearchStr: " + SearchStr);
    switch (Action) {
        case "concert-this" :
            ConcertThis(SearchStr)
            break;

        case "spotify-this-song" :
            SpotifyThis(SearchStr)
            break;

        case "movie-this" :
            MovieThis(SearchStr)
            break;
        
        case "do-what-it-says" :
            DoThis(SearchStr)
            break;

        default :
            console.log ("Unrecognized action " + Action);
            break;

    }  // switch (Action)

}    // if (NumParams >=3)
else {  // input parameters not specified. prompt the user for input

    // prompt until the user says to quit

    while (!exitFlag) {

        // Created a series of prompts
        inquirer.prompt([

            { // prompt user to select an action from the list
            type: "list",
            name: "SelectAction",
            message: "Select what you would like to do:",
            choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-this-says", "quit"]
            },

            {    // prompt the user to unput the appropriate search string
            type: "input",
            name: "InputSearchStr",
            message: "Input corresponding band, artist, song, movie or filename"
            },
        
        ]).then(function(user) {

            switch (user.SelectAction) {
                case "concert-this" :
                    ConcertThis(user.InputSearchStr)
                    break;

                case "spotify-this-song" :
                    SpotifyThis(user.InputSearchStr)
                    break;

                case "movie-this" :
                    MovieThis(user.InputSearchStr)
                    break;
                
                case "do-what-it-says" :
                    DoThis(user.InputSearchStr)
                    break;

                case "quit" :
                    exitFlag = true;
                    break;

                default :
                    console.log ("Unrecognized action " + Action);
                    break;
            }  // switch
        });  //  .then(function(user)
    }  // while (!exitFlag)
  
}  // else

//***********************************************************************************/
//  function ConcertThis(Band) 
//  The purpose of this function is to use the BandsInTown API to search for the
//  input band name
//***********************************************************************************/
function ConcertThis(Band) {
    if (DebugON) console.log ("** In ConcertThis() " + Band);
    if (!Band) {
        console.log ("***ERROR*** No band specified");
        return;
	}  // if (!Band)

    if (DebugON)  console.log ("** in ConcertThis() " + Band);

    axios.get("https://rest.bandsintown.com/artists/"+Band+"/events?app_id=codingbootcamp").then(
    function (response) {

        var NumConcerts = response.data.length;

        // limit the listings to the 5 upcoming dates
        if (NumConcerts > 5)
            NumConcerts = 5;

        for (var i = 0; i < NumConcerts; i++) {
            // create concert results string
            var ConcertResults = "--------------------------------------------------------------------" +
                "\nVenue Name: " + response.data[i].venue.name +
                "\nVenue Location: " + response.data[i].venue.city +
                "\nDate of the Event: " + moment(response.data[i].datetime).format("MM/DD/YYYY") +
                "\n--------------------------------------------------------------------";
            console.log(ConcertResults);

        }  // for

    })  // function(response)
    .catch(function (error) { // error handler
        console.log(error);
    });  // get.axios()

}  // ConcertThis()

//***********************************************************************************/
//  function SpotifyThis(Song) 
//  The purpose of this function is to use the Spotify API to search for the
//  input song name
//***********************************************************************************/
function SpotifyThis(Song) {
    if (DebugON)  console.log ("** in SpotifyThis() " + Song);

	if (!Song) {
		Song = "The Sign:Ace of Base";
	}

	spotify.search({
		type: 'artist,track',
		query: Song

	}, function (err, response) {
		if (err) {
			return console.log("Spotify Query Error occurred: " + err);
		}

		var SongResults = "----------------------------------------------------------------" +
			"\nArtist(s): " + response.tracks.items[0].artists[0].name +
			"\nSong Name: " + response.tracks.items[0].name +
			"\nAlbum Name: " + response.tracks.items[0].album.name +
			"\nPreview Link: " + response.tracks.items[0].external_urls.spotify +
			"\n--------------------------------------------------------------------";
		console.log(SongResults);

	});  // spotify.search()

}  // SpotifyThis()

//***********************************************************************************/
//  function MovieThis(Movie) 
//  The purpose of this function is to use the OMDB API to search for the
//  input movie name
//***********************************************************************************/
function MovieThis(Movie) {

    if (!Movie) {
		Movie = "Mr. Nobody";
	}  // if (!Movie)
 
    if (DebugON)  console.log ("** in MovieThis() " + Movie);

    //  Use axios call to query omdb
    axios.get("http://www.omdbapi.com/?t="+Movie+"&y=&plot=short&apikey=trilogy").then(
    function (response) {
        // Create Movie Results string 
        var MovieResults = "--------------------------------------------------------------------" +
            "\nTitle " + response.data.Title +
            "\nYear: " + response.data.Year +
            "\nIMDB Rating: " + response.data.Ratings[0].Value +
            "\nRotten Tomatoes Rating: " + response.data.Ratings[1].Value +
            "\nCountry: " + response.data.Country +
            "\nLanguage: " + response.data.Language +
            "\nPlot: " + response.data.Plot +
            "\nActors: " + response.data.Actors +
            "\n--------------------------------------------------------------------";
        console.log(MovieResults);
    })  // function(response)
    .catch(function (error) {
        console.log(error);
	});  // axios.get

}  // MovieThis()

//***********************************************************************************/
//  function DoThis(File) 
//  The purpose of this function is to perform the action specified in the input
//  file name
//***********************************************************************************/
function DoThis(File) {
    if (DebugON)  console.log ("** in DoThis() " + File);

    if (!File) {
        console.log ("***ERROR*** No file specified");
        return;
	}  // if (!File)

    if (DebugON)  console.log ("** in DoThis() " + File);

    fs.readFile(File, "utf8", function (error, data) {
		if (error) {
			return console.log(error);
		}

		var dataArr = data.split(",");

        var Action = dataArr[0];
        var SearchStr = dataArr[1];
        
        switch (Action) {
            case "concert-this" :
                ConcertThis(SearchStr)
                break;
    
            case "spotify-this-song" :
                SpotifyThis(SearchStr)
                break;
    
            case "movie-this" :
                MovieThis(SearchStr)
                break;
            
            case "do-what-it-says" :
                DoThis(SearchStr)
                break;
    
            default :
                console.log ("Unrecognized action " + Action);
                break;
    
        }  // switch (Action)
        
	});  // fs.readFile()

}  // DoThis()
