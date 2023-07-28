import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DividendItemsDialogComponent } from './dividend-items-dialog.component';

describe('DividendItemsDialogComponent', () => {
  let component: DividendItemsDialogComponent;
  let fixture: ComponentFixture<DividendItemsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividendItemsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DividendItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
