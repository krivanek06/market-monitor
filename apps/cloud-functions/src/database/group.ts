import {
  GroupData,
  GroupHoldingSnapshotsData,
  GroupMembersData,
  GroupPortfolioStateSnapshotsData,
  GroupTransactionsData,
} from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './assign-type';

export const groupsCollectionRef = () => firestore().collection('groups').withConverter(assignTypes<GroupData>());
export const groupsCollectionDemoAccountRef = () => groupsCollectionRef().where('isDemo', '==', true);
export const groupDocumentRef = (groupId: string) => groupsCollectionRef().doc(groupId);

export const groupCollectionMoreInformationRef = (groupId: string) =>
  groupDocumentRef(groupId).collection('more_information');

export const groupDocumentTransactionsRef = (groupId: string) =>
  groupCollectionMoreInformationRef(groupId).doc('transactions').withConverter(assignTypes<GroupTransactionsData>());

export const groupDocumentMembersRef = (groupId: string) =>
  groupCollectionMoreInformationRef(groupId).doc('members').withConverter(assignTypes<GroupMembersData>());

export const groupDocumentPortfolioStateSnapshotsRef = (groupId: string) =>
  groupCollectionMoreInformationRef(groupId)
    .doc('portfolio_snapshots')
    .withConverter(assignTypes<GroupPortfolioStateSnapshotsData>());

export const groupDocumentHoldingSnapshotsRef = (groupId: string) =>
  groupCollectionMoreInformationRef(groupId)
    .doc('holding_snapshots')
    .withConverter(assignTypes<GroupHoldingSnapshotsData>());
