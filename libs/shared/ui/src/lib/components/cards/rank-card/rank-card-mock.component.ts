import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-rank-card',
  standalone: true,
  template: `<ng-content />`,
})
export class RankCardComponentMock {
  itemClicked = output<void>();
  clickable = input(false);
  image = input<string | null>();
  currentPositions = input<number>();
  positionChange = input<number | undefined | null>();
  cardWidthPx = input<number | null>();
  cardHeightPx = input<number | null>();
}
