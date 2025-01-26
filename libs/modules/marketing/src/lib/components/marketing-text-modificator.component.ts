import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { concatMap, delay, from, of, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-marketing-text-modificator',
  imports: [],
  template: `<span (mouseenter)="onMouseEnter()">{{ displayText() || originalText() }}</span>`,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketingTextModificatorComponent {
  readonly originalText = input<string>('');
  readonly LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  readonly totalIterations = 50;

  private readonly triggerTextMsh$ = new Subject<string>();

  readonly displayText = toSignal(
    this.triggerTextMsh$.pipe(
      switchMap((originalText) =>
        from(this.shuffleText(originalText)).pipe(concatMap((text) => of(text).pipe(delay(50)))),
      ),
    ),
  );

  private shuffleText(originalText: string) {
    // create masked text => XXXX
    const maskedText = originalText
      .split('')
      .map((d) => (d === ' ' ? ' ' : 'X'))
      .join('');

    // from original => XXXX
    const mask1 = originalText.split('').map((_, index) => {
      const beginning = maskedText.slice(0, index + 1);
      const rest = originalText.slice(index + 1);
      return beginning + rest;
    });

    // from XXXX => some kind of mesh
    const mask2 = Array.from({ length: originalText.length * 3 }).reduce(
      (acc: string[], _, index) => {
        const prevWord = acc.at(-1) as string;
        const letterIndexToReplace = index % originalText.length;
        const randomLetter = this.LETTERS[Math.floor(Math.random() * 26)];

        return [
          ...acc,
          prevWord.slice(0, letterIndexToReplace) + randomLetter + prevWord.slice(letterIndexToReplace + 1),
        ];
      },
      [mask1[mask1.length - 1]] as string[],
    );

    // from some kind of mesh => XXXX
    const mask3 = mask2[mask2.length - 1].split('').map((_, index) => {
      return maskedText.slice(0, index + 1) + mask2[mask2.length - 1].slice(index + 1);
    });

    // from XXX => original
    const mask4 = mask3[mask3.length - 1].split('').map((_, index) => {
      return originalText.slice(0, index + 1) + mask3[mask3.length - 1].slice(index + 1);
    });

    return [...mask1, ...mask2, ...mask3, ...mask4];
  }

  onMouseEnter(): void {
    this.triggerTextMsh$.next(this.originalText());
  }
}
