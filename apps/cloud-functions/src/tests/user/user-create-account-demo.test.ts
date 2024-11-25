import { CreateDemoAccountService } from '../../user/user-create-account-demo';

describe('CreateDemoAccountService', () => {
  let service: CreateDemoAccountService;

  beforeEach(() => {
    service = new CreateDemoAccountService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
