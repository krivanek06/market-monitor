export type LocalStorageData = {
  /** if user created demo account */
  demoAccount?: {
    email: string;
    password: string;
    createdDate: string;
  };
};

export type LocalStorageKeysVersion = LocalStorageData & {
  version: number;
};

export const storageInitialData: LocalStorageData = {
  demoAccount: undefined,
};
