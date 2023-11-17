import { Injectable } from '@angular/core';
import { httpsCallable } from '@angular/fire/functions';
import { GroupCreateInput, GroupData } from '@market-monitor/api-types';
import { getApp } from 'firebase/app';
import { getFunctions } from 'firebase/functions';

@Injectable({
  providedIn: 'root',
})
export class GroupApiService {
  private functions = getFunctions(getApp());

  constructor() {}

  async createGroup(input: GroupCreateInput): Promise<GroupData> {
    const createGroupWrapper = httpsCallable<GroupCreateInput, GroupData>(this.functions, 'groupCreateCall');
    const result = await createGroupWrapper(input);
    console.log('THIS IS RESULT');
    console.log(result);
    return result.data;
  }
}
