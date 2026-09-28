import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSelectedLegalSlug,
  updateLegalDoc,
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
} from 'lucide-react';

export const CmsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { legalDocs, selectedLegalSlug, faqs, brandAssets } =
    useAppSelector((state) => state.cms);

  const [activeTab, setActiveTab] = useState<'legal' | 'faqs' | 'branding'>('legal');

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

  // FAQ State (Unified without category fragmentation)
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<CmsFaqItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');

  const handleOpenNewFaq = () => {
    setEditingFaq(null);
    setFaqQuestion('');
    setFaqAnswer('');
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: CmsFaqItem) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
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
        })
      );
    } else {
      dispatch(
        addFaq({
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          category: 'general',
          order: faqs.length + 1,
          isPublished: true,
        })
      );
    }

    setIsFaqModalOpen(false);
  };

  const filteredFaqs = faqs.filter((f) => {
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="CMS"
        subtitle="Manage legal policies, FAQs, and brand assets."
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
          <span>Pages ({legalDocs.length})</span>
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
          <span>FAQs ({faqs.length})</span>
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
      </div>

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

      {/* TAB 2: UNIFIED DYNAMIC FAQS (NO CATEGORY FRAGMENTATION) */}
      {activeTab === 'faqs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                placeholder="Search FAQ questions or explanations..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold placeholder:text-neutral-400 focus:outline-none focus:border-brand-pink focus:ring-2 focus:ring-brand-pink/20"
              />
            </div>

            <Button
              variant="accent"
              size="sm"
              className="font-bold self-start sm:self-auto"
              onClick={handleOpenNewFaq}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Question
            </Button>
          </div>

          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-neutral-200 text-neutral-500 text-xs font-medium">
                No FAQ items found matching "{faqSearchQuery}".
              </div>
            ) : (
              filteredFaqs.map((faq, index) => (
                <Card key={faq.id} hoverEffect className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                          #{index + 1}
                        </span>
                        {faq.isPublished ? (
                          <Badge variant="success" size="sm" dot>
                            Live
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Draft
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-extrabold text-neutral-950">
                        {faq.question}
                      </h4>
                      <p className="text-xs text-neutral-600 leading-relaxed max-w-3xl font-medium">
                        {faq.answer}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-bold text-xs"
                        onClick={() => dispatch(toggleFaqPublish(faq.id))}
                      >
                        {faq.isPublished ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-bold text-xs"
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
                    {editingFaq ? 'Save' : 'Add Question'}
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <Input
                  label="Question"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. When are funds released from escrow?"
                  className="font-bold"
                  required
                />

                <Textarea
                  label="Answer"
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Provide a concise, direct explanation visible to both brands and creators..."
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
