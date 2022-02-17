-- Shared tables for many other apps
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
CREATE TABLE log_in(
	id UUID NOT NULL,
   	email CHAR(500) UNIQUE NOT NULL,
   	password CHAR(50) NOT NULL,
	issue_at TIMESTAMP NOT NULL,
   PRIMARY KEY ( id )
);

CREATE TABLE personal_info (
    id UUID NOT NULL,
    email CHAR(500) NOT NULL,
    name CHAR (500),
    PRIMARY KEY (id),
    FOREIGN KEY(email) REFERENCES log_in(email)
)