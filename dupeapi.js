
import express from 'express';
import { DBInit } from './controllers/database.js'

DBInit();

const app = express();
const port = 3000;


/****** Express Setup **** */
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

/***********************************/
/** ROOT endpoint  - used for nothing... */
app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

/********************************/
/* Agent CONTROLLER API         */
import { agentInit, getAgentID, postAgent } from './controllers/agent.js'
app.get("/agent/:agentid", getAgentID);
app.post("/agent", postAgent );
agentInit();

/********************************/
/* Root Folder CONTROLLER API   */
import { postRootFolder } from './controllers/rootfolder.js'
app.post("/rootfolder", postRootFolder);

/********************************/
/* Generic Folder CONTROLLER API */
import { getFolder, postFolder, folderInit } from './controllers/folder.js'
app.get("/folder", getFolder);
app.post("/folder", postFolder);
folderInit();

/********************************/
/* Generic File  CONTROLLER API */
import { getFile, postFile, fileInit  } from './controllers/file.js'
app.get("/file", getFile);
app.post("/file", postFile);
fileInit();


/********************************/
/* Hasher        CONTROLLER API */
import { getFileHash, putFileHash, hashInit  } from './controllers/filehash.js'
app.get("/filehash", getFileHash);
app.put("/filehash", putFileHash);
hashInit();


/********************************/
/* File Deleter  CONTROLLER API */
import { getFileDelete, putFileDelete, filedeleteInit  } from './controllers/filedelete.js'
app.get("/filedelete", getFileDelete);
app.put("/filedelete", putFileDelete);
filedeleteInit();


/********************************/
/* Folder Deleter CONTROLLER API */
import { getFolderDelete, putFolderDelete, folderdeleteInit  } from './controllers/folderdelete.js'
app.get("/folderdelete", getFolderDelete);
app.put("/folderdelete", putFolderDelete);
folderdeleteInit();



/** Starting API */
app.listen(port, () => {
  console.log(`DupeFinderDB-API listening at http://localhost:${port}`);
});
