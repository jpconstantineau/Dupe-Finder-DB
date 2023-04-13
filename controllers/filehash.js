import mariadb from 'mariadb';


var throttledelay = 1*60*1000; // 1 minute
var continuelooping = true;

const pool = mariadb.createPool({
    host: 'localhost', 
    user:'root', 
    password: '',
    database: "DupeDB",
    connectionLimit: 5
  });




  async function fileHashCalledUpdate(id) 
  {
      let conn;
      try {
              conn = await pool.getConnection();
              const query = "UPDATE files_all SET statusID = (SELECT ID FROM status_file WHERE name = 'Hashing') where ID = " + id + " ;"
              const rows = await conn.query(query);
              console.log(rows); //[ {val: 1}, meta: ... ]
          } catch (err) {
              console.log(err);
              throw err;
          } finally {
              if (conn)  conn.end();
          } 
  }
  
  async function getFileHash(req, res) {
    console.log('/getFileHash/:agentid '+req.params.agentid);
    let response = [];
    let conn;
    try {
      conn = await pool.getConnection();
  
    // SELECT ID FROM agents where hostname = req.params.agentid
  
      const rows = await conn.query("SELECT ID, name FROM files_all where agentid ='" + req.params.agentid + "' AND statusID = (SELECT ID FROM status_file WHERE name = 'MarkedForHashing') ORDER by ID ASC LIMIT 1;");
      console.log(rows); //[ {val: 1}, meta: ... ]
    if (rows.length > 0)
    {
      response = rows[0];
      setTimeout(fileHashCalledUpdate, 15, rows[0].ID);
  
    }
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
    res.status(200);
    res.json(response);
    if (conn) return conn.end();
    }
  }

  async function putFileHash(req, res) {}
  
  
  async function filehashWatchdog() 
  {    
      while (continuelooping) {
          console.log('filehashWatchdog - check for files to be marked for Hashing');
          let conn;
          try {
                  conn = await pool.getConnection();
                  const query = "UPDATE files_all SET statusID=(SELECT ID FROM status_file where name = 'MarkedForHashing') where hash IS NULL AND size IN ("+ 
                  "SELECT size FROM (SELECT count(name) as total, size FROM files_all group by size ) AS temp WHERE total > 1" +
                  ");"
                  const rows = await conn.query(query);
                  console.log(rows); //[ {val: 1}, meta: ... ]
              } catch (err) {
                  console.log(err);
                  throw err;
              } finally {
                  if (conn)  conn.end();
              }
          await new Promise(resolve => setTimeout(resolve, throttledelay));
      }
  }

 /**********************************************************/


  /**********************************************************/
  function hashInit() 
  {
    filehashWatchdog(); 
  }
  

  
  export { getFileHash, putFileHash, hashInit };