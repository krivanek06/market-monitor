import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockUpgradesDowngradesTableComponent } from '../upgrades-downgrades-table/upgrades-downgrades-table.component';

describe('StockUpgradesDowngradesTableComponent', () => {
  let component: StockUpgradesDowngradesTableComponent;
  let fixture: ComponentFixture<StockUpgradesDowngradesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockUpgradesDowngradesTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockUpgradesDowngradesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
