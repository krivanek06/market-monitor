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
import { GroupApiService } from '@market-monitor/api-client';
import { GroupData } from '@market-monitor/api-types';
import { GroupDisplayItemComponent } from '@market-monitor/modules/group/ui';
import { DefaultImgDirective, RangeDirective } from '@market-monitor/shared/ui';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-group-search-control',
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
    GroupDisplayItemComponent,
  ],
  template: `
    <mat-form-field class="w-full">
      <mat-label>Search Group by Name</mat-label>
      <input
        type="text"
        placeholder="Enter Group Name"
        aria-label="Text"
        matInput
        [formControl]="searchControl"
        [matAutocomplete]="auto"
      />
      <mat-icon matPrefix>search</mat-icon>
      <mat-autocomplete
        #auto="matAutocomplete"
        (optionSelected)="onSelect($event)"
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
          <mat-option *ngFor="let group of optionsSignal(); let last = last" [value]="group" class="py-2 rounded-md">
            <app-group-display-item [groupData]="group" />
            <div *ngIf="!last" class="mt-2">
              <mat-divider></mat-divider>
            </div>
          </mat-option>
        </ng-container>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      ::ng-deep .mat-mdc-form-field-infix {
        height: 48px !important;
        min-height: 48px !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: GroupSearchControlComponent,
      multi: true,
    },
  ],
})
export class GroupSearchControlComponent implements ControlValueAccessor {
  showLoadingIndicator = signal<boolean>(false);
  optionsSignal = signal<GroupData[]>([]);
  searchControl = new FormControl<string>('', { nonNullable: true });

  groupApiService = inject(GroupApiService);

  onChange: (value: GroupData) => void = () => {};
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
          this.groupApiService.getGroupByName(value).pipe(
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

  displayProperty = (groupData: GroupData) => '';

  onSelect(event: MatAutocompleteSelectedEvent) {
    const groupData = event.option.value as GroupData | undefined;
    if (!groupData) {
      return;
    }
    this.onChange(groupData);
  }

  /**
   *  parent component adds value to child
   */
  writeValue(data?: GroupData): void {}

  /**
   * method to notify parent that the value (disabled state) has been changed
   */
  registerOnChange(fn: GroupSearchControlComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * method to notify parent that form control has been touched
   */
  registerOnTouched(fn: GroupSearchControlComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
