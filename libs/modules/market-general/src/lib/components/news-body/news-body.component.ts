import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { News } from '@market-monitor/api-types';
import { DefaultImgDirective } from '@market-monitor/shared-directives';
import { DateAgoPipe } from '@market-monitor/shared-pipes';

@Component({
  selector: 'app-news-body',
  standalone: true,
  imports: [CommonModule, DefaultImgDirective, DateAgoPipe],
  templateUrl: './news-body.component.html',
  styleUrls: ['./news-body.component.scss'],
})
export class NewsBodyComponent {
  @Input({ required: true }) news!: News;
  @Input() additionalClasses: string = '';
}
