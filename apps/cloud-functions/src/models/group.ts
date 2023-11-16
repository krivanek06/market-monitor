import { GroupData } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypesServer } from './assign-type';

export const groupsCollectionRef = () => firestore().collection('groups').withConverter(assignTypesServer<GroupData>());

export const groupDocumentRef = (groupId: string) =>
  groupsCollectionRef().doc(groupId).withConverter(assignTypesServer<GroupData>());
