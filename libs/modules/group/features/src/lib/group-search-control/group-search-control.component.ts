import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AggregationApiService, GroupApiService } from '@mm/api-client';
import { GroupData } from '@mm/api-types';
import { GroupDisplayItemComponent } from '@mm/group/ui';
import { DefaultImgDirective, RangeDirective } from '@mm/shared/ui';
import { catchError, debounceTime, distinctUntilChanged, filter, of, startWith, switchMap } from 'rxjs';

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
        <!-- loaded data -->
        @for (group of optionsSignal(); let last = $last; track group.id) {
          <mat-option [value]="group" class="py-2 rounded-md">
            <app-group-display-item [groupData]="group" />
            <div *ngIf="!last" class="mt-2">
              <mat-divider></mat-divider>
            </div>
          </mat-option>
        }
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }

    ::ng-deep .mat-mdc-form-field-infix {
      height: 48px !important;
      min-height: 48px !important;
    }
  `,
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
  private groupApiService = inject(GroupApiService);
  private aggregationApiService = inject(AggregationApiService);

  selectedEmitter = output<GroupData>();
  searchControl = new FormControl<string>('', { nonNullable: true });
  optionsSignal = toSignal(
    this.searchControl.valueChanges.pipe(
      startWith(''),
      filter((d) => d.length < 10),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap((value) =>
        value.length > 0
          ? this.groupApiService.getGroupByName(value).pipe(
              //tap(console.log),
              catchError((e) => {
                console.log(e);
                return [];
              }),
            )
          : of(
              this.aggregationApiService
                .hallOfFameGroups()
                ?.bestPortfolio.map((d) => d.item)
                .slice(0, 10) ?? [],
            ),
      ),
    ),
    { initialValue: [] },
  );

  onChange: (value: GroupData) => void = () => {};
  onTouched = () => {};

  displayProperty = (groupData: GroupData) => '';

  onSelect(event: MatAutocompleteSelectedEvent) {
    const groupData = event.option.value as GroupData | undefined;
    if (!groupData) {
      return;
    }
    this.onChange(groupData);
    this.selectedEmitter.emit(groupData);
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
