"use client";
import { useState, FormEvent } from 'react';
import { FormField } from './FormField';
import { FormActions } from './FormActions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

/**
 * Form to create or edit an SEO/SEM campaign. Captures basic
 * performance metrics and posts them to the API. Shows success or
 * error notifications via toasts.
 */
export default function SeoSemCampaignForm() {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    keyword: '',
    impressions: '',
    clicks: '',
    conversions: '',
    cost: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/app/api/marketing/seo-sem-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save campaign');
      addToast({ title: 'Campaign saved', message: 'Campaign has been recorded.', type: 'success' });
      setForm({ keyword: '', impressions: '', clicks: '', conversions: '', cost: '', start_date: '', end_date: '' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message ?? 'Failed to save campaign', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Keyword" htmlFor="keyword">
        <Input id="keyword" name="keyword" value={form.keyword} onChange={handleChange} required />
      </FormField>
      <FormField label="Impressions" htmlFor="impressions">
        <Input id="impressions" name="impressions" type="number" value={form.impressions} onChange={handleChange} />
      </FormField>
      <FormField label="Clicks" htmlFor="clicks">
        <Input id="clicks" name="clicks" type="number" value={form.clicks} onChange={handleChange} />
      </FormField>
      <FormField label="Conversions" htmlFor="conversions">
        <Input id="conversions" name="conversions" type="number" value={form.conversions} onChange={handleChange} />
      </FormField>
      <FormField label="Cost" htmlFor="cost">
        <Input id="cost" name="cost" type="number" step="0.01" value={form.cost} onChange={handleChange} />
      </FormField>
      <FormField label="Start Date" htmlFor="start_date">
        <Input id="start_date" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
      </FormField>
      <FormField label="End Date" htmlFor="end_date">
        <Input id="end_date" name="end_date" type="date" value={form.end_date} onChange={handleChange} required />
      </FormField>
      <FormActions>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Campaign'}
        </Button>
      </FormActions>
    </form>
  );
}