// Send every request for the bare domain to the www version (one canonical URL for SEO).
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'crmflowlab.com') {
    url.hostname = 'www.crmflowlab.com';
    return Response.redirect(url.toString(), 301);
  }
  // Old blog slug moved: keep any existing links and search results working.
  if (url.pathname === '/blog/gohighlevel-for-dental-practices' || url.pathname === '/blog/gohighlevel-for-dental-practices.html') {
    url.pathname = '/blog/dental-practice-crm-automation';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
