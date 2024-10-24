import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DialogCloseHeaderComponent } from '../../headers';

@Component({
  selector: 'app-help-dialog',
  standalone: true,
  imports: [MatIconModule, MatDialogModule, DialogCloseHeaderComponent, MatButtonModule, MatIconModule],
  template: `
    <app-dialog-close-header title="Help Section" />

    <mat-dialog-content>
      <section class="grid gap-x-10 gap-y-4 lg:grid-cols-2">
        <!-- thank you section -->
        <article>
          <h2>Thank You</h2>
          <p>
            We want to express our sincere gratitude for choosing GGfinance and embark on a journey towards financial
            empowerment. Your trust in our platform means the world to us and we hope you will enjoy your experience
            here and will stay with us on this journey. Thank you.
          </p>
          <p>
            We are a team of young passionate developers who love technologies and finance. Our goal is to create a
            platform where you will be able to view deep insight into your investment strategy. We want to highlight
            that we direct <strong>DO NOT MANAGE</strong> anybody's finances. This application is used for data
            visualization / learning.
          </p>
        </article>
        <!-- Help section -->
        <article>
          <h2>Help</h2>
          <p>
            The application is in its already stage of development. We know it is annoying when you encounter a bug or
            something that is not working exactly as you initially thought. If you have anything you would like to
            report to us, please write a message to <strong>contact.ggfinance.io</strong> .
          </p>
          <p>
            We also appreciate any ideas you may have. As it is an early product, we want to be community-driven. Give
            us your idea, try to describe it as much as possible and we will contact you back.
          </p>
        </article>
      </section>
    </mat-dialog-content>

    <mat-dialog-actions>
      <div class="g-mat-dialog-actions-end">
        <button type="button" mat-flat-button mat-dialog-close>Cancel</button>
      </div>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
    }

    article > p {
      margin-bottom: 12px;
    }
    article > h2 {
      text-align: center;
      font-size: 20px;
      color: var(--primary);
      margin-bottom: 8px !important;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpDialogComponent {}
