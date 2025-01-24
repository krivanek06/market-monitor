import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { delay, expand, of, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-marketing-text-modificator',
  imports: [],
  template: `<span>{{ displayText() }}</span>`,
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

  readonly displayText = toSignal(
    toObservable(this.originalText).pipe(
      switchMap((originalText) =>
        of(originalText).pipe(
          expand((previousTitle, index) => {
            // last iterations - complete the original text
            if (index + originalText.length >= this.totalIterations) {
              const letterIndex = previousTitle.length - (this.totalIterations - index);
              const letter = originalText.at(letterIndex);
              const newRandomTitle =
                previousTitle.slice(0, letterIndex) + letter + previousTitle.slice(letterIndex + 1);
              return of(newRandomTitle).pipe(delay(30));
            }

            // random letter - replace one letter in the title
            const letter = this.LETTERS[Math.floor(Math.random() * 26)];
            const letterIndex = Math.floor(Math.random() * previousTitle.length);
            const newRandomTitle = previousTitle.slice(0, letterIndex) + letter + previousTitle.slice(letterIndex + 1);

            return of(newRandomTitle).pipe(delay(30));
          }),
          take(this.totalIterations + 1),
        ),
      ),
    ),
    { initialValue: this.originalText() },
  );
}
