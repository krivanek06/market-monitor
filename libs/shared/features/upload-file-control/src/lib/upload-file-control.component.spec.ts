import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mockCreateUser } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { of } from 'rxjs';
import { UploadFileControlComponent } from './upload-file-control.component';

describe('UploadFileControlComponent', () => {
  const mockUser = mockCreateUser();

  beforeEach(() => {
    return MockBuilder(UploadFileControlComponent)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(NoopAnimationsModule)
      .keep(MatButtonModule)
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showNotificationBar: jest.fn(),
          handleError: jest.fn(),
        },
      })
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => mockUser,
          },
        },
      })
      .provide({
        provide: ChangeDetectorRef,
        useValue: {
          detectChanges: jest.fn(),
        },
      })
      .provide({
        provide: HttpClient,
        useValue: {
          post: jest.fn().mockReturnValue(of()),
        },
      });
  });

  it('should create', () => {
    const fixture = MockRender(UploadFileControlComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
