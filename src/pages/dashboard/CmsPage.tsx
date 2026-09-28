import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedLegalSlug,
  updateLegalDoc,
  setFaqCategoryFilter,
  addFaq,
  updateFaq,
  deleteFaq,
  toggleFaqPublish,
  updateBrandAssets,
} from '@/store/slices/cmsSlice';
import { CmsFaqItem } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import {
  FileText,
  HelpCircle,
  Image as ImageIcon,
  Save,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Eye,
  Globe,
  Upload,
} from 'lucide-react';

export const CmsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { legalDocs, selectedLegalSlug, faqs, faqCategoryFilter, brandAssets } =
    useAppSelector((state) => state.cms);

  const [activeTab, setActiveTab] = useState<'legal' | 'faqs' | 'branding'>('legal');

  // Legal Doc Editor State
  const currentLegalDoc =
    legalDocs.find((d) => d.slug === selectedLegalSlug) || legalDocs[0];
  const [legalTitle, setLegalTitle] = useState(currentLegalDoc?.title || '');
  const [legalVersion, setLegalVersion] = useState(currentLegalDoc?.version || '');
  const [legalContent, setLegalContent] = useState(
    currentLegalDoc?.contentMarkdown || ''
  );
  const [legalPreviewMode, setLegalPreviewMode] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Sync state if slug changes
  const handleSelectSlug = (slug: 'terms' | 'privacy') => {
    dispatch(setSelectedLegalSlug(slug));
    const doc = legalDocs.find((d) => d.slug === slug);
    if (doc) {
      setLegalTitle(doc.title);
      setLegalVersion(doc.version);
      setLegalContent(doc.contentMarkdown);
    }
  };

  const handleSaveLegal = () => {
    dispatch(
      updateLegalDoc({
        slug: selectedLegalSlug,
        title: legalTitle,
        version: legalVersion,
        contentMarkdown: legalContent,
      })
    );
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // FAQ Modal State
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<CmsFaqItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState<'brands' | 'creators' | 'escrow'>('brands');

  const handleOpenNewFaq = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setFaqCategory('brands');
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: CmsFaqItem) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = () => {
    if (!faqQuestion || !faqAnswer) return;

    if (editingFaq) {
      dispatch(
        updateFaq({
          ...editingFaq,
          question: faqQuestion,
          answer: faqAnswer,
          category: faqCategory,
        })
      );
    } else {
      dispatch(
        addFaq({
          question: faqQuestion,
          answer: faqAnswer,
          category: faqCategory,
          order: faqs.length + 1,
          isPublished: true,
        })
      );
    }

    setIsFaqModalOpen(false);
  };

  // Brand Assets State
  const [logoLight, setLogoLight] = useState(brandAssets.logoLightUrl);
  const [logoDark, setLogoDark] = useState(brandAssets.logoDarkUrl);
  const [favicon, setFavicon] = useState(brandAssets.faviconUrl);
  const [headline, setHeadline] = useState(brandAssets.heroHeadline);
  const [subtitle, setSubtitle] = useState(brandAssets.heroSubtitle);
  const [supportEmail, setSupportEmail] = useState(brandAssets.supportEmail);
  const [brandSavedNotice, setBrandSavedNotice] = useState(false);

  const handleSaveBrand = () => {
    dispatch(
      updateBrandAssets({
        logoLightUrl: logoLight,
        logoDarkUrl: logoDark,
        faviconUrl: favicon,
        heroHeadline: headline,
        heroSubtitle: subtitle,
        supportEmail: supportEmail,
      })
    );
    setBrandSavedNotice(true);
    setTimeout(() => setBrandSavedNotice(false), 2500);
  };

  const filteredFaqs = faqs.filter((f) => {
    if (faqCategoryFilter === 'all') return true;
    return f.category === faqCategoryFilter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="CMS & Dynamic Content Studio"
        subtitle="Live management of Terms of Service, Privacy Policy markdown, FAQs, and brand identity assets."
        badge={
          <Badge variant="pink" size="sm">
            Live Website Sync
          </Badge>
        }
      />

      {/* Main CMS Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('legal')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'legal'
              ? 'border-brand-black text-brand-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Terms & Privacy Policies</span>
        </button>

        <button
          onClick={() => setActiveTab('faqs')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'faqs'
              ? 'border-brand-black text-brand-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Dynamic FAQs ({faqs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'branding'
              ? 'border-brand-black text-brand-black'
              : 'border-transparent text-neutral-500 hover:text-neutral-900'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Brand Assets & Logos</span>
        </button>
      </div>

      {/* TAB 1: LEGAL DOCUMENTS (TERMS & PRIVACY) */}
      {activeTab === 'legal' && (
        <div className="space-y-6">
          {saveSuccessNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Document updated and published live across consumer website.</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left selector */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Select Legal Contract
              </span>
              <div className="space-y-1">
                {legalDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => handleSelectSlug(doc.slug)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      selectedLegalSlug === doc.slug
                        ? 'border-brand-black bg-brand-black text-white font-bold'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <div className="text-xs">{doc.title}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${
                        selectedLegalSlug === doc.slug
                          ? 'text-neutral-300'
                          : 'text-neutral-400'
                      }`}
                    >
                      v{doc.version} • {doc.lastModified}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/60 mt-4 text-[11px] text-neutral-500 space-y-1">
                <span className="font-bold text-neutral-700">Legal Audit Trail:</span>
                <p>
                  All modifications automatically increment minor revisions and
                  are timestamped for GDPR/EU consumer protection audits.
                </p>
              </div>
            </div>

            {/* Right Editor Area */}
            <div className="lg:col-span-3 space-y-4">
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 mb-4">
                  <div className="flex items-center gap-3">
                    <Input
                      label="Document Title"
                      value={legalTitle}
                      onChange={(e) => setLegalTitle(e.target.value)}
                      className="w-64"
                    />
                    <Input
                      label="Version"
                      value={legalVersion}
                      onChange={(e) => setLegalVersion(e.target.value)}
                      className="w-24"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLegalPreviewMode(!legalPreviewMode)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      {legalPreviewMode ? 'Edit Markdown' : 'Preview'}
                    </Button>
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={handleSaveLegal}
                      leftIcon={<Save className="w-3.5 h-3.5" />}
                    >
                      Save & Publish
                    </Button>
                  </div>
                </div>

                {legalPreviewMode ? (
                  <div className="prose prose-sm max-w-none p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-800 whitespace-pre-line font-serif leading-relaxed">
                    {legalContent}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                      Markdown Legal Document Source
                    </label>
                    <textarea
                      value={legalContent}
                      onChange={(e) => setLegalContent(e.target.value)}
                      rows={14}
                      className="w-full p-4 font-mono text-xs bg-white border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink leading-relaxed"
                    />
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DYNAMIC FAQS */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start">
              {(['all', 'brands', 'creators', 'escrow'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => dispatch(setFaqCategoryFilter(cat))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                    faqCategoryFilter === cat
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {cat === 'all' ? 'All Questions' : cat}
                </button>
              ))}
            </div>

            <Button
              variant="accent"
              size="sm"
              onClick={handleOpenNewFaq}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add FAQ Item
            </Button>
          </div>

          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} hoverEffect className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-neutral-400 font-bold">
                        #{faq.id}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {faq.category}
                      </Badge>
                      {faq.isPublished ? (
                        <Badge variant="success" size="sm" dot>
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          Draft
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {faq.question}
                    </h4>
                    <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl">
                      {faq.answer}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dispatch(toggleFaqPublish(faq.id))}
                      title="Toggle visibility"
                    >
                      {faq.isPublished ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenEditFaq(faq)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => dispatch(deleteFaq(faq.id))}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Add / Edit FAQ Modal */}
          {isFaqModalOpen && (
            <Modal
              isOpen={true}
              onClose={() => setIsFaqModalOpen(false)}
              title={editingFaq ? 'Edit FAQ Item' : 'Create New FAQ Item'}
              maxWidth="md"
              footer={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFaqModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="accent" size="sm" onClick={handleSaveFaq}>
                    {editingFaq ? 'Save Changes' : 'Create Question'}
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                    Target Category
                  </label>
                  <select
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value as any)}
                    className="w-full h-10 px-3 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink"
                  >
                    <option value="brands">For Brands</option>
                    <option value="creators">For Creators</option>
                    <option value="escrow">Escrow & Legal Security</option>
                  </select>
                </div>

                <Input
                  label="Question"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. When are funds released from escrow?"
                  required
                />

                <Textarea
                  label="Answer"
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Provide a concise, direct explanation..."
                  rows={4}
                  required
                />
              </div>
            </Modal>
          )}
        </div>
      )}

      {/* TAB 3: BRAND ASSETS & LOGOS */}
      {activeTab === 'branding' && (
        <div className="space-y-6 max-w-4xl">
          {brandSavedNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Brand identity assets and global copy saved successfully.</span>
            </div>
          )}

          <Card className="p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Visual Assets & Brand Identity
              </h3>
              <p className="text-xs text-neutral-500">
                Update public website logos, favicons, and metadata.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Logo Light */}
              <div className="space-y-2">
                <Input
                  label="Logo URL (Light Background)"
                  value={logoLight}
                  onChange={(e) => setLogoLight(e.target.value)}
                  leftIcon={<ImageIcon className="w-4 h-4" />}
                />
                <div className="p-4 rounded-xl border border-dashed border-neutral-300 bg-white flex items-center justify-between">
                  <div className="text-xs text-neutral-500">Preview:</div>
                  <div className="w-16 h-8 bg-neutral-100 rounded flex items-center justify-center font-black text-brand-black text-xs">
                    INFLUVERSE
                  </div>
                </div>
              </div>

              {/* Logo Dark */}
              <div className="space-y-2">
                <Input
                  label="Logo URL (Dark Header)"
                  value={logoDark}
                  onChange={(e) => setLogoDark(e.target.value)}
                  leftIcon={<ImageIcon className="w-4 h-4" />}
                />
                <div className="p-4 rounded-xl border border-dashed border-neutral-300 bg-brand-black flex items-center justify-between">
                  <div className="text-xs text-neutral-400">Preview:</div>
                  <div className="w-16 h-8 bg-neutral-900 rounded flex items-center justify-center font-black text-white text-xs">
                    INFLUVERSE
                  </div>
                </div>
              </div>
            </div>

            {/* Favicon */}
            <div className="pt-2">
              <Input
                label="Favicon ICO / PNG URL"
                value={favicon}
                onChange={(e) => setFavicon(e.target.value)}
                leftIcon={<Globe className="w-4 h-4" />}
              />
            </div>

            {/* Hero Copy Dynamic Customization */}
            <div className="pt-4 border-t border-neutral-100 space-y-4">
              <h3 className="text-base font-bold text-neutral-900">
                Global Homepage Messaging
              </h3>

              <Input
                label="Primary Hero Headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />

              <Textarea
                label="Hero Supporting Subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={2}
              />

              <Input
                label="Concierge Support Email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button
                variant="accent"
                size="md"
                onClick={handleSaveBrand}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Brand Configuration
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
