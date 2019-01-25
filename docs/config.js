// Docsify Setup
window.$docsify = {
  name: 'keycloak-angular',
  repo: 'ssh://git@github.com/mauriciovigolo/keycloak-angular',
  auto2top: true,
  homepage: 'docs/en/README',
  alias: {},
  coverpage: {
    '/': 'docs/en/_coverpage.md',
    '/pt/': 'docs/pt/_coverpage.md'
  },
  onlyCover: false,
  executeScript: true,
  loadSidebar: true,
  loadNavbar: true,
  maxLevel: 4,
  subMaxLevel: 2,
  search: {
    noData: {
      '/': 'No results!',
      '/pt/': 'Nenhum resultado localizado!'
    },
    paths: 'auto',
    placeholder: {
      '/': 'Search',
      '/pt/': 'Pesquisar'
    }
  },
  formatUpdated: '{MM}/{DD} {HH}:{mm}',
  plugins: [],
  notFoundPage: {
    '/': 'docs/en/_404.md'
  }
};

// Service Worker Registration
// if (typeof navigator.serviceWorker !== 'undefined') {
//   navigator.serviceWorker.register('sw.js');
// }
