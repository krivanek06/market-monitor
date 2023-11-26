import {
  GroupData,
  GroupMembersData,
  GroupPortfolioStateSnapshotsData,
  GroupTransactionsData,
} from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypesServer } from './assign-type';

export const groupsCollectionRef = () => firestore().collection('groups').withConverter(assignTypesServer<GroupData>());

export const groupDocumentRef = (groupId: string) =>
  groupsCollectionRef().doc(groupId).withConverter(assignTypesServer<GroupData>());

export const groupCollectionMoreInformationRef = (groupId: string) =>
  groupDocumentRef(groupId).collection('more_information');

export const groupDocumentTransactionsRef = (groupId: string) =>
  groupCollectionMoreInformationRef(groupId)
    .doc('transactions')
    .withConverter(assignTypesServer<GroupTransactionsData>());

export const groupDocumentMembersRef = (groupId: string) =>
  groupCollectionMoreInformationRef(groupId).doc('members').withConverter(assignTypesServer<GroupMembersData>());

/**
 *
 * @param groupId
 * @returns - historical snapshots of the group portfolio state for each day
 */
export const groupDocumentPortfolioStateSnapshotsRef = (groupId: string) =>
  groupCollectionMoreInformationRef(groupId)
    .doc('portfolio_snapshots')
    .withConverter(assignTypesServer<GroupPortfolioStateSnapshotsData>());
