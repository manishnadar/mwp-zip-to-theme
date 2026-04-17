import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/* ── Sub-tab definitions ─────────────────────────────────────────────────── */
const TABS = [
  { id: 'general',   label: 'General',   icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { id: 'social',    label: 'Social',    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'technical', label: 'Technical', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'schema',    label: 'Schema',    icon: 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4' },
];

/* ── Social platforms ────────────────────────────────────────────────────── */
const PLATFORMS = [
  { value: 'og',        label: 'Open Graph',             hint: 'Facebook, LinkedIn, Pinterest, Slack & more' },
  { value: 'twitter',   label: 'Twitter / X',            hint: 'twitter:card meta tags' },
  { value: 'whatsapp',  label: 'WhatsApp',               hint: 'Uses Open Graph tags' },
  { value: 'telegram',  label: 'Telegram',               hint: 'Uses Open Graph tags' },
  { value: 'linkedin',  label: 'LinkedIn (override)',     hint: 'Separate OG for LinkedIn' },
  { value: 'pinterest', label: 'Pinterest (override)',    hint: 'Separate OG for Pinterest' },
  { value: 'custom',    label: 'Custom',                  hint: 'Any other platform' },
];

const DEFAULT_SOCIAL_CARDS = [
  { platform: 'og',      title: '', description: '', image: '' },
  { platform: 'twitter', title: '', description: '', image: '' },
];

/* ── Social Tab ──────────────────────────────────────────────────────────── */
function SocialTab({ cards, onChange }) {
  const addCard = () => onChange([...cards, { platform: 'og', title: '', description: '', image: '' }]);
  const removeCard = (i) => onChange(cards.filter((_, idx) => idx !== i));
  const updateCard = (i, key, val) => onChange(cards.map((c, idx) => idx === i ? { ...c, [key]: val } : c));

  const platformLabel = (val) => PLATFORMS.find(p => p.value === val)?.label || val;

  return (
    <>
      <p style={{ margin: '0 0 12px', fontSize: 11.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Customise how this page appears when shared on each social platform. The first <strong style={{ color: 'var(--text-primary)' }}>Open Graph</strong> card is the universal fallback.
      </p>

      {cards.map((card, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,.03)',
          border: '1px solid rgba(255,255,255,.09)',
          borderRadius: 9, marginBottom: 10, overflow: 'hidden',
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px',
            background: 'rgba(124,58,237,.08)',
            borderBottom: '1px solid rgba(255,255,255,.07)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: card.platform === 'og' ? '#06b6d4' : card.platform === 'twitter' ? '#1d9bf0' : '#a78bfa',
                display: 'inline-block', flexShrink: 0,
              }} />
              <select
                value={card.platform}
                onChange={e => updateCard(i, 'platform', e.target.value)}
                style={{
                  background: 'transparent', border: 'none', color: 'var(--text-primary)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  fontFamily: 'var(--font-ui)', outline: 'none',
                }}
              >
                {PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                {PLATFORMS.find(p => p.value === card.platform)?.hint}
              </span>
            </div>
            {cards.length > 1 && (
              <button
                onClick={() => removeCard(i)}
                title={`Remove ${platformLabel(card.platform)} card`}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 17, lineHeight: 1, padding: '0 4px' }}
              >×</button>
            )}
          </div>

          {/* Card fields */}
          <div style={{ padding: '10px 10px 6px' }}>
            <Field label="Title">
              <TextInput
                value={card.title}
                onChange={v => updateCard(i, 'title', v)}
                placeholder={card.platform === 'twitter' ? 'Defaults to OG title if empty' : 'Defaults to meta title if empty'}
                maxLen={card.platform === 'twitter' ? 70 : 60}
              />
            </Field>
            <Field label="Description">
              <TextArea
                value={card.description}
                onChange={v => updateCard(i, 'description', v)}
                placeholder={card.platform === 'twitter' ? 'Defaults to OG description if empty' : 'Defaults to meta description if empty'}
                maxLen={200} rows={2}
              />
            </Field>
            <Field label="Image URL">
              <TextInput
                value={card.image}
                onChange={v => updateCard(i, 'image', v)}
                placeholder={card.platform === 'twitter' ? 'https://…  (1200×600 recommended)' : 'https://…  (1200×630 recommended)'}
              />
            </Field>
          </div>
        </div>
      ))}

      <button
        onClick={addCard}
        style={{
          width: '100%', background: 'rgba(124,58,237,.1)',
          border: '1px dashed rgba(124,58,237,.4)', borderRadius: 7,
          color: '#c4b5fd', fontSize: 12, fontWeight: 600,
          padding: '8px 0', cursor: 'pointer', fontFamily: 'var(--font-ui)',
          marginBottom: 4,
        }}
      >
        + Add Social Platform
      </button>
    </>
  );
}

/* ── Schema type definitions ─────────────────────────────────────────────── */
const ARTICLE_FIELDS = [
  { key: 'headline',       label: 'Headline',              type: 'text' },
  { key: 'description',    label: 'Description',           type: 'textarea' },
  { key: 'image',          label: 'Image URL',             type: 'text' },
  { key: 'author_name',    label: 'Author Name',           type: 'text' },
  { key: 'author_url',     label: 'Author URL',            type: 'text' },
  { key: 'publisher_name', label: 'Publisher Name',        type: 'text' },
  { key: 'publisher_logo', label: 'Publisher Logo URL',    type: 'text' },
  { key: 'date_published', label: 'Date Published',        type: 'date' },
  { key: 'date_modified',  label: 'Date Modified',         type: 'date' },
];

const SCHEMA_TYPES = {
  '': { label: '— Select a type —', fields: [] },

  Organization: {
    label: 'Organization',
    fields: [
      { key: 'name',             label: 'Name',            type: 'text' },
      { key: 'url',              label: 'Website URL',     type: 'text' },
      { key: 'logo',             label: 'Logo URL',        type: 'text' },
      { key: 'description',      label: 'Description',     type: 'textarea' },
      { key: 'email',            label: 'Email',           type: 'text' },
      { key: 'telephone',        label: 'Phone',           type: 'text' },
      { key: 'social_facebook',  label: 'Facebook URL',    type: 'text' },
      { key: 'social_twitter',   label: 'Twitter URL',     type: 'text' },
      { key: 'social_linkedin',  label: 'LinkedIn URL',    type: 'text' },
      { key: 'social_instagram', label: 'Instagram URL',   type: 'text' },
    ],
  },

  LocalBusiness: {
    label: 'Local Business',
    fields: [
      { key: 'name',          label: 'Business Name',                          type: 'text' },
      { key: 'type',          label: 'Business Sub-type (e.g. Restaurant)',    type: 'text' },
      { key: 'description',   label: 'Description',                            type: 'textarea' },
      { key: 'image',         label: 'Image URL',                              type: 'text' },
      { key: 'url',           label: 'Website URL',                            type: 'text' },
      { key: 'telephone',     label: 'Phone',                                  type: 'text' },
      { key: 'email',         label: 'Email',                                  type: 'text' },
      { key: 'street',        label: 'Street Address',                         type: 'text' },
      { key: 'city',          label: 'City',                                   type: 'text' },
      { key: 'state',         label: 'State / Region',                         type: 'text' },
      { key: 'postal_code',   label: 'Postal Code',                            type: 'text' },
      { key: 'country',       label: 'Country Code (e.g. US)',                 type: 'text' },
      { key: 'price_range',   label: 'Price Range (e.g. $$)',                  type: 'text' },
      { key: 'opening_hours', label: 'Opening Hours (e.g. Mo-Fr 09:00-18:00)', type: 'text' },
    ],
  },

  WebSite: {
    label: 'Website',
    fields: [
      { key: 'name',        label: 'Site Name',                                           type: 'text' },
      { key: 'url',         label: 'Site URL',                                            type: 'text' },
      { key: 'description', label: 'Description',                                         type: 'textarea' },
      { key: 'search_url',  label: 'Search URL (e.g. https://example.com/?s={search_term_string})', type: 'text' },
    ],
  },

  WebPage: {
    label: 'Web Page',
    fields: [
      { key: 'name',        label: 'Page Name',   type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'url',         label: 'URL',         type: 'text' },
    ],
  },

  Article:     { label: 'Article',      fields: ARTICLE_FIELDS },
  BlogPosting: { label: 'Blog Posting', fields: ARTICLE_FIELDS },

  Product: {
    label: 'Product',
    fields: [
      { key: 'name',         label: 'Product Name',        type: 'text' },
      { key: 'description',  label: 'Description',         type: 'textarea' },
      { key: 'image',        label: 'Image URL',           type: 'text' },
      { key: 'brand',        label: 'Brand',               type: 'text' },
      { key: 'sku',          label: 'SKU',                 type: 'text' },
      { key: 'price',        label: 'Price',               type: 'text' },
      { key: 'currency',     label: 'Currency (e.g. USD)', type: 'text' },
      {
        key: 'availability', label: 'Availability', type: 'select',
        options: ['InStock', 'OutOfStock', 'PreOrder', 'Discontinued'],
      },
      { key: 'rating_value', label: 'Rating Value (1–5)', type: 'text' },
      { key: 'rating_count', label: 'Rating Count',       type: 'text' },
    ],
  },

  FAQPage:        { label: 'FAQ',            fields: [], isFaq: true },
  BreadcrumbList: { label: 'Breadcrumb',     fields: [], isBreadcrumb: true },

  Person: {
    label: 'Person',
    fields: [
      { key: 'name',            label: 'Full Name',         type: 'text' },
      { key: 'job_title',       label: 'Job Title',         type: 'text' },
      { key: 'description',     label: 'Description / Bio', type: 'textarea' },
      { key: 'image',           label: 'Photo URL',         type: 'text' },
      { key: 'email',           label: 'Email',             type: 'text' },
      { key: 'url',             label: 'Profile URL',       type: 'text' },
      { key: 'social_facebook', label: 'Facebook URL',      type: 'text' },
      { key: 'social_twitter',  label: 'Twitter URL',       type: 'text' },
      { key: 'social_linkedin', label: 'LinkedIn URL',      type: 'text' },
    ],
  },

  Service: {
    label: 'Service',
    fields: [
      { key: 'name',          label: 'Service Name',                    type: 'text' },
      { key: 'service_type',  label: 'Service Type (e.g. Web Design)',  type: 'text' },
      { key: 'description',   label: 'Description',                     type: 'textarea' },
      { key: 'image',         label: 'Image URL',                       type: 'text' },
      { key: 'url',           label: 'Service URL',                     type: 'text' },
      { key: 'provider_name', label: 'Provider Name',                   type: 'text' },
      { key: 'provider_url',  label: 'Provider URL',                    type: 'text' },
      { key: 'area_served',   label: 'Area Served (e.g. New York, US)', type: 'text' },
      { key: 'price_range',   label: 'Price Range (e.g. $50–$200)',     type: 'text' },
    ],
  },

  Event: {
    label: 'Event',
    fields: [
      { key: 'name',              label: 'Event Name',        type: 'text' },
      { key: 'description',       label: 'Description',       type: 'textarea' },
      { key: 'image',             label: 'Image URL',         type: 'text' },
      { key: 'url',               label: 'Event URL',         type: 'text' },
      { key: 'start_date',        label: 'Start Date & Time (YYYY-MM-DDTHH:MM)', type: 'text' },
      { key: 'end_date',          label: 'End Date & Time (YYYY-MM-DDTHH:MM)',   type: 'text' },
      { key: 'location_name',     label: 'Venue / Location Name',  type: 'text' },
      { key: 'location_address',  label: 'Street Address',         type: 'text' },
      { key: 'location_city',     label: 'City',                   type: 'text' },
      { key: 'location_country',  label: 'Country Code (e.g. US)', type: 'text' },
      { key: 'organizer_name',    label: 'Organiser Name',         type: 'text' },
      { key: 'organizer_url',     label: 'Organiser URL',          type: 'text' },
      {
        key: 'event_status', label: 'Event Status', type: 'select',
        options: ['EventScheduled', 'EventCancelled', 'EventPostponed', 'EventRescheduled'],
      },
      {
        key: 'event_attendance', label: 'Attendance Mode', type: 'select',
        options: ['OfflineEventAttendanceMode', 'OnlineEventAttendanceMode', 'MixedEventAttendanceMode'],
      },
      { key: 'offers_price',    label: 'Ticket Price',            type: 'text' },
      { key: 'offers_currency', label: 'Ticket Currency (e.g. USD)', type: 'text' },
    ],
  },
};

/* ── Build JSON-LD preview from current state (mirrors PHP output) ────────── */
function buildJsonLd(schemaType, schemaJson) {
  if (!schemaType) return null;
  const d = schemaJson || {};
  const ld = { '@context': 'https://schema.org', '@type': schemaType };

  switch (schemaType) {
    case 'Article':
    case 'NewsArticle':
    case 'BlogPosting':
      if (d.headline)      ld.headline = d.headline;
      if (d.description)   ld.description = d.description;
      if (d.image)         ld.image = d.image;
      if (d.date_published) ld.datePublished = d.date_published;
      if (d.date_modified)  ld.dateModified  = d.date_modified;
      if (d.author_name) {
        ld.author = { '@type': 'Person', name: d.author_name };
        if (d.author_url) ld.author.url = d.author_url;
      }
      if (d.publisher_name) {
        ld.publisher = { '@type': 'Organization', name: d.publisher_name };
        if (d.publisher_logo) ld.publisher.logo = { '@type': 'ImageObject', url: d.publisher_logo };
      }
      break;
    case 'WebSite':
      if (d.name)        ld.name        = d.name;
      if (d.url)         ld.url         = d.url;
      if (d.description) ld.description = d.description;
      if (d.search_url)  ld.potentialAction = { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: d.search_url }, 'query-input': 'required name=search_term_string' };
      break;
    case 'WebPage':
      if (d.name)        ld.name = d.name;
      if (d.description) ld.description = d.description;
      if (d.url)         ld.url = d.url;
      break;
    case 'LocalBusiness':
      ld['@type'] = d.type || 'LocalBusiness';
      if (d.name)          ld.name = d.name;
      if (d.url)           ld.url = d.url;
      if (d.description)   ld.description = d.description;
      if (d.image)         ld.image = d.image;
      if (d.telephone)     ld.telephone = d.telephone;
      if (d.email)         ld.email = d.email;
      if (d.price_range)   ld.priceRange = d.price_range;
      if (d.opening_hours) ld.openingHours = d.opening_hours;
      const addr = {};
      if (d.street)      addr.streetAddress   = d.street;
      if (d.city)        addr.addressLocality = d.city;
      if (d.state)       addr.addressRegion   = d.state;
      if (d.postal_code) addr.postalCode      = d.postal_code;
      if (d.country)     addr.addressCountry  = d.country;
      if (Object.keys(addr).length) ld.address = { '@type': 'PostalAddress', ...addr };
      break;
    case 'Organization':
      if (d.name)  ld.name = d.name;
      if (d.url)   ld.url  = d.url;
      if (d.logo)  ld.logo = { '@type': 'ImageObject', url: d.logo };
      if (d.description) ld.description = d.description;
      if (d.email)       ld.email       = d.email;
      if (d.telephone)   ld.telephone   = d.telephone;
      const sameAs1 = [d.social_facebook, d.social_twitter, d.social_linkedin, d.social_instagram].filter(Boolean);
      if (sameAs1.length) ld.sameAs = sameAs1;
      break;
    case 'Person':
      if (d.name)        ld.name = d.name;
      if (d.job_title)   ld.jobTitle    = d.job_title;
      if (d.description) ld.description = d.description;
      if (d.image)       ld.image = d.image;
      if (d.email)       ld.email = d.email;
      if (d.url)         ld.url   = d.url;
      const sameAs2 = [d.social_facebook, d.social_twitter, d.social_linkedin].filter(Boolean);
      if (sameAs2.length) ld.sameAs = sameAs2;
      break;
    case 'Product':
      if (d.name)        ld.name = d.name;
      if (d.description) ld.description = d.description;
      if (d.image)       ld.image = d.image;
      if (d.brand)       ld.brand = { '@type': 'Brand', name: d.brand };
      if (d.sku)         ld.sku   = d.sku;
      if (d.price || d.currency) {
        ld.offers = {
          '@type': 'Offer',
          price: d.price || '',
          priceCurrency: d.currency || 'USD',
          availability: `https://schema.org/${d.availability || 'InStock'}`,
        };
      }
      if (d.rating_value) {
        ld.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: d.rating_value,
          reviewCount: d.rating_count || '1',
        };
      }
      break;
    case 'FAQPage': {
      const pairs = (d.faq_pairs || []).filter(p => p.question);
      if (pairs.length) {
        ld.mainEntity = pairs.map(p => ({
          '@type': 'Question',
          name: p.question,
          acceptedAnswer: { '@type': 'Answer', text: p.answer || '' },
        }));
      }
      break;
    }
    case 'BreadcrumbList': {
      const items = (d.breadcrumb_items || []).filter(i => i.name);
      if (items.length) {
        ld.itemListElement = items.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: item.url || '',
        }));
      }
      break;
    }
    case 'Service':
      if (d.name)          ld.name         = d.name;
      if (d.service_type)  ld.serviceType  = d.service_type;
      if (d.description)   ld.description  = d.description;
      if (d.image)         ld.image        = d.image;
      if (d.url)           ld.url          = d.url;
      if (d.area_served)   ld.areaServed   = d.area_served;
      if (d.price_range)   ld.offers       = { '@type': 'Offer', priceSpecification: d.price_range };
      if (d.provider_name) ld.provider     = { '@type': 'Organization', name: d.provider_name, ...(d.provider_url ? { url: d.provider_url } : {}) };
      break;

    case 'Event':
      if (d.name)        ld.name        = d.name;
      if (d.description) ld.description = d.description;
      if (d.image)       ld.image       = d.image;
      if (d.url)         ld.url         = d.url;
      if (d.start_date)  ld.startDate   = d.start_date;
      if (d.end_date)    ld.endDate     = d.end_date;
      if (d.event_status)     ld.eventStatus     = `https://schema.org/${d.event_status}`;
      if (d.event_attendance) ld.eventAttendanceMode = `https://schema.org/${d.event_attendance}`;
      if (d.location_name || d.location_address) {
        ld.location = { '@type': 'Place', name: d.location_name || '' };
        const evAddr = {};
        if (d.location_address) evAddr.streetAddress   = d.location_address;
        if (d.location_city)    evAddr.addressLocality = d.location_city;
        if (d.location_country) evAddr.addressCountry  = d.location_country;
        if (Object.keys(evAddr).length) ld.location.address = { '@type': 'PostalAddress', ...evAddr };
      }
      if (d.organizer_name) ld.organizer = { '@type': 'Organization', name: d.organizer_name, ...(d.organizer_url ? { url: d.organizer_url } : {}) };
      if (d.offers_price)   ld.offers    = { '@type': 'Offer', price: d.offers_price, priceCurrency: d.offers_currency || 'USD', availability: 'https://schema.org/InStock' };
      break;

    default: return null;
  }
  return ld;
}

/* ── Parse existing meta tags from the page's HTML ───────────────────────── */
function parsePageMeta(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const h   = doc.head;
  const metaName = (n)  => h.querySelector(`meta[name="${n}"]`)?.getAttribute('content') || '';
  const metaProp = (p)  => h.querySelector(`meta[property="${p}"]`)?.getAttribute('content') || '';

  const robots   = metaName('robots').toLowerCase();
  const ogImage  = metaProp('og:image');
  const twImage  = metaName('twitter:image') || metaName('twitter:image:src');

  // Build social cards from OG / Twitter tags found in the page
  const socialCards = [];
  const ogTitle = metaProp('og:title');
  const ogDesc  = metaProp('og:description');
  if (ogTitle || ogDesc || ogImage) {
    socialCards.push({ platform: 'og', title: ogTitle, description: ogDesc, image: ogImage });
  }
  const twTitle = metaName('twitter:title');
  const twDesc  = metaName('twitter:description');
  if (twTitle || twDesc || twImage) {
    socialCards.push({ platform: 'twitter', title: twTitle, description: twDesc, image: twImage });
  }
  if (!socialCards.length) {
    socialCards.push(
      { platform: 'og',      title: '', description: '', image: '' },
      { platform: 'twitter', title: '', description: '', image: '' },
    );
  }

  // Try to extract JSON-LD schema
  let schemaType = '';
  let schemaJson = {};
  const ldScripts = Array.from(h.querySelectorAll('script[type="application/ld+json"]'));
  for (const script of ldScripts) {
    try {
      const ld = JSON.parse(script.textContent);
      const t  = ld['@type'] || '';
      if (t && SCHEMA_TYPES[t]) {
        schemaType = t;
        schemaJson = extractSchemaFromLd(ld, t);
        break;
      }
    } catch (_) { /* ignore malformed JSON-LD */ }
  }

  return {
    title:           h.querySelector('title')?.textContent?.trim() || '',
    description:     metaName('description'),
    canonical:       h.querySelector('link[rel="canonical"]')?.getAttribute('href') || '',
    robots_noindex:  robots.includes('noindex')  ? '1' : '0',
    robots_nofollow: robots.includes('nofollow') ? '1' : '0',
    socialCards,
    schemaType,
    schemaJson,
  };
}

/** Reverse-map a schema.org JSON-LD object back into our form field keys. */
function extractSchemaFromLd(ld, type) {
  const str = (v) => (typeof v === 'string' ? v : '');
  const imgUrl = (v) => (typeof v === 'string' ? v : str(v?.url));

  switch (type) {
    case 'Article':
    case 'BlogPosting':
    case 'NewsArticle':
      return {
        headline:       str(ld.headline),
        description:    str(ld.description),
        image:          imgUrl(ld.image),
        author_name:    str(ld.author?.name),
        author_url:     str(ld.author?.url),
        publisher_name: str(ld.publisher?.name),
        publisher_logo: imgUrl(ld.publisher?.logo),
        date_published: str(ld.datePublished),
        date_modified:  str(ld.dateModified),
      };
    case 'WebSite':
      return {
        name:       str(ld.name),
        url:        str(ld.url),
        description:str(ld.description),
        search_url: str(ld.potentialAction?.target?.urlTemplate || ld.potentialAction?.target),
      };
    case 'WebPage':
      return { name: str(ld.name), description: str(ld.description), url: str(ld.url) };
    case 'LocalBusiness': {
      const a = ld.address || {};
      return {
        name: str(ld.name), type: str(ld['@type'] !== 'LocalBusiness' ? ld['@type'] : ''),
        description: str(ld.description), image: imgUrl(ld.image),
        url: str(ld.url), telephone: str(ld.telephone), email: str(ld.email),
        street: str(a.streetAddress), city: str(a.addressLocality),
        state: str(a.addressRegion), postal_code: str(a.postalCode),
        country: str(a.addressCountry), price_range: str(ld.priceRange),
        opening_hours: Array.isArray(ld.openingHours) ? ld.openingHours.join(', ') : str(ld.openingHours),
      };
    }
    case 'Organization': {
      const sameAs = Array.isArray(ld.sameAs) ? ld.sameAs : [];
      return {
        name: str(ld.name), url: str(ld.url),
        logo: imgUrl(ld.logo), description: str(ld.description),
        email: str(ld.email), telephone: str(ld.telephone),
        social_facebook:  sameAs.find(u => u.includes('facebook'))  || '',
        social_twitter:   sameAs.find(u => u.includes('twitter') || u.includes('x.com')) || '',
        social_linkedin:  sameAs.find(u => u.includes('linkedin'))  || '',
        social_instagram: sameAs.find(u => u.includes('instagram')) || '',
      };
    }
    case 'Person': {
      const sameAs = Array.isArray(ld.sameAs) ? ld.sameAs : [];
      return {
        name: str(ld.name), job_title: str(ld.jobTitle),
        description: str(ld.description), image: imgUrl(ld.image),
        email: str(ld.email), url: str(ld.url),
        social_facebook: sameAs.find(u => u.includes('facebook'))  || '',
        social_twitter:  sameAs.find(u => u.includes('twitter') || u.includes('x.com')) || '',
        social_linkedin: sameAs.find(u => u.includes('linkedin'))  || '',
      };
    }
    case 'Product': {
      const offer = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
      const rating = ld.aggregateRating || {};
      return {
        name: str(ld.name), description: str(ld.description), image: imgUrl(ld.image),
        brand: str(ld.brand?.name || ld.brand), sku: str(ld.sku),
        price: str(offer?.price), currency: str(offer?.priceCurrency),
        availability: (offer?.availability || '').replace('https://schema.org/', '') || 'InStock',
        rating_value: str(rating.ratingValue), rating_count: str(rating.reviewCount),
      };
    }
    case 'FAQPage': {
      const entities = Array.isArray(ld.mainEntity) ? ld.mainEntity : [];
      return { faq_pairs: entities.map(e => ({ question: str(e.name), answer: str(e.acceptedAnswer?.text) })) };
    }
    case 'BreadcrumbList': {
      const items = Array.isArray(ld.itemListElement) ? ld.itemListElement : [];
      return { breadcrumb_items: items.map(i => ({ name: str(i.name), url: str(i.item || i.id) })) };
    }
    case 'Service':
      return {
        name: str(ld.name), service_type: str(ld.serviceType),
        description: str(ld.description), image: imgUrl(ld.image),
        url: str(ld.url), area_served: str(ld.areaServed),
        provider_name: str(ld.provider?.name), provider_url: str(ld.provider?.url),
        price_range: str(ld.offers?.priceSpecification),
      };
    case 'Event': {
      const loc = ld.location || {};
      const a   = loc.address || {};
      const off = ld.offers || {};
      return {
        name: str(ld.name), description: str(ld.description), image: imgUrl(ld.image),
        url: str(ld.url), start_date: str(ld.startDate), end_date: str(ld.endDate),
        event_status: (str(ld.eventStatus)).replace('https://schema.org/', ''),
        event_attendance: (str(ld.eventAttendanceMode)).replace('https://schema.org/', ''),
        location_name: str(loc.name), location_address: str(a.streetAddress),
        location_city: str(a.addressLocality), location_country: str(a.addressCountry),
        organizer_name: str(ld.organizer?.name), organizer_url: str(ld.organizer?.url),
        offers_price: str(off.price), offers_currency: str(off.priceCurrency),
      };
    }
    default: return {};
  }
}

/* ── SEO Score ───────────────────────────────────────────────────────────── */
function calcScore(fields) {
  let score = 0;
  const checks = [];
  if (fields.title && fields.title.length >= 30 && fields.title.length <= 60) {
    score += 25; checks.push({ ok: true,  label: 'Title length is ideal (30–60 chars)' });
  } else if (fields.title) {
    score += 10; checks.push({ ok: false, label: `Title too ${fields.title.length > 60 ? 'long' : 'short'} (${fields.title.length} chars)` });
  } else {
    checks.push({ ok: false, label: 'Missing meta title' });
  }
  if (fields.description && fields.description.length >= 120 && fields.description.length <= 160) {
    score += 25; checks.push({ ok: true,  label: 'Description length is ideal (120–160 chars)' });
  } else if (fields.description) {
    score += 10; checks.push({ ok: false, label: `Description too ${fields.description.length > 160 ? 'long' : 'short'} (${fields.description.length} chars)` });
  } else {
    checks.push({ ok: false, label: 'Missing meta description' });
  }
  if (fields.focus_keyword) {
    score += 15; checks.push({ ok: true, label: 'Focus keyword is set' });
    if (fields.title?.toLowerCase().includes(fields.focus_keyword.toLowerCase())) {
      score += 10; checks.push({ ok: true, label: 'Keyword appears in title' });
    } else {
      checks.push({ ok: false, label: 'Keyword not found in title' });
    }
    if (fields.description?.toLowerCase().includes(fields.focus_keyword.toLowerCase())) {
      score += 10; checks.push({ ok: true, label: 'Keyword appears in description' });
    } else {
      checks.push({ ok: false, label: 'Keyword not found in description' });
    }
  } else {
    checks.push({ ok: false, label: 'No focus keyword set' });
  }
  const hasImage = (fields.socialCards || []).some(c => c.image);
  if (hasImage) {
    score += 15; checks.push({ ok: true, label: 'Social image is set' });
  } else {
    checks.push({ ok: false, label: 'No social image set' });
  }
  if (fields.schema_type) {
    score += 5; // small fixed bonus for having schema configured
    checks.push({ ok: true, label: `Schema markup is configured (${fields.schema_type})` });
  } else {
    checks.push({ ok: false, label: 'No structured data (Schema) configured' });
  }
  return { score: Math.min(score, 100), checks };
}

function scoreColor(s) { return s >= 75 ? '#10b981' : s >= 45 ? '#f59e0b' : '#ef4444'; }
function scoreLabel(s) { return s >= 75 ? 'Good' : s >= 45 ? 'Needs Work' : 'Poor'; }

/* ── Shared styled primitives ─────────────────────────────────────────────── */
const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,.05)',
  border: '1px solid rgba(255,255,255,.1)', borderRadius: 7,
  padding: '7px 10px', color: 'var(--text-primary)',
  fontSize: 12.5, fontFamily: 'var(--font-ui)', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color .15s',
};

function FieldLabel({ children }) {
  return (
    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 5 }}>
      {children}
    </label>
  );
}
function Field({ label, children }) {
  return <div style={{ marginBottom: 14 }}><FieldLabel>{label}</FieldLabel>{children}</div>;
}
function TextInput({ value, onChange, placeholder, maxLen }) {
  return (
    <div style={{ position: 'relative' }}>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
      {maxLen && <span style={{ position: 'absolute', right: 8, bottom: 7, fontSize: 10, color: value.length > maxLen ? '#ef4444' : 'var(--text-muted)' }}>{value.length}/{maxLen}</span>}
    </div>
  );
}
function TextArea({ value, onChange, placeholder, maxLen, rows = 3 }) {
  return (
    <div style={{ position: 'relative' }}>
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...inputStyle, resize: 'vertical', paddingBottom: maxLen ? 20 : 8 }} />
      {maxLen && <span style={{ position: 'absolute', right: 8, bottom: 10, fontSize: 10, color: value.length > maxLen ? '#ef4444' : 'var(--text-muted)' }}>{value.length}/{maxLen}</span>}
    </div>
  );
}
function SelectInput({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputStyle, appearance: 'auto' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SectionDivider({ label }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-accent)', letterSpacing: '.05em', textTransform: 'uppercase', marginBottom: 8, marginTop: 4 }}>
      {label}
    </div>
  );
}

function SerpPreview({ title, description }) {
  return (
    <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
      <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,.35)', fontFamily: 'var(--font-ui)', marginBottom: 3 }}>SERP Preview</p>
      <p style={{ margin: 0, fontSize: 14, color: '#8ab4f8', fontFamily: 'var(--font-ui)', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {title || 'Page Title'}
      </p>
      <p style={{ margin: '2px 0', fontSize: 11, color: '#34a853', fontFamily: 'var(--font-ui)' }}>{window.location.origin}/your-page/</p>
      <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,.55)', fontFamily: 'var(--font-ui)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {description || 'Add a meta description to control how this page appears in search results.'}
      </p>
    </div>
  );
}

/* ── Schema Tab ──────────────────────────────────────────────────────────── */
function SchemaTab({ schemaType, schemaJson, onTypeChange, onJsonChange }) {
  const [showPreview, setShowPreview] = useState(false);
  const typeDef = SCHEMA_TYPES[schemaType] || SCHEMA_TYPES[''];
  const jsonLd  = buildJsonLd(schemaType, schemaJson);

  const setField = (key, val) => onJsonChange({ ...schemaJson, [key]: val });

  // FAQ helpers
  const faqPairs = schemaJson?.faq_pairs || [{ question: '', answer: '' }];
  const setFaq = (pairs) => onJsonChange({ ...schemaJson, faq_pairs: pairs });
  const addFaq = () => setFaq([...faqPairs, { question: '', answer: '' }]);
  const removeFaq = (i) => setFaq(faqPairs.filter((_, idx) => idx !== i));
  const updateFaq = (i, key, val) => setFaq(faqPairs.map((p, idx) => idx === i ? { ...p, [key]: val } : p));

  // Breadcrumb helpers
  const breadcrumbs = schemaJson?.breadcrumb_items || [{ name: '', url: '' }];
  const setBc = (items) => onJsonChange({ ...schemaJson, breadcrumb_items: items });
  const addBc = () => setBc([...breadcrumbs, { name: '', url: '' }]);
  const removeBc = (i) => setBc(breadcrumbs.filter((_, idx) => idx !== i));
  const updateBc = (i, key, val) => setBc(breadcrumbs.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  return (
    <>
      {/* Type selector */}
      <Field label="Schema Type">
        <select
          value={schemaType}
          onChange={e => { onTypeChange(e.target.value); onJsonChange({}); }}
          style={{ ...inputStyle, appearance: 'auto', backgroundColor: '#0d1117', color: '#e5e7eb' }}
        >
          {Object.entries(SCHEMA_TYPES).map(([k, v]) => (
            <option key={k} value={k} style={{ backgroundColor: '#0d1117', color: '#e5e7eb' }}>{v.label}</option>
          ))}
        </select>
      </Field>

      {!schemaType && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
          Select a schema type above to add structured data to this page.
          <br /><br />
          Structured data helps search engines understand your content and can enable rich results in Google Search.
        </p>
      )}

      {/* Dynamic fields for normal types */}
      {schemaType && typeDef.fields.map(f => (
        <Field key={f.key} label={f.label}>
          {f.type === 'textarea'
            ? <TextArea value={schemaJson?.[f.key] || ''} onChange={v => setField(f.key, v)} placeholder={`Enter ${f.label.toLowerCase()}…`} rows={2} />
            : f.type === 'select'
            ? <SelectInput value={schemaJson?.[f.key] || f.options[0]} onChange={v => setField(f.key, v)} options={f.options} />
            : <TextInput value={schemaJson?.[f.key] || ''} onChange={v => setField(f.key, v)} placeholder={f.type === 'date' ? 'YYYY-MM-DD' : `Enter ${f.label.toLowerCase()}…`} />
          }
        </Field>
      ))}

      {/* FAQ type — dynamic Q&A pairs */}
      {typeDef.isFaq && (
        <>
          <SectionDivider label="Questions & Answers" />
          {faqPairs.map((pair, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '10px 10px 6px', marginBottom: 8, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Q{i + 1}</span>
                {faqPairs.length > 1 && (
                  <button onClick={() => removeFaq(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1 }} title="Remove">×</button>
                )}
              </div>
              <TextInput value={pair.question} onChange={v => updateFaq(i, 'question', v)} placeholder="Question…" />
              <div style={{ marginTop: 6 }}>
                <TextArea value={pair.answer} onChange={v => updateFaq(i, 'answer', v)} placeholder="Answer…" rows={2} />
              </div>
            </div>
          ))}
          <button onClick={addFaq} style={{ width: '100%', marginBottom: 14, background: 'rgba(124,58,237,.12)', border: '1px dashed rgba(124,58,237,.4)', borderRadius: 7, color: '#c4b5fd', fontSize: 12, fontWeight: 600, padding: '7px 0', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            + Add Question
          </button>
        </>
      )}

      {/* Breadcrumb type — dynamic items */}
      {typeDef.isBreadcrumb && (
        <>
          <SectionDivider label="Breadcrumb Items" />
          {breadcrumbs.map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '10px 10px 6px', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>Item {i + 1}</span>
                {breadcrumbs.length > 1 && (
                  <button onClick={() => removeBc(i)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1 }} title="Remove">×</button>
                )}
              </div>
              <TextInput value={item.name} onChange={v => updateBc(i, 'name', v)} placeholder="Label (e.g. Home)" />
              <div style={{ marginTop: 6 }}>
                <TextInput value={item.url} onChange={v => updateBc(i, 'url', v)} placeholder="URL (e.g. https://example.com/)" />
              </div>
            </div>
          ))}
          <button onClick={addBc} style={{ width: '100%', marginBottom: 14, background: 'rgba(124,58,237,.12)', border: '1px dashed rgba(124,58,237,.4)', borderRadius: 7, color: '#c4b5fd', fontSize: 12, fontWeight: 600, padding: '7px 0', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}>
            + Add Item
          </button>
        </>
      )}

      {/* JSON-LD Preview */}
      {schemaType && jsonLd && (
        <div style={{ marginTop: 4 }}>
          <button
            onClick={() => setShowPreview(p => !p)}
            style={{ width: '100%', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 7, color: 'var(--text-muted)', fontSize: 11.5, fontWeight: 600, padding: '6px 10px', cursor: 'pointer', fontFamily: 'var(--font-ui)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>JSON-LD Preview</span>
            <span style={{ fontSize: 10 }}>{showPreview ? '▲ Hide' : '▼ Show'}</span>
          </button>
          {showPreview && (
            <pre style={{
              marginTop: 6, padding: '10px', borderRadius: 7, overflowX: 'auto',
              background: '#0d1117', border: '1px solid rgba(255,255,255,.08)',
              fontSize: 10.5, lineHeight: 1.6, color: '#7ee787',
              fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              maxHeight: 260, overflowY: 'auto',
            }}>
              {JSON.stringify(jsonLd, null, 2)}
            </pre>
          )}
        </div>
      )}
    </>
  );
}

/* ── Main Component ──────────────────────────────────────────────────────── */
export default function SEOPanel({ postId }) {
  const [activeTab, setActiveTab] = useState('general');
  const [fields, setFields] = useState({
    title: '', description: '', focus_keyword: '',
    canonical: '', robots_noindex: '0', robots_nofollow: '0',
    schema_type: '',
  });
  const [socialCards, setSocialCards] = useState(DEFAULT_SOCIAL_CARDS);
  const [schemaJson, setSchemaJson]   = useState({});
  const [status, setStatus]           = useState('idle');
  const [errorMsg, setErrorMsg]       = useState('');
  const [imported, setImported]       = useState(false); // true when data was auto-read from page HTML

  useEffect(() => {
    if (!postId || !window.zttData?.seoApiUrl) return;
    setStatus('loading');

    const apiReq  = axios.get(`${window.zttData.seoApiUrl}${postId}`, { headers: { 'X-WP-Nonce': window.zttData.nonce } });
    const htmlReq = window.zttData?.frontendUrl
      ? axios.get(window.zttData.frontendUrl).catch(() => null)
      : Promise.resolve(null);

    Promise.all([apiReq, htmlReq]).then(([apiRes, htmlRes]) => {
      const { schema_json, social_cards, ...apiFields } = apiRes.data;

      // Detect whether the user has ever saved SEO data via our plugin
      const hasSavedData = Object.values(apiFields).some(v => v && v !== '0');
      const hasSavedCards  = Array.isArray(social_cards) && social_cards.length > 0;
      const hasSavedSchema = schema_json && typeof schema_json === 'object' && Object.keys(schema_json).length > 0;

      // Parse meta from page HTML when plugin has no saved data yet
      let pageMeta = null;
      if (htmlRes?.data && (!hasSavedData || !hasSavedCards)) {
        try { pageMeta = parsePageMeta(htmlRes.data); } catch (_) {}
      }

      // Merge: our saved data wins; page meta fills gaps
      const merged = { ...apiFields };
      if (pageMeta) {
        if (!merged.title)       merged.title       = pageMeta.title;
        if (!merged.description) merged.description = pageMeta.description;
        if (!merged.canonical)   merged.canonical   = pageMeta.canonical;
        if (merged.robots_noindex  === '0' && pageMeta.robots_noindex  === '1') merged.robots_noindex  = '1';
        if (merged.robots_nofollow === '0' && pageMeta.robots_nofollow === '1') merged.robots_nofollow = '1';
      }
      // Always auto-fill canonical from permalink as last resort
      if (!merged.canonical && window.zttData?.frontendUrl) {
        merged.canonical = window.zttData.frontendUrl;
      }

      setFields(prev => ({ ...prev, ...merged }));

      // Social cards — prefer saved, fall back to parsed
      if (hasSavedCards) {
        setSocialCards(social_cards);
      } else if (pageMeta?.socialCards?.length) {
        setSocialCards(pageMeta.socialCards);
        setImported(true);
      }

      // Schema — prefer saved, fall back to parsed
      if (hasSavedSchema) {
        setSchemaJson(schema_json);
      } else if (pageMeta?.schemaType && pageMeta.schemaType !== apiFields.schema_type) {
        setFields(prev => ({ ...prev, schema_type: pageMeta.schemaType }));
        setSchemaJson(pageMeta.schemaJson || {});
        setImported(true);
      } else {
        setSchemaJson(schema_json && typeof schema_json === 'object' ? schema_json : {});
      }

      // Mark as imported if page meta contributed any value
      if (pageMeta && !hasSavedData && (pageMeta.title || pageMeta.description || pageMeta.canonical)) {
        setImported(true);
      }

      setStatus('idle');
    }).catch(() => setStatus('idle'));
  }, [postId]);

  const set = useCallback((key, val) => setFields(prev => ({ ...prev, [key]: val })), []);

  const handleSave = () => {
    if (!postId || !window.zttData?.seoApiUrl) return;
    setStatus('saving');
    setErrorMsg('');
    axios.post(`${window.zttData.seoApiUrl}${postId}`,
      { ...fields, social_cards: socialCards, schema_json: schemaJson },
      { headers: { 'X-WP-Nonce': window.zttData.nonce, 'Content-Type': 'application/json' } },
    ).then(() => {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    }).catch(err => {
      setStatus('error');
      setErrorMsg(err?.response?.data?.message || 'Save failed. Please try again.');
      setTimeout(() => setStatus('idle'), 3000);
    });
  };

  const { score, checks } = calcScore({ ...fields, socialCards });
  const sColor = scoreColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', fontFamily: 'var(--font-ui)' }}>

      {/* ── Header ── */}
      <div style={{ padding: '12px 14px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-.01em' }}>SEO Settings</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${sColor}18`, border: `1px solid ${sColor}55`, borderRadius: 20, padding: '3px 10px' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: sColor }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: sColor }}>{score}/100 — {scoreLabel(score)}</span>
          </div>
        </div>
        <div style={{ height: 3, background: 'rgba(255,255,255,.07)', borderRadius: 2, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: sColor, borderRadius: 2, transition: 'width .4s ease' }} />
        </div>

        {/* Sub-tabs — 2×2 grid to fit all 4 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, background: 'rgba(255,255,255,.04)', borderRadius: 8, padding: 3, marginBottom: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              border: activeTab === t.id ? '1px solid rgba(124,58,237,.4)' : '1px solid transparent',
              borderRadius: 6, padding: '5px 4px',
              fontSize: 10.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-ui)',
              background: activeTab === t.id ? 'linear-gradient(135deg,rgba(124,58,237,.5),rgba(6,182,212,.3))' : 'transparent',
              color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
              transition: 'all .15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', scrollbarWidth: 'thin' }}>

        {/* Imported-from-page banner */}
        {imported && status !== 'loading' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 8,
            background: 'rgba(6,182,212,.10)',
            border: '1px solid rgba(6,182,212,.3)',
            borderRadius: 8, padding: '9px 11px', marginBottom: 12,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 11.5, fontWeight: 700, color: '#06b6d4' }}>SEO data detected in page</p>
              <p style={{ margin: '2px 0 6px', fontSize: 11, color: 'rgba(255,255,255,.55)', lineHeight: 1.4 }}>
                Existing meta tags and structured data have been pre-filled below. Review the fields and click <strong style={{ color: 'rgba(255,255,255,.75)' }}>Save SEO Settings</strong> to keep them.
              </p>
              <button
                onClick={() => setImported(false)}
                style={{ background: 'none', border: 'none', color: '#06b6d4', fontSize: 11, cursor: 'pointer', padding: 0, fontFamily: 'var(--font-ui)', textDecoration: 'underline' }}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {status === 'loading' && <p style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', marginTop: 20 }}>Loading SEO data…</p>}

        {status !== 'loading' && activeTab === 'general' && (
          <>
            <SerpPreview title={fields.title} description={fields.description} />
            <Field label="Meta Title">
              <TextInput value={fields.title} onChange={v => set('title', v)} placeholder="Enter page title…" maxLen={60} />
            </Field>
            <Field label="Meta Description">
              <TextArea value={fields.description} onChange={v => set('description', v)} placeholder="Describe the page content for search engines…" maxLen={160} rows={3} />
            </Field>
            <Field label="Focus Keyword">
              <TextInput value={fields.focus_keyword} onChange={v => set('focus_keyword', v)} placeholder="Primary keyword to optimise for" />
            </Field>
          </>
        )}

        {status !== 'loading' && activeTab === 'social' && (
          <SocialTab cards={socialCards} onChange={setSocialCards} />
        )}

        {status !== 'loading' && activeTab === 'technical' && (
          <>
            <Field label="Canonical URL">
              <TextInput value={fields.canonical} onChange={v => set('canonical', v)} placeholder="Leave blank to use default permalink" />
            </Field>
            <div style={{ marginBottom: 14 }}>
              <FieldLabel>Robots Meta</FieldLabel>
              {[
                { key: 'robots_noindex',  label: 'No Index',  hint: 'Prevent search engines from indexing this page' },
                { key: 'robots_nofollow', label: 'No Follow', hint: 'Prevent search engines from following links on this page' },
              ].map(({ key, label, hint }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={fields[key] === '1'} onChange={e => set(key, e.target.checked ? '1' : '0')} style={{ marginTop: 2, accentColor: '#7c3aed', cursor: 'pointer' }} />
                  <div>
                    <span style={{ display: 'block', fontSize: 12.5, color: 'var(--text-primary)' }}>{label}</span>
                    <span style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)' }}>{hint}</span>
                  </div>
                </label>
              ))}
            </div>
            <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '10px 12px' }}>
              <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.05em' }}>SEO Checklist</p>
              {checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.ok ? '#10b981' : '#ef4444'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {c.ok ? <polyline points="20 6 9 17 4 12" /> : <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>}
                  </svg>
                  <span style={{ fontSize: 11.5, color: c.ok ? 'rgba(255,255,255,.7)' : 'rgba(255,255,255,.45)' }}>{c.label}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {status !== 'loading' && activeTab === 'schema' && (
          <SchemaTab
            schemaType={fields.schema_type}
            schemaJson={schemaJson}
            onTypeChange={v => set('schema_type', v)}
            onJsonChange={setSchemaJson}
          />
        )}
      </div>

      {/* ── Save bar ── */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0, background: 'var(--bg-panel)' }}>
        {status === 'error' && <p style={{ margin: '0 0 6px', fontSize: 11.5, color: '#ef4444' }}>{errorMsg}</p>}
        <button
          onClick={handleSave}
          disabled={status === 'saving' || status === 'loading'}
          style={{
            width: '100%', height: 34, border: 'none', borderRadius: 7, cursor: 'pointer',
            background: status === 'saved' ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#7c3aed,#06b6d4)',
            color: '#fff', fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-ui)',
            boxShadow: status === 'saved' ? '0 0 14px rgba(5,150,105,.35)' : '0 0 14px rgba(124,58,237,.35)',
            opacity: status === 'saving' || status === 'loading' ? .6 : 1,
            transition: 'all .2s',
          }}
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved' : 'Save SEO Settings'}
        </button>
      </div>
    </div>
  );
}
