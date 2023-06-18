import { firestore } from 'firebase-admin';

export const assignTypes = <T extends object>() => {
	return {
		toFirestore(doc: T): firestore.DocumentData {
			return doc;
		},
		fromFirestore(snapshot: firestore.QueryDocumentSnapshot): T {
			return snapshot.data()! as T;
		},
	};
};
