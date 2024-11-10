import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, contentChild, Directive, inject, input, TemplateRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Directive({
  selector: '[appGeneralCardActionContent]',
  standalone: true,
})
export class GeneralCardActionContentDirective {
  readonly tpl = inject(TemplateRef);
}

@Component({
  selector: 'app-general-card',
  standalone: true,
  imports: [NgClass, MatCardModule, MatIconModule, MatProgressSpinnerModule, NgTemplateOutlet],
  template: `
    <mat-card appearance="outlined" [class]="additionalClasses() + ' ' + 'h-full shadow-md'">
      <!-- title -->
      @if (title()) {
        <mat-card-header>
          <mat-card-title class="flex items-center gap-2">
            @if (titleImgUrl()) {
              <img appDefaultImg [src]="titleImgUrl()" />
            }
            @if (matIcon()) {
              <mat-icon color="primary">{{ matIcon() }}</mat-icon>
            }
            <h2
              class="text-wt-primary mb-0"
              [ngClass]="{
                'text-lg': titleSize() === 'lg',
                'text-base': titleSize() === 'base',
              }"
            >
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
          <div class="wrapper overflow-clip">
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

      <!-- action button -->
      @if (contentAction()) {
        <mat-card-actions>
          <ng-container [ngTemplateOutlet]="contentAction()?.tpl ?? null" />
        </mat-card-actions>
      }
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
  readonly titleSize = input<'lg' | 'base'>('base');
  readonly matIcon = input<string | undefined>();
  readonly additionalClasses = input('');
  //readonly showActionSection = input(false);
  readonly showLoadingState = input(false);

  readonly contentAction = contentChild(GeneralCardActionContentDirective);
}
