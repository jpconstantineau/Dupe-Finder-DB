const mariadb = require('mariadb');

const express = require("express");
const app = express();
const port = 3000;

const pool = mariadb.createPool({
     host: 'localhost', 
     user:'root', 
     password: '',
     database: "DupeDB",
     connectionLimit: 5
});


function twoDigits(d) {
  if(0 <= d && d < 10) return "0" + d.toString();
  if(-10 < d && d < 0) return "-0" + (-1*d).toString();
  return d.toString();
}

Date.prototype.toMysqlFormat = function() {
  return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};



async function asyncWriteToDB(data) {
  let conn;
  try {
	conn = await pool.getConnection();
	//const rows = await conn.query("SELECT 1 as val");
	//console.log(rows); //[ {val: 1}, meta: ... ]
  const query = "INSERT INTO files(hostname, folderhash, hash, path, name, extension, size, created, modified, accessed) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";   
  var created = new Date(data.created);
  var modified = new Date(data.modified);
  var accessed = new Date(data.accessed);
  const insertdata = [data.hostname, data.subfolderHash, data.hash, data.path, data.name, data.extension, data.size, 
    created.toMysqlFormat(), 
    modified.toMysqlFormat(), 
    accessed.toMysqlFormat()];
  //console.log("MariaDB INSERT" + data.hash);
  const res = await conn.query(query, insertdata);
	console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }

  } catch (err) {
    console.log(err);
	  throw err;
  } finally {
	if (conn) return conn.end();
  }
}


app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});
app.post("/file", (req, res) => {
//    console.log(req.body);
    console.log(req.body.hostname+":"+req.body.path+"/"+req.body.name);
    asyncWriteToDB(req.body);
    res.status(201).json({ message: req.body.hash });    
  });
  
app.listen(port, () => {
  console.log(`DupeFinderDB listening at http://localhost:${port}`);
});