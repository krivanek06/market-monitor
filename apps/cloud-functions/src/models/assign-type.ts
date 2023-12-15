import { firestore } from 'firebase-admin';

/**
 * usage: .withConverter(assignTypes<DataSnapshot<SymbolOwnershipHolders[]>>());
 *
 * @returns
 */
export const assignTypesOptional = <T extends object>() => {
  return {
    toFirestore(doc: T): firestore.DocumentData {
      return doc;
    },
    fromFirestore(snapshot: firestore.QueryDocumentSnapshot): T | undefined {
      return snapshot.data() as T | undefined;
    },
  };
};

export const assignTypes = <T extends object>() => {
  return {
    toFirestore(doc: T): firestore.DocumentData {
      return doc;
    },
    fromFirestore(snapshot: firestore.QueryDocumentSnapshot): T {
      return snapshot.data() as T;
    },
  };
};

export type DataSnapshot<T> = {
  lastUpdate: string;
  data: T;
};
