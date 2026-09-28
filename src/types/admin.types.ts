export type AdminRole = 'super_admin' | 'operations' | 'finance' | 'moderator';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  status: 'active' | 'suspended';
  twoFactorEnabled: boolean;
  lastLogin: string;
  createdAt: string;
}

export type UserStatus = 'active' | 'pending_verification' | 'suspended' | 'banned';

export interface MarketplaceUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  role: 'creator' | 'brand';
  status: UserStatus;
  category?: string;
  companyName?: string;
  location: string;
  rating?: number;
  totalVolumeEur: number;
  ordersCount: number;
  joinedDate: string;
  banReason?: string;
  banActionType?: 'warning' | 'temporary' | 'permanent';
  escrowDisposition?: 'refund' | 'hold';
  notes?: string;
}

export interface VerificationRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  handle: string;
  avatar: string;
  category: string;
  followersTotal: string;
  platforms: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  sampleWorkTitle: string;
  sampleWorkViews: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface EscrowDispute {
  id: string;
  orderId: string;
  brandName: string;
  brandAvatar: string;
  creatorName: string;
  creatorAvatar: string;
  campaignTitle: string;
  amountEur: number;
  feeEur: number;
  disputeReason: string;
  status: 'open' | 'resolved_creator' | 'resolved_brand' | 'resolved_split';
  splitRatio?: string;
  submittedDate: string;
  briefSummary: string;
  deliverableLink: string;
}

export interface CmsLegalDoc {
  id: string;
  slug: 'terms' | 'privacy';
  title: string;
  version: string;
  lastModified: string;
  contentMarkdown: string;
  isPublished: boolean;
}

export interface CmsFaqItem {
  id: string;
  category: 'brands' | 'creators' | 'escrow';
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
}

export interface CmsBrandAssets {
  logoLightUrl: string;
  logoDarkUrl: string;
  faviconUrl: string;
  heroHeadline: string;
  heroSubtitle: string;
  supportEmail: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    linkedin: string;
  };
}

export type TransactionType =
  | 'escrow_deposit'
  | 'creator_payout'
  | 'platform_fee'
  | 'brand_refund'
  | 'arbitration_split';

export type TransactionStatus =
  | 'completed'
  | 'escrow_locked'
  | 'pending'
  | 'failed'
  | 'refunded';

export interface MarketplaceTransaction {
  id: string;
  orderId: string;
  brandName: string;
  brandAvatar: string;
  creatorName: string;
  creatorAvatar: string;
  campaignTitle: string;
  type: TransactionType;
  grossAmountEur: number;
  platformFeeEur: number;
  netAmountEur: number;
  paymentMethod: 'stripe_connect' | 'sepa_transfer' | 'wise' | 'credit_card';
  status: TransactionStatus;
  createdAt: string;
  stripePaymentIntentId: string;
  invoiceNumber: string;
}

export type PackageTier = 'starter' | 'standard' | 'premium' | 'enterprise';

export interface MarketplacePackage {
  id: string;
  title: string;
  description: string;
  category: string;
  tier: PackageTier;
  priceEur: number;
  deliveryDays: number;
  revisionsCount: number;
  adRightsMonths: number;
  deliverables: string[];
  isFeatured: boolean;
  isPublished: boolean;
  ordersCount: number;
  creatorCount: number;
  createdAt: string;
}


