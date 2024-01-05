import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UserApiService } from '@market-monitor/api-client';
import { UserData } from '@market-monitor/api-types';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { DefaultImgDirective, RangeDirective } from '@market-monitor/shared/ui';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';

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
  templateUrl: './user-search-control.component.html',
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
            catchError(() => {
              this.showLoadingIndicator.set(false);
              return [];
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
}
