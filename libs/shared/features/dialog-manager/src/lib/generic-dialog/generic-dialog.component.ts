import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  inject,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DialogCloseHeaderComponent } from '@mm/shared/ui';

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
  public data = inject<GenericDialogComponentData>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<GenericDialogComponent>>(MatDialogRef);

  // todo: had some problems converting to signal, components were not rendering inside this
  @ViewChild('container', { read: ViewContainerRef, static: true }) vrc!: ViewContainerRef;

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
