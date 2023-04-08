CREATE DATABASE IF NOT EXISTS DupeDB;

USE DupeDB;

DROP TABLE files;

CREATE TABLE IF NOT EXISTS files (
    FileID BIGINT NOT NULL AUTO_INCREMENT,
    hostname varchar(255) NOT NULL,
    folderhash varchar(255) NOT NULL,
    hash varchar(255) NOT NULL,
    path varchar(255) NOT NULL,
    name varchar(255) NOT NULL,
    extension varchar(32) NOT NULL,
    size BIGINT,
    created DATETIME, 
    modified DATETIME,
    accessed DATETIME,
    PRIMARY KEY (FileID));

CREATE  INDEX index_files ON files ( hostname, folderhash, hash);

USE DupeDB;

SELECT * FROM files;