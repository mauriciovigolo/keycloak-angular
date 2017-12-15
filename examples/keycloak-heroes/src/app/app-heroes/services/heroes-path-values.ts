import { environment } from '../../../environments';

const dotaApi = environment.apis.dota;
const heroesApi = `${dotaApi}'/heroes`;

const pathValues = {
  dotaApi,
  heroesApi
};

export { pathValues };
