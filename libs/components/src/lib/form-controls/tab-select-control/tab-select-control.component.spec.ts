import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabSelectControlComponent } from './tab-select-control.component';

describe('TabSelectControlComponent', () => {
  let component: TabSelectControlComponent;
  let fixture: ComponentFixture<TabSelectControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabSelectControlComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TabSelectControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
