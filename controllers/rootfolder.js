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
  

async  function postRootFolder(req, res) {
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
        
  }

  export { postRootFolder };