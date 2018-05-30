import { environment } from '../../environments';

const dotaApi = environment.apis.dota;
const dotaImages = environment.assets.dotaImages;
const heroesApi = `${dotaApi}/heroes`;
const heroesImages = `${dotaImages}/heroes`;

const pathValues = {
  dotaApi,
  heroesApi,
  heroesImages,
};

export { pathValues };
