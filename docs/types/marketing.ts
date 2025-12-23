export interface MarketingCampaign {
  id: string;
  name: string;
  campaign_type: 'offline' | 'online' | 'mixed';
  budget: number | null;
  start_date: string;
  end_date: string | null;
  status: string;
}

export interface OfflineEvent {
  id: string;
  campaign_id: string | null;
  event_name: string;
  location: string;
  event_date: string;
  attendees: number | null;
  leads_generated: number | null;
  notes: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SeoSemCampaign {
  id: string;
  campaign_id: string | null;
  keyword: string;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
  start_date: string;
  end_date: string;
}

export interface WebsiteAnalytics {
  id: string;
  date: string;
  pageviews: number;
  sessions: number;
  users: number;
  bounce_rate: number;
  avg_session_duration: number;
}

export interface DigitalChannelMetrics {
  id: string;
  channel_name: string;
  visits: number;
  leads: number;
  conversions: number;
  cost: number;
  report_date: string;
}

export interface ContentPiece {
  id: string;
  campaign_id: string | null;
  title: string;
  content_type: string;
  publish_date: string;
  impressions: number;
  leads_generated: number;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AttributionStats {
  id: string;
  channel: string;
  first_touch_conversions: number;
  last_touch_conversions: number;
  assisted_conversions: number;
  report_date: string;
}

export interface MarketingKpi {
  id: string;
  name: string;
  description: string | null;
  calculation: string;
  target_value: number | null;
  domain: 'marketing';
}