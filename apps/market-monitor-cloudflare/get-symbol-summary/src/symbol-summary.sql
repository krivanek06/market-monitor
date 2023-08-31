DROP TABLE IF EXISTS symbol_summary;
CREATE TABLE IF NOT EXISTS symbol_summary (
  id VARCHAR(25) PRIMARY KEY,
  quote TEXT,
  profile TEXT DEFAULT null,
  priceChange TEXT,
	lastUpdated timestamp DEFAULT CURRENT_TIMESTAMP
);
