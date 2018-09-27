import { GenericConfig } from './generic.config';

describe('=> GenericConfig', () => {
  let genericConfig;

  beforeAll(() => {
    genericConfig = new GenericConfig();
  });

  describe('#constructor', () => {
    it('Should be initialized', () => {
      expect(genericConfig).toBeDefined();
    });
  });

  describe('#_findFiles', () => {
    it('Should find route files', async () => {
      let files = await genericConfig._findFiles('**/*.route.js');
      expect(files.length).toBeGreaterThan(0);
    });
  });
});
