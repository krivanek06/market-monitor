import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TradingSimulatorApiService } from '@mm/api-client';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { delay, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-trading-simulator-details',
  standalone: true,
  imports: [],
  template: `
    <div class="grid grid-cols-4 gap-x-10">
      <div>left side</div>

      <div class="col-span-3">right side</div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorDetailsComponent {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly router = inject(Router);

  private readonly simulatorId$ = inject(ActivatedRoute).params.pipe(map((params) => params['id'] as string));

  readonly simulatorData = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorApiService.getTradingSimulatorById(selectedId)),
    ),
  );

  readonly simulatorDataSymbols = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorApiService.getTradingSimulatorByIdSymbols(selectedId)),
    ),
  );

  readonly simulatorDataTransactions = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) =>
        this.tradingSimulatorApiService.getTradingSimulatorByIdTransactionAggregation(selectedId),
      ),
    ),
  );

  readonly simulatorDataTopParticipants = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorApiService.getTradingSimulatorByIdTopParticipants(selectedId)),
    ),
  );

  readonly simulatorDataParticipant = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) =>
        this.tradingSimulatorApiService.getTradingSimulatorByIdParticipantById(
          selectedId,
          this.authenticationUserStoreService.state.getUser().uid,
        ),
      ),
    ),
  );

  constructor() {
    // check if simulator exists
    of(null)
      .pipe(
        delay(3000),
        map(() => this.simulatorData()),
      )
      .subscribe((res) => {
        if (!res) {
          this.dialogServiceUtil.showNotificationBar('Trading simulator not found', 'error');
          this.router.navigateByUrl(ROUTES_MAIN.TRADING_SIMULATOR);
        }
      });

    // log changes
    effect(() => {
      console.log('PageTradingSimulatorDetailsComponent', {
        simulatorData: this.simulatorData(),
        simulatorDataSymbols: this.simulatorDataSymbols(),
        simulatorDataTransactions: this.simulatorDataTransactions(),
        simulatorDataTopParticipants: this.simulatorDataTopParticipants(),
        simulatorDataParticipant: this.simulatorDataParticipant(),
      });
    });
  }
}
