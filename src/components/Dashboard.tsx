// src/components/Dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';
import useSWR, { mutate } from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const schema = z.object({
  targetUrl: z.string().url('Please enter a valid URL'),
  code: z.string().regex(/^[A-Za-z0-9]{6,8}$/, '6–8 alphanumeric characters').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;
type Link = { id: number; code: string; targetUrl: string; clicks: number; lastClicked: string | null; createdAt: string };

export default function Dashboard() {
  const { data: links = [], error, isLoading } = useSWR<Link[]>('/api/links', fetcher, { refreshInterval: 2000 });
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const body = data.code ? { ...data } : { targetUrl: data.targetUrl };
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const newLink = await res.json();
      toast.success(`Created: ${newLink.code}`);
      reset();
      mutate('/api/links');
    } else {
      const err = await res.json();
      toast.error(err.error || 'Failed');
    }
  };

  const deleteLink = async (code: string) => {
    if (!confirm('Delete this link?')) return;
    await fetch(`/api/links/${code}`, { method: 'DELETE' });
    toast.success('Deleted');
    mutate('/api/links');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const filtered = links.filter(l => l.code.includes(search) || l.targetUrl.includes(search));

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">TinyLink</h1>

        {/* Create Form */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Link</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <input
                {...register('targetUrl')}
                placeholder="https://your-long-url.com"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.targetUrl && <p className="text-red-500 text-sm mt-1">{errors.targetUrl.message}</p>}
            </div>
            <div>
              <input
                {...register('code')}
                placeholder="Custom code (optional)"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="md:col-span-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {isSubmitting ? 'Creating...' : 'Shorten URL'}
            </button>
          </form>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by code or URL..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-3 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Table */}
        {isLoading ? (
          <div className="text-center py-12">Loading links...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-2xl mb-4">No links yet</p>
            <p>Create your first short link above</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Short Code</th>
                  <th className="text-left p-4 font-medium hidden sm:table-cell">Target URL</th>
                  <th className="text-center p-4 font-medium">Clicks</th>
                  <th className="text-center p-4 font-medium hidden md:table-cell">Last Clicked</th>
                  <th className="text-center p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(link => (
                  <tr key={link.id} className="border-t hover:bg-gray-50">
                    <td className="p-4 font-mono">{link.code}</td>
                    <td className="p-4 hidden sm:table-cell">
                      <span className="truncate max-w-md inline-block" title={link.targetUrl}>
                        {link.targetUrl}
                      </span>
                    </td>
                    <td className="p-4 text-center">{link.clicks}</td>
                    <td className="p-4 text-center hidden md:table-cell">
                      {link.lastClicked ? new Date(link.lastClicked).toLocaleString() : '-'}
                    </td>
                    <td className="p-4 text-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/${link.code}`)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => deleteLink(link.code)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


