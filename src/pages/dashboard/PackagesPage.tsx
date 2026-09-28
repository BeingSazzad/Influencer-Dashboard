import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setPackageSearchQuery,
  setPackageTierFilter,
  addPackage,
  deletePackage,
  togglePackagePublish,
  togglePackageFeatured,
} from '@/store/slices/packagesSlice';
import { MarketplacePackage, PackageTier } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  CheckCircle,
  Trash2,
  Star,
  X,
} from 'lucide-react';

export const PackagesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { packages, searchQuery, tierFilter } = useAppSelector(
    (state) => state.packages
  );

  // New Package Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Beauty & Skincare');
  const [tier, setTier] = useState<PackageTier>('standard');
  const [priceEur, setPriceEur] = useState('850');
  const [deliveryDays, setDeliveryDays] = useState('5');
  const [revisionsCount, setRevisionsCount] = useState('2');
  const [adRightsMonths, setAdRightsMonths] = useState('12');
  const [deliverables, setDeliverables] = useState<string[]>([
    '1x 45s Vertical Video (9:16 4K)',
    '2x Hook Variations for A/B Testing',
    'Script Approval Before Filming',
  ]);
  const [newDeliverableInput, setNewDeliverableInput] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);

  // Filtered packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || pkg.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  const handleAddDeliverable = () => {
    if (newDeliverableInput.trim()) {
      setDeliverables([...deliverables, newDeliverableInput.trim()]);
      setNewDeliverableInput('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !priceEur) return;

    dispatch(
      addPackage({
        title,
        description,
        category,
        tier,
        priceEur: Number(priceEur),
        deliveryDays: Number(deliveryDays),
        revisionsCount: Number(revisionsCount),
        adRightsMonths: Number(adRightsMonths),
        deliverables,
        isFeatured,
        isPublished,
      })
    );

    // Reset and close
    setTitle('');
    setDescription('');
    setPriceEur('850');
    setIsCreateModalOpen(false);
  };

  const getTierBadgeVariant = (t: PackageTier) => {
    switch (t) {
      case 'starter':
        return 'neutral';
      case 'standard':
        return 'pink';
      case 'premium':
        return 'default';
      case 'enterprise':
        return 'success';
      default:
        return 'neutral';
    }
  };

  const calculatedPrice = Number(priceEur) || 0;
  const platformFee15 = Math.round(calculatedPrice * 0.15);
  const creatorPayout = calculatedPrice;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Packages"
        subtitle="Creator service offerings and pricing tiers."
        badge={
          <Badge variant="default" size="sm">
            {packages.length} Packages
          </Badge>
        }
        actions={
          <Button
            variant="accent"
            size="sm"
            className="font-bold text-xs"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Package
          </Button>
        }
      />

      {/* Controls & Filter Pills */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Tier Filter Tabs */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start overflow-x-auto max-w-full">
            {(['all', 'starter', 'standard', 'premium', 'enterprise'] as const).map(
              (t) => (
                <button
                  key={t}
                  onClick={() => dispatch(setPackageTierFilter(t))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize shrink-0 ${
                    tierFilter === t
                      ? 'bg-white text-neutral-950 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {t === 'all' ? 'All Tiers' : t}
                </button>
              )
            )}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search package title, category..."
              value={searchQuery}
              onChange={(e) => dispatch(setPackageSearchQuery(e.target.value))}
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20 font-medium"
            />
          </div>
        </div>
      </Card>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPackages.map((pkg) => (
          <Card key={pkg.id} hoverEffect className="p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded">
                    {pkg.id}
                  </span>
                  <Badge variant={getTierBadgeVariant(pkg.tier)} size="sm">
                    {pkg.tier}
                  </Badge>
                  {pkg.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/60">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      Featured
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-bold text-neutral-900 tabular-nums">
                    {formatCurrency(pkg.priceEur)}
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    Fee: {formatCurrency(Math.round(pkg.priceEur * 0.15))}
                  </div>
                </div>
              </div>

              {/* Title & Category */}
              <div className="mt-2.5">
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight line-clamp-1" title={pkg.title}>
                  {pkg.title}
                </h3>
                <p className="text-xs text-neutral-500 font-medium mt-0.5">
                  {pkg.category}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-600 line-clamp-2 mt-2 leading-relaxed">
                {pkg.description}
              </p>

              {/* Key Specs Strip */}
              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-neutral-50 border border-neutral-100 font-medium text-neutral-700 mt-3">
                <span>{pkg.deliveryDays}d delivery</span>
                <span className="text-neutral-300">•</span>
                <span>{pkg.revisionsCount} revs</span>
                <span className="text-neutral-300">•</span>
                <span>{pkg.adRightsMonths}m rights</span>
              </div>

              {/* Deliverables summary */}
              <div className="mt-2.5 flex items-center justify-between text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {pkg.deliverables.length} Deliverables
                </span>
                <span className="text-[11px] text-neutral-400 truncate max-w-[130px]">
                  {pkg.deliverables[0]}
                </span>
              </div>
            </div>

            {/* Card Actions Footer */}
            <div className="pt-3 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-500 text-[11px]">
                <strong className="text-neutral-900 font-semibold">{pkg.ordersCount}</strong> Orders • <strong className="text-neutral-900 font-semibold">{pkg.creatorCount}</strong> Creators
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => dispatch(togglePackageFeatured(pkg.id))}
                  title="Toggle Featured"
                >
                  <Star className={`w-3.5 h-3.5 ${pkg.isFeatured ? 'fill-amber-500 text-amber-500' : 'text-neutral-400'}`} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs"
                  onClick={() => dispatch(togglePackagePublish(pkg.id))}
                >
                  {pkg.isPublished ? 'Unpublish' : 'Publish'}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-600 hover:bg-rose-50"
                  onClick={() => dispatch(deletePackage(pkg.id))}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CREATE PACKAGE MODAL */}
      {isCreateModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Standard Service Package"
          description="Define a reusable marketplace package template with deliverables, pricing, and turnaround SLAs."
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                size="sm"
                onClick={handleCreatePackage}
              >
                Publish Service Package
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreatePackage} className="space-y-4">
            <Input
              label="Package Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 4K TikTok UGC Video + Spark Ads Rights"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Marketplace Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink font-medium"
                >
                  <option value="Beauty & Skincare">Beauty & Skincare</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Tech & Gadgets">Tech & Gadgets</option>
                  <option value="Wellness & Fitness">Wellness & Fitness</option>
                  <option value="Culinary & Food">Culinary & Food</option>
                  <option value="Travel & Luxury Lifestyle">Travel & Luxury Lifestyle</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Service Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as PackageTier)}
                  className="w-full h-10 px-3 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink font-medium capitalize"
                >
                  <option value="starter">Starter</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Package Description & Scope"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a clear description of what the creator will produce..."
              rows={2}
            />

            {/* Financial Calculator Preview */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Base Price (EUR)"
                  type="number"
                  value={priceEur}
                  onChange={(e) => setPriceEur(e.target.value)}
                  required
                />
                <Input
                  label="Turnaround (Days)"
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(e.target.value)}
                  required
                />
                <Input
                  label="Included Revisions"
                  type="number"
                  value={revisionsCount}
                  onChange={(e) => setRevisionsCount(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-200 text-neutral-600 font-medium">
                <span>
                  15% Platform Take: <strong className="text-brand-pink font-bold">€{platformFee15}</strong>
                </span>
                <span>
                  Gross Brand Invoice: <strong className="text-neutral-950 font-bold">€{calculatedPrice + platformFee15}</strong>
                </span>
              </div>
            </div>

            {/* Deliverables Checklist Builder */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Included Deliverables Checklist
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. 1x Raw B-Roll Footage Bundle"
                  value={newDeliverableInput}
                  onChange={(e) => setNewDeliverableInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDeliverable();
                    }
                  }}
                  className="flex-1 h-9 px-3 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink font-medium"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleAddDeliverable}
                >
                  Add Item
                </Button>
              </div>

              <div className="space-y-1 pt-1 max-h-36 overflow-y-auto">
                {deliverables.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-neutral-50 border border-neutral-200/60 text-xs font-medium text-neutral-800"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(idx)}
                      className="text-neutral-400 hover:text-rose-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-700 font-medium">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-black"
                />
                <span>Feature on Marketplace Homepage & Catalog Top</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-neutral-700 font-medium">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-black"
                />
                <span>Publish Immediately</span>
              </label>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
