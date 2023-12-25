import { onCall } from 'firebase-functions/v2/https';

export const userDeleteAccountCall = onCall(async (request) => {
  const userResetId = request.data as any;
  const userAuthId = request.auth?.uid;
});
