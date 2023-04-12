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



  async function getFolderDelete(req, res) {}
  async function putFolderDelete(req, res) {}
  
  
  /**********************************************************/
  function folderdeleteInit() 
  {
      ; 
  }

  
  export { getFolderDelete, putFolderDelete, folderdeleteInit };