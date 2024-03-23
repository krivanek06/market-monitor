import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserApiService } from '@mm/api-client';
import { UserData } from '@mm/api-types';
import { DefaultImgDirective, RangeDirective } from '@mm/shared/ui';
import { UserDisplayItemComponent } from '@mm/user/ui';
import { catchError, debounceTime, distinctUntilChanged, filter, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-user-search-control',
  standalone: true,
  imports: [
    CommonModule,
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
        <!-- loading skeleton -->
        <ng-container *ngIf="showLoadingIndicator()">
          <mat-option *ngRange="5" class="h-10 mb-1 g-skeleton"></mat-option>
        </ng-container>

        <!-- loaded data -->
        <ng-container *ngIf="!showLoadingIndicator()">
          <mat-option *ngFor="let user of optionsSignal(); let last = last" [value]="user" class="py-2 rounded-md">
            <app-user-display-item [userData]="user"></app-user-display-item>
            <div *ngIf="!last" class="mt-2">
              <mat-divider></mat-divider>
            </div>
          </mat-option>
        </ng-container>
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
  selectedUserEmitter = output<UserData>();
  isDisabled = model<boolean>(false);

  showLoadingIndicator = signal<boolean>(false);
  optionsSignal = signal<UserData[]>([]);
  searchControl = new FormControl<string>('', { nonNullable: true });

  userApiService = inject(UserApiService);

  onChange: (value: UserData) => void = () => {};
  onTouched = () => {};

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        // check if type is string and not empty
        filter((d) => typeof d === 'string'),
        tap(() => {
          this.showLoadingIndicator.set(true);
          this.optionsSignal.set([]);
        }),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value) =>
          this.userApiService.getUsersByName(value).pipe(
            tap(() => this.showLoadingIndicator.set(false)),
            tap(console.log),
            catchError((e) => {
              console.log(e);
              this.showLoadingIndicator.set(false);
              return of([]);
            }),
          ),
        ),
        tap((data) => this.optionsSignal.set(data)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  displayProperty = (userData: UserData) => '';

  onSelectUser(event: MatAutocompleteSelectedEvent) {
    const userData = event.option.value as UserData | undefined;
    if (!userData) {
      return;
    }
    this.onChange(userData);
    this.selectedUserEmitter.emit(userData);
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
