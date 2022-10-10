CREATE TABLE ninjas
(
    id SERIAL,
    name text,
    weapon text,
    CONSTRAINT ninjas_pkey PRIMARY KEY (id)
);

INSERT INTO ninjas(name, weapon) VALUES
 ('Meadow Crystalfreak ', 'Katana'),
 ('Buddy-Ray Perceptor', 'Shuriken'),
 ('Prince Flitterbell', 'Yari');