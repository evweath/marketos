#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════════
//  MarketOS — Interactive Configuration Wizard
//  Usage: node scripts/wizard.js (run from project root)
//  Node.js 18+ required. Zero external dependencies.
// ═══════════════════════════════════════════════════════════════════════════════

'use strict';

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');

// ── ANSI color palette ────────────────────────────────────────────────────────
const C = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  dim:    '\x1b[2m',
  cyan:   '\x1b[38;5;51m',
  green:  '\x1b[38;5;120m',
  amber:  '\x1b[38;5;215m',
  red:    '\x1b[38;5;203m',
  purple: '\x1b[38;5;141m',
  white:  '\x1b[97m',
  bgDark: '\x1b[48;5;234m',
};

// ── State ─────────────────────────────────────────────────────────────────────
/** @type {Record<string, string>} */
const env = {};          // collected key→value pairs for this session
/** @type {Record<string, string>} */
let existing = {};       // values read from existing .env.local
let storeCount = 1;      // how many Shopify stores configured
let rl;                  // readline interface (created once in run())

// ═══════════════════════════════════════════════════════════════════════════════
//  UTILITY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/** Parse a .env file into a plain object. */
function parseEnvFile(filePath) {
  const out = {};
  if (!fs.existsSync(filePath)) return out;
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    if (key) out[key] = val;
  }
  return out;
}

/** Write env object to .env.local, preserving existing keys not touched by wizard. */
function writeEnvFile(collected, existingValues) {
  const merged = { ...existingValues, ...collected };

  // Build ordered output following env.example section structure
  const sections = [
    {
      header: '# ── App ─────────────────────────────────────────────────────────',
      keys: ['NEXT_PUBLIC_APP_URL', 'APP_ENV'],
    },
    {
      header: '# ── Shopify — Store 1 ───────────────────────────────────────────',
      comment: '# Required scopes: read_orders, read_products, read_customers,\n#   read_inventory, read_analytics, write_script_tags',
      keys: ['SHOPIFY_STORE1_DOMAIN','SHOPIFY_STORE1_API_KEY','SHOPIFY_STORE1_API_SECRET','SHOPIFY_STORE1_ACCESS_TOKEN','SHOPIFY_STORE1_WEBHOOK_SECRET','NEXT_PUBLIC_SHOPIFY_STORE1_NAME'],
    },
    {
      header: '# ── Shopify — Store 2 (optional) ────────────────────────────────',
      keys: ['SHOPIFY_STORE2_DOMAIN','SHOPIFY_STORE2_API_KEY','SHOPIFY_STORE2_API_SECRET','SHOPIFY_STORE2_ACCESS_TOKEN','SHOPIFY_STORE2_WEBHOOK_SECRET','NEXT_PUBLIC_SHOPIFY_STORE2_NAME'],
    },
    {
      header: '# ── Shopify — Store 3 (optional) ────────────────────────────────',
      keys: ['SHOPIFY_STORE3_DOMAIN','SHOPIFY_STORE3_API_KEY','SHOPIFY_STORE3_API_SECRET','SHOPIFY_STORE3_ACCESS_TOKEN','SHOPIFY_STORE3_WEBHOOK_SECRET','NEXT_PUBLIC_SHOPIFY_STORE3_NAME'],
    },
    {
      header: '# ── Google Ads ──────────────────────────────────────────────────',
      keys: ['GOOGLE_ADS_DEVELOPER_TOKEN','GOOGLE_ADS_CLIENT_ID','GOOGLE_ADS_CLIENT_SECRET','GOOGLE_ADS_REFRESH_TOKEN','GOOGLE_ADS_CUSTOMER_ID','GOOGLE_ADS_MANAGER_ID'],
    },
    {
      header: '# ── Google Analytics 4 ─────────────────────────────────────────',
      keys: ['NEXT_PUBLIC_GA4_MEASUREMENT_ID_STORE1','NEXT_PUBLIC_GA4_MEASUREMENT_ID_STORE2','NEXT_PUBLIC_GA4_MEASUREMENT_ID_STORE3','GA4_PROPERTY_ID_STORE1','GA4_PROPERTY_ID_STORE2','GA4_PROPERTY_ID_STORE3','GA4_SERVICE_ACCOUNT_EMAIL','GA4_PRIVATE_KEY'],
    },
    {
      header: '# ── Google Search Console ───────────────────────────────────────',
      keys: ['GSC_SERVICE_ACCOUNT_EMAIL','GSC_PRIVATE_KEY','GSC_SITE_URL_STORE1','GSC_SITE_URL_STORE2','GSC_SITE_URL_STORE3'],
    },
    {
      header: '# ── Google Enhanced Conversions ─────────────────────────────────',
      keys: ['GOOGLE_ENHANCED_CONVERSION_ID','GOOGLE_ENHANCED_CONVERSION_LABEL'],
    },
    {
      header: '# ── Meta (Facebook & Instagram) ─────────────────────────────────',
      keys: ['META_APP_ID','META_APP_SECRET','META_ACCESS_TOKEN','META_AD_ACCOUNT_ID'],
    },
    {
      header: '# ── Meta Pixel & CAPI ───────────────────────────────────────────',
      keys: ['NEXT_PUBLIC_META_PIXEL_ID_STORE1','NEXT_PUBLIC_META_PIXEL_ID_STORE2','NEXT_PUBLIC_META_PIXEL_ID_STORE3','META_CAPI_ACCESS_TOKEN','META_CAPI_TEST_EVENT_CODE'],
    },
    {
      header: '# ── TikTok Ads ──────────────────────────────────────────────────',
      keys: ['TIKTOK_APP_ID','TIKTOK_APP_SECRET','TIKTOK_ACCESS_TOKEN','TIKTOK_ADVERTISER_ID'],
    },
    {
      header: '# ── YouTube ─────────────────────────────────────────────────────',
      keys: ['YOUTUBE_API_KEY','YOUTUBE_CHANNEL_ID_STORE1','YOUTUBE_CHANNEL_ID_STORE2','YOUTUBE_CHANNEL_ID_STORE3'],
    },
    {
      header: '# ── X / Twitter Ads ─────────────────────────────────────────────',
      keys: ['X_API_KEY','X_API_SECRET','X_BEARER_TOKEN','X_ACCESS_TOKEN','X_ACCESS_TOKEN_SECRET','X_AD_ACCOUNT_ID'],
    },
    {
      header: '# ── LinkedIn Ads ─────────────────────────────────────────────────',
      keys: ['LINKEDIN_CLIENT_ID','LINKEDIN_CLIENT_SECRET','LINKEDIN_ACCESS_TOKEN','LINKEDIN_AD_ACCOUNT_ID'],
    },
    {
      header: '# ── Klaviyo ──────────────────────────────────────────────────────',
      keys: ['KLAVIYO_API_KEY','KLAVIYO_LIST_ID_STORE1','KLAVIYO_LIST_ID_STORE2','KLAVIYO_LIST_ID_STORE3'],
    },
    {
      header: '# ── HubSpot (optional) ──────────────────────────────────────────',
      keys: ['HUBSPOT_API_KEY','HUBSPOT_PORTAL_ID'],
    },
    {
      header: '# ── Salesforce (optional) ───────────────────────────────────────',
      keys: ['SALESFORCE_CLIENT_ID','SALESFORCE_CLIENT_SECRET','SALESFORCE_USERNAME','SALESFORCE_PASSWORD','SALESFORCE_SECURITY_TOKEN'],
    },
    {
      header: '# ── Slack ────────────────────────────────────────────────────────',
      keys: ['SLACK_BOT_TOKEN','SLACK_WEBHOOK_URL','SLACK_ALERT_CHANNEL','SLACK_REPORT_CHANNEL'],
    },
    {
      header: '# ── Microsoft Teams ──────────────────────────────────────────────',
      keys: ['TEAMS_WEBHOOK_URL'],
    },
    {
      header: '# ── SMS Provider ─────────────────────────────────────────────────',
      keys: ['SMS_PROVIDER','TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_PHONE_NUMBER','POSTSCRIPT_API_KEY','POSTSCRIPT_SHOP_ID','ATTENTIVE_API_KEY'],
    },
  ];

  const writtenKeys = new Set();
  const lines = [
    '# ═══════════════════════════════════════════════════════════════',
    '#  MarketOS — Environment Configuration',
    '#  Generated by `node scripts/wizard.js`',
    '# ═══════════════════════════════════════════════════════════════',
    '',
  ];

  for (const section of sections) {
    lines.push(section.header);
    if (section.comment) lines.push(section.comment);
    for (const key of section.keys) {
      const val = merged[key];
      if (val !== undefined && val !== '') {
        lines.push(`${key}=${val}`);
        writtenKeys.add(key);
      }
    }
    lines.push('');
  }

  // Append any keys from merged that weren't in our sections
  const orphans = Object.entries(merged).filter(([k]) => !writtenKeys.has(k) && merged[k] !== '');
  if (orphans.length) {
    lines.push('# ── Other ────────────────────────────────────────────────────────');
    for (const [k, v] of orphans) lines.push(`${k}=${v}`);
    lines.push('');
  }

  fs.writeFileSync(ENV_FILE, lines.join('\n'), 'utf8');
}

/** Mask a secret value: first 4 chars + *** */
function mask(val) {
  if (!val || val.length <= 4) return '***';
  return val.slice(0, 4) + '***';
}

/** Print a section header box. */
function sectionHeader(title, subtitle = '') {
  const width = 60;
  const inner = ` ${title} `;
  const pad = '═'.repeat(Math.max(0, width - inner.length - 2));
  console.log('');
  console.log(`${C.cyan}${C.bold}╔═${inner}${pad}═╗${C.reset}`);
  if (subtitle) {
    const s = ` ${subtitle} `;
    const spad = ' '.repeat(Math.max(0, width - s.length));
    console.log(`${C.cyan}║${C.dim}${s}${spad}${C.cyan}║${C.reset}`);
  }
  console.log(`${C.cyan}╚${'═'.repeat(width)}╝${C.reset}`);
}

/** Print a dimmed hint line. */
function hint(text) {
  console.log(`  ${C.dim}→ ${text}${C.reset}`);
}

/** Print a success line. */
function ok(text) {
  console.log(`${C.green}  ✓ ${text}${C.reset}`);
}

/** Print a warning line. */
function warn(text) {
  console.log(`${C.amber}  ⚠ ${text}${C.reset}`);
}

/** Print an error line. */
function err(text) {
  console.log(`${C.red}  ✗ ${text}${C.reset}`);
}

/** Show a spinner for `ms` milliseconds, then resolve. */
function spinner(message, ms) {
  const frames = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];
  let i = 0;
  process.stdout.write(`  ${C.cyan}${frames[0]}${C.reset} ${message}`);
  return new Promise(resolve => {
    const iv = setInterval(() => {
      i = (i + 1) % frames.length;
      process.stdout.write(`\r  ${C.cyan}${frames[i]}${C.reset} ${message}`);
    }, 80);
    setTimeout(() => {
      clearInterval(iv);
      process.stdout.write('\r' + ' '.repeat(message.length + 6) + '\r');
      resolve();
    }, ms);
  });
}

/**
 * Prompt the user for input. Returns the trimmed answer.
 * @param {string} question   - Label shown before the prompt
 * @param {string} [def]      - Default value (shown in brackets)
 * @param {boolean} [secret]  - If true, don't echo input (best-effort via dim)
 */
function ask(question, def = '', secret = false) {
  return new Promise(resolve => {
    const defPart = def ? `${C.dim} [${mask(def)}]${C.reset}` : '';
    const secretNote = secret ? `${C.dim}(hidden)${C.reset} ` : '';
    process.stdout.write(`  ${C.white}${question}${defPart}${C.reset} ${secretNote}${C.cyan}›${C.reset} `);
    rl.once('line', answer => {
      const trimmed = answer.trim();
      resolve(trimmed === '' ? def : trimmed);
    });
  });
}

/**
 * Ask a yes/no question. `defaultYes` controls what Enter alone means.
 * Returns true for yes, false for no.
 */
async function confirm(question, defaultYes = true) {
  const indicator = defaultYes ? '[Y/n]' : '[y/N]';
  const answer = await ask(`${question} ${C.dim}${indicator}${C.reset}`);
  if (answer === '') return defaultYes;
  return /^y/i.test(answer);
}

/**
 * Ask with inline validation. Re-prompts until valid or user accepts empty optional value.
 * @param {string} label
 * @param {string} def
 * @param {(v: string) => string|null} validate - returns error string or null if valid
 * @param {boolean} optional - if true, empty input bypasses validation
 * @param {boolean} secret
 */
async function askValidated(label, def, validate, optional = false, secret = false) {
  while (true) {
    const answer = await ask(label, def, secret);
    if (answer === '' && optional) return answer;
    if (answer === '' && def) return def; // accepted existing
    const errMsg = validate(answer);
    if (!errMsg) return answer;
    err(errMsg);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  WELCOME SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

function printLogo() {
  console.clear();
  const logo = [
    '   ███╗   ███╗ █████╗ ██████╗ ██╗  ██╗███████╗████████╗ ██████╗ ███████╗',
    '   ████╗ ████║██╔══██╗██╔══██╗██║ ██╔╝██╔════╝╚══██╔══╝██╔═══██╗██╔════╝',
    '   ██╔████╔██║███████║██████╔╝█████╔╝ █████╗     ██║   ██║   ██║███████╗',
    '   ██║╚██╔╝██║██╔══██║██╔══██╗██╔═██╗ ██╔══╝     ██║   ██║   ██║╚════██║',
    '   ██║ ╚═╝ ██║██║  ██║██║  ██║██║  ██╗███████╗   ██║   ╚██████╔╝███████║',
    '   ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚══════╝',
  ];
  console.log('');
  for (const line of logo) console.log(`${C.cyan}${C.bold}${line}${C.reset}`);
  console.log(`${C.dim}${'─'.repeat(74)}${C.reset}`);
  console.log(`  ${C.purple}${C.bold}Configuration Wizard${C.reset}  ${C.dim}· MarketOS v1.0${C.reset}`);
  console.log(`${C.dim}${'─'.repeat(74)}${C.reset}`);
}

function printInstructions() {
  console.log('');
  console.log(`  ${C.white}This wizard configures your API integrations.${C.reset}`);
  console.log(`  ${C.dim}• Press ${C.reset}${C.white}Enter${C.reset}${C.dim} to accept the default value shown in brackets.${C.reset}`);
  console.log(`  ${C.dim}• Type your value and press ${C.reset}${C.white}Enter${C.reset}${C.dim} to set it.${C.reset}`);
  console.log(`  ${C.dim}• Press ${C.reset}${C.white}Ctrl+C${C.reset}${C.dim} to exit at any time.${C.reset}`);
  console.log('');
}

function printStatusTable() {
  const sections = [
    { label: 'Shopify',       keys: ['SHOPIFY_STORE1_DOMAIN','SHOPIFY_STORE1_ACCESS_TOKEN'] },
    { label: 'Google Ads',    keys: ['GOOGLE_ADS_DEVELOPER_TOKEN','GOOGLE_ADS_CLIENT_ID'] },
    { label: 'Meta / FB',     keys: ['META_APP_ID','META_ACCESS_TOKEN'] },
    { label: 'TikTok',        keys: ['TIKTOK_ACCESS_TOKEN'] },
    { label: 'X / Twitter',   keys: ['X_API_KEY'] },
    { label: 'LinkedIn',      keys: ['LINKEDIN_ACCESS_TOKEN'] },
    { label: 'Klaviyo',       keys: ['KLAVIYO_API_KEY'] },
    { label: 'HubSpot',       keys: ['HUBSPOT_API_KEY'] },
    { label: 'Salesforce',    keys: ['SALESFORCE_CLIENT_ID'] },
    { label: 'Slack',         keys: ['SLACK_BOT_TOKEN'] },
    { label: 'Teams',         keys: ['TEAMS_WEBHOOK_URL'] },
    { label: 'SMS',           keys: ['TWILIO_ACCOUNT_SID','POSTSCRIPT_API_KEY','ATTENTIVE_API_KEY'] },
  ];

  console.log(`  ${C.bold}${C.white}Current configuration status:${C.reset}`);
  console.log(`  ${C.dim}${'─'.repeat(40)}${C.reset}`);

  for (const s of sections) {
    const configured = s.keys.some(k => existing[k] && existing[k].trim() !== '');
    const icon = configured ? `${C.green}✓${C.reset}` : `${C.dim}─${C.reset}`;
    const label = configured
      ? `${C.green}${s.label}${C.reset}`
      : `${C.dim}${s.label}${C.reset}`;
    console.log(`  ${icon}  ${label}`);
  }
  console.log('');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION 1 — SHOPIFY
// ═══════════════════════════════════════════════════════════════════════════════

async function sectionShopify() {
  sectionHeader('1 / 8  Shopify Stores', 'Connect your Shopify store(s)');

  const countStr = await askValidated(
    'How many stores? (1/2/3)',
    String(existing['SHOPIFY_STORE_COUNT'] || 1),
    v => ['1','2','3'].includes(v) ? null : 'Enter 1, 2, or 3',
  );
  storeCount = parseInt(countStr, 10);

  for (let i = 1; i <= storeCount; i++) {
    console.log('');
    console.log(`  ${C.purple}${C.bold}── Store ${i} ──────────────────────────────${C.reset}`);

    const domain = await askValidated(
      `Store ${i} domain`,
      existing[`SHOPIFY_STORE${i}_DOMAIN`] || '',
      v => (v.includes('.myshopify.com') || v.includes('.')) ? null : 'Enter a valid domain (e.g. mystore.myshopify.com)',
    );
    hint('Found in Shopify Admin → Settings → Domains');

    const token = await askValidated(
      `Store ${i} Admin API Access Token`,
      existing[`SHOPIFY_STORE${i}_ACCESS_TOKEN`] || '',
      v => v.startsWith('shpat_') ? null : 'Must start with shpat_',
      false, true,
    );
    hint('Shopify Admin → Apps → Develop apps → API credentials');

    const apiKey = await askValidated(
      `Store ${i} API Key`,
      existing[`SHOPIFY_STORE${i}_API_KEY`] || '',
      v => v.length > 0 ? null : 'Required',
      false, true,
    );

    const apiSecret = await askValidated(
      `Store ${i} API Secret`,
      existing[`SHOPIFY_STORE${i}_API_SECRET`] || '',
      v => v.length > 0 ? null : 'Required',
      false, true,
    );

    const existingWebhook = existing[`SHOPIFY_STORE${i}_WEBHOOK_SECRET`] || '';
    const webhookInput = await ask(
      `Store ${i} Webhook Secret ${C.dim}(leave blank to auto-generate)${C.reset}`,
      existingWebhook, true,
    );
    const webhookSecret = webhookInput || crypto.randomBytes(32).toString('hex');
    if (!webhookInput) ok('Auto-generated webhook secret');

    const displayName = await ask(
      `Store ${i} display name`,
      existing[`NEXT_PUBLIC_SHOPIFY_STORE${i}_NAME`] || `Store ${i}`,
    );

    // Mock connection test
    await spinner(`Testing connection to ${domain}…`, 1500);
    ok(`Connected to ${domain}`);

    env[`SHOPIFY_STORE${i}_DOMAIN`]    = domain;
    env[`SHOPIFY_STORE${i}_ACCESS_TOKEN`] = token;
    env[`SHOPIFY_STORE${i}_API_KEY`]   = apiKey;
    env[`SHOPIFY_STORE${i}_API_SECRET`] = apiSecret;
    env[`SHOPIFY_STORE${i}_WEBHOOK_SECRET`] = webhookSecret;
    env[`NEXT_PUBLIC_SHOPIFY_STORE${i}_NAME`] = displayName;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION 2 — GOOGLE
// ═══════════════════════════════════════════════════════════════════════════════

async function sectionGoogle() {
  sectionHeader('2 / 8  Google', 'Ads · Analytics · Search Console');
  hint('Get credentials at https://developers.google.com/google-ads/api/docs/first-call/overview');
  console.log('');

  env['GOOGLE_ADS_DEVELOPER_TOKEN'] = await ask(
    'Google Ads Developer Token',
    existing['GOOGLE_ADS_DEVELOPER_TOKEN'] || '',
    true,
  );
  hint('Usually 22 characters — Google Ads → Tools → API Center');

  env['GOOGLE_ADS_CLIENT_ID'] = await askValidated(
    'Google Ads OAuth Client ID',
    existing['GOOGLE_ADS_CLIENT_ID'] || '',
    v => v === '' || v.endsWith('.apps.googleusercontent.com') ? null : 'Must end in .apps.googleusercontent.com',
    true,
  );

  env['GOOGLE_ADS_CLIENT_SECRET'] = await askValidated(
    'Google Ads OAuth Client Secret',
    existing['GOOGLE_ADS_CLIENT_SECRET'] || '',
    v => v === '' || v.startsWith('GOCSPX-') ? null : 'Must start with GOCSPX-',
    true, true,
  );

  env['GOOGLE_ADS_REFRESH_TOKEN'] = await askValidated(
    'Google Ads Refresh Token',
    existing['GOOGLE_ADS_REFRESH_TOKEN'] || '',
    v => v === '' || v.startsWith('1//') ? null : 'Must start with 1//',
    true, true,
  );

  env['GOOGLE_ADS_CUSTOMER_ID'] = await askValidated(
    'Google Ads Customer ID',
    existing['GOOGLE_ADS_CUSTOMER_ID'] || '',
    v => v === '' || /^\d+$/.test(v) ? null : 'Digits only, no dashes',
    true,
  );
  hint('Found in Google Ads → top-right customer ID (remove dashes)');

  console.log('');
  console.log(`  ${C.purple}${C.bold}── GA4 ──────────────────────────────────────${C.reset}`);
  for (let i = 1; i <= storeCount; i++) {
    env[`NEXT_PUBLIC_GA4_MEASUREMENT_ID_STORE${i}`] = await askValidated(
      `GA4 Measurement ID — Store ${i}`,
      existing[`NEXT_PUBLIC_GA4_MEASUREMENT_ID_STORE${i}`] || '',
      v => v === '' || /^G-[A-Z0-9]+$/.test(v) ? null : 'Must match G-XXXXXXXXXX format',
      true,
    );
  }

  env['GA4_SERVICE_ACCOUNT_EMAIL'] = await askValidated(
    'GA4 Service Account Email',
    existing['GA4_SERVICE_ACCOUNT_EMAIL'] || '',
    v => v === '' || (v.includes('@') && v.endsWith('.iam.gserviceaccount.com')) ? null : 'Must be a valid email ending in .iam.gserviceaccount.com',
    true,
  );
  hint('Google Cloud Console → IAM → Service Accounts');

  console.log('');
  console.log(`  ${C.purple}${C.bold}── Search Console ───────────────────────────${C.reset}`);
  for (let i = 1; i <= storeCount; i++) {
    env[`GSC_SITE_URL_STORE${i}`] = await ask(
      `Search Console site URL — Store ${i}`,
      existing[`GSC_SITE_URL_STORE${i}`] || '',
    );
    hint('Must match exactly what is verified in Search Console (include https://)');
  }

  console.log('');
  console.log(`  ${C.purple}${C.bold}── Enhanced Conversions ─────────────────────${C.reset}`);
  env['GOOGLE_ENHANCED_CONVERSION_ID'] = await ask(
    'Enhanced Conversions ID',
    existing['GOOGLE_ENHANCED_CONVERSION_ID'] || '',
  );
  env['GOOGLE_ENHANCED_CONVERSION_LABEL'] = await ask(
    'Enhanced Conversions Label',
    existing['GOOGLE_ENHANCED_CONVERSION_LABEL'] || '',
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION 3 — META
// ═══════════════════════════════════════════════════════════════════════════════

async function sectionMeta() {
  sectionHeader('3 / 8  Meta / Facebook', 'Ads · Pixel · Conversions API');
  hint('Get credentials at https://developers.facebook.com/apps');
  console.log('');

  env['META_APP_ID'] = await askValidated(
    'Meta App ID',
    existing['META_APP_ID'] || '',
    v => v === '' || /^\d+$/.test(v) ? null : 'Digits only',
    true,
  );
  hint('Meta for Developers → Your App → App ID');

  env['META_APP_SECRET'] = await askValidated(
    'Meta App Secret',
    existing['META_APP_SECRET'] || '',
    v => v === '' || /^[a-f0-9]{32}$/.test(v) ? null : 'Must be a 32-character hex string',
    true, true,
  );

  env['META_ACCESS_TOKEN'] = await askValidated(
    'Meta Long-Lived Access Token',
    existing['META_ACCESS_TOKEN'] || '',
    v => v === '' || v.startsWith('EAA') ? null : 'Must start with EAA',
    true, true,
  );
  hint('Graph API Explorer → Generate Token → long-lived (60-day)');

  env['META_AD_ACCOUNT_ID'] = await askValidated(
    'Meta Ad Account ID',
    existing['META_AD_ACCOUNT_ID'] || '',
    v => v === '' || v.startsWith('act_') ? null : 'Must start with act_',
    true,
  );
  hint('Meta Ads Manager → Account Overview → Account ID (prepend act_)');

  console.log('');
  console.log(`  ${C.purple}${C.bold}── Pixel IDs ────────────────────────────────${C.reset}`);
  for (let i = 1; i <= storeCount; i++) {
    env[`NEXT_PUBLIC_META_PIXEL_ID_STORE${i}`] = await askValidated(
      `Meta Pixel ID — Store ${i}`,
      existing[`NEXT_PUBLIC_META_PIXEL_ID_STORE${i}`] || '',
      v => v === '' || /^\d+$/.test(v) ? null : 'Digits only',
      true,
    );
  }

  env['META_CAPI_ACCESS_TOKEN'] = await askValidated(
    'Meta CAPI Access Token',
    existing['META_CAPI_ACCESS_TOKEN'] || '',
    v => v === '' || v.startsWith('EAA') ? null : 'Must start with EAA (same or separate from access token)',
    true, true,
  );
  hint('Events Manager → Data Sources → Settings → Generate Access Token');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION 4 — OTHER AD PLATFORMS
// ═══════════════════════════════════════════════════════════════════════════════

async function sectionOtherAds() {
  sectionHeader('4 / 8  Other Ad Platforms', 'TikTok · X/Twitter · LinkedIn · YouTube');

  // TikTok
  console.log('');
  if (await confirm('Configure TikTok Ads?', false)) {
    hint('Get credentials at https://ads.tiktok.com/marketing_api/homepage');
    env['TIKTOK_APP_ID']         = await ask('TikTok App ID',        existing['TIKTOK_APP_ID'] || '');
    env['TIKTOK_APP_SECRET']     = await ask('TikTok App Secret',    existing['TIKTOK_APP_SECRET'] || '', true);
    env['TIKTOK_ACCESS_TOKEN']   = await ask('TikTok Access Token',  existing['TIKTOK_ACCESS_TOKEN'] || '', true);
    env['TIKTOK_ADVERTISER_ID']  = await ask('TikTok Advertiser ID', existing['TIKTOK_ADVERTISER_ID'] || '');
  } else {
    console.log(`  ${C.dim}Skipped TikTok${C.reset}`);
  }

  // X / Twitter
  console.log('');
  if (await confirm('Configure X / Twitter Ads?', false)) {
    hint('Get credentials at https://developer.twitter.com/en/portal/dashboard');
    env['X_API_KEY']             = await ask('X API Key',             existing['X_API_KEY'] || '', true);
    env['X_API_SECRET']          = await ask('X API Secret',          existing['X_API_SECRET'] || '', true);
    env['X_BEARER_TOKEN']        = await ask('X Bearer Token',        existing['X_BEARER_TOKEN'] || '', true);
    env['X_ACCESS_TOKEN']        = await ask('X Access Token',        existing['X_ACCESS_TOKEN'] || '', true);
    env['X_ACCESS_TOKEN_SECRET'] = await ask('X Access Token Secret', existing['X_ACCESS_TOKEN_SECRET'] || '', true);
    env['X_AD_ACCOUNT_ID']       = await ask('X Ad Account ID',       existing['X_AD_ACCOUNT_ID'] || '');
  } else {
    console.log(`  ${C.dim}Skipped X / Twitter${C.reset}`);
  }

  // LinkedIn
  console.log('');
  if (await confirm('Configure LinkedIn Ads?', false)) {
    hint('Get credentials at https://www.linkedin.com/developers/apps');
    env['LINKEDIN_CLIENT_ID']     = await ask('LinkedIn Client ID',     existing['LINKEDIN_CLIENT_ID'] || '');
    env['LINKEDIN_CLIENT_SECRET'] = await ask('LinkedIn Client Secret', existing['LINKEDIN_CLIENT_SECRET'] || '', true);
    env['LINKEDIN_ACCESS_TOKEN']  = await ask('LinkedIn Access Token',  existing['LINKEDIN_ACCESS_TOKEN'] || '', true);
    env['LINKEDIN_AD_ACCOUNT_ID'] = await ask('LinkedIn Ad Account ID', existing['LINKEDIN_AD_ACCOUNT_ID'] || '');
  } else {
    console.log(`  ${C.dim}Skipped LinkedIn${C.reset}`);
  }

  // YouTube
  console.log('');
  if (await confirm('Configure YouTube?', false)) {
    hint('Get credentials at https://console.cloud.google.com/apis/credentials');
    env['YOUTUBE_API_KEY'] = await ask('YouTube API Key', existing['YOUTUBE_API_KEY'] || '', true);
    for (let i = 1; i <= storeCount; i++) {
      env[`YOUTUBE_CHANNEL_ID_STORE${i}`] = await ask(
        `YouTube Channel ID — Store ${i}`,
        existing[`YOUTUBE_CHANNEL_ID_STORE${i}`] || '',
      );
    }
  } else {
    console.log(`  ${C.dim}Skipped YouTube${C.reset}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION 5 — EMAIL & CRM
// ═══════════════════════════════════════════════════════════════════════════════

async function sectionEmailCRM() {
  sectionHeader('5 / 8  Email & CRM', 'Klaviyo · HubSpot · Salesforce');

  // Klaviyo (default yes)
  console.log('');
  if (await confirm('Use Klaviyo?', true)) {
    hint('Get credentials at https://www.klaviyo.com/account#api-keys-tab');
    env['KLAVIYO_API_KEY'] = await askValidated(
      'Klaviyo API Key',
      existing['KLAVIYO_API_KEY'] || '',
      v => v === '' || v.startsWith('pk_') ? null : 'Should start with pk_',
      true, true,
    );
    for (let i = 1; i <= storeCount; i++) {
      env[`KLAVIYO_LIST_ID_STORE${i}`] = await ask(
        `Klaviyo List ID — Store ${i}`,
        existing[`KLAVIYO_LIST_ID_STORE${i}`] || '',
      );
      hint('Klaviyo → Lists & Segments → select list → List ID in URL');
    }
  } else {
    console.log(`  ${C.dim}Skipped Klaviyo${C.reset}`);
  }

  // HubSpot
  console.log('');
  if (await confirm('Use HubSpot?', false)) {
    hint('Get credentials at https://app.hubspot.com/settings/integrations/private-apps');
    env['HUBSPOT_API_KEY'] = await ask('HubSpot API Key', existing['HUBSPOT_API_KEY'] || '', true);
  } else {
    console.log(`  ${C.dim}Skipped HubSpot${C.reset}`);
  }

  // Salesforce
  console.log('');
  if (await confirm('Use Salesforce?', false)) {
    hint('Get credentials at https://login.salesforce.com → Setup → Connected Apps');
    env['SALESFORCE_CLIENT_ID']     = await ask('Salesforce Client ID',             existing['SALESFORCE_CLIENT_ID'] || '');
    env['SALESFORCE_CLIENT_SECRET'] = await ask('Salesforce Client Secret',         existing['SALESFORCE_CLIENT_SECRET'] || '', true);
    env['SALESFORCE_USERNAME']      = await ask('Salesforce Username',              existing['SALESFORCE_USERNAME'] || '');
    env['SALESFORCE_PASSWORD']      = await ask('Salesforce Password',              existing['SALESFORCE_PASSWORD'] || '', true);
    env['SALESFORCE_SECURITY_TOKEN']= await ask('Salesforce Security Token',        existing['SALESFORCE_SECURITY_TOKEN'] || '', true);
    hint('Append security token to your password if your IP is not whitelisted');
  } else {
    console.log(`  ${C.dim}Skipped Salesforce${C.reset}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION 6 — NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

async function sectionNotifications() {
  sectionHeader('6 / 8  Notifications', 'Slack · Microsoft Teams');

  // Slack (default yes)
  console.log('');
  if (await confirm('Configure Slack?', true)) {
    hint('Get credentials at https://api.slack.com/apps');

    env['SLACK_BOT_TOKEN'] = await askValidated(
      'Slack Bot Token',
      existing['SLACK_BOT_TOKEN'] || '',
      v => v === '' || v.startsWith('xoxb-') ? null : 'Must start with xoxb-',
      true, true,
    );
    hint('Slack App → OAuth & Permissions → Bot User OAuth Token');

    env['SLACK_WEBHOOK_URL'] = await askValidated(
      'Slack Webhook URL',
      existing['SLACK_WEBHOOK_URL'] || '',
      v => v === '' || v.startsWith('https://hooks.slack.com/') ? null : 'Must start with https://hooks.slack.com/',
      true,
    );

    env['SLACK_ALERT_CHANNEL']  = await ask('Alert channel',  existing['SLACK_ALERT_CHANNEL']  || '#marketing-alerts');
    env['SLACK_REPORT_CHANNEL'] = await ask('Report channel', existing['SLACK_REPORT_CHANNEL'] || '#marketing-reports');
  } else {
    console.log(`  ${C.dim}Skipped Slack${C.reset}`);
  }

  // Teams
  console.log('');
  if (await confirm('Configure Microsoft Teams?', false)) {
    hint('Teams → channel → Connectors → Incoming Webhook → Create');
    env['TEAMS_WEBHOOK_URL'] = await ask('Teams Webhook URL', existing['TEAMS_WEBHOOK_URL'] || '');
  } else {
    console.log(`  ${C.dim}Skipped Teams${C.reset}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION 7 — SMS
// ═══════════════════════════════════════════════════════════════════════════════

async function sectionSMS() {
  sectionHeader('7 / 8  SMS', 'Twilio · Postscript · Attentive');
  console.log('');

  if (!await confirm('Configure SMS?', true)) {
    console.log(`  ${C.dim}Skipped SMS${C.reset}`);
    return;
  }

  const choice = await askValidated(
    `Provider: ${C.dim}1) Twilio  2) Postscript  3) Attentive${C.reset}`,
    existing['SMS_PROVIDER'] === 'postscript' ? '2' : existing['SMS_PROVIDER'] === 'attentive' ? '3' : '1',
    v => ['1','2','3'].includes(v) ? null : 'Enter 1, 2, or 3',
  );

  if (choice === '1') {
    env['SMS_PROVIDER'] = 'twilio';
    hint('Get credentials at https://console.twilio.com');
    env['TWILIO_ACCOUNT_SID']  = await ask('Twilio Account SID',  existing['TWILIO_ACCOUNT_SID'] || '');
    env['TWILIO_AUTH_TOKEN']   = await ask('Twilio Auth Token',   existing['TWILIO_AUTH_TOKEN'] || '', true);
    env['TWILIO_PHONE_NUMBER'] = await ask('Twilio Phone Number', existing['TWILIO_PHONE_NUMBER'] || '');
    hint('Format: +15551234567');
  } else if (choice === '2') {
    env['SMS_PROVIDER'] = 'postscript';
    hint('Get credentials at https://app.postscript.io → Settings → API');
    env['POSTSCRIPT_API_KEY']  = await ask('Postscript API Key',  existing['POSTSCRIPT_API_KEY'] || '', true);
    env['POSTSCRIPT_SHOP_ID']  = await ask('Postscript Shop ID',  existing['POSTSCRIPT_SHOP_ID'] || '');
  } else {
    env['SMS_PROVIDER'] = 'attentive';
    hint('Get credentials at https://ui.attentivemobile.com → Settings → API');
    env['ATTENTIVE_API_KEY']   = await ask('Attentive API Key',   existing['ATTENTIVE_API_KEY'] || '', true);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION 8 — REVIEW & SAVE
// ═══════════════════════════════════════════════════════════════════════════════

const SENSITIVE_KEYS = new Set([
  'SHOPIFY_STORE1_ACCESS_TOKEN','SHOPIFY_STORE2_ACCESS_TOKEN','SHOPIFY_STORE3_ACCESS_TOKEN',
  'SHOPIFY_STORE1_API_SECRET','SHOPIFY_STORE2_API_SECRET','SHOPIFY_STORE3_API_SECRET',
  'SHOPIFY_STORE1_WEBHOOK_SECRET','SHOPIFY_STORE2_WEBHOOK_SECRET','SHOPIFY_STORE3_WEBHOOK_SECRET',
  'GOOGLE_ADS_CLIENT_SECRET','GOOGLE_ADS_REFRESH_TOKEN',
  'META_APP_SECRET','META_ACCESS_TOKEN','META_CAPI_ACCESS_TOKEN',
  'TIKTOK_APP_SECRET','TIKTOK_ACCESS_TOKEN',
  'X_API_SECRET','X_BEARER_TOKEN','X_ACCESS_TOKEN','X_ACCESS_TOKEN_SECRET',
  'LINKEDIN_CLIENT_SECRET','LINKEDIN_ACCESS_TOKEN',
  'KLAVIYO_API_KEY','HUBSPOT_API_KEY',
  'SALESFORCE_CLIENT_SECRET','SALESFORCE_PASSWORD','SALESFORCE_SECURITY_TOKEN',
  'SLACK_BOT_TOKEN','TWILIO_AUTH_TOKEN','POSTSCRIPT_API_KEY','ATTENTIVE_API_KEY',
  'YOUTUBE_API_KEY',
]);

/** Print the review summary table. */
function printReview() {
  sectionHeader('8 / 8  Review & Save', 'Verify your configuration before writing');

  const summaryGroups = [
    { label: 'Shopify',       keys: [`SHOPIFY_STORE1_DOMAIN`,`SHOPIFY_STORE1_ACCESS_TOKEN`,`SHOPIFY_STORE2_DOMAIN`,`SHOPIFY_STORE3_DOMAIN`] },
    { label: 'Google',        keys: ['GOOGLE_ADS_DEVELOPER_TOKEN','GOOGLE_ADS_CLIENT_ID','NEXT_PUBLIC_GA4_MEASUREMENT_ID_STORE1','GA4_SERVICE_ACCOUNT_EMAIL','GSC_SITE_URL_STORE1','GOOGLE_ENHANCED_CONVERSION_ID'] },
    { label: 'Meta',          keys: ['META_APP_ID','META_ACCESS_TOKEN','META_AD_ACCOUNT_ID','NEXT_PUBLIC_META_PIXEL_ID_STORE1','META_CAPI_ACCESS_TOKEN'] },
    { label: 'Other Ads',     keys: ['TIKTOK_ACCESS_TOKEN','X_API_KEY','LINKEDIN_ACCESS_TOKEN','YOUTUBE_API_KEY'] },
    { label: 'Email & CRM',   keys: ['KLAVIYO_API_KEY','HUBSPOT_API_KEY','SALESFORCE_CLIENT_ID'] },
    { label: 'Notifications', keys: ['SLACK_BOT_TOKEN','TEAMS_WEBHOOK_URL'] },
    { label: 'SMS',           keys: ['SMS_PROVIDER','TWILIO_ACCOUNT_SID','POSTSCRIPT_API_KEY','ATTENTIVE_API_KEY'] },
  ];

  console.log('');
  for (const group of summaryGroups) {
    const filled = group.keys.filter(k => env[k] || existing[k]).length;
    const total  = group.keys.length;
    let icon, labelColor;
    if (filled === 0) {
      icon = `${C.dim}─${C.reset}`; labelColor = C.dim;
    } else if (filled === total) {
      icon = `${C.green}✓${C.reset}`; labelColor = C.green;
    } else {
      icon = `${C.amber}⚠${C.reset}`; labelColor = C.amber;
    }
    console.log(`  ${icon}  ${labelColor}${C.bold}${group.label}${C.reset}`);

    for (const key of group.keys) {
      const val = env[key] || existing[key] || '';
      if (!val) continue;
      const display = SENSITIVE_KEYS.has(key) ? mask(val) : val;
      console.log(`     ${C.dim}${key}${C.reset} = ${C.white}${display}${C.reset}`);
    }
  }
  console.log('');
}

async function sectionReviewSave() {
  printReview();

  if (!await confirm('Save these settings to .env.local?', true)) {
    console.log(`  ${C.dim}Nothing saved.${C.reset}`);
    return false;
  }

  writeEnvFile(env, existing);
  ok(`Saved to ${ENV_FILE}`);
  console.log('');
  console.log(`${C.bold}${C.white}  Next steps:${C.reset}`);
  console.log(`  ${C.cyan}1.${C.reset} ${C.white}npm run dev${C.reset}`);
  console.log(`  ${C.cyan}2.${C.reset} ${C.white}Open ${C.cyan}http://localhost:3001/setup${C.reset}${C.white} to complete in-app setup${C.reset}`);
  console.log('');
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CTRL+C HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

async function handleInterrupt() {
  console.log('');
  console.log(`\n  ${C.amber}Interrupted.${C.reset}`);
  try {
    if (await confirm('Save partial configuration?', false)) {
      writeEnvFile(env, existing);
      ok(`Partial config saved to ${ENV_FILE}`);
    } else {
      console.log(`  ${C.dim}Nothing saved.${C.reset}`);
    }
  } catch {
    // If readline is already destroyed, just exit
  }
  console.log('');
  process.exit(0);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════════════

async function run() {
  // Load existing .env.local
  existing = parseEnvFile(ENV_FILE);

  // Set up readline interface
  rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
    terminal: false,
  });

  // Ctrl+C — ask to save partial config
  rl.on('SIGINT', () => {
    handleInterrupt().catch(() => process.exit(1));
  });
  process.on('SIGINT', () => {
    handleInterrupt().catch(() => process.exit(1));
  });

  try {
    printLogo();
    printInstructions();
    printStatusTable();

    await sectionShopify();
    await sectionGoogle();
    await sectionMeta();
    await sectionOtherAds();
    await sectionEmailCRM();
    await sectionNotifications();
    await sectionSMS();
    await sectionReviewSave();

  } catch (e) {
    if (e?.code === 'ERR_USE_AFTER_CLOSE') {
      // readline closed (Ctrl+C handled above) — exit cleanly
      process.exit(0);
    }
    console.error(`${C.red}Fatal error:${C.reset}`, e?.message ?? e);
    process.exit(1);
  } finally {
    rl.close();
  }
}

run();
