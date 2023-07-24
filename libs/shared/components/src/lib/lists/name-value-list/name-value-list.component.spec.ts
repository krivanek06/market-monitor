import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NameValueListComponent } from '../name-value-item/name-value-item.component';

describe('NameValueListComponent', () => {
  let component: NameValueListComponent;
  let fixture: ComponentFixture<NameValueListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NameValueListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NameValueListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
