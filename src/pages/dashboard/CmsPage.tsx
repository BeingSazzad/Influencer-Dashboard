import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedLegalSlug,
  updateLegalDoc,
  addFaq,
  updateFaq,
  deleteFaq,
  reorderFaq,
  updateBrandAssets,
} from '@/store/slices/cmsSlice';
import { CmsFaqItem, SocialMediaItem } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { ImageUploadBox } from '@/components/shared/ImageUploadBox';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import {
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Search,
  ExternalLink,
  Building2,
  User,
  ChevronUp,
  ChevronDown,
  Share2,
} from 'lucide-react';
import { PartnerBrandsSection } from './components/PartnerBrandsSection';

interface OfficialSocialConfig {
  key: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube';
  name: string;
  placeholder: string;
  handleHint: string;
  badge: React.ReactNode;
}

const OFFICIAL_SOCIAL_PLATFORMS: OfficialSocialConfig[] = [
  {
    key: 'facebook',
    name: 'Facebook',
    placeholder: 'https://facebook.com/influverse',
    handleHint: 'facebook.com/...',
    badge: (
      <svg className="w-8 h-8 shrink-0 rounded-xl shadow-xs" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="16" fill="#0866FF" />
        <path
          d="M21.5 16h-3.3v11.5h-4.8V16h-2.3v-4.1h2.3v-2.7c0-3.2 1.9-5 4.9-5 1.4 0 2.9.3 2.9.3v3.2h-1.6c-1.6 0-2.1 1-2.1 2v2.2h3.6l-.6 4.1z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    key: 'instagram',
    name: 'Instagram',
    placeholder: 'https://instagram.com/influverse',
    handleHint: 'instagram.com/...',
    badge: (
      <svg className="w-8 h-8 shrink-0 rounded-xl shadow-xs" viewBox="0 0 32 32" fill="none">
        <defs>
          <linearGradient id="igOfficialGrad" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#833AB4" />
            <stop offset="25%" stopColor="#C13584" />
            <stop offset="50%" stopColor="#E1306C" />
            <stop offset="75%" stopColor="#FD1D1D" />
            <stop offset="100%" stopColor="#F77737" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#igOfficialGrad)" />
        <rect x="7" y="7" width="18" height="18" rx="5" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <circle cx="16" cy="16" r="4.3" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <circle cx="21.5" cy="10.5" r="1.3" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    name: 'X (Twitter)',
    placeholder: 'https://x.com/influverse',
    handleHint: 'x.com/...',
    badge: (
      <svg className="w-8 h-8 shrink-0 rounded-xl shadow-xs" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#000000" />
        <path
          d="M19.5 7h2.7l-5.9 6.8 7 9.2h-5.4l-4.2-5.5-4.9 5.5H6.1l6.3-7.2L5.8 7h5.6l3.8 5.1L19.5 7zm-1 14.3h1.5L10.7 8.5H9.1l9.4 12.8z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    placeholder: 'https://linkedin.com/company/influverse',
    handleHint: 'linkedin.com/company/...',
    badge: (
      <svg className="w-8 h-8 shrink-0 rounded-xl shadow-xs" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#0A66C2" />
        <path
          d="M10.8 13.5H7.8V24h3V13.5zm-1.5-4.2c-1 0-1.8.8-1.8 1.7 0 1 .8 1.7 1.8 1.7 1 0 1.8-.8 1.8-1.7 0-.9-.8-1.7-1.8-1.7zm15.2 7.7c0-3.3-1.8-4.9-4.1-4.9-1.9 0-2.8 1.1-3.3 1.8V13.5H14V24h3v-5.8c0-1.5.3-3 2.1-3 1.8 0 1.8 1.7 1.8 3.1V24h3v-7z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
  {
    key: 'youtube',
    name: 'YouTube',
    placeholder: 'https://youtube.com/@influverse',
    handleHint: 'youtube.com/@...',
    badge: (
      <svg className="w-8 h-8 shrink-0 rounded-xl shadow-xs" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="8" fill="#FF0000" />
        <path
          d="M24.8 11.2c-.3-1-.9-1.7-1.9-2-1.7-.4-8.9-.4-8.9-.4s-7.2 0-8.9.4c-1 .3-1.6 1-1.9 2C2.8 12.9 2.8 16 2.8 16s0 3.1.4 4.8c.3 1 .9 1.7 1.9 2 1.7.4 8.9.4 8.9.4s7.2 0 8.9-.4c1-.3 1.6-1 1.9-2 .4-1.7.4-4.8.4-4.8s0-3.1-.4-4.8zM13.4 19.3v-6.6l5.7 3.3-5.7 3.3z"
          fill="#FFFFFF"
        />
      </svg>
    ),
  },
];

export const CmsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { legalDocs, selectedLegalSlug, faqs, brandAssets, partnerBrands } =
    useAppSelector((state) => state.cms);

  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs: Array<'legal' | 'brands' | 'faqs' | 'branding'> = ['legal', 'brands', 'faqs', 'branding'];
  const queryTab = searchParams.get('tab') as 'legal' | 'brands' | 'faqs' | 'branding' | null;
  const initialTab = queryTab && validTabs.includes(queryTab) ? queryTab : 'faqs';
  const [activeTab, setActiveTabState] = useState<'legal' | 'brands' | 'faqs' | 'branding'>(initialTab);

  const setActiveTab = (tab: 'legal' | 'brands' | 'faqs' | 'branding') => {
    setActiveTabState(tab);
    setSearchParams({ tab });
  };

  // Legal Doc Editor State
  const currentLegalDoc =
    legalDocs.find((d) => d.slug === selectedLegalSlug) || legalDocs[0];
  const [legalContent, setLegalContent] = useState(
    currentLegalDoc?.contentMarkdown || ''
  );
  const [isEditingPolicy, setIsEditingPolicy] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Sync state if slug changes
  const handleSelectSlug = (slug: string) => {
    dispatch(setSelectedLegalSlug(slug));
    const doc = legalDocs.find((d) => d.slug === slug);
    if (doc) {
      setLegalContent(doc.contentMarkdown);
    }
    setIsEditingPolicy(false);
  };

  const handleCancelEditPolicy = () => {
    setLegalContent(currentLegalDoc?.contentMarkdown || '');
    setIsEditingPolicy(false);
  };

  const handleSaveLegal = () => {
    dispatch(
      updateLegalDoc({
        slug: selectedLegalSlug,
        contentMarkdown: legalContent,
      })
    );
    setIsEditingPolicy(false);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // FAQ State (Separate tabs for Brands and Creators)
  const [activeFaqAudience, setActiveFaqAudience] = useState<'brands' | 'creators'>('brands');
  const [faqCategory, setFaqCategory] = useState<'brands' | 'creators'>('brands');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<CmsFaqItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  const handleOpenNewFaq = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory(activeFaqAudience);
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: CmsFaqItem) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category === 'creators' ? 'creators' : 'brands');
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;

    if (editingFaq) {
      dispatch(
        updateFaq({
          ...editingFaq,
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          category: faqCategory,
        })
      );
    } else {
      const countInCategory = faqs.filter(
        (f) => (f.category || 'brands') === faqCategory
      ).length;
      dispatch(
        addFaq({
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          category: faqCategory,
          order: countInCategory + 1,
          isPublished: true,
        })
      );
    }

    setIsFaqModalOpen(false);
  };

  const brandFaqs = faqs.filter((f) => (f.category || 'brands') === 'brands');
  const creatorFaqs = faqs.filter((f) => f.category === 'creators');
  const audienceFaqs = activeFaqAudience === 'brands' ? brandFaqs : creatorFaqs;

  const filteredFaqs = audienceFaqs.filter((f) => {
    if (!faqSearchQuery.trim()) return true;
    const query = faqSearchQuery.toLowerCase();
    return (
      f.question.toLowerCase().includes(query) ||
      f.answer.toLowerCase().includes(query)
    );
  });

  // Brand Assets State
  const [logoLight, setLogoLight] = useState(brandAssets.logoLightUrl);
  const [logoDark, setLogoDark] = useState(brandAssets.logoDarkUrl);
  const [favicon, setFavicon] = useState(brandAssets.faviconUrl);
  const [headline, setHeadline] = useState(brandAssets.heroHeadline);
  const [subtitle, setSubtitle] = useState(brandAssets.heroSubtitle);
  const [supportEmail, setSupportEmail] = useState(brandAssets.supportEmail);
  const [brandSavedNotice, setBrandSavedNotice] = useState(false);

  // Fixed Official Social Media Profiles State
  const [socialLinks, setSocialLinks] = useState({
    facebook: brandAssets.socialLinks?.facebook || 'https://facebook.com/influverse',
    instagram: brandAssets.socialLinks?.instagram || 'https://instagram.com/influverse',
    twitter: brandAssets.socialLinks?.twitter || 'https://x.com/influverse',
    linkedin: brandAssets.socialLinks?.linkedin || 'https://linkedin.com/company/influverse',
    youtube: brandAssets.socialLinks?.youtube || 'https://youtube.com/@influverse',
  });

  // Social Link Edit Modal State
  const [editingSocialKey, setEditingSocialKey] = useState<
    'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube' | null
  >(null);
  const [tempSocialUrl, setTempSocialUrl] = useState('');

  const handleOpenEditSocial = (
    key: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'youtube'
  ) => {
    setEditingSocialKey(key);
    setTempSocialUrl(socialLinks[key] || '');
  };

  const handleSaveSocialModal = () => {
    if (!editingSocialKey) return;
    const updated = {
      ...socialLinks,
      [editingSocialKey]: tempSocialUrl.trim(),
    };
    setSocialLinks(updated);

    const updatedSocialList: SocialMediaItem[] = [
      { id: 'SOC-FB', platform: 'Facebook', url: updated.facebook },
      { id: 'SOC-IG', platform: 'Instagram', url: updated.instagram },
      { id: 'SOC-X', platform: 'X / Twitter', url: updated.twitter },
      { id: 'SOC-LI', platform: 'LinkedIn', url: updated.linkedin },
      { id: 'SOC-YT', platform: 'YouTube', url: updated.youtube },
    ];

    dispatch(
      updateBrandAssets({
        ...brandAssets,
        socialLinks: updated,
        socialList: updatedSocialList,
      })
    );
    setEditingSocialKey(null);
    setBrandSavedNotice(true);
    setTimeout(() => setBrandSavedNotice(false), 2500);
  };

  const handleSaveBrand = () => {
    const updatedSocialList: SocialMediaItem[] = [
      { id: 'SOC-FB', platform: 'Facebook', url: socialLinks.facebook },
      { id: 'SOC-IG', platform: 'Instagram', url: socialLinks.instagram },
      { id: 'SOC-X', platform: 'X / Twitter', url: socialLinks.twitter },
      { id: 'SOC-LI', platform: 'LinkedIn', url: socialLinks.linkedin },
      { id: 'SOC-YT', platform: 'YouTube', url: socialLinks.youtube },
    ];

    dispatch(
      updateBrandAssets({
        logoLightUrl: logoLight,
        logoDarkUrl: logoDark,
        faviconUrl: favicon,
        heroHeadline: headline,
        heroSubtitle: subtitle,
        supportEmail: supportEmail,
        socialLinks: socialLinks,
        socialList: updatedSocialList,
      })
    );
    setBrandSavedNotice(true);
    setTimeout(() => setBrandSavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CMS"
        subtitle="Manage website policies, partner brand logos, FAQs, and branding assets."
      />

      {/* Main CMS Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'legal'
              ? 'border-brand-black text-brand-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Pages</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'faqs'
              ? 'border-brand-black text-brand-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>FAQs</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'branding'
              ? 'border-brand-black text-brand-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Branding</span>
        </button>

        <button
          onClick={() => setActiveTab('brands')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'brands'
              ? 'border-brand-black text-brand-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Trusted By</span>
        </button>
      </div>

      {/* TAB: PARTNER BRANDS (AUTO-SCROLL MARQUEE LOGOS) */}
      {activeTab === 'brands' && <PartnerBrandsSection />}

      {/* TAB 1: LEGAL DOCUMENTS */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          {saveSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Document updated and synchronized live.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left selector */}
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-neutral-500 tracking-wider">
                Policies
              </span>
              <div className="space-y-1.5">
                {legalDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectSlug(doc.slug)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all ${
                      selectedLegalSlug === doc.slug
                        ? 'border-brand-black bg-brand-black text-white shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-sm font-bold leading-snug">{doc.title}</div>
                    <div
                      className={`text-xs mt-1 font-medium ${
                        selectedLegalSlug === doc.slug
                          ? 'text-neutral-300'
                          : 'text-neutral-500'
                      }`}
                    >
                      {doc.lastModified}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Editor Area */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 mb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-neutral-950 flex items-center gap-2">
                      <span>{currentLegalDoc?.title}</span>
                      <Badge variant={isEditingPolicy ? 'pink' : 'neutral'} size="sm">
                        {isEditingPolicy ? 'Editing' : 'Active'}
                      </Badge>
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">
                      Last updated: {currentLegalDoc?.lastModified}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isEditingPolicy ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-bold text-xs"
                          onClick={handleCancelEditPolicy}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="accent"
                          size="sm"
                          className="font-bold text-xs"
                          onClick={handleSaveLegal}
                          leftIcon={<Save className="w-3.5 h-3.5" />}
                        >
                          Save Policy
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="accent"
                        size="sm"
                        className="font-bold text-xs"
                        onClick={() => setIsEditingPolicy(true)}
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                      >
                        Edit Policy
                      </Button>
                    )}
                  </div>
                </div>

                {/* Formatted Text Editor */}
                <RichTextEditor
                  value={legalContent}
                  onChange={setLegalContent}
                  placeholder="Write policy content here..."
                  minHeight="440px"
                  readOnly={!isEditingPolicy}
                />
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SEPARATE FAQS FOR BRANDS & CREATORS */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          {/* Header Controls: Segmented Audience Switcher & Search / Add */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white border border-neutral-200 rounded-2xl shadow-xs">
            {/* Segmented Brand vs Creator Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-neutral-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveFaqAudience('brands')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFaqAudience === 'brands'
                    ? 'bg-white text-brand-black shadow-xs font-extrabold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>For Brands</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    activeFaqAudience === 'brands'
                      ? 'bg-brand-black text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {brandFaqs.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFaqAudience('creators')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeFaqAudience === 'creators'
                    ? 'bg-white text-brand-black shadow-xs font-extrabold'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>For Creators</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    activeFaqAudience === 'creators'
                      ? 'bg-brand-black text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {creatorFaqs.length}
                </span>
              </button>
            </div>

            {/* Search & Add Action */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={faqSearchQuery}
                  onChange={(e) => setFaqSearchQuery(e.target.value)}
                  placeholder={`Search ${activeFaqAudience === 'brands' ? 'Brand' : 'Creator'} FAQs...`}
                  className="w-full pl-10 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-semibold placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
                />
              </div>

              <Button
                variant="accent"
                size="sm"
                className="font-bold shrink-0 text-xs"
                onClick={handleOpenNewFaq}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Question
              </Button>
            </div>
          </div>

          {/* FAQ List for Active Audience */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-xs font-medium">
                {faqSearchQuery
                  ? `No ${activeFaqAudience === 'brands' ? 'Brand' : 'Creator'} FAQ items found matching "${faqSearchQuery}".`
                  : `No FAQ items added for ${activeFaqAudience === 'brands' ? 'Brands' : 'Creators'} yet.`}
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <Card key={faq.id} hoverEffect className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        {/* Clean Up / Down Arrow Controls within Category */}
                        <div className="inline-flex items-center bg-neutral-100 rounded-lg border border-neutral-200 p-0.5 shadow-2xs">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(reorderFaq({ id: faq.id, direction: 'up' }));
                            }}
                            title="Move question up"
                            className="p-1 rounded text-neutral-600 hover:text-neutral-950 hover:bg-white disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>

                          <span className="font-mono text-xs font-black text-neutral-700 px-1.5 select-none">
                            #{index + 1}
                          </span>

                          <button
                            type="button"
                            disabled={index === filteredFaqs.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              dispatch(reorderFaq({ id: faq.id, direction: 'down' }));
                            }}
                            title="Move question down"
                            className="p-1 rounded text-neutral-600 hover:text-neutral-950 hover:bg-white disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <h4 className="text-sm font-extrabold text-neutral-950">
                        {faq.question}
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl font-medium">
                        {faq.answer}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-bold text-xs p-2 text-neutral-600 hover:text-neutral-950"
                        onClick={() => handleOpenEditFaq(faq)}
                        title="Edit question"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 p-2"
                        onClick={() => dispatch(deleteFaq(faq.id))}
                        title="Delete question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Add / Edit FAQ Modal */}
          {isFaqModalOpen && (
            <Modal
              isOpen={true}
              onClose={() => setIsFaqModalOpen(false)}
              title={editingFaq ? 'Edit FAQ' : 'Add FAQ'}
              maxWidth="md"
              footer={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-bold"
                    onClick={() => setIsFaqModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    className="font-bold"
                    onClick={handleSaveFaq}
                  >
                    {editingFaq ? 'Save Changes' : 'Add Question'}
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                {/* Target Audience Selector */}
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFaqCategory('brands')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        faqCategory === 'brands'
                          ? 'border-brand-black bg-brand-black text-white shadow-2xs font-extrabold'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>For Brands</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFaqCategory('creators')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        faqCategory === 'creators'
                          ? 'border-brand-black bg-brand-black text-white shadow-2xs font-extrabold'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>For Creators</span>
                    </button>
                  </div>
                </div>

                <Input
                  label="Question"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder={
                    faqCategory === 'brands'
                      ? 'e.g. How does the escrow protection work for hiring brands?'
                      : 'e.g. When and how do creators receive payments?'
                  }
                  className="font-bold"
                  required
                />

                <Textarea
                  label="Answer"
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Provide a clear, helpful explanation..."
                  rows={4}
                  required
                />
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* TAB 3: BRAND ASSETS & DIRECT FILE UPLOADS */}
      {activeTab === 'branding' && (
        <div className="space-y-6 max-w-4xl">
          {brandSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Brand identity assets and global copy saved successfully.</span>
            </div>
          )}

          <Card className="p-6 space-y-6">
            <div className="border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-extrabold text-neutral-900">
                Brand Identity
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUploadBox
                label="Logo"
                value={logoDark}
                onChange={(val) => {
                  setLogoDark(val);
                  setLogoLight(val);
                }}
                previewBg="light"
                recommendedDimensions="SVG or PNG (400x100px)"
              />

              <ImageUploadBox
                label="Favicon"
                value={favicon}
                onChange={setFavicon}
                aspectRatio="square"
                previewBg="light"
                recommendedDimensions="32x32px or 64x64px"
              />
            </div>

            {/* Homepage Messaging */}
            <div className="pt-4 border-t border-neutral-100 space-y-3">
              <h3 className="text-sm font-extrabold text-neutral-900">
                Homepage Copy
              </h3>

              <Input
                label="Hero Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="font-bold text-xs"
              />

              <Textarea
                label="Hero Subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
              />

              <Input
                label="Support Email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="font-bold text-xs"
              />
            </div>

            {/* Social Media Links Section */}
            <div className="pt-6 border-t border-neutral-100 space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-neutral-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-brand-black" />
                  <span>Official Social Media Profiles</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Direct profile links to your official brand channels. Displayed across the website header, footer, and emails.
                </p>
              </div>

              {/* Fixed 5 Platforms List with Official Logos */}
              <div className="space-y-3">
                {OFFICIAL_SOCIAL_PLATFORMS.map((platform) => {
                  const currentUrl = socialLinks[platform.key];
                  const hasUrl = Boolean(currentUrl && currentUrl.trim().length > 0);

                  return (
                    <div
                      key={platform.key}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-neutral-50/70 border border-neutral-200 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3 sm:w-44 shrink-0">
                        {platform.badge}
                        <div>
                          <span className="block text-xs font-bold text-neutral-900">{platform.name}</span>
                          <span className="block text-[10px] text-neutral-400 font-mono truncate">{platform.handleHint}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          {hasUrl ? (
                            <div className="flex items-center gap-2 bg-white border border-neutral-200 px-3.5 py-2 rounded-xl shadow-2xs">
                              <span className="text-xs font-mono text-neutral-800 font-semibold truncate flex-1" title={currentUrl}>
                                {currentUrl}
                              </span>
                            </div>
                          ) : (
                            <div className="bg-white/60 border border-dashed border-neutral-200 px-3.5 py-2 rounded-xl text-xs text-neutral-400 italic">
                              No URL configured yet
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-bold text-xs gap-1.5 text-neutral-800 hover:text-neutral-950 border-neutral-200 bg-white hover:bg-neutral-100 shadow-2xs cursor-pointer"
                            onClick={() => handleOpenEditSocial(platform.key)}
                          >
                            <Edit2 className="w-3.5 h-3.5 text-neutral-600" />
                            <span>Edit Link</span>
                          </Button>

                          {hasUrl ? (
                            <a
                              href={currentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Visit official ${platform.name} channel`}
                              className="p-2 rounded-lg border border-neutral-200 hover:border-brand-black text-neutral-500 hover:text-brand-black bg-white hover:bg-neutral-100 transition-all shrink-0 cursor-pointer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          ) : (
                            <div
                              title="No link configured"
                              className="p-2 rounded-lg border border-transparent text-neutral-300 bg-transparent shrink-0 cursor-not-allowed"
                            >
                              <ExternalLink className="w-4 h-4 opacity-30" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button
                variant="accent"
                size="sm"
                className="font-bold text-xs"
                onClick={handleSaveBrand}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save Changes
              </Button>
            </div>
          </Card>

          {/* Edit Official Social Link Modal */}
          {editingSocialKey && (
            <Modal
              isOpen={true}
              onClose={() => setEditingSocialKey(null)}
              title={
                <div className="flex items-center gap-2.5">
                  {OFFICIAL_SOCIAL_PLATFORMS.find((p) => p.key === editingSocialKey)?.badge}
                  <span>
                    Edit {OFFICIAL_SOCIAL_PLATFORMS.find((p) => p.key === editingSocialKey)?.name} Link
                  </span>
                </div>
              }
              description="Enter your official brand channel URL to display across website header, footer, and emails."
              maxWidth="md"
              footer={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingSocialKey(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    className="font-bold"
                    onClick={handleSaveSocialModal}
                  >
                    Save Link
                  </Button>
                </>
              }
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveSocialModal();
                }}
                className="space-y-4"
              >
                <Input
                  label="Official Profile URL"
                  type="url"
                  value={tempSocialUrl}
                  onChange={(e) => setTempSocialUrl(e.target.value)}
                  placeholder={
                    OFFICIAL_SOCIAL_PLATFORMS.find((p) => p.key === editingSocialKey)?.placeholder ||
                    'https://...'
                  }
                  helperText={`Example: ${OFFICIAL_SOCIAL_PLATFORMS.find((p) => p.key === editingSocialKey)?.placeholder}`}
                  autoFocus
                  required
                />

                {tempSocialUrl.trim().length > 0 && (
                  <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-neutral-500 font-medium">Link Preview Test:</span>
                    <a
                      href={tempSocialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-neutral-900 hover:text-brand-pink flex items-center gap-1"
                    >
                      <span>Test Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </form>
            </Modal>
          )}
        </div>
      )}
    </div>
  );
};
