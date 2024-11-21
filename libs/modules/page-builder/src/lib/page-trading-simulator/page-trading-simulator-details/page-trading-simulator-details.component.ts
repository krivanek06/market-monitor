import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { PageTradingSimulatorBaseComponent } from '../base/page-trading-simulator-base.component';

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
export class PageTradingSimulatorDetailsComponent extends PageTradingSimulatorBaseComponent {
  readonly simulatorDataTopParticipants = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorByIdTopParticipants(selectedId)),
    ),
  );

  readonly simulatorDataParticipant = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) =>
        this.tradingSimulatorService.getTradingSimulatorByIdParticipantById(
          selectedId,
          this.authenticationUserStoreService.state.getUser().uid,
        ),
      ),
    ),
  );

  constructor() {
    super();

    effect(() => {
      console.log('PageTradingSimulatorDetailsComponent', {
        simulatorDataTopParticipants: this.simulatorDataTopParticipants(),
        simulatorDataParticipant: this.simulatorDataParticipant(),
      });
    });
  }
}
