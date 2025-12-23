import React from 'react';
import { Tabs } from '@/components/ui/Tabs';
import OfflineEventsPanel from '@/components/marketing/OfflineEventsPanel';
import SeoSemCampaignsPanel from '@/components/marketing/SeoSemCampaignsPanel';
import WebsiteAnalyticsPanel from '@/components/marketing/WebsiteAnalyticsPanel';
import DigitalChannelsPanel from '@/components/marketing/DigitalChannelsPanel';
import ContentPiecesPanel from '@/components/marketing/ContentPiecesPanel';
import AttributionPanel from '@/components/marketing/AttributionPanel';
import MarketingKpiPanel from '@/components/marketing/MarketingKpiPanel';

export default function MarketingTabs() {
  const tabs = [
    { label: 'Overview', content: <MarketingKpiPanel /> },
    { label: 'Offline Events', content: <OfflineEventsPanel /> },
    { label: 'SEO/SEM', content: <SeoSemCampaignsPanel /> },
    { label: 'Website', content: <WebsiteAnalyticsPanel /> },
    { label: 'Channels', content: <DigitalChannelsPanel /> },
    { label: 'Content', content: <ContentPiecesPanel /> },
    { label: 'Attribution', content: <AttributionPanel /> }
  ];
  return <Tabs tabs={tabs} />;
}