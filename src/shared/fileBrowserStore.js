let lastUrl = null;

export function setFileBrowserUrl(url) {
  lastUrl = url;
}

export function getFileBrowserUrl() {
  return lastUrl;
}
