CREATE DATABASE project;

CREATE TABLE users (
	user_id VARCHAR(30) NOT NULL,
    email VARCHAR(30) NOT NULL,
    password VARCHAR(70) NOT NULL,
    security INT NOT NULL,
    reset_token VARCHAR(50),
    reset_expires BIGINT,
    PRIMARY KEY (user_id)
);

CREATE TABLE char_info (
	char_info_id INT NOT NULL AUTO_INCREMENT,
    user_id VARCHAR(30) NOT NULL UNIQUE,
    user_xp BIGINT NOT NULL,
    posX INT NOT NULL,
    posY INT NOT NULL,
    PRIMARY KEY (char_info_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

