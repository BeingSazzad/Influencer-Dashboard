import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addPartnerBrand,
  updatePartnerBrand,
  deletePartnerBrand,
  reorderPartnerBrand,
} from '@/store/slices/cmsSlice';
import { PartnerBrandLogo } from '@/types/admin.types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { ImageUploadBox } from '@/components/shared/ImageUploadBox';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  UploadCloud,
} from 'lucide-react';

export const PartnerBrandsSection: React.FC = () => {
  const dispatch = useAppDispatch();
  const { partnerBrands, tickerSettings } = useAppSelector((state) => state.cms);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<PartnerBrandLogo | null>(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Delete Dialog State
  const [brandToDelete, setBrandToDelete] = useState<PartnerBrandLogo | null>(null);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setName('');
    setLogoUrl('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (brand: PartnerBrandLogo) => {
    setEditingBrand(brand);
    setName(brand.name);
    setLogoUrl(brand.logoUrl);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!logoUrl.trim()) {
      setErrorMsg('Please upload a logo image or enter a logo URL.');
      return;
    }

    if (editingBrand) {
      dispatch(
        updatePartnerBrand({
          id: editingBrand.id,
          name: name.trim() || editingBrand.name,
          logoUrl: logoUrl.trim(),
        })
      );
    } else {
      dispatch(
        addPartnerBrand({
          name: name.trim() || `Brand ${partnerBrands.length + 1}`,
          logoUrl: logoUrl.trim(),
        })
      );
    }

    setIsModalOpen(false);
  };

  const sortedBrands = [...partnerBrands].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {/* 1. LIVE AUTO-SCROLL TICKER PREVIEW */}
      <Card className="overflow-hidden border-neutral-200 shadow-2xs">
        <div className="px-5 py-3.5 border-b border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-800">
              Trusted Brands • Live Website Auto-Scroll Ticker
            </h3>
          </div>
          <span className="text-[11px] font-bold text-neutral-500">
            {sortedBrands.length} Brands
          </span>
        </div>

        {/* Endless Seamless Marquee */}
        <div className="py-6 px-4 bg-gradient-to-b from-white via-neutral-50/20 to-white relative overflow-hidden select-none">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {sortedBrands.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-400 font-semibold">
              No brand logos uploaded yet. Click "+ Upload Logo" below to add brands we have worked with.
            </div>
          ) : (
            <div
              className="flex gap-8 items-center animate-marquee-scroll pause-hover"
              style={
                {
                  '--marquee-speed': `${tickerSettings.speedSeconds || 26}s`,
                } as React.CSSProperties
              }
            >
              {[...sortedBrands, ...sortedBrands, ...sortedBrands].map((brand, idx) => (
                <div
                  key={`${brand.id}-${idx}`}
                  className="flex items-center justify-center h-14 min-w-[120px] px-4 py-2 rounded-xl bg-white border border-neutral-200/80 shadow-2xs shrink-0 group hover:border-neutral-400 transition-all"
                  title={brand.name}
                >
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-h-7 max-w-[100px] object-contain opacity-80 group-hover:opacity-100 transition-opacity filter grayscale group-hover:grayscale-0"
                    onError={(e) => {
                      const target = e.target as HTMLElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-text')) {
                        const span = document.createElement('span');
                        span.className =
                          'fallback-text font-black text-xs uppercase tracking-tight text-neutral-800';
                        span.innerText = brand.name;
                        parent.appendChild(span);
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 2. SIMPLE LOGO MANAGEMENT SECTION */}
      <Card className="p-5 sm:p-6 space-y-5 border-neutral-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-base font-extrabold text-neutral-950">
              Brands We've Worked With
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              Showcase partner and client brands that work or have worked with us in the auto-scrolling ticker.
            </p>
          </div>

          <Button
            variant="accent"
            size="sm"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
            className="font-bold text-xs"
          >
            Upload Brand Logo
          </Button>
        </div>

        {/* LOGO GRID CARDS */}
        {sortedBrands.length === 0 ? (
          <div
            onClick={handleOpenAdd}
            className="cursor-pointer border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-2xl p-10 text-center transition-all bg-neutral-50/50"
          >
            <UploadCloud className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
            <div className="text-xs font-bold text-neutral-800">
              No brands added yet
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Click here to upload your first client brand logo.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sortedBrands.map((brand, index) => (
              <div
                key={brand.id}
                className="bg-white border border-neutral-200 rounded-xl p-3 flex flex-col justify-between hover:shadow-xs hover:border-neutral-300 transition-all group relative"
              >
                {/* Position Badge & Reorder */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="font-mono text-[11px] font-black text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                    #{brand.order}
                  </span>

                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(reorderPartnerBrand({ id: brand.id, direction: 'up' }))
                      }
                      disabled={index === 0}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors"
                      title="Move Left / Forward"
                    >
                      <ArrowUp className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(reorderPartnerBrand({ id: brand.id, direction: 'down' }))
                      }
                      disabled={index === sortedBrands.length - 1}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 disabled:opacity-20 disabled:hover:text-neutral-400 transition-colors"
                      title="Move Right / Backward"
                    >
                      <ArrowDown className="w-3 h-3 rotate-[-90deg]" />
                    </button>
                  </div>
                </div>

                {/* Logo Canvas */}
                <div className="h-16 bg-neutral-50 rounded-lg border border-neutral-100 flex items-center justify-center p-2 mb-2 overflow-hidden">
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="max-h-full max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>

                {/* Brand Name */}
                <div className="text-center font-bold text-xs text-neutral-900 truncate mb-2">
                  {brand.name}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center justify-center gap-1 pt-2 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(brand)}
                    className="flex-1 py-1 rounded text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 flex items-center justify-center gap-1 transition-colors"
                    title="Edit Logo"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandToDelete(brand)}
                    className="py-1 px-2 rounded text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors"
                    title="Delete Logo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {/* Upload New Logo Card Button */}
            <button
              type="button"
              onClick={handleOpenAdd}
              className="border-2 border-dashed border-neutral-200 hover:border-brand-pink hover:bg-pink-50/20 rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer min-h-[160px] group"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-pink-100 text-neutral-500 group-hover:text-brand-pink flex items-center justify-center mb-2 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-neutral-700 group-hover:text-brand-pink">
                Add Brand
              </span>
            </button>
          </div>
        )}
      </Card>

      {/* ULTRA-SIMPLE ADD / EDIT MODAL */}
      {isModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsModalOpen(false)}
          title={editingBrand ? 'Edit Brand Logo' : 'Upload Brand Logo'}
          maxWidth="sm"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                className="font-bold"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                className="font-bold"
                onClick={handleSave}
              >
                {editingBrand ? 'Save Changes' : 'Upload Logo'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* Brand Logo Upload */}
            <ImageUploadBox
              label="Logo Image"
              description="PNG, SVG or WebP format."
              value={logoUrl}
              onChange={(val) => {
                setLogoUrl(val);
                if (errorMsg) setErrorMsg('');
              }}
              previewBg="light"
            />

            {/* Brand Label/Name */}
            <Input
              label="Brand Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nike, Apple, Sephora"
              className="font-bold text-xs"
            />
          </div>
        </Modal>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {brandToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setBrandToDelete(null)}
          onConfirm={() => {
            dispatch(deletePartnerBrand(brandToDelete.id));
            setBrandToDelete(null);
          }}
          title="Delete Logo?"
          description={`Are you sure you want to delete the logo for "${brandToDelete.name}"?`}
          confirmLabel="Delete"
          variant="danger"
        />
      )}
    </div>
  );
};
