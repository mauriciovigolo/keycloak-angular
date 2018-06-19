// Docsify Setup
window.$docsify = {
  name: 'keycloak-angular',
  repo: 'ssh://git@github.com/mauriciovigolo/keycloak-angular',
  auto2top: true,
  homepage: '_home.md',
  alias: {},
  coverpage: {
    '/': '_coverpage.md'
  },
  onlyCover: false,
  executeScript: true,
  loadSidebar: true,
  loadNavbar: true,
  maxLevel: 4,
  subMaxLevel: 2,
  ga: '',
  search: {
    noData: {
      '/': 'No results!'
    },
    paths: 'auto',
    placeholder: {
      '/': 'Search'
    }
  },
  formatUpdated: '{MM}/{DD} {HH}:{mm}',
  plugins: [],
  languages: [{ label: 'English', code: 'uk', lang: 'en', default: true }],
  fallbackLanguages: ['en'],
  notFoundPage: {
    '/': '_404.md'
  }
};

$docsify.addLanguages = options => {
  const { code, label, lang, searchNoData, searchPlaceholder, navbar, footer } = options;
  /**
   *
   */
  window.$docsify.alias[`/${lang}/`] = `/${lang}/_home.html`;
  /**
   *
   * @type {string}
   */
  window.$docsify.coverpage[`/${lang}/`] = '_coverpage.md';
  /**
   *
   * @type {string}
   */
  window.$docsify.search.noData[`/${lang}/`] = searchNoData;
  /**
   *
   * @type {string}
   */
  window.$docsify.search.placeholder[`/${lang}/`] = searchPlaceholder;
  /**
   *
   */
  window.$docsify.fallbackLanguages.push(lang);
  /**
   *
   */
  window.$docsify.navbar[lang] = navbar;
  /**
   *
   */
  window.$docsify.footer[lang] = footer;
  /**
   *
   * @type {string}
   */
  window.$docsify.notFoundPage[`/${lang}/`] = '/pt/_404.md';

  window.$docsify.languages.push({
    code,
    label,
    lang
  });
};

// Service Worker Registration
if (typeof navigator.serviceWorker !== 'undefined') {
  navigator.serviceWorker.register('sw.js');
}
