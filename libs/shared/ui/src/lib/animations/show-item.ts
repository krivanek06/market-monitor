import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export const animationShowItemLeft = trigger('showItemLeft', [
  transition('* => *', [
    query(
      ':enter',
      [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        stagger(200, [animate('500ms ease-in', style({ opacity: 1, transform: 'translateX(0px)' }))]),
      ],
      {
        optional: true,
      },
    ),
    query(':leave', [stagger(100, [animate('200ms', style({ opacity: 0 }))])], {
      optional: true,
    }),
  ]),
]);
