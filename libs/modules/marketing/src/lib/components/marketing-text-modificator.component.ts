import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { delay, expand, of, Subject, switchMap, take } from 'rxjs';

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
        of(originalText).pipe(
          expand((previousTitle, index) => {
            // check if last iterations
            const isLastIteration = index + originalText.length >= this.totalIterations;

            const letterIndex = isLastIteration
              ? previousTitle.length - (this.totalIterations - index)
              : Math.floor(Math.random() * previousTitle.length);

            const letter = isLastIteration
              ? originalText.at(letterIndex)
              : this.LETTERS[Math.floor(Math.random() * 26)];

            // create random title or back to original
            const newRandomTitle = previousTitle.slice(0, letterIndex) + letter + previousTitle.slice(letterIndex + 1);

            // return new title
            return of(newRandomTitle).pipe(delay(45));
          }),
          take(this.totalIterations + 1),
        ),
      ),
    ),
  );

  onMouseEnter(): void {
    this.triggerTextMsh$.next(this.originalText());
  }
}
