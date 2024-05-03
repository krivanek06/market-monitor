/*
  DROP some tables if necessary
  DROP TABLE IF EXISTS symbol_summary
*/


/*
  Create a table to store the symbol summary
*/
CREATE TABLE IF NOT EXISTS symbol_summary (
  id VARCHAR(25) PRIMARY KEY,
  quote TEXT NOT NULL,
  profile TEXT DEFAULT null,
  priceChange TEXT DEFAULT NULL,
	lastUpdate TEXT DEFAULT NULL
);

/*
  Create a table to store market json data
*/
CREATE TABLE IF NOT EXISTS market_data (
  id VARCHAR(100) PRIMARY KEY,
  data TEXT NOT NULL,
  lastUpdate timestamp DEFAULT CURRENT_TIMESTAMP
);


