import { CastToNumberPipe } from './cast-to-number.pipe';

describe('CastToNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new CastToNumberPipe();
    expect(pipe).toBeTruthy();
  });
});
