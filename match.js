//https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database
//Install zip codes module with npm i zipcodes
// USED https://github.com/davglass/zipcodes as a zip code module


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://webalub:comp20tufts@cluster0-jnsgs.mongodb.net/test?retryWrites=true&w=majority";
var port = process.env.PORT || 8080; // to enable access by heroku

var http = require('http');
var url = require('url');
var zipcodes = require('zipcodes');

async function main()
{
	console.log("MAIN");
	http.createServer(async function(req, res){
		res.writeHead(200, {'Content-Type':'text/html'});
		var qobj = url.parse(req.url, true).query;
		var zip = qobj.zip;

		if (zip != null)
	{
		MongoClient.connect(uri, { useUnifiedTopology: true }, async function(err, client) {
			if(err) { return console.log(err); }

			let dbo = client.db("masks");
			let collection = dbo.collection('mask_donors');

			await collection.find().toArray(function(err, result) {
	            if (err) { return console.log(err); }
	            var query = result;
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
					}
				} 
				console.log("MIN DIST: " + min_dist)
	        });
		});
	}
	res.end();
	}).listen(port);
}
main().catch(console.error);


