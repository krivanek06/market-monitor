import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogCloseHeaderComponent } from '@market-monitor/shared/ui';

export type GenericDialogComponentData =
  | {
      title?: string;
      /**
       * The component to render inside the dialog
       */
      component: Type<unknown>;
      /**
       * The data to pass to the component
       */
      componentData?: Record<string, any>;
    }
  | {
      title?: string;
      templateRef: TemplateRef<unknown>;
    };

@Component({
  selector: 'app-generic-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, DialogCloseHeaderComponent],
  template: `
    <app-dialog-close-header [title]="data.title ?? ''" />
    <mat-dialog-content>
      <ng-container #container></ng-container>
    </mat-dialog-content>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenericDialogComponent implements OnInit {
  @ViewChild('container', { read: ViewContainerRef, static: true }) vrc!: ViewContainerRef;

  constructor(
    private dialogRef: MatDialogRef<GenericDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenericDialogComponentData,
  ) {}

  ngOnInit(): void {
    // check if provided view is ng-template
    if (this.hasTemplateRef(this.data)) {
      this.vrc.createEmbeddedView(this.data.templateRef);
      return;
    }

    // Insert the component into the template
    const component = this.vrc.createComponent<any>(this.data.component);

    // pass data to the component
    const inputData = this.data.componentData ?? {};
    Object.keys(inputData).forEach((key) => {
      component.instance[key] = inputData[key];
    });
  }

  private hasTemplateRef(data: GenericDialogComponentData): data is { templateRef: TemplateRef<unknown> } {
    return (data as { templateRef: TemplateRef<unknown> }).templateRef !== undefined;
  }
}
