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
  Sparkles,
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
      <div className="w-8 h-8 rounded-xl bg-[#1877F2] flex items-center justify-center shrink-0 shadow-xs">
        <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
    ),
  },
  {
    key: 'instagram',
    name: 'Instagram',
    placeholder: 'https://instagram.com/influverse',
    handleHint: 'instagram.com/...',
    badge: (
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] flex items-center justify-center shrink-0 shadow-xs">
        <svg className="w-4.5 h-4.5 text-white stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
        </svg>
      </div>
    ),
  },
  {
    key: 'twitter',
    name: 'X (Twitter)',
    placeholder: 'https://x.com/influverse',
    handleHint: 'x.com/...',
    badge: (
      <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shrink-0 shadow-xs">
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </div>
    ),
  },
  {
    key: 'linkedin',
    name: 'LinkedIn',
    placeholder: 'https://linkedin.com/company/influverse',
    handleHint: 'linkedin.com/company/...',
    badge: (
      <div className="w-8 h-8 rounded-xl bg-[#0A66C2] flex items-center justify-center shrink-0 shadow-xs">
        <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      </div>
    ),
  },
  {
    key: 'youtube',
    name: 'YouTube',
    placeholder: 'https://youtube.com/@influverse',
    handleHint: 'youtube.com/@...',
    badge: (
      <div className="w-8 h-8 rounded-xl bg-[#FF0000] flex items-center justify-center shrink-0 shadow-xs">
        <svg className="w-4.5 h-4.5 fill-white" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </div>
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
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Sync state if slug changes
  const handleSelectSlug = (slug: string) => {
    dispatch(setSelectedLegalSlug(slug));
    const doc = legalDocs.find((d) => d.slug === slug);
    if (doc) {
      setLegalContent(doc.contentMarkdown);
    }
  };

  const handleSaveLegal = () => {
    dispatch(
      updateLegalDoc({
        slug: selectedLegalSlug,
        contentMarkdown: legalContent,
      })
    );
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
                      <Badge variant="neutral" size="sm">
                        Active
                      </Badge>
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium mt-0.5">
                      Last updated: {currentLegalDoc?.lastModified}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="accent"
                      size="sm"
                      className="font-bold text-xs"
                      onClick={handleSaveLegal}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                    >
                      Save Policy
                    </Button>
                  </div>
                </div>

                {/* Formatted Text Editor */}
                <RichTextEditor
                  value={legalContent}
                  onChange={setLegalContent}
                  placeholder="Write policy content here..."
                  minHeight="440px"
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
                <Sparkles className="w-3.5 h-3.5" />
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
                      <Sparkles className="w-3.5 h-3.5" />
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
                        <div className="flex-1">
                          <Input
                            type="url"
                            placeholder={platform.placeholder}
                            value={currentUrl}
                            onChange={(e) =>
                              setSocialLinks((prev) => ({
                                ...prev,
                                [platform.key]: e.target.value,
                              }))
                            }
                            className="text-xs font-mono bg-white"
                          />
                        </div>
                        {hasUrl ? (
                          <a
                            href={currentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Open ${platform.name} profile in new tab`}
                            className="p-2 rounded-lg border border-neutral-200 hover:border-brand-black text-neutral-500 hover:text-brand-black bg-white hover:bg-neutral-100 transition-all shrink-0 cursor-pointer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <div
                            title="Enter URL to preview"
                            className="p-2 rounded-lg border border-transparent text-neutral-300 bg-transparent shrink-0 cursor-not-allowed"
                          >
                            <ExternalLink className="w-4 h-4 opacity-40" />
                          </div>
                        )}
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
        </div>
      )}
    </div>
  );
};
