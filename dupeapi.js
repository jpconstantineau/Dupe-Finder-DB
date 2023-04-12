
import mariadb from 'mariadb';
import express from 'express';

import { agentInit, getAgentID } from './controllers/agent.js'

const app = express();
const port = 3000;

const pool = mariadb.createPool({
  host: 'localhost', 
  user:'root', 
  password: '',
  database: "DupeDB",
  connectionLimit: 5
});


async function DBInit() {

  let conn = await pool.getConnection();

  console.log('initializing DupeDB Tables');
  try {
    const resdb = await conn.query('CREATE DATABASE IF NOT EXISTS DupeDB;');
    console.log(resdb);
  
  const resstatusa = await conn.query('CREATE TABLE IF NOT EXISTS status_agent (ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(32) UNIQUE NOT NULL)');
  console.log(resstatusa);
  const resstatusr = await conn.query('CREATE TABLE IF NOT EXISTS status_folder (ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,name varchar(32) UNIQUE NOT NULL)');
  console.log(resstatusr);
  const resstatusf = await conn.query('CREATE TABLE IF NOT EXISTS status_file (ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,name varchar(32) UNIQUE NOT NULL)');
  console.log(resstatusf);
  const reshosts = await conn.query('CREATE TABLE IF NOT EXISTS agents ( ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, hostname varchar(255) NOT NULL, statusID INT, created DATETIME, accessed DATETIME, enabled BOOLEAN, CONSTRAINT fk_status_agent FOREIGN KEY (statusID) REFERENCES status_agent(ID));');
  console.log(reshosts);
  const resfolderroot = await conn.query('CREATE TABLE IF NOT EXISTS folders_root(ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY, path varchar(255) not null, statusID INT, agentID INT, CONSTRAINT fk_root_agent FOREIGN KEY (agentID) REFERENCES agents(ID), CONSTRAINT fk_status_folder_root FOREIGN KEY (statusID) REFERENCES status_folder(ID) );');
  console.log(resfolderroot);
  const resfolderall = await conn.query('CREATE TABLE IF NOT EXISTS folders_all(ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(255) not null, statusID INT, parent_folder BIGINT, agentID INT, CONSTRAINT fk_folder_agent FOREIGN KEY (agentID) REFERENCES agents(ID), CONSTRAINT fk_status_folder_all FOREIGN KEY (statusID) REFERENCES status_folder(ID), CONSTRAINT fk_folder_parent FOREIGN KEY (parent_folder) REFERENCES folders_all(ID));');
  console.log(resfolderall);  
  const resfileall = await conn.query('CREATE TABLE IF NOT EXISTS files_all(ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(255) not null, statusID INT, parent_folder BIGINT NOT NULL,  CONSTRAINT fk_status_file_all FOREIGN KEY (statusID) REFERENCES status_file(ID), CONSTRAINT fk_folder_parent_file FOREIGN KEY (parent_folder) REFERENCES folders_all(ID));');
  console.log(resfileall);  


  const resview1 = await conn.query('CREATE VIEW  IF NOT EXISTS agent_details AS SELECT A.ID, A.hostname, B.name as statusName, A.created, A.accessed, A.enabled FROM agents A join status_agent B ON A.statusID = B.ID;');
  console.log(resview1);  

  const insert1 = await conn.query('INSERT IGNORE INTO status_agent (ID, name) VALUES (1, "Created");');
  console.log(insert1);  
  const insert2 = await conn.query('INSERT IGNORE INTO status_agent (ID, name) VALUES (2, "Ready");');
  console.log(insert2);  
  const insert3 = await conn.query('INSERT IGNORE INTO status_agent (ID, name) VALUES (3, "NotReady");');
  console.log(insert3);
 
  const insert10 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (1, "Pending");');
  console.log(insert10);  
  const insert11 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (2, "Progressing");');
  console.log(insert11);  
  const insert12 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (3, "Synced");');
  console.log(insert12);  
  const insert13 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (4, "Missing");');
  console.log(insert13);  
  const insert14 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (5, "MarkedForDeletion");');
  console.log(insert14);  
  const insert15 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (6, "Deleting");');
  console.log(insert15);  
  const insert16 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (7, "Deleted");');
  console.log(insert16);  

  const insert20 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (1, "Pending");');
  console.log(insert20);  
  const insert21 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (2, "Progressing");');
  console.log(insert21);  
  const insert22 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (3, "Synced");');
  console.log(insert22);  
  const insert23 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (4, "Missing");');
  console.log(insert23);  
  const insert24 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (5, "MarkedForDeletion");');
  console.log(insert24);  
  const insert25 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (6, "Deleting");');
  console.log(insert25);  
  const insert26 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (7, "Deleted");');
  console.log(insert26);  
  const insert27 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (8, "MarkedForHashing");');
  console.log(insert27);  
  const insert28 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (9, "Hashing");');
  console.log(insert28);  


  } catch (err) {
    console.log(err);
    throw err;
  } finally {
  if (conn) return conn.end();
  }
}


/****** UTILITY FUNCTIONS **** */
function twoDigits(d) {
  if(0 <= d && d < 10) return "0" + d.toString();
  if(-10 < d && d < 0) return "-0" + (-1*d).toString();
  return d.toString();
}

Date.prototype.toMysqlFormat = function() {
  return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};



/****** Express Setup **** */
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

/***********************************/
/** ROOT endpoint  - used for nothing... */
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

/***********************************/
/* LEGACY ENDPOINT FOR OLD SCANNER */
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


app.post("/file", (req, res) => {
//    console.log(req.body);
    console.log(req.body.hostname+":"+req.body.path+"/"+req.body.name);
    asyncWriteToDB(req.body);
    res.status(201).json({ message: req.body.hash });    
  });


/********************************/
/* Agent CONTROLLER API         */
// Get is used for getting the agent id to get roots
app.get("/agent/:agentid", getAgentID);


// post is used for the initial setup of the agent in the db
app.post("/agent", async (req, res) => {
  //    console.log(req.body);
      console.log('/agent '+ req.body.hostname);

      let response = [];
      let conn;
      try {
      conn = await pool.getConnection();
    
      const query = "INSERT INTO agents (hostname,statusID,created,accessed,enabled) "
                  +  "SELECT * FROM (SELECT '"+req.body.hostname+"' AS hostname, 1 AS statusID, NOW() as created, NOW() as accessed, 1 as enabled) AS temp "
                  +  "WHERE NOT EXISTS ("
                  +  "SELECT ID FROM agents WHERE hostname = '"+req.body.hostname+"'"
                  +  ") LIMIT 1;";
      const rows = await conn.query(query);
      console.log(rows);
      let response = { rows };
      
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
    if (conn) return conn.end();
  
    res.status(201);
    res.json(response);
    res.end();
    }    
    }
    );
/********************************/
/* Root Folder CONTROLLER API   */
app.post("/rootfolder", async (req, res) => {
  console.log('POST /rootfolder '+ req.body);
  console.log(req.body);
  let response = {};
  let conn;
  try{
    conn = await pool.getConnection();
    const query = "INSERT INTO folders_root (path,statusID,agentID) "
                +  "SELECT * FROM (SELECT '"+req.body.path+"' AS path, 1 AS statusID, " +req.body.agentid+ " as agentID) AS temp "
                +  "WHERE NOT EXISTS ("
                +  "SELECT ID FROM folders_root WHERE agentID = '"+req.body.agentid+"' AND path = '" + req.body.path + "'"
                +  ") LIMIT 1;";
    const rows = await conn.query(query);
    console.log(rows);
    let response = { rows };

} catch (err) {
  console.log(err);
  throw err;
} finally {
if (conn) return conn.end();

res.status(201);
res.json(response);
res.end();
}    

});


/********************************/
/* Generic Folder CONTROLLER API */


/********************************/
/* Generic File  CONTROLLER API */


/********************************/
/* Hasher        CONTROLLER API */


/********************************/
/* File Deleter  CONTROLLER API */


/********************************/
/* Folder Deleter CONTROLLER API */


/********************************/
/** Initializing APP DB */
DBInit();

/** Starting API */
app.listen(port, () => {
  console.log(`DupeFinderDB-API listening at http://localhost:${port}`);
});

// Starting Controllers
agentInit();