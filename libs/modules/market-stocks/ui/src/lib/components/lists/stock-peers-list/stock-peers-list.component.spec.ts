import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockPeersListComponent } from './stock-peers-list.component';

describe('StockPeersListComponent', () => {
  let component: StockPeersListComponent;
  let fixture: ComponentFixture<StockPeersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockPeersListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockPeersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
