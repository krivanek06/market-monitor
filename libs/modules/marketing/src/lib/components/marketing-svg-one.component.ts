import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-marketing-svg-one',
  imports: [],
  template: `
    <svg viewBox="0 0 189 189" fill="none" xmlns="http://www.w3.org/2000/svg" [class]="addClass()">
      <path
        d="M160.164 128.237C154.697 133.704 145.832 133.704 140.365 128.237L116.228 104.099C110.76 98.6323 110.76 89.7682 116.228 84.3002L140.365 60.1632C145.832 54.6962 154.697 54.6962 160.164 60.1632L184.302 84.3002C189.769 89.7682 189.769 98.6323 184.302 104.099L160.164 128.237ZM48.037 128.237C42.57 133.704 33.705 133.704 28.237 128.237L4.101 104.099C-1.367 98.6323 -1.367 89.7682 4.101 84.3002L28.238 60.1632C33.705 54.6962 42.57 54.6962 48.037 60.1632L72.174 84.3002C77.642 89.7682 77.642 98.6323 72.174 104.099L48.037 128.237ZM104.101 184.3C98.633 189.768 89.769 189.768 84.301 184.3L60.164 160.163C54.697 154.696 54.697 145.831 60.164 140.364L84.302 116.227C89.769 110.759 98.633 110.759 104.101 116.227L128.238 140.364C133.705 145.831 133.705 154.696 128.238 160.163L104.101 184.3ZM104.101 72.1732C98.633 77.6412 89.769 77.6412 84.301 72.1732L60.164 48.0362C54.697 42.5682 54.697 33.7042 60.164 28.2362L84.302 4.10025C89.769 -1.36675 98.633 -1.36675 104.101 4.10025L128.238 28.2382C133.705 33.7052 133.705 42.5693 128.238 48.0373L104.101 72.1732Z"
        fill="url(#paint0_linear_1620_1943)"
      />
      <defs>
        <linearGradient id="paint0_linear_1620_1943" x1="0" y1="0" x2="188.402" y2="0" gradientUnits="userSpaceOnUse">
          <stop stop-color="#061418" />
          <stop offset="0.48" stop-color="#0C3541" />
          <stop offset="1" stop-color="#0E7490" />
        </linearGradient>
      </defs>
    </svg>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingSvgOneComponent {
  readonly addClass = input<string>('');
}
