import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-general-card',
  standalone: true,
  imports: [NgClass, MatCardModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <mat-card appearance="outlined" [class]="additionalClasses() + ' ' + 'h-full shadow-md'">
      <!-- title -->
      @if (title()) {
        <mat-card-header [ngClass]="{ 'justify-center': titleCenter() }">
          <mat-card-title class="flex items-center gap-2">
            @if (titleImgUrl()) {
              <img appDefaultImg [src]="titleImgUrl()" />
            }
            @if (matIcon()) {
              <mat-icon color="primary">{{ matIcon() }}</mat-icon>
            }
            <h2 class="text-wt-primary mb-0 text-lg">
              {{ title() }}
            </h2>
          </mat-card-title>
        </mat-card-header>
      }

      <!-- content -->
      <mat-card-content #matContent>
        @if (showLoadingState()) {
          <div class="grid place-content-center">
            <mat-spinner />
          </div>
        } @else {
          <!-- custom content -->
          <div class="wrapper">
            <ng-content />
          </div>

          <!-- default content -->
          <div class="default">
            <div class="text-wt-gray-medium grid h-[80%] min-h-[150px] place-content-center">
              No data has been found
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: block;
    }
    mat-card-content {
      height: inherit;
    }

    .wrapper:not(:empty) + .default {
      display: none;
    }
  `,
})
export class GeneralCardComponent {
  readonly title = input<string | null>(null);
  readonly titleImgUrl = input<string | undefined>();
  readonly matIcon = input<string | undefined>();
  readonly additionalClasses = input('');
  readonly titleCenter = input(false);
  readonly showLoadingState = input(false);
}
