// ###############################################################################
// Web Technology at VU University Amsterdam
// Assignment 3
// ###############################################################################
//
// Database setup:

const sqlite = require('sqlite3').verbose();
let db = my_database('./phones.db');

var express = require("express");
var app = express();

var bodyParser = require("body-parser");
app.use(bodyParser.json());

app.all("*", function (req, res, next) {
	// Add Access-Control-Allow-Origin * to each header to allow cross domain requests
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With,    Content-Type, Accept");
	next();
});

app.get('/products/:id', function (req, res) {
	// Example SQL statement to select the name of all products from a specific brand
	db.get("SELECT id, brand, model, os, image, screensize FROM phones WHERE id=?", [req.params.id], function (err, row) {
		if (err) {
			return res.status(400).send(err.message);
		}
		// # Return db response as JSON	
		return res.status(200).json(row);
	});
});

app.get('/products', function (req, res) {
	// SQL statement to select the name of all products from a specific brand
	db.all("SELECT id, brand, model, os, image, screensize FROM phones", function (err, rows) {
		if (err) {
			return res.status(400).send(err.message);
		}
		// # Return db response as JSON	
		return res.status(200).json(rows)
	});
});

app.delete('/products/:id', function (req, res) {
	db.run("DELETE FROM phones WHERE id=?", [req.params.id], function (err) {
		if (err) {
			return res.status(400).send(err.message);
		}
		return res.sendStatus(200);
	});
});

app.delete('/products', function (req, res) {
	db.run("DELETE FROM phones", function (err) {
		if (err) {
			return res.status(400).send(err.message);
		}
		return res.sendStatus(200);
	});
})

app.post('/products', function (req, res) {
	console.log(req.body);
	const item = req.body;
	db.run(`INSERT INTO phones (brand, model, os, image, screensize)
	VALUES (?, ?, ?, ?, ?)`,
		[item['brand'], item['model'], item['os'], item['image'], item['screensize']], function (err) {
			if (err) {
				return res.status(400).send(err.message);
			}
			return res.sendStatus(201);
		});
});

app.put('/products', function (req, res) {
	const item = req.body;
	db.run(`UPDATE phones
                    SET brand=?, model=?, os=?, image=?,
                    screensize=? WHERE id=?`,
		[item['brand'], item['model'], item['os'], item['image'], item['screensize'], item['id']], function (err) {
			if (err) {
				return res.status(400).send(err.message);
			}
			return res.sendStatus(200);
		}
	);
});


// ###############################################################################
// This should start the server, after the routes have been defined, at port 3000:

app.listen(3000);

// ###############################################################################
// Some helper functions called above
function my_database(filename) {
	// Conncect to db by opening filename, create filename if it does not exist:
	var db = new sqlite.Database(filename, (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Connected to the phones database.');
	});
	// Create our phones table if it does not exist already:
	db.serialize(() => {
		db.run(`
        	CREATE TABLE IF NOT EXISTS phones
        	(id 	INTEGER PRIMARY KEY,
        	brand	CHAR(100) NOT NULL,
        	model 	CHAR(100) NOT NULL,
        	os 	CHAR(10) NOT NULL,
        	image 	CHAR(254) NOT NULL,
        	screensize INTEGER NOT NULL
        	)`);
		db.all(`select count(*) as count from phones`, function (err, result) {
			if (result[0].count == 0) {
				db.run(`INSERT INTO phones (brand, model, os, image, screensize) VALUES (?, ?, ?, ?, ?)`,
					["Fairphone", "FP3", "Android", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fairphone_3_modules_on_display.jpg/320px-Fairphone_3_modules_on_display.jpg", "5.65"]);
				console.log('Inserted dummy phone entry into empty database');
			} else {
				console.log("Database already contains", result[0].count, " item(s) at startup.");
			}
		});
	});
	return db;
}
