
CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL,
  "username" VARCHAR(255) NOT NULL,
  "email" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "locations"(
    "id" SERIAL,
    "name" VARCHAR(255) NOT NULL,
    "latitude" FLOAT NOT NULL,
    "longitude" FLOAT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT TRUE,
    PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "species"(
    "id" SERIAL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "catches"(
  "id" SERIAL,
  "user_id" INT NOT NULL,
  "species" INT NOT NULL,
  "weight" FLOAT NOT NULL,
  "length" FLOAT NOT NULL,
  "location" INT NOT NULL,
  "date_caught" DATE NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (species) REFERENCES species(id),
  FOREIGN KEY (location) REFERENCES locations(id)
);