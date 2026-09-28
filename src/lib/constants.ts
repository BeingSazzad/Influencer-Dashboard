import {
  AdminUser,
  MarketplaceUser,
  VerificationRequest,
  EscrowDispute,
  CmsLegalDoc,
  CmsFaqItem,
  CmsBrandAssets,
} from '@/types/admin.types';

export const INITIAL_ADMIN_USER: AdminUser = {
  id: 'ADM-001',
  name: 'Sazzad Hoshen',
  email: 'sazzad.uiuxdesign@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  role: 'super_admin',
  status: 'active',
  twoFactorEnabled: true,
  lastLogin: 'Today at 09:15 AM',
  createdAt: '2025-01-10',
};

export const INITIAL_ADMIN_TEAM: AdminUser[] = [
  INITIAL_ADMIN_USER,
  {
    id: 'ADM-002',
    name: 'Camille Laurent',
    email: 'camille@influverse.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    role: 'operations',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: 'Yesterday at 04:30 PM',
    createdAt: '2025-03-12',
  },
  {
    id: 'ADM-003',
    name: 'Julian Vance',
    email: 'julian.finance@influverse.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'finance',
    status: 'active',
    twoFactorEnabled: true,
    lastLogin: '2 days ago',
    createdAt: '2025-04-05',
  },
  {
    id: 'ADM-004',
    name: 'Amara Diallo',
    email: 'amara.mod@influverse.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    role: 'moderator',
    status: 'active',
    twoFactorEnabled: false,
    lastLogin: '3 hours ago',
    createdAt: '2025-06-18',
  },
];

export const INITIAL_USERS: MarketplaceUser[] = [
  {
    id: 'USR-8910',
    name: 'Sophie Kim',
    email: 'sophie@sophiekim.com',
    handle: 'sophiekim',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    role: 'creator',
    status: 'active',
    category: 'Beauty & Skincare',
    location: 'Los Angeles, CA',
    rating: 4.98,
    totalVolumeEur: 28400,
    ordersCount: 32,
    joinedDate: '2025-02-14',
  },
  {
    id: 'USR-8911',
    name: 'Maya Chen',
    email: 'maya@wellnesschen.com',
    handle: 'mayachen',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    role: 'creator',
    status: 'active',
    category: 'Fitness & Health',
    location: 'London, UK',
    rating: 5.0,
    totalVolumeEur: 19500,
    ordersCount: 24,
    joinedDate: '2025-03-01',
  },
  {
    id: 'USR-8912',
    name: 'Liam Carter',
    email: 'liam@cartercinematics.com',
    handle: 'liamcarter',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    role: 'creator',
    status: 'active',
    category: 'Tech & Gadgets',
    location: 'Berlin, Germany',
    rating: 4.92,
    totalVolumeEur: 42100,
    ordersCount: 41,
    joinedDate: '2025-01-20',
  },
  {
    id: 'USR-8913',
    name: 'Elena Rostova',
    email: 'elena@aura-cosmetics.com',
    handle: 'auracosmetics',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    role: 'brand',
    status: 'active',
    companyName: 'Aura Skincare Paris S.A.S.',
    location: 'Paris, France',
    totalVolumeEur: 68450,
    ordersCount: 18,
    joinedDate: '2025-01-15',
  },
  {
    id: 'USR-8914',
    name: 'Nordica Apparel',
    email: 'marketing@nordica-sports.se',
    handle: 'nordicasports',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    role: 'brand',
    status: 'active',
    companyName: 'Nordica Activewear AB',
    location: 'Stockholm, Sweden',
    totalVolumeEur: 34200,
    ordersCount: 11,
    joinedDate: '2025-04-10',
  },
  {
    id: 'USR-8915',
    name: 'Darius Vance',
    email: 'darius@vancehype.io',
    handle: 'dariusvance',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    role: 'creator',
    status: 'suspended',
    category: 'Crypto & Gaming',
    location: 'Miami, USA',
    rating: 3.4,
    totalVolumeEur: 4200,
    ordersCount: 5,
    joinedDate: '2025-05-12',
    banReason: 'Attempted off-platform WhatsApp payment to circumvent 15% platform escrow fee.',
    banActionType: 'temporary',
  },
];

export const INITIAL_VERIFICATIONS: VerificationRequest[] = [
  {
    id: 'VRF-401',
    creatorId: 'USR-9001',
    creatorName: 'Aria Montclaire',
    handle: 'ariamontclaire',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    category: 'Luxury Fashion',
    followersTotal: '450K',
    platforms: { instagram: '@aria.mont', tiktok: '@ariamontclaire' },
    sampleWorkTitle: 'Prada Fall Collection UGC Reel',
    sampleWorkViews: '620K Views',
    submittedDate: '2026-09-26',
    status: 'pending',
  },
  {
    id: 'VRF-402',
    creatorId: 'USR-9002',
    creatorName: 'Kaito Tanaka',
    handle: 'kaitotanaka',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    category: 'Culinary & Matcha UGC',
    followersTotal: '280K',
    platforms: { instagram: '@kaito.cooks', youtube: 'Kaito Cooking Studio' },
    sampleWorkTitle: 'Kyoto Ceremonial Matcha Storyboard',
    sampleWorkViews: '310K Views',
    submittedDate: '2026-09-25',
    status: 'pending',
  },
];

export const INITIAL_DISPUTES: EscrowDispute[] = [
  {
    id: 'DSP-8821',
    orderId: 'ORD-94102',
    brandName: 'Aura Skincare Paris',
    brandAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    creatorName: 'Sophie Kim',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    campaignTitle: 'Serum Launch 4K UGC Reel + 2 Re-cuts',
    amountEur: 1200,
    feeEur: 180,
    disputeReason: 'Brand claims lighting & tone do not match agreed moodboard; Creator claims script was fully approved.',
    status: 'open',
    submittedDate: '2026-09-24',
    briefSummary: 'Deliver 1x 45s vertical reel featuring hydrating serum texture shot and 3-second hook.',
    deliverableLink: 'https://storage.influverse.com/deliverables/nordica_draft_v2.mp4',
  },
];

export const INITIAL_LEGAL_DOCS: CmsLegalDoc[] = [
  {
    id: 'CMS-TOS',
    slug: 'terms',
    title: 'Terms of Service',
    version: '2.4',
    lastModified: 'September 2026',
    isPublished: true,
    contentMarkdown: `# Terms of Service — Influverse Marketplace

## 1. Introduction and Acceptance
By registering as a Brand or Creator on Influverse, you accept full adherence to these terms, our 15% escrow policy, and our dispute arbitration procedures.

## 2. Escrow Protection & Deposit Policy
All brand collaboration funds are placed into segregated escrow holding accounts before creator production begins. Escrow is released only upon brand approval or admin dispute resolution.

## 3. Commercial Ad Rights and Whitelisting
Creators grant brands standard digital advertising rights for a minimum of 12 months unless specified otherwise in custom package add-ons.`,
  },
  {
    id: 'CMS-PRIVACY',
    slug: 'privacy',
    title: 'Privacy Policy',
    version: '1.9',
    lastModified: 'September 2026',
    isPublished: true,
    contentMarkdown: `# Privacy Policy & GDPR Compliance

## 1. Information We Collect
We collect personal identification, business legal registration, social media statistics, and billing information necessary to execute contracts and deliver tax-compliant invoices.

## 2. Escrow Financial Data
We do not store full credit card numbers. All payments are processed through PCI-DSS Level 1 compliant partners (Stripe & Wise).`,
  },
];

export const INITIAL_FAQS: CmsFaqItem[] = [
  {
    id: 'FAQ-01',
    category: 'brands',
    question: 'How does escrow protection guarantee our campaign delivery?',
    answer: 'When you fund an order, your capital is locked in secure platform escrow. The creator is not paid until you review the video and approve the deliverable.',
    order: 1,
    isPublished: true,
  },
  {
    id: 'FAQ-02',
    category: 'creators',
    question: 'When do I receive payment for approved deliverables?',
    answer: 'Escrow is disbursed instantly to your connected bank account or Wise wallet within 24 hours of brand approval.',
    order: 2,
    isPublished: true,
  },
  {
    id: 'FAQ-03',
    category: 'escrow',
    question: 'What is the platform commission fee?',
    answer: 'Influverse charges a transparent 15% platform fee on all transactions, paid by the hiring brand with zero creator deductions.',
    order: 3,
    isPublished: true,
  },
];

export const INITIAL_BRAND_ASSETS: CmsBrandAssets = {
  logoLightUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
  logoDarkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
  faviconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=32&q=80',
  heroHeadline: 'Where Luxury Brands Discover & Hire Top 1% Creators',
  heroSubtitle: 'The high-trust creator marketplace with 100% escrow protection and direct EUR pricing.',
  supportEmail: 'concierge@influverse.com',
  socialLinks: {
    instagram: 'https://instagram.com/influverse',
    twitter: 'https://twitter.com/influverse',
    linkedin: 'https://linkedin.com/company/influverse',
  },
};
