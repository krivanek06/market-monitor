export type LocalStorageData = {
  /** if user created demo account */
  demoAccount?: {
    email: string;
    password: string;
    createdDate: string;
  };
  /** true if should show loader on the whole app */
  loader: {
    enabled: boolean;
  };
};

export type LocalStorageKeysVersion = LocalStorageData & {
  version: number;
};

export const storageInitialData: LocalStorageData = {
  demoAccount: undefined,
  loader: {
    enabled: false,
  },
};
