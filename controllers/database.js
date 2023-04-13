import mariadb from 'mariadb';

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
    const resfileall = await conn.query('CREATE TABLE IF NOT EXISTS files_all(ID BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY, name varchar(255) not null, statusID INT, parent_folder BIGINT NOT NULL, hash varchar(255), extension varchar(32), size BIGINT, created DATETIME, modified DATETIME, accessed DATETIME, agentID INT, CONSTRAINT fk_status_file_all FOREIGN KEY (statusID) REFERENCES status_file(ID), CONSTRAINT fk_folder_parent_file FOREIGN KEY (parent_folder) REFERENCES folders_all(ID));');
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
    const insert14a = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (6, "ReadyForDeletion");');
    console.log(insert14a);
    const insert15 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (7, "Deleting");');
    console.log(insert15);  
    const insert16 = await conn.query('INSERT IGNORE INTO status_folder (ID, name) VALUES (8, "Deleted");');
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
    const insert24a = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (6, "ReadyForDeletion");');
    console.log(insert24a);
    const insert25 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (7, "Deleting");');
    console.log(insert25);  
    const insert26 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (8, "Deleted");');
    console.log(insert26);  
    const insert27 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (9, "MarkedForHashing");');
    console.log(insert27);  
    const insert28 = await conn.query('INSERT IGNORE INTO status_file (ID, name) VALUES (10, "Hashing");');
    console.log(insert28);  
  
  
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
    if (conn) return conn.end();
    }
  }
  

export {DBInit};