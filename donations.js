//https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database


const MongoClient = require('mongodb').MongoClient;
var http = require('http');
var url = require('url');


async function main()
{
	http.createServer(function(req, res){
		res.writeHead(200, {'Content-Type':'text/html'});
		var qobj = url.parse(req.url, true).query;
		var f_name = qobj.f_name;
		var l_name = qobj.l_name;
		add_to_db(f_name, l_name);

	    res.end(f_name + " " + l_name);
	}).listen(8080);
}
main().catch(console.error);

async function add_to_db(f_name,l_name){
	if (f_name != null){
		const uri = "mongodb+srv://webalub:comp20tufts@cluster0-jnsgs.mongodb.net/test?retryWrites=true&w=majority"

		MongoClient.connect(uri, function(err, client) {
			if(err) { return console.log(err); }	  
			var dbo = client.db("masks");
			var collection = dbo.collection('mask_donors');

			var newData = {"f_name": f_name, "l_name": l_name};
			collection.insertOne(newData, function(err, res) {
			if (err) throw err;
			console.log("new document inserted");
			}   );	

			console.log("Success!");
			client.close();
		});
	}
}

