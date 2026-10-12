// Account links use this site's origin and keep preview-folder navigation valid.
for (const link of document.querySelectorAll('[data-oda-account]')) {
  const root = new URL(link.dataset.odaRoot, document.baseURI);
  const params = new URL(link.href).searchParams;
  const lang = params.get('lang') || 'en';
  const deletion = params.get('deleteAccount') === '1' ? '&deleteAccount=1' : '';
  link.href = `${root.href}${root.pathname === '/' ? 'app/account' : '#/app/account'}?lang=${encodeURIComponent(lang)}${deletion}`;
}
