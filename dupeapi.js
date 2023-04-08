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


async function asyncWriteToDB(data) {
  let conn;
  try {
	conn = await pool.getConnection();
	//const rows = await conn.query("SELECT 1 as val");
	//console.log(rows); //[ {val: 1}, meta: ... ]
  const query = "INSERT INTO files value (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"   
  const insertdata = [data.hostname, data.subfolderHash, data.hash, data.path, data.name, data.extension, data.size, data.created, data.modified, data.accessed];
  console.log("MariaDB INSERT" + data.hash);
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
  console.log(`Example app listening at http://localhost:${port}`);
});