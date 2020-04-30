//Install zip codes module with npm i zipcodes
// USED https://github.com/davglass/zipcodes as a zip code module


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://webalub:comp20tufts@cluster0-jnsgs.mongodb.net/test?retryWrites=true&w=majority";
var port = process.env.PORT || 8080; // to enable access by heroku

var http = require('http');
var url = require('url');
var zipcodes = require('zipcodes');
var my_data = [];
var donation_index = -1;


async function main()
{
	console.log("MAIN");
	http.createServer(async function(req, res){
		res.writeHead(200, {'Content-Type':'text/html'});
		var qobj = url.parse(req.url, true).query;
		var zip = qobj.zip;

	// ---------------------- start of if-block -----------------------
	if (zip != null)
	{
		MongoClient.connect(uri, { useUnifiedTopology: true }, async function(err, client) {
			if(err) { return console.log(err); }

			let dbo = client.db("masks");
			let collection = dbo.collection('mask_donors');

			await collection.find().toArray(function(err, result) {
	            if (err) { return console.log(err); }
	            var query = result;
	            my_data = query;
	            console.log(query);
	            client.close();
	            var min_dist = zipcodes.distance(zip, query[0].zip);
	            var curr_dist = 0;
	            for (index = 0; index < query.length; index++) { 
	            	curr_dist = zipcodes.distance(zip, query[index].zip);
	            	console.log ("CURR DIST BETWEEN: " + zip + " and " + query[index].zip + " is " + curr_dist);
					if (curr_dist < min_dist && curr_dist != null)
					{
						min_dist = curr_dist;
						donation_index = index;
					}
				} 
				try {
					console.log("MIN DIST: " + min_dist)
					console.log("Donator name: " + query[donation_index].f_name + " " + query[donation_index].l_name);
					console.log("Masks available: " + query[donation_index].mask_num);
					console.log("State: " + query[donation_index].state);
					console.log("Phone number: " + query[donation_index].phone);
				} catch(e) {
					console.log(e);
				}
	        });
		});
	}
	// ---------------------- end of if-block -----------------------

	await sleep(1000);

	// ---------------------- write to the page ----------------------
	try{
		var zipcode = my_data[donation_index].zip;
		var lat = zipcodes.lookup(zipcode).latitude;
		var lng = zipcodes.lookup(zipcode).longitude;
		/* map api headers */
		res.write('<html><head><title>Find Masks Near You</title><link rel="stylesheet" type="text/css" href="https://juliahindle.github.io/final/style.css" />');
		res.write('<link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css" /><script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"></script><link rel="stylesheet" href="https://unpkg.com/leaflet@1.6.0/dist/leaflet.css"integrity="sha512-xwE/Az9zrjBIphAcBb3F6JVqxf46+CDLwfLMHloNu6KEQCAWi6HcDUbeOfBIptF7tcCzusKFjFw2yuvEpDL9wQ=="crossorigin=""/><script src="https://unpkg.com/leaflet@1.6.0/dist/leaflet.js"integrity="sha512-gZwIG9x3wUXg2hdXF6+rVkLF/0Vi9U8D2Ntg4Ga5I5BZpVkVxlJWbSQtXPSiUTtC0TjtGOmxa1AJPuV0CPthew=="crossorigin=""></script></head>');
		/* ------------------ */
		var lat_array = new Array(my_data.length);
		var lng_array = new Array(lat_array.length);
		
		// storing all the coordinates in arrays
		for (i = 0; i < my_data.length; i++) {
			zipcode = my_data[i].zip;
			if (zipcodes.lookup(zipcode) != null) {
				lat_array[i] = await zipcodes.lookup(my_data[i].zip).latitude;
				lng_array[i] = await zipcodes.lookup(my_data[i].zip).longitude;
			}
				
		}

		var addPointsToMap = "";
		for (var i = 0; i < my_data.length; ++i) {
			// template: L.marker(["+lat+", "+lng+"]).addTo(map);
			if (zipcodes.lookup(my_data[i].zip) != null && zipcodes.lookup(my_data[i].zip) != undefined && lat_array[i] != undefined ) {
				call_link = "<a href=\"tel:"+my_data[i].phone+"\">Call phone</a>";
				addPointsToMap += "L.marker(["+lat_array[i]+", "+lng_array[i]+"]).addTo(map).bindPopup('<strong>Donor Details</strong> <br /> Name: "+my_data[i].f_name + " " + my_data[i].l_name+" <br /> Masks available: "+my_data[i].mask_num+"<br />"+call_link+"')\n";
			}	
		}

		res.write('<body><header><div class="title_left"><h1>COVID-19 U.S. LIVE STATS</h1></div><div class="nav_right"><ul><li><a href="https://juliahindle.github.io/final/index.html">Home</a></li><li><a href="https://juliahindle.github.io/final/donations.html">Donate Masks</a></li></ul></div></header><h1 class="findMask">Find Masks Near Your Location</h1>\n');
		res.write("<div class='result'> The person closest to your location is " + my_data[donation_index].f_name + " " + my_data[donation_index].l_name + ".\n");
		res.write("<br /> They have " + my_data[donation_index].mask_num + " masks available. You can reach them at their phone number, " + my_data[donation_index].phone + ".\n");
		res.write("You can view the approximate location of the donor below:</div> <br /> <br /> <br /><div class='map' id='map' style='height:450px'></div>");
		var attribution = "{ attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors' }";
		res.write("<script type='text/javascript'>var map = L.map('map').setView(["+lat+", "+lng+"], 15);\nL.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', "+ attribution+").addTo(map);L.marker(["+lat+", "+lng+"]).addTo(map);\n"+addPointsToMap+"</script>");
	} catch(e) {
		res.write("<script type='text/javascript'>alert('The zip code you entered may not be a valid zip code. Please try again.')</script>\n");
		console.log(e);
	}
	finally{
	res.write("<p class='goBack'>To get back, please click <a href='https://juliahindle.github.io/final/donations.html'>here</a></p>\n");
    res.end("<footer><div>&copy; Team Webalubadubdub, 2020</div></footer>\n</body>\n</html>");
}
// ------------------------- end of write ------------------------------

}).listen(port);
}
main().catch(console.error);



// function sleep - waits for the specified amount of time (in milliseconds)
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   

