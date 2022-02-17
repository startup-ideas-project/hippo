DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
CREATE TABLE log_in(
	id UUID NOT NULL,
   	email VARCHAR(500) UNIQUE NOT NULL,
   	password VARCHAR(50) NOT NULL,
	issue_at TIMESTAMP NOT NULL,
   PRIMARY KEY ( id )
);

CREATE TABLE personal_info (
    id UUID NOT NULL,
    email VARCHAR(500) NOT NULL,
    name VARCHAR(500),
	issue_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(email) REFERENCES log_in(email)
);

