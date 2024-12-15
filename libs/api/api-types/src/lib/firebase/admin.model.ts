import { ExtractedType } from '../ts-utils';

export type AdminGeneralActions =
  | {
      type: 'adminResetUserTransactions';
      userId: string;
    }
  | {
      type: 'adminDeleteGroup';
      groupId: string;
    };

export type AdminGeneralActionsType<T extends AdminGeneralActions['type']> = ExtractedType<AdminGeneralActions, T>;
