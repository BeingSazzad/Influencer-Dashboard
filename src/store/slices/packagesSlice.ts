import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { MarketplacePackage, PackageTier } from '@/types/admin.types';
import { INITIAL_PACKAGES } from '@/lib/constants';

interface PackagesState {
  packages: MarketplacePackage[];
  searchQuery: string;
  categoryFilter: string;
  tierFilter: 'all' | PackageTier;
  selectedPackageId: string | null;
}

const initialState: PackagesState = {
  packages: INITIAL_PACKAGES,
  searchQuery: '',
  categoryFilter: 'all',
  tierFilter: 'all',
  selectedPackageId: null,
};

export const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setPackageSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setPackageCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
    },
    setPackageTierFilter: (state, action: PayloadAction<'all' | PackageTier>) => {
      state.tierFilter = action.payload;
    },
    setSelectedPackageId: (state, action: PayloadAction<string | null>) => {
      state.selectedPackageId = action.payload;
    },
    addPackage: (
      state,
      action: PayloadAction<
        Omit<MarketplacePackage, 'id' | 'createdAt' | 'ordersCount' | 'creatorCount'>
      >
    ) => {
      const newPackage: MarketplacePackage = {
        ...action.payload,
        id: `PKG-${Date.now().toString().slice(-3)}`,
        createdAt: new Date().toISOString().split('T')[0],
        ordersCount: 0,
        creatorCount: 1,
      };
      state.packages.unshift(newPackage);
    },
    updatePackage: (state, action: PayloadAction<MarketplacePackage>) => {
      const index = state.packages.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.packages[index] = action.payload;
      }
    },
    deletePackage: (state, action: PayloadAction<string>) => {
      state.packages = state.packages.filter((p) => p.id !== action.payload);
    },
    togglePackagePublish: (state, action: PayloadAction<string>) => {
      const pkg = state.packages.find((p) => p.id === action.payload);
      if (pkg) {
        pkg.isPublished = !pkg.isPublished;
      }
    },
    togglePackageFeatured: (state, action: PayloadAction<string>) => {
      const pkg = state.packages.find((p) => p.id === action.payload);
      if (pkg) {
        pkg.isFeatured = !pkg.isFeatured;
      }
    },
  },
});

export const {
  setPackageSearchQuery,
  setPackageCategoryFilter,
  setPackageTierFilter,
  setSelectedPackageId,
  addPackage,
  updatePackage,
  deletePackage,
  togglePackagePublish,
  togglePackageFeatured,
} = packagesSlice.actions;

export default packagesSlice.reducer;
