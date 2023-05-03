const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Define database connection and search functions
const db = new sqlite3.Database('database.db');

const searchUser = (username, callback) => {
	db.get('SELECT id FROM co_user WHERE user = ?', [username], (err, row) => {
	  if (err) {
		callback(err, null);
	  } else if (!row) {
		callback(null, null);
	  } else {
		db.all('SELECT * FROM co_chat WHERE user = ?', [row.id], callback);
	  }
	});
};

const searchUserCmd = (username, callback) => {
	db.get('SELECT id FROM co_user WHERE user = ?', [username], (err, row) => {
	  if (err) {
		callback(err, null);
	  } else if (!row) {
		callback(null, null);
	  } else {
		db.all('SELECT * FROM co_command WHERE user = ?', [row.id], callback);
	  }
	});
};

// Define routes
app.get('/', (req, res) => {
	res.render('index');
});

app.get("/api/users", (req, res, next) => {
	db.all("SELECT * FROM co_user", (err, rows) => {
		if (err) {
			res.status(500).json({ error: err.message });
			return;
		}
		res.json({
			message: "success",
			data: rows
		});
	});
});

app.get("/api/chats", (req, res, next) => {
	if (/^[a-zA-Z0-9_-]+$/.test(req.query.user) == false) {
		res.status(403).json({ error: "Unsafe String", code: 403 });
		return;
	}
	if (req.query.id) {
		db.all(`SELECT * FROM co_chat WHERE user = '${req.query.id}'`, (err, rows) => {
			if (err) {
				res.status(500).json({ error: err.message, code: 500 });
				return;
			}
			else if (!rows[0]) {
				res.status(404).json({ error: "User not found", code: 404 });
				return;
			}
			res.json({
				message: "success",
				code: 200,
				data: rows,
			});
		});
	}
});

app.get("/api/pms", (req, res, next) => {
	if (req.query.id) {
		db.all(`SELECT * FROM co_command WHERE message LIKE '%msg%'`, (err, rows) => {
			if (err) {
				res.status(500).json({ error: err.message, code: 500 });
				return;
			}
			else if (!rows[0]) {
				res.status(404).json({ error: "User not found", code: 404 });
				return;
			}
			res.json({
				message: "success",
				code: 200,
				data: rows,
			});
		});
	}
});

app.get("/api/user", (req, res, next) => {
	if (/^[a-zA-Z0-9_-]+$/.test(req.query.user) == false) {
		res.status(403).json({ error: "Unsafe String", code: 403 });
		return;
	}
	if(req.query.user) {
		db.all(`SELECT * FROM co_user WHERE user = '${req.query.user}'`, (err, rows) => {
			if (err) {
				res.status(500).json({ error: err.message, code: 500 });
				return;
			}
			else if (!rows[0]) {
				res.status(404).json({ error: "User not found", code: 404 });
				return;
			}
			res.json({
				message: "success",
				code: 200,
				data: rows,
			});
		});
	} else if (req.query.id) {
		db.all(`SELECT * FROM co_user WHERE id = '${req.query.id}'`, (err, rows) => {
			if (err) {
				res.status(500).json({ error: err.message, code: 500 });
				return;
			}
			else if (!rows[0]) {
				res.status(404).json({ error: "User not found", code: 404 });
				return;
			}
			res.json({
				message: "success",
				code: 200,
				data: rows,
			});
		});
	} else if (req.query.uuid) {
		db.all(`SELECT * FROM co_user WHERE uuid = '${req.query.uuid}'`, (err, rows) => {
			if (err) {
				res.status(500).json({ error: err.message, code: 500 });
				return;
			}
			else if (!rows[0]) {
				res.status(404).json({ error: "User not found", code: 404 });
				return;
			}
			res.json({
				message: "success",
				code: 200,
				data: rows,
			});
		});
	}
});


app.post('/search', (req, res) => {
	const username = req.body.username;
	searchUser(username, (err, rows) => {
	  if (err) {
		console.error(err.message);
		res.status(500).send('Internal server error');
	  } else if (!rows) {
		res.render('search_no_results', { username });
	  } else {
		res.render('search', { username, rows });
	  }
	});
});

// Start the server
app.listen(port, () => {
	console.log(`App listening on ${port}`);
});