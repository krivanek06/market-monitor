import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'market-monitor-root',
  templateUrl: './app.component.html',
  styles: [''],
})
export class AppComponent {
  title = 'market-monitor-dashboard';
}
