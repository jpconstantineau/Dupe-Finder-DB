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


  async function folderDeleteCalledUpdate(id) 
  {
      let conn;
      try {
              conn = await pool.getConnection();
              const query = "UPDATE folders_all SET statusID = (SELECT ID FROM status_folder WHERE name = 'Deleting') where ID = " + id + " ;"
              const rows = await conn.query(query);
              console.log(rows); //[ {val: 1}, meta: ... ]
          } catch (err) {
              console.log(err);
              throw err;
          } finally {
              if (conn)  conn.end();
          } 
  }
  

  async function getFolderDelete(req, res) {
    console.log('/getFolderDelete/:agentid '+req.params.agentid);
    let response = [];
    let conn;
    try {
      conn = await pool.getConnection();
  
    // SELECT ID FROM agents where hostname = req.params.agentid
  
      const rows = await conn.query("SELECT ID, name FROM folders_all where agentid ='" + req.params.agentid + "' AND statusID = (SELECT ID FROM status_folder WHERE name = 'ReadyForDeletion') ORDER by ID ASC LIMIT 1;");
      console.log(rows); //[ {val: 1}, meta: ... ]
    if (rows.length > 0)
    {
      response = rows[0];
      setTimeout(folderDeleteCalledUpdate, 15, rows[0].ID);
  
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





  async function putFolderDelete(req, res) {}
  
  
  async function folderdeleteWatchdog() 
  {    
      while (continuelooping) {
          console.log('folderdeleteWatchdog - check for Propagating MarkedForDeletion');
          let conn;
          try {
                  conn = await pool.getConnection();
                  const query = "UPDATE folders_all SET statusID=(SELECT ID FROM status_folder where name = 'MarkedForDeletion') where ID IN (SELECT ID FROM folders_all where parent_folder IN (SELECT ID FROM folders_all where statusID IN (SELECT ID FROM status_folder where name = 'MarkedForDeletion') ) );"
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
  function folderdeleteInit() 
  {
    folderdeleteWatchdog() ; 
  }

  
  export { getFolderDelete, putFolderDelete, folderdeleteInit };