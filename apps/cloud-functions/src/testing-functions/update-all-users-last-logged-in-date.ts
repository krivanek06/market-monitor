import { getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import admin from 'firebase-admin';
import { usersCollectionRef } from '../models';

export const updateAllUsersLastLoggedInDate = async () => {
  const usersDocs = await usersCollectionRef().get();
  const batch = admin.firestore().batch();
  usersDocs.forEach((user) => {
    batch.update(user.ref, { lastLoginDate: getCurrentDateDefaultFormat(), isAccountActive: true });
  });
  await batch.commit();
};
