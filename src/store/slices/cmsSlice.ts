import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CmsLegalDoc, CmsFaqItem, CmsBrandAssets } from '@/types/admin.types';
import {
  INITIAL_LEGAL_DOCS,
  INITIAL_FAQS,
  INITIAL_BRAND_ASSETS,
} from '@/lib/constants';

interface CmsState {
  legalDocs: CmsLegalDoc[];
  faqs: CmsFaqItem[];
  brandAssets: CmsBrandAssets;
  selectedLegalSlug: string;
  faqCategoryFilter: string;
}

const initialState: CmsState = {
  legalDocs: INITIAL_LEGAL_DOCS,
  faqs: INITIAL_FAQS,
  brandAssets: INITIAL_BRAND_ASSETS,
  selectedLegalSlug: 'terms-of-service',
  faqCategoryFilter: 'all',
};

export const cmsSlice = createSlice({
  name: 'cms',
  initialState,
  reducers: {
    setSelectedLegalSlug: (state, action: PayloadAction<string>) => {
      state.selectedLegalSlug = action.payload;
    },
    updateLegalDoc: (
      state,
      action: PayloadAction<{
        slug: string;
        contentMarkdown: string;
        version?: string;
        title?: string;
      }>
    ) => {
      const doc = state.legalDocs.find((d) => d.slug === action.payload.slug);
      if (doc) {
        doc.contentMarkdown = action.payload.contentMarkdown;
        if (action.payload.version) doc.version = action.payload.version;
        if (action.payload.title) doc.title = action.payload.title;
        doc.lastModified = new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
          day: 'numeric',
        });
      }
    },
    setFaqCategoryFilter: (
      state,
      action: PayloadAction<string>
    ) => {
      state.faqCategoryFilter = action.payload;
    },
    addFaq: (state, action: PayloadAction<Omit<CmsFaqItem, 'id'>>) => {
      const newFaq: CmsFaqItem = {
        ...action.payload,
        id: `FAQ-${Date.now().toString().slice(-4)}`,
      };
      state.faqs.push(newFaq);
    },
    updateFaq: (state, action: PayloadAction<CmsFaqItem>) => {
      const index = state.faqs.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.faqs[index] = action.payload;
      }
    },
    deleteFaq: (state, action: PayloadAction<string>) => {
      state.faqs = state.faqs.filter((f) => f.id !== action.payload);
    },
    toggleFaqPublish: (state, action: PayloadAction<string>) => {
      const faq = state.faqs.find((f) => f.id === action.payload);
      if (faq) {
        faq.isPublished = !faq.isPublished;
      }
    },
    updateBrandAssets: (state, action: PayloadAction<Partial<CmsBrandAssets>>) => {
      state.brandAssets = {
        ...state.brandAssets,
        ...action.payload,
      };
    },
  },
});

export const {
  setSelectedLegalSlug,
  updateLegalDoc,
  setFaqCategoryFilter,
  addFaq,
  updateFaq,
  deleteFaq,
  toggleFaqPublish,
  updateBrandAssets,
} = cmsSlice.actions;

export default cmsSlice.reducer;
