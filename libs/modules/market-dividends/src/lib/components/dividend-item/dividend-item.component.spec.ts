import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DividendItemComponent } from './dividend-item.component';

describe('DividendItemComponent', () => {
  let component: DividendItemComponent;
  let fixture: ComponentFixture<DividendItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DividendItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DividendItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
