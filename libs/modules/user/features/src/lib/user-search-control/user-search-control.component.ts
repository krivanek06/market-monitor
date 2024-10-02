import { ChangeDetectionStrategy, Component, inject, model, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AggregationApiService, UserApiService } from '@mm/api-client';
import { UserData } from '@mm/api-types';
import { DefaultImgDirective, RangeDirective } from '@mm/shared/ui';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-user-search-control',
  standalone: true,
  imports: [
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    RangeDirective,
    DefaultImgDirective,
    MatDividerModule,
    MatIconModule,
    UserDisplayItemComponent,
  ],
  template: `
    <mat-form-field class="w-full" [ariaDisabled]="isDisabled()">
      <mat-label>Search user by username</mat-label>
      <input
        type="text"
        placeholder="Enter ticker"
        aria-label="Text"
        matInput
        [formControl]="searchControl"
        [matAutocomplete]="auto"
      />
      <mat-icon matPrefix>search</mat-icon>
      <mat-autocomplete
        #auto="matAutocomplete"
        (optionSelected)="onSelectUser($event)"
        [displayWith]="displayProperty"
        [hideSingleSelectionIndicator]="true"
        [autofocus]="false"
        [autoActiveFirstOption]="false"
      >
        <!-- loaded data -->
        @for (user of optionsSignal(); track user.id; let last = $last) {
          <mat-option [value]="user" class="rounded-md py-2">
            <app-user-display-item [userData]="user" />
            @if (!last) {
              <div class="mt-2">
                <mat-divider />
              </div>
            }
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: UserSearchControlComponent,
      multi: true,
    },
  ],
})
export class UserSearchControlComponent implements ControlValueAccessor {
  private readonly userApiService = inject(UserApiService);
  private readonly aggregationApiService = inject(AggregationApiService);

  readonly selectedEmitter = output<UserData>();
  readonly isDisabled = model<boolean>(false);

  readonly searchControl = new FormControl<string>('', { nonNullable: true });

  readonly optionsSignal = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      filter((d) => d.length < 10),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value) =>
        value.length > 0
          ? this.userApiService.getUsersByName(value).pipe(
              //tap(console.log),
              catchError((e) => {
                console.log(e);
                return of([]);
              }),
            )
          : this.aggregationApiService.hallOfFameUsers$.pipe(
              map((data) => data.bestPortfolio.map((d) => d.item).slice(0, 10) ?? []),
            ),
      ),
    ),
    { initialValue: [] },
  );

  onChange: (value: UserData) => void = () => {};
  onTouched = () => {};

  displayProperty = (userData: UserData) => '';

  onSelectUser(event: MatAutocompleteSelectedEvent) {
    const userData = event.option.value as UserData | undefined;
    if (!userData) {
      return;
    }
    this.onChange(userData);
    this.selectedEmitter.emit(userData);
    this.searchControl.patchValue('');
  }

  /*
    parent component adds value to child
  */
  writeValue(data?: any): void {}

  /*
      method to notify parent that the value (disabled state) has been changed
    */
  registerOnChange(fn: UserSearchControlComponent['onChange']): void {
    this.onChange = fn;
  }

  /*
      method to notify parent that form control has been touched
    */
  registerOnTouched(fn: UserSearchControlComponent['onTouched']): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
}
