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


  async function getFileHash(req, res) {}
  async function putFileHash(req, res) {}
  
  
  /**********************************************************/
  function hashInit() 
  {
      ; 
  }
  

  
  export { getFileHash, putFileHash, hashInit };