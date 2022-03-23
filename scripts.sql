DROP TABLE IF EXISTS iam_management, data_requested, log_in, user_info, data_provider, data_market, data_consumer;
CREATE TABLE log_in(
	id UUID NOT NULL,
   	email VARCHAR(500) UNIQUE NOT NULL,
   	password VARCHAR(50) NOT NULL,
	issue_at TIMESTAMP NOT NULL,
   PRIMARY KEY ( id )
);

CREATE TABLE user_info (
    id UUID NOT NULL,
    email VARCHAR(500) NOT NULL,
    user_name VARCHAR(500),
	issue_at TIMESTAMP NOT NULL,
	modified_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE data_provider (
    id UUID NOT NULL,
    user_info_id VARCHAR(500) NOT NULL,
	insert_at TIMESTAMP NOT NULL,
	modify_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE data_market (
    id UUID NOT NULL,
	data_provider_id UUID NOT NULL,
    data_base_name VARCHAR(500) NOT NULL,
    data_base_URL VARCHAR(500) NOT NULL,
    URL_to_IAM_key VARCHAR(500) NOT NULL,
    data_restriction_id UUID,
	insert_at TIMESTAMP NOT NULL,
	modify_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE data_restriction (
    id UUID NOT NULL,
	restrictions VARCHAR(500) NOT NULL,
	insert_at TIMESTAMP NOT NULL,
	modify_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);


CREATE TABLE data_consumer (
    id UUID NOT NULL,
    user_info_id UUID NOT NULL,
    data_market_id UUID,
    data_restriction_id UUID,
	insert_at TIMESTAMP NOT NULL,
	modify_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE data_requested (
    id UUID NOT NULL,
    data_provider_id UUID NOT NULL,
    consumer_id UUID NOT NULL,
	data_market_id UUID NOT NULL,
    data_base_name VARCHAR(500) NOT NULL,
	isApproved VARCHAR(500),
	insert_at TIMESTAMP NOT NULL,
	modify_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE iam_management(
    id UUID NOT NULL,
    data_provider_id UUID NOT NULL,
    data_market_id uuid NOT NULL,
	insert_at TIMESTAMP NOT NULL,
	modify_at TIMESTAMP NOT NULL,
    PRIMARY KEY (id)
)
