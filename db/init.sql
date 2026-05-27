
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
CREATE TABLE IF NOT EXISTS "lures"(
    "id" SERIAL,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "brand" VARCHAR(255),
    "size" VARCHAR(100),
    "color_family" VARCHAR(100),
    "purchase_url" VARCHAR(500),
    "sku" VARCHAR(100),
    "is_custom" BOOLEAN NOT NULL DEFAULT FALSE,
    "user_id" INT,
    PRIMARY KEY ("id"),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS "lure_inventory" (
    "id" SERIAL,
    "user_id" INT NOT NULL,
    "lure_id" INT NOT NULL,
    PRIMARY KEY ("id"),
    UNIQUE ("user_id", "lure_id"),
    FOREIGN KEY ("user_id") REFERENCES users(id),
    FOREIGN KEY ("lure_id") REFERENCES lures(id)
);
CREATE TABLE IF NOT EXISTS "catches"(
  "id" SERIAL,
  "user_id" INT NOT NULL,
  "species" INT NOT NULL,
  "weight" FLOAT NOT NULL,
  "length" FLOAT NOT NULL,
  "location" INT NOT NULL,
  "lure_id" INT NOT NULL,
  "date_caught" DATE NOT NULL,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY ("id"),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (species) REFERENCES species(id),
  FOREIGN KEY (location) REFERENCES locations(id),
  FOREIGN KEY (lure_id) REFERENCES lures(id)
);