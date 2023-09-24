import { firestore } from 'firebase-admin';

/**
 * usage: .withConverter(assignTypes<DataSnapshot<SymbolOwnershipHolders[]>>());
 *
 * @returns
 */
export const assignTypes = <T extends object>() => {
  return {
    toFirestore(doc: T): firestore.DocumentData {
      return doc;
    },
    fromFirestore(snapshot: firestore.QueryDocumentSnapshot): T | undefined {
      return snapshot.data() as T | undefined;
    },
  };
};

export type DataSnapshot<T> = {
  lastUpdate: string;
  data: T;
};
