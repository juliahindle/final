//https://www.mongodb.com/blog/post/quick-start-nodejs-mongodb--how-to-get-connected-to-your-database


const MongoClient = require('mongodb').MongoClient;
var http = require('http');
var url = require('url');
var port = process.env.PORT || 8080; // to enable access by heroku

async function main()
{

	async function insertData (req, res){
		res.writeHead(200, {'Content-Type':'text/html'});
		var qobj = url.parse(req.url, true).query;
		var f_name = qobj.f_name;
		var l_name = qobj.l_name;
		var mask_num = qobj.masks;
		var zip = qobj.zip;
		var state = qobj.state;
		var phone = qobj.phone;

		if (f_name != null){
			const uri = "mongodb+srv://webalub:comp20tufts@cluster0-jnsgs.mongodb.net/test?retryWrites=true&w=majority"

			await MongoClient.connect(uri, async function(err, client) {
				if(err) { return console.log(err); }	  
				var dbo = client.db("masks");
				var collection = dbo.collection('mask_donors');

				var newData = {"f_name": f_name, "l_name": l_name, "mask_num": mask_num, 
							   "zip": zip, "state": state, "phone": phone};
				await collection.insertOne(newData, function(err, res) {
				if (err) throw err;
				console.log("new document inserted");
				}   );	

				console.log("Success!");
				client.close();
			});
	}
	var html1 = '<html><head><title>Thank You!</title><link rel="stylesheet" type="text/css" href="https://juliahindle.github.io/final/style.css" /></head>';
	var html2 = '<body><h1> Thank you for donating! </h1><br /> <br /><h4> To go back to the form, click <a href="https://juliahindle.github.io/final/donations.html">here</a>. <br />If you want to go back to the home page instead, click <a href="https://juliahindle.github.io/final/">here</a>.</h4><footer><div>&copy; Team Webalubadubdub, 2020</div></footer>';
	res.write(html1 + html2);
	res.end('</body></html>');
	}

	http.createServer(insertData).listen(port);

}
main().catch(console.error);


