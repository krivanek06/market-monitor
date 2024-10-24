import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, TemplateRef, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { DialogCloseHeaderComponent } from '../../headers';

export type InfoSectionData = {
  title: string;
  description?: string;
  info: {
    title: string;
    description: string;
  }[];
};

@Component({
  selector: 'app-info-section',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, NgTemplateOutlet, MatIconModule, DialogCloseHeaderComponent],
  template: `
    @if (infoDisplay() === 'dialog') {
      <button mat-stroked-button type="button" (click)="onOpenDialog()" class="w-full">
        <mat-icon>info</mat-icon>
        {{ buttonLabel() }}
      </button>
    } @else {
      <ng-template [ngTemplateOutlet]="infoList" />
    }

    <ng-template #infoList>
      <div class="w-full lg:min-w-[700px]">
        <!-- header -->
        <div class="flex items-center justify-between p-3">
          <h2 class="text-wt-primary mb-0 text-xl">Info Section</h2>

          <button mat-icon-button mat-dialog-close color="warn" type="button">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <mat-dialog-content>
          @for (item of infoData(); track $index) {
            <div class="mb-2 p-3">
              <div class="text-wt-primary text-lg">{{ item.title }}</div>

              <!-- description -->
              @if (item.description) {
                <div class="mb-4 text-sm" [innerText]="item.description"></div>
              }

              <!-- items -->
              @for (info of item.info; track $index) {
                <div class="g-item-wrapper">
                  <span class="min-w-[160px] max-w-[160px]">{{ info.title }}</span>
                  <span class="flex-1">{{ info.description }}</span>
                </div>
              }
            </div>
          }
        </mat-dialog-content>
        <mat-dialog-actions>
          <div class="g-mat-dialog-actions-end">
            <button type="button" mat-flat-button mat-dialog-close>Cancel</button>
          </div>
        </mat-dialog-actions>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoSectionComponent {
  private readonly dialog = inject(MatDialog);

  readonly infoDisplay = input<'dialog' | 'list'>('dialog');
  readonly buttonLabel = input<string>('Info');
  readonly infoData = input.required<InfoSectionData[]>();

  readonly infoList = viewChild('infoList', { read: TemplateRef<HTMLElement> });

  onOpenDialog() {
    const infoList = this.infoList();

    if (!infoList) {
      return;
    }

    this.dialog.open(infoList, {
      panelClass: [SCREEN_DIALOGS.DIALOG_SMALL],
    });
  }
}
