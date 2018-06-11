import { AmiiboModule } from './amiibo.module';

describe('AmiiboModule', () => {
  let amiiboModule: AmiiboModule;

  beforeEach(() => {
    amiiboModule = new AmiiboModule();
  });

  it('should create an instance', () => {
    expect(amiiboModule).toBeTruthy();
  });
});
