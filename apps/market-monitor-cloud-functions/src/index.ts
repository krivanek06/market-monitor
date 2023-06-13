import { TestingInterface } from '@market-monitor/shared-types';
// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
import * as functions from 'firebase-functions';

// The Firebase Admin SDK to access Firebase Features from within Cloud Functions.
import * as admin from 'firebase-admin';
import { DATABASE_URL } from './environments';

const serviceAccount: admin.ServiceAccount = {
  projectId: 'market-monitor-prod',
  privateKey:
    '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDPmLnDjXtNPv0t\nWe5ZDo9qD8CPZ1KR9YPXomXPwcT74G0MQZfxvbfV19gcXClBWHHJf920yhRFc52N\n6/WoUWEWGOegSpCCPDBSy/f308vZLujMcxKbVGtFsJB5BI565+arQs1aWKC06Axd\nn3ClOwntaLC6ZtuSzGgdLjAOE2lYUv0B6iQ4bnGFrt5RU+wePRyiGQGrtSzunHnh\nnMl5UvNsQ6LToS2E32jmu15hAl5sDFAIPTWxPJip5a8Dkw23obWVktGy8ESJaXAB\nRAntsZcjxP6CDopdE2AUot0Wzf/rK+CFDmuFF3giYVpzGZYbDQXApP6aeaB6Blhe\n6/ehOzOnAgMBAAECggEABEmRsJW38bD21pxwXTt9P8IChpOqM2SALBBpDODiGheY\n+PNT2YTDCrIR/wfyPCzA8NnosMapo4OPQfKZGLhRinzKL9fKYz4t+0/GF8Kyh5I9\n8ZcAz99u9bn/SdiLvsMSUwAmsJJ7AzF1q+tSjr8I5fPPDpJ4P3BkSBH/oRLKjq3i\njHzwjyyAEHYefG0NJjVKIB1OyDZybSb6rgjLG/IoGqVgf+6fFKMTJw4DMWyZbVtu\nJGAURYNqXPncAiA9ggin7X45RUm0TvXouALsy6cGLvsEaflidcJZNIqIq0msw1A5\ne8Z6RE01Oj9yAKPa9Y9yrrMmurzwww8WnMrs5UB+6QKBgQD1KUX5hEKjl17UQAcK\nMJ20NjgN2XCkAPuB3z3D3G4d6pp7FvhwOJIgXnGJV9QgV8tJJkDGajblgzHSq8uH\npKe5/FlnX0bihVEAr6YyEp06kte6WRI0/UgVUh7A1MHv8RpjKkbpT18ScqdPjR3A\n7NeQnpiw5mibWPS+KjBdZeNdSQKBgQDYxkwE2r6IDRuQKKbmCknyy4BSYxrl3xU6\nBCxOMnPojWQXgdBcmVjEHEI4QFqfrub/KjIHI4X1p3bdw6LmY4TRfKK3TeXLbhEe\nehCv7si8peIggkwpp+R0S/me5HPj6NvoN+P3VC0vaW3FqEGzb2KFdzEy9gtAVHLJ\nm54Pp1y5bwKBgDTearWtXQWUXiHdkOcUpt23F419B7qGb7aJIvO69JBFCH1k7byd\npn2OgGOC6j7zT+Z9dliTjTUffr4UyDZ/PqBwGAOf21R8NYS1XFzOANQh2J3aGYAN\n4t6eL/2bpBsPXoZmFpa3xCPhT81q/DCforkQSpNTjNl7bIQZ6wYpM8fpAoGAKuxx\nBxENY0E9MPlruudUpzf2i9nF7LiUqm1DHKTO4MCGjkUNLhjLQ+HYluzfRPlMEkCX\nsWQuVWs4lUb0zavtE9IbIjLRisubpi5DeaLNqtUqBofmbuUozoJwxi60Z++nA791\na3cGj3nP27Cqec5XctgcLNwddDqElDk1PiJEsQ8CgYEA0xk+Hyg4TkkGZlSd9kIj\nVb6wYNh/VN6GH/MjEaro6G+EsadNd8BW/WLuaQqd4oC3dXe+nB5LCdTGG1XYFNR0\n6SLAJi5DzYN8XxGN5QjkTVJaszEod0h2w5+fMjOLSUcsYh/BB/UxcaNqYLqOdSn4\n+chHvCULD9lNwpmZQDcVFBc=\n-----END PRIVATE KEY-----\n',
  clientEmail:
    'firebase-adminsdk-knos0@market-monitor-prod.iam.gserviceaccount.com',
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DATABASE_URL,
});

// Set up extra settings. Since May 29, 2020, Firebase Firebase Added support for
// calling FirebaseFirestore.settings with { ignoreUndefinedProperties: true }.
// When this parameter is set, Cloud Firestore ignores undefined properties
// inside objects rather than rejecting the API call.
admin.firestore().settings({
  ignoreUndefinedProperties: true,
});

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });

  const test: TestingInterface = {
    name: 'yolo - test',
  };

  response.send(test);
});
