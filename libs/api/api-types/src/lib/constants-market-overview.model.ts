export type MarketOverviewDocumentStructure = {
  name: string;
  key: string;
  data: MarketOverviewDocumentStructureData[];
};
export type MarketOverviewDocumentStructureData = {
  endpoint: string;
  name: string;
  databaseKey: string;
  provider: string;
};
