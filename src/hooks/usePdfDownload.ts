import { useState } from 'react';

/** Object URLs are revoked after this long; enough for the browser to save the file. */
const URL_LIFETIME_MS = 60_000;

/** Generates a PDF in the browser on demand and downloads it, tracking which one is in progress. */
export function usePdfDownload() {
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function download(key: string, fileName: string, render: () => Promise<Blob>) {
    setPendingKey(key);
    setError(null);
    try {
      const url = URL.createObjectURL(await render());
      window.setTimeout(() => URL.revokeObjectURL(url), URL_LIFETIME_MS);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
    } catch {
      setError(`Couldn't generate ${fileName}. Please try again.`);
    } finally {
      setPendingKey(null);
    }
  }

  return { download, pendingKey, error };
}
