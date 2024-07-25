import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-page-app-loading',
  standalone: true,
  template: `
    <div class="c-wrapper grid h-screen w-screen place-content-center">
      <div class="wave"></div>
      <div class="wave"></div>
      <div class="wave"></div>

      <div class="loader"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .c-wrapper {
      margin: auto;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      overflow: auto;
      background: linear-gradient(315deg, #121212 10%, #0a1e2f 38%, #050505 98%);
      animation: gradient 6s ease infinite;
      background-size: 400% 400%;
      background-attachment: fixed;
    }

    @keyframes gradient {
      0% {
        background-position: 0% 0%;
      }
      50% {
        background-position: 100% 100%;
      }
      100% {
        background-position: 0% 0%;
      }
    }

    .wave {
      background: rgb(255 255 255 / 25%);
      border-radius: 1000% 1000% 0 0;
      position: fixed;
      width: 200%;
      height: 12em;
      animation: wave 10s -3s linear infinite;
      transform: translate3d(0, 0, 0);
      opacity: 0.8;
      bottom: 0;
      left: 0;
      z-index: -1;
    }

    .wave:nth-of-type(2) {
      bottom: -1.25em;
      animation: wave 18s linear reverse infinite;
      opacity: 0.8;
    }

    .wave:nth-of-type(3) {
      bottom: -2.5em;
      animation: wave 20s -1s reverse infinite;
      opacity: 0.9;
    }

    @keyframes wave {
      2% {
        transform: translateX(1);
      }

      25% {
        transform: translateX(-25%);
      }

      50% {
        transform: translateX(-50%);
      }

      75% {
        transform: translateX(-25%);
      }

      100% {
        transform: translateX(1);
      }
    }

    .loader {
      width: 60px;
      height: 60px;
      display: grid;
      animation: l6-0 1.5s infinite linear;
    }
    .loader:before,
    .loader:after {
      content: '';
      grid-area: 1/1;
      background: #c6deeb;
      animation:
        l6-1 1.5s infinite linear,
        l6-2 1.5s infinite linear;
    }
    .loader:after {
      --s: -1;
      animation-direction: reverse;
    }
    @keyframes l6-0 {
      0%,
      9%,
      91%,
      100% {
        background: #c6deeb;
      }
      10%,
      90% {
        background: #0000;
      }
    }
    @keyframes l6-1 {
      0%,
      33% {
        clip-path: polygon(0 0, 50% 100%, 100% 0, 100% 100%, 0 100%);
      }
      66%,
      100% {
        clip-path: polygon(50% 0, 50% 100%, 50% 0, 100% 100%, 0 100%);
      }
    }
    @keyframes l6-2 {
      0%,
      10%,
      90%,
      100% {
        transform: scale(var(--s, 1)) translateY(0);
      }
      33%,
      66% {
        transform: scale(var(--s, 1)) translateY(50%);
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageAppLoadingComponent {}
