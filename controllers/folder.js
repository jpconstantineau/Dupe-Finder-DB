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



/****** UTILITY FUNCTIONS **** */
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
  }
  
  Date.prototype.toMysqlFormat = function() {
    return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
  };
  
  
  

  async function folderCalledUpdate(id) 
  {
      let conn;
      try {
              conn = await pool.getConnection();
              const query = "UPDATE folders_all SET statusID = (SELECT ID FROM status_folder WHERE name = 'Progressing') where ID = " + id + " ;"
              const rows = await conn.query(query);
              console.log(rows); //[ {val: 1}, meta: ... ]
          } catch (err) {
              console.log(err);
              throw err;
          } finally {
              if (conn)  conn.end();
          } 
  }
  

async function getFolder(req, res) {
    console.log('/getFolder/:agentid '+req.params.agentid);
    let response = [];
    let conn;
    try {
      conn = await pool.getConnection();
  
    // SELECT ID FROM agents where hostname = req.params.agentid
  
      const rows = await conn.query("SELECT ID, name FROM folders_all where agentid ='" + req.params.agentid + "' AND statusID = (SELECT ID FROM status_folder WHERE name = 'Pending') ORDER by ID ASC LIMIT 1;");
      console.log(rows); //[ {val: 1}, meta: ... ]
    if (rows.length > 0)
    {
      response = rows[0];
      setTimeout(folderCalledUpdate, 15, rows[0].ID);
  
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



async function postFolder(req, res) {}





/**********************************************************/
function folderInit() 
{
    //folderWatchdog(); 
}


  export { getFolder, postFolder, folderInit };