import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CmsLegalDoc,
  CmsFaqItem,
  CmsBrandAssets,
  PartnerBrandLogo,
  BrandTickerSettings,
} from '@/types/admin.types';
import {
  INITIAL_LEGAL_DOCS,
  INITIAL_FAQS,
  INITIAL_BRAND_ASSETS,
  INITIAL_PARTNER_BRANDS,
  INITIAL_BRAND_TICKER_SETTINGS,
} from '@/lib/constants';

interface CmsState {
  legalDocs: CmsLegalDoc[];
  faqs: CmsFaqItem[];
  brandAssets: CmsBrandAssets;
  partnerBrands: PartnerBrandLogo[];
  tickerSettings: BrandTickerSettings;
  selectedLegalSlug: string;
  faqCategoryFilter: string;
}

const initialState: CmsState = {
  legalDocs: INITIAL_LEGAL_DOCS,
  faqs: INITIAL_FAQS,
  brandAssets: INITIAL_BRAND_ASSETS,
  partnerBrands: INITIAL_PARTNER_BRANDS,
  tickerSettings: INITIAL_BRAND_TICKER_SETTINGS,
  selectedLegalSlug: 'terms',
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
      const targetPosition = action.payload.order || state.faqs.length + 1;
      const newFaq: CmsFaqItem = {
        ...action.payload,
        id: `FAQ-${Date.now().toString().slice(-4)}`,
        order: targetPosition,
      };
      const insertIndex = Math.max(
        0,
        Math.min(state.faqs.length, targetPosition - 1)
      );
      state.faqs.splice(insertIndex, 0, newFaq);
      state.faqs.forEach((item, idx) => {
        item.order = idx + 1;
      });
    },
    updateFaq: (state, action: PayloadAction<CmsFaqItem>) => {
      const index = state.faqs.findIndex((f) => f.id === action.payload.id);
      if (index !== -1) {
        state.faqs[index] = { ...state.faqs[index], ...action.payload };
        if (
          typeof action.payload.order === 'number' &&
          action.payload.order !== index + 1
        ) {
          const [removed] = state.faqs.splice(index, 1);
          const targetIndex = Math.max(
            0,
            Math.min(state.faqs.length, action.payload.order - 1)
          );
          state.faqs.splice(targetIndex, 0, removed);
        }
        state.faqs.forEach((item, idx) => {
          item.order = idx + 1;
        });
      }
    },
    deleteFaq: (state, action: PayloadAction<string>) => {
      state.faqs = state.faqs.filter((f) => f.id !== action.payload);
      state.faqs.forEach((item, idx) => {
        item.order = idx + 1;
      });
    },
    toggleFaqPublish: (state, action: PayloadAction<string>) => {
      const faq = state.faqs.find((f) => f.id === action.payload);
      if (faq) {
        faq.isPublished = !faq.isPublished;
      }
    },
    reorderFaq: (
      state,
      action: PayloadAction<{ id: string; direction: 'up' | 'down' }>
    ) => {
      const index = state.faqs.findIndex((f) => f.id === action.payload.id);
      if (index === -1) return;
      const targetIndex =
        action.payload.direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.faqs.length) return;

      const [removed] = state.faqs.splice(index, 1);
      state.faqs.splice(targetIndex, 0, removed);
      state.faqs.forEach((item, idx) => {
        item.order = idx + 1;
      });
    },
    changeFaqPosition: (
      state,
      action: PayloadAction<{ id: string; targetPosition: number }>
    ) => {
      const index = state.faqs.findIndex((f) => f.id === action.payload.id);
      if (index === -1) return;
      const [removed] = state.faqs.splice(index, 1);
      const targetIndex = Math.max(
        0,
        Math.min(state.faqs.length, action.payload.targetPosition - 1)
      );
      state.faqs.splice(targetIndex, 0, removed);
      state.faqs.forEach((item, idx) => {
        item.order = idx + 1;
      });
    },
    updateBrandAssets: (state, action: PayloadAction<Partial<CmsBrandAssets>>) => {
      state.brandAssets = {
        ...state.brandAssets,
        ...action.payload,
      };
    },
    addPartnerBrand: (
      state,
      action: PayloadAction<{ name?: string; logoUrl: string }>
    ) => {
      const nextOrder = state.partnerBrands.length + 1;
      const newBrand: PartnerBrandLogo = {
        id: `BRD-${Date.now().toString().slice(-4)}`,
        name: action.payload.name || `Brand ${nextOrder}`,
        logoUrl: action.payload.logoUrl,
        order: nextOrder,
        isActive: true,
      };
      state.partnerBrands.push(newBrand);
    },
    updatePartnerBrand: (
      state,
      action: PayloadAction<{ id: string; name?: string; logoUrl: string }>
    ) => {
      const index = state.partnerBrands.findIndex(
        (b) => b.id === action.payload.id
      );
      if (index !== -1) {
        state.partnerBrands[index].logoUrl = action.payload.logoUrl;
        if (action.payload.name !== undefined) {
          state.partnerBrands[index].name = action.payload.name;
        }
      }
    },
    deletePartnerBrand: (state, action: PayloadAction<string>) => {
      state.partnerBrands = state.partnerBrands.filter(
        (b) => b.id !== action.payload
      );
      state.partnerBrands.forEach((item, idx) => {
        item.order = idx + 1;
      });
    },
    togglePartnerBrandActive: (state, action: PayloadAction<string>) => {
      const brand = state.partnerBrands.find((b) => b.id === action.payload);
      if (brand) {
        brand.isActive = !brand.isActive;
      }
    },
    reorderPartnerBrand: (
      state,
      action: PayloadAction<{ id: string; direction: 'up' | 'down' }>
    ) => {
      const index = state.partnerBrands.findIndex(
        (b) => b.id === action.payload.id
      );
      if (index === -1) return;
      const targetIndex =
        action.payload.direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= state.partnerBrands.length) return;

      const [removed] = state.partnerBrands.splice(index, 1);
      state.partnerBrands.splice(targetIndex, 0, removed);
      // Re-index orders
      state.partnerBrands.forEach((item, idx) => {
        item.order = idx + 1;
      });
    },
    updateTickerSettings: (
      state,
      action: PayloadAction<Partial<BrandTickerSettings>>
    ) => {
      state.tickerSettings = {
        ...state.tickerSettings,
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
  reorderFaq,
  changeFaqPosition,
  updateBrandAssets,
  addPartnerBrand,
  updatePartnerBrand,
  deletePartnerBrand,
  togglePartnerBrandActive,
  reorderPartnerBrand,
  updateTickerSettings,
} = cmsSlice.actions;

export default cmsSlice.reducer;
