import { Component } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styles: [''],
})
export class AppComponent {
  constructor(firestore: Firestore) {}
  title = 'market-monitor-dashboard';
}
