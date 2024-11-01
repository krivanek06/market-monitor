import { animate, style, transition, trigger } from '@angular/animations';

export const animationValueChange = trigger('valueChange', [
  transition(':increment', [
    animate(
      '700ms',
      style({
        color: 'var(--success)',
        // transform: 'scale(1.1, 1.1)',
      }),
    ),
    animate('500ms'),
  ]),

  transition(':decrement', [
    animate(
      '700ms',
      style({
        color: 'var(--danger)',
        //   transform: 'scale(0.9, 0.9)',
      }),
    ),
    animate('500ms'),
  ]),
]);
