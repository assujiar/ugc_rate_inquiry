"use client";
import { useState, FormEvent } from 'react';
import { FormField } from './FormField';
import { FormActions } from './FormActions';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

/**
 * Form to create or edit a marketing content piece. Supports selecting
 * a content type and entering basic metrics. Data is posted to
 * `/app/api/marketing/content-pieces`. Toasts communicate success or
 * failure.
 */
export default function ContentPieceForm() {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    title: '',
    content_type: 'Article',
    publish_date: '',
    impressions: '',
    leads_generated: ''
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/app/api/marketing/content-pieces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save content piece');
      addToast({ title: 'Content saved', message: 'Content piece has been recorded.', type: 'success' });
      setForm({ title: '', content_type: 'Article', publish_date: '', impressions: '', leads_generated: '' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message ?? 'Failed to save content piece', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Title" htmlFor="title">
        <Input id="title" name="title" value={form.title} onChange={handleChange} required />
      </FormField>
      <FormField label="Content Type" htmlFor="content_type">
        <Select
          id="content_type"
          name="content_type"
          value={form.content_type}
          onChange={handleChange}
          options={[
            { value: 'Article', label: 'Article' },
            { value: 'Video', label: 'Video' },
            { value: 'Webinar', label: 'Webinar' },
            { value: 'Podcast', label: 'Podcast' }
          ]}
        />
      </FormField>
      <FormField label="Publish Date" htmlFor="publish_date">
        <Input id="publish_date" name="publish_date" type="date" value={form.publish_date} onChange={handleChange} required />
      </FormField>
      <FormField label="Impressions" htmlFor="impressions">
        <Input id="impressions" name="impressions" type="number" value={form.impressions} onChange={handleChange} />
      </FormField>
      <FormField label="Leads Generated" htmlFor="leads_generated">
        <Input id="leads_generated" name="leads_generated" type="number" value={form.leads_generated} onChange={handleChange} />
      </FormField>
      <FormActions>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Content'}
        </Button>
      </FormActions>
    </form>
  );
}