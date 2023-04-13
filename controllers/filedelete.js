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


  
  async function fileDeleteCalledUpdate(id) 
  {
      let conn;
      try {
              conn = await pool.getConnection();
              const query = "UPDATE files_all SET statusID = (SELECT ID FROM status_file WHERE name = 'Deleting') where ID = " + id + " ;"
              const rows = await conn.query(query);
              console.log(rows); //[ {val: 1}, meta: ... ]
          } catch (err) {
              console.log(err);
              throw err;
          } finally {
              if (conn)  conn.end();
          } 
  }
 
  async function getFileDelete(req, res) {
    console.log('/getFileDelete/:agentid '+req.params.agentid);
    let response = [];
    let conn;
    try {
      conn = await pool.getConnection();
  
    // SELECT ID FROM agents where hostname = req.params.agentid
  
      const rows = await conn.query("SELECT ID, name FROM files_all where agentid ='" + req.params.agentid + "' AND statusID = (SELECT ID FROM status_file WHERE name = 'MarkedForDeletion') ORDER by ID ASC LIMIT 1;");
      console.log(rows); //[ {val: 1}, meta: ... ]
    if (rows.length > 0)
    {
      response = rows[0];
      setTimeout(fileDeleteCalledUpdate, 15, rows[0].ID);
  
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


   async function putFileDelete(req, res) {}
  

   async function filedeleteWatchdog() 
   {    
       while (continuelooping) {
           console.log('filedeleteWatchdog - check for Propagating MarkedForDeletion');
           let conn;
           try {
                   conn = await pool.getConnection();
                   const query = "UPDATE files_all SET statusID=(SELECT ID FROM status_file where name = 'MarkedForDeletion') where ID IN (SELECT ID FROM files_all where parent_folder IN (SELECT ID FROM folders_all where status_ID IN (SELECT ID FROM status_folder where name = 'MarkedForDeletion') ) );"
                   const rows = await conn.query(query);
                   console.log(rows); //[ {val: 1}, meta: ... ]
               } catch (err) {
                   console.log(err);
                   throw err;
               } finally {
                   if (conn)  conn.end();
               }
            console.log('filedeleteWatchdog - check for Updating MarkedForDeletion to ReadyForDeletion');  
            try {
                conn = await pool.getConnection();
                const query = "UPDATE files_all SET statusID=(SELECT ID FROM status_file where name = 'ReadyForDeletion') where ID IN (SELECT ID FROM files_all where statusID  IN (SELECT ID FROM status_file where name = 'MarkedForDeletion') );"
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
  function filedeleteInit() 
  {
    filedeleteWatchdog(); 
  }

  
  export { getFileDelete, putFileDelete, filedeleteInit};