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
  email: string;
  handle: string;
  avatar: string;
  category: string;
  platform?: string;
  submittedDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  followersTotal?: string;
  platforms?: {
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  sampleWorkTitle?: string;
  sampleWorkViews?: string;
  sampleWorkUrl?: string;
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
  slug: string;
  title: string;
  version: string;
  lastModified: string;
  contentMarkdown: string;
  isPublished: boolean;
}

export interface CmsFaqItem {
  id: string;
  category?: string;
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

export type OrderStatus =
  | 'escrow_funded'
  | 'in_progress'
  | 'deliverable_submitted'
  | 'revision_requested'
  | 'completed'
  | 'disputed'
  | 'cancelled';

export interface OrderMilestone {
  title: string;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
  notes?: string;
}

export interface MarketplaceOrder {
  id: string; // e.g. "ORD-84920"
  packageTitle: string;
  packageTier: PackageTier;
  category: string;
  brandName: string;
  brandAvatar: string;
  brandEmail: string;
  creatorName: string;
  creatorAvatar: string;
  creatorHandle: string;
  grossAmountEur: number;
  platformFeeEur: number; // 15%
  creatorNetEur: number;
  status: OrderStatus;
  progressPercent: number; // 0 to 100
  deliveryDaysTotal: number;
  daysRemaining: number; // positive = days left, negative = overdue, 0 = due today
  dueDate: string;
  revisionCurrent: number;
  revisionMax: number;
  deliverablesSummary: string[];
  deliverableLink?: string;
  escrowDepositId: string;
  milestones: OrderMilestone[];
  createdAt: string;
  lastActivity: string;
  brandNotes?: string;
  slaWarning?: boolean;
}

export type TicketType = 'support' | 'user_report';
export type TicketPriority = 'urgent' | 'high' | 'normal' | 'low';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: 'brand' | 'creator' | 'admin';
  senderAvatar: string;
  message: string;
  timestamp: string;
  isAdminReply?: boolean;
}

export interface SupportTicket {
  id: string; // e.g. "TCK-4019"
  type: TicketType;
  subject: string;
  category: 'billing_escrow' | 'account_access' | 'order_delivery' | 'fraud_scam' | 'copyright_ip' | 'general';
  userName: string;
  userEmail: string;
  userRole: 'brand' | 'creator';
  userAvatar: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAdmin?: string;
  reportedUser?: {
    name: string;
    handle?: string;
    role: 'brand' | 'creator';
    avatar: string;
    reason: string;
  };
  messages: TicketMessage[];
  createdAt: string;
  lastUpdated: string;
}




