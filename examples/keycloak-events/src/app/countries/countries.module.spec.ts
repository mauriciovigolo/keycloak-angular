import { CountriesModule } from './countries.module';

describe('CountriesModule', () => {
  let countriesModule: CountriesModule;

  beforeEach(() => {
    countriesModule = new CountriesModule();
  });

  it('should create an instance', () => {
    expect(countriesModule).toBeTruthy();
  });
});
