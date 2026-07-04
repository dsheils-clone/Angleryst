
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
    "town" VARCHAR(255),
    "latitude" FLOAT NOT NULL,
    "longitude" FLOAT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT TRUE,
    "user_id" INT,
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES users(id)
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
CREATE TABLE IF NOT EXISTS "user_inventory" (
    "id" SERIAL,
    "user_id" INT NOT NULL,
    "lure_id" INT NOT NULL,
    "quantity" INT NOT NULL DEFAULT 1,
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

INSERT INTO species (name) VALUES
  ('Largemouth Bass'), ('Smallmouth Bass'), ('Northern Pike'),
  ('Walleye'), ('Rainbow Trout'), ('Brown Trout'),
  ('Bluegill'), ('Crappie')
ON CONFLICT DO NOTHING;

INSERT INTO locations (name, town, latitude, longitude) VALUES
  ('Farm Pond', 'Sherborn', 42.2435, -71.3651),
  ('Lake Cochituate', 'Framingham', 42.3209, -71.3993),
  ('Lake Winthrop', 'Holliston', 42.1958, -71.4486),
  ('Ashland Reservoir', 'Ashland', 42.2502, -71.4733),
  ('Hopkinton Reservoir', 'Hopkinton', 42.2266, -71.5417)
ON CONFLICT DO NOTHING;