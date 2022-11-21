CREATE TABLE users
(
    user_id SERIAL PRIMARY KEY,
    password VARCHAR (255) NOT NULL,
    username VARCHAR (255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,
    token TEXT DEFAULT ''
);

CREATE TABLE capsules
(
    id SERIAL PRIMARY KEY,
    creator VARCHAR (255) DEFAULT 'spacexAPI',
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    data JSONB
);

CREATE TABLE roles
(
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR (50) UNIQUE NOT NULL
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

INSERT INTO users(password, username) VALUES ('$2a$12$Ppm4DOlHGXg.Svv.MS9LZeyPqPn7h2QYigrZ.6mlV..JW9R1h6Q3.', 'admin@test.com');
INSERT INTO users(password, username) VALUES ('$2a$12$Ppm4DOlHGXg.Svv.MS9LZeyPqPn7h2QYigrZ.6mlV..JW9R1h6Q3.', 'user@test.com');
INSERT INTO users(password, username, deleted_at) VALUES ('$2a$12$Ppm4DOlHGXg.Svv.MS9LZeyPqPn7h2QYigrZ.6mlV..JW9R1h6Q3.', 'deleted@test.com', NOW());

INSERT INTO user_roles(user_id, role_id) VALUES (1,1);
INSERT INTO user_roles(user_id, role_id) VALUES (1,2);
INSERT INTO user_roles(user_id, role_id) VALUES (2,2);