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
  

async  function getAgentID(req, res) {
    console.log('/agent/:agentid '+req.params.agentid);
    let response = [];
    let conn;
    try {
      conn = await pool.getConnection();
  
    // SELECT ID FROM agents where hostname = req.params.agentid
  
      const rows = await conn.query("SELECT ID FROM agents where hostname ='" + req.params.agentid + "'");
      console.log(rows); //[ {val: 1}, meta: ... ]
    if (rows.length > 0)
    {
      response = { agentid: rows[0].ID };
      setTimeout(agentCalledUpdate, 15, rows[0].ID);
  
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


/**********************************************************/
async function agentWatchdog() 
{    
    while (continuelooping) {
        console.log('agentWatchdog - check for NotReady');
        let conn;
        try {
                conn = await pool.getConnection();
                const query = "UPDATE agent_details SET statusName='NotReady' where statusName = 'Ready' AND accessed < NOW() - INTERVAL 5 MINUTE;"
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
function agentInit() 
{
    agentWatchdog(); 
}


async function agentCalledUpdate(id) 
{
    //TODO: update agent to Ready
    let conn;
    try {
            conn = await pool.getConnection();
            const query = "UPDATE agent_details SET statusName='Ready', accessed = NOW() where ID = " + id + " ;"
            const rows = await conn.query(query);
            console.log(rows); //[ {val: 1}, meta: ... ]
        } catch (err) {
            console.log(err);
            throw err;
        } finally {
            if (conn)  conn.end();
        } 
}


export {agentInit, getAgentID};