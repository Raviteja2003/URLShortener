// src/components/StatsPage.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function StatsPage({ code }: { code: string }) {
  // If code is somehow undefined (should never happen after the fix), show loading
  if (!code) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-lg text-gray-600">Loading stats…</p>
      </div>
    );
  }

  const { data: link, error, isLoading } = useSWR(`/api/links/${code}`, fetcher, {
    refreshInterval: 3000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-lg text-gray-600">Loading stats…</p>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-2xl text-gray-600 mb-4">Link not found</p>
          <a href="/" className="text-blue-600 hover:underline">← Back to Dashboard</a>
        </div>
      </div>
    );
  }

  const createdAt = new Date(link.createdAt);
  const lastClicked = link.lastClicked ? new Date(link.lastClicked) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-8">Link Statistics</h1>
        <div className="space-y-6 text-lg">
          <div>
            <p className="text-gray-500">Short Code</p>
            <p className="font-mono text-2xl">{link.code}</p>
          </div>
          <div>
            <p className="text-gray-500">Target URL</p>
            <p className="break-all">{link.targetUrl}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Clicks</p>
            <p className="text-4xl font-bold text-blue-600">{link.clicks}</p>
          </div>
          <div>
            <p className="text-gray-500">Last Clicked</p>
            <p>{lastClicked ? formatDistanceToNow(lastClicked, { addSuffix: true }) : 'Never'}</p>
          </div>
          <div>
            <p className="text-gray-500">Created</p>
            <p>{createdAt.toLocaleString()}</p>
          </div>
        </div>
        <a href="/" className="mt-10 inline-block text-blue-600 hover:underline">
          ← Back to Dashboard
        </a>
      </div>
    </div>
  );
}