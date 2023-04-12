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
                        +  ")";
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



/**********************************************************/
async function folderrootWatchdog() 
{    
    while (continuelooping) {
        console.log('agentWatchdog - check for Pending Root Items');
        let conn;
        try {
                conn = await pool.getConnection();
                const query = "INSERT INTO folders_all (name,statusID,agentID) SELECT * FROM (SELECT Q.path as name, S.ID AS statusID, Q.agentID FROM folders_root Q JOIN status_folder S ON Q.statusID = S.ID WHERE S.name = 'Pending') AS temp WHERE NOT EXISTS ( SELECT A.ID FROM folders_all A JOIN folders_root B ON A.name = B.path AND A.agentID = B.agentID  WHERE B.statusID IN (SELECT ID FROM status_folder WHERE name = 'Pending'));";
                const rows = await conn.query(query);
                console.log(rows); //[ {val: 1}, meta: ... ]
            } catch (err) {
                console.log(err);
                throw err;
            } finally {
                if (conn)  conn.end();
            }
            try {
                conn = await pool.getConnection();
                const query = "UPDATE folders_root SET statusID = (select ID from status_folder where name = 'Progressing') where ID in ( SELECT B.ID FROM folders_all A JOIN folders_root B ON A.name = B.path AND A.agentID = B.agentID AND A.statusID = B.statusID where B.statusID = (select ID from status_folder where name = 'Pending'));";
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
function folderrootInit() 
{
    folderrootWatchdog(); 
}

  export { postRootFolder, folderrootInit };