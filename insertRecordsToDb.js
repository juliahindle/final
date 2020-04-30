// insertRecordsToDb
/*
A file that reads in a comma delimited file and inserts the 
records to mongodb.
*/

var readline = require('readline');
var fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://webalub:comp20tufts@cluster0-jnsgs.mongodb.net/test?retryWrites=true&w=majority";

MongoClient.connect(uri, function(err, client) {
	if (err) return console.log(err);	

	var dbo = client.db('masks');
	var collection = dbo.collection('mask_donors');
	var fileReader = readline.createInterface({
  		input: fs.createReadStream('donor_data.csv')
	});

	fileReader.on('line', async function (line) {
		
		name = line.split(",")[0];

		f_name = name.split(" ")[0];
		l_name = name.split(" ")[1];

		num_masks = line.split(",")[1];
		zip = line.split(",")[2];
		state = line.split(",")[3];
		phone = line.split(",")[4];

		console.log(f_name + " " + l_name + " " + num_masks + " " + zip + " " + state + " " + phone);
		
		var newData = {
			"f_name" : f_name,
			"l_name" : l_name,
			"mask_num" : num_masks,
			"state" : state, 
			"zip" : zip, 
			"phone" : phone
		};

	    await collection.insertOne(newData, function(err, res) { // inserting the data
			if (err) throw err;
			console.log("document inserted!");
		});	

		client.close();
		
	});
});



