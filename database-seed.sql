CREATE TABLE users
(
    user_id SERIAL PRIMARY KEY,
    username VARCHAR (50) UNIQUE NOT NULL,
    password VARCHAR (50) NOT NULL,
    email VARCHAR (255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

CREATE TABLE roles
(
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR (255) UNIQUE NOT NULL
);

CREATE TABLE user_roles
(
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (role_id)
      REFERENCES roles (role_id),
    FOREIGN KEY (user_id)
      REFERENCES users (user_id)
);

INSERT INTO roles(role_name) VALUES ('admin');
INSERT INTO roles(role_name) VALUES ('user');

INSERT INTO users(username, password, email) VALUES ('Admin', 'qwerty', 'admin@test.com');
INSERT INTO users(username, password, email) VALUES ('Jacek', 'qwerty', 'jacek@test.com');
INSERT INTO users(username, password, email, deleted_at) VALUES ('Placek', 'qwerty', 'placek@test.com', NOW());

INSERT INTO user_roles(user_id, role_id) VALUES (1,1);
INSERT INTO user_roles(user_id, role_id) VALUES (2,2);