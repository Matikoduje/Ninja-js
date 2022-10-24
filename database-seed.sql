CREATE TABLE testSeed
(
    id SERIAL,
    name text,
    CONSTRAINT testSeed_pkey PRIMARY KEY (id)
);

INSERT INTO testSeed(name) VALUES
 ('Seed1'),
 ('Seed2'),
 ('Seed3');