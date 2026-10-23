// Send every request for the bare domain to the www version (one canonical URL for SEO).
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === 'crmflowlab.com') {
    url.hostname = 'www.crmflowlab.com';
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
