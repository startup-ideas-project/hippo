DROP TABLE IF EXISTS log_in, personal_info, data_requester, data_provider;
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

CREATE TABLE data_requester (
    id UUID NOT NULL,
    personal_info_id UUID NOT NULL,
    url_link VARCHAR(500),
    iam_role VARCHAR(500),
	insert_at TIMESTAMP NOT NULL,
	modify_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(personal_info_id) REFERENCES personal_info(id)
);

CREATE TABLE data_provider (
    id UUID NOT NULL,
    provider VARCHAR(500) NOT NULL,
    personal_info_id UUID NOT NULL,
    public_key_URL VARCHAR(500),
	insert_at TIMESTAMP NOT NULL,
	modify_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(personal_info_id) REFERENCES personal_info(id)
);

