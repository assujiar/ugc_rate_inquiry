"use client";
import { useState, FormEvent } from 'react';
import { FormField } from './FormField';
import { FormActions } from './FormActions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';

/**
 * Form to create or edit an offline marketing event. Captures basic
 * event details and posts them to the API. On success a toast is
 * displayed; errors are also reported via toast.
 */
export default function OfflineEventForm() {
  const { addToast } = useToast();
  const [form, setForm] = useState({
    event_name: '',
    location: '',
    event_date: '',
    attendees: '',
    leads_generated: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/app/api/marketing/offline-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed to save event');
      addToast({ title: 'Event saved', message: 'Offline event has been recorded.', type: 'success' });
      setForm({ event_name: '', location: '', event_date: '', attendees: '', leads_generated: '', notes: '' });
    } catch (err: any) {
      addToast({ title: 'Error', message: err.message ?? 'Failed to save event', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField label="Event Name" htmlFor="event_name">
        <Input id="event_name" name="event_name" value={form.event_name} onChange={handleChange} required />
      </FormField>
      <FormField label="Location" htmlFor="location">
        <Input id="location" name="location" value={form.location} onChange={handleChange} required />
      </FormField>
      <FormField label="Event Date" htmlFor="event_date">
        <Input id="event_date" name="event_date" type="date" value={form.event_date} onChange={handleChange} required />
      </FormField>
      <FormField label="Attendees" htmlFor="attendees">
        <Input id="attendees" name="attendees" type="number" value={form.attendees} onChange={handleChange} />
      </FormField>
      <FormField label="Leads Generated" htmlFor="leads_generated">
        <Input id="leads_generated" name="leads_generated" type="number" value={form.leads_generated} onChange={handleChange} />
      </FormField>
      <FormField label="Notes" htmlFor="notes">
        <textarea
          id="notes"
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
          rows={3}
        />
      </FormField>
      <FormActions>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Saving…' : 'Save Event'}
        </Button>
      </FormActions>
    </form>
  );
}