export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type CatchStackParamList = {
  CatchHistory: undefined;
  LogCatch: undefined;
  SpotPicker: { onSelect: (locationId: number, name: string) => void };
  LurePicker: { onSelect: (lureId: number, name: string) => void };
};

export type MapStackParamList = {
  Spots: undefined;
  SpotDetail: { locationId: number; name: string };
  SpotRecs: { locationId: number; region: string };
  SpotConditions: { locationId: number; name: string; latitude: number; longitude: number; town?: string };
};

export type TackleStackParamList = {
  Inventory: undefined;
  CatalogSearch: undefined;
  AddCustomLure: undefined;
  Recommendations: undefined;
};

export type StatsStackParamList = {
  Stats: undefined;
};
