import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setDisputeFilter,
  arbitrateDispute,
} from '@/store/slices/escrowSlice';
import { EscrowDispute } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Scale,
  ShieldAlert,
  CheckCircle2,
  DollarSign,
  Euro,
  ExternalLink,
  Split,
  Undo2,
  Lock,
  FileText,
} from 'lucide-react';

export const EscrowPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { disputes, filterStatus, totalEscrowHeldEur, totalVolumeArbitratedEur } =
    useAppSelector((state) => state.escrow);

  const [activeDisputeForArbitration, setActiveDisputeForArbitration] =
    useState<EscrowDispute | null>(null);
  const [decision, setDecision] = useState<
    'resolved_creator' | 'resolved_brand' | 'resolved_split'
  >('resolved_split');
  const [splitRatio, setSplitRatio] = useState('50% Brand / 50% Creator');
  const [mediatorNotes, setMediatorNotes] = useState(
    'Deliverable met 70% of creative brief criteria. Re-cut revision was acceptable for organic channels but not whitelisted TikTok Ads. 50/50 mutual settlement approved.'
  );

  const filteredDisputes = disputes.filter((d) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'open') return d.status === 'open';
    return d.status !== 'open';
  });

  const handleOpenArbitration = (dispute: EscrowDispute) => {
    setActiveDisputeForArbitration(dispute);
    setDecision('resolved_split');
  };

  const handleConfirmArbitration = () => {
    if (!activeDisputeForArbitration) return;
    dispatch(
      arbitrateDispute({
        disputeId: activeDisputeForArbitration.id,
        decision,
        splitRatio: decision === 'resolved_split' ? splitRatio : undefined,
      })
    );
    setActiveDisputeForArbitration(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Disputes"
        subtitle="Arbitrate escrow conflicts and payment settlements."
        badge={
          <Badge variant="danger" size="sm">
            {disputes.filter((d) => d.status === 'open').length} Open
          </Badge>
        }
      />

      {/* Escrow High-Level Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Escrow Capital In Hold"
          value={formatCurrency(totalEscrowHeldEur)}
          icon={<Lock className="w-5 h-5" />}
          accentColor="pink"
          subtitle="Segregated client accounts"
        />
        <StatCard
          title="Total Volume Arbitrated"
          value={formatCurrency(totalVolumeArbitratedEur)}
          icon={<Scale className="w-5 h-5" />}
          accentColor="black"
          subtitle="Lifetime resolved disputes"
        />
        <StatCard
          title="Platform Dispute Ratio"
          value="0.74%"
          change={-0.12}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
          subtitle="Industry benchmark: 2.5%"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start max-w-xs">
        {(['all', 'open', 'resolved'] as const).map((s) => (
          <button
            key={s}
            onClick={() => dispatch(setDisputeFilter(s))}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
              filterStatus === s
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {s === 'all' ? 'All Cases' : `${s} Cases`}
          </button>
        ))}
      </div>

      {/* Disputes Docket */}
      <div className="space-y-4">
        {filteredDisputes.length === 0 ? (
          <Card className="p-12 text-center text-neutral-500 text-sm">
            No disputes found matching current filter.
          </Card>
        ) : (
          filteredDisputes.map((dispute) => (
            <Card key={dispute.id} hoverEffect className="overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black text-neutral-950 bg-neutral-100 px-2 py-1 rounded">
                      {dispute.id}
                    </span>
                    <Badge
                      variant={dispute.status === 'open' ? 'danger' : 'success'}
                      size="sm"
                      dot
                    >
                      {dispute.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-neutral-500 font-medium">
                      Contract Order #{dispute.orderId}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-neutral-500 font-medium">
                      Filed: {formatDate(dispute.submittedDate)}
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-black text-neutral-950 tabular-nums">
                        {formatCurrency(dispute.amountEur)}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-medium ml-1.5">
                        (Fee: <strong className="font-bold text-neutral-800">{formatCurrency(dispute.feeEur)}</strong>)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
                  {/* Parties & Campaign */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Campaign
                      </span>
                      <h4 className="text-base font-extrabold text-neutral-950">
                        {dispute.campaignTitle}
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                        <span className="text-[10px] uppercase font-bold text-neutral-500">
                          Brand
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar src={dispute.brandAvatar} name={dispute.brandName} size="xs" />
                          <span className="text-xs font-extrabold text-neutral-900 truncate">
                            {dispute.brandName}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                        <span className="text-[10px] uppercase font-bold text-neutral-500">
                          Creator
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar src={dispute.creatorAvatar} name={dispute.creatorName} size="xs" />
                          <span className="text-xs font-extrabold text-neutral-900 truncate">
                            {dispute.creatorName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100 font-medium">
                      <span className="font-bold text-neutral-900">Scope: </span>
                      {dispute.briefSummary}
                    </div>
                  </div>

                  {/* Grievance & Evidence */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                        Grievance
                      </span>
                      <div className="mt-1 p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-950 leading-relaxed font-semibold">
                        "{dispute.disputeReason}"
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <a
                        href={dispute.deliverableLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-pink hover:underline"
                      >
                        <FileText className="w-4 h-4" />
                        View Deliverable
                      </a>

                      {dispute.status === 'open' ? (
                        <Button
                          variant="accent"
                          size="sm"
                          onClick={() => handleOpenArbitration(dispute)}
                          leftIcon={<Scale className="w-4 h-4" />}
                        >
                          Arbitrate Case
                        </Button>
                      ) : (
                        <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          Ruling Executed: {dispute.splitRatio || dispute.status}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* 3-Way Escrow Arbitration Modal */}
      {activeDisputeForArbitration && (
        <Modal
          isOpen={true}
          onClose={() => setActiveDisputeForArbitration(null)}
          title={`Arbitrate Case: ${activeDisputeForArbitration.id}`}
          description={`Issue a platform ruling for €${activeDisputeForArbitration.amountEur} held in escrow custody.`}
          maxWidth="lg"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveDisputeForArbitration(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="font-bold"
                onClick={handleConfirmArbitration}
              >
                Confirm Ruling & Disburse
              </Button>
            </>
          }
        >
          <div className="space-y-5">
            {/* 3 Decision Pathways */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Arbitration Judgment
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision('resolved_creator')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    decision === 'resolved_creator'
                      ? 'border-brand-pink bg-pink-50/70 shadow-sm'
                      : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100/60'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900">
                    100% Release to Creator
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Creator met agreed specifications; brand must accept delivery.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('resolved_brand')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    decision === 'resolved_brand'
                      ? 'border-brand-pink bg-pink-50/70 shadow-sm'
                      : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100/60'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900">
                    100% Refund to Brand
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Total breach of brief or severe delivery failure. Funds returned.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDecision('resolved_split')}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    decision === 'resolved_split'
                      ? 'border-brand-pink bg-pink-50/70 shadow-sm'
                      : 'border-neutral-200 bg-neutral-50/60 hover:bg-neutral-100/60'
                  }`}
                >
                  <div className="text-xs font-bold text-neutral-900">
                    Split Settlement (50/50)
                  </div>
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Equitable compromise. Both parties share financial adjustment.
                  </div>
                </button>
              </div>
            </div>

            {/* Split options if split selected */}
            {decision === 'resolved_split' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  Custom Split Allocation
                </label>
                <select
                  value={splitRatio}
                  onChange={(e) => setSplitRatio(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink"
                >
                  <option value="50% Brand / 50% Creator">
                    50% Brand Refund (€600) / 50% Creator Payout (€600)
                  </option>
                  <option value="75% Creator / 25% Brand">
                    75% Creator Payout (€900) / 25% Brand Refund (€300)
                  </option>
                  <option value="75% Brand / 25% Creator">
                    75% Brand Refund (€900) / 25% Creator Payout (€300)
                  </option>
                </select>
              </div>
            )}

            {/* Mediator Official Ruling Remarks */}
            <Textarea
              label="Arbitration Ruling Reason"
              value={mediatorNotes}
              onChange={(e) => setMediatorNotes(e.target.value)}
              rows={4}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
