import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setVerificationFilter,
  approveRequest,
  rejectRequest,
} from '@/store/slices/verificationSlice';
import { VerificationRequest } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate } from '@/lib/utils';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Instagram,
  Youtube,
  ExternalLink,
  Award,
  Video,
  FileCheck,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, filterStatus } = useAppSelector((state) => state.verification);

  const [rejectingItem, setRejectingItem] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('Audience engagement metrics fell below our 3.5% verified benchmark.');

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleApprove = (id: string) => {
    dispatch(approveRequest(id));
  };

  const handleConfirmReject = () => {
    if (!rejectingItem) return;
    dispatch(rejectRequest({ id: rejectingItem.id, reason: rejectionReason }));
    setRejectingItem(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Creator Verification & Badges"
        subtitle="Vetting the top 1% UGC creators to guarantee campaign ROI for enterprise brands."
        badge={
          <Badge variant="pink" size="sm">
            Strict 1% Acceptance Rate
          </Badge>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start max-w-sm">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => dispatch(setVerificationFilter(s))}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
              filterStatus === s
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} hoverEffect className="flex flex-col justify-between">
            <div>
              {/* Card Header with Creator Info */}
              <div className="p-6 border-b border-neutral-100 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Avatar src={request.avatar} name={request.creatorName} size="lg" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-neutral-900">
                        {request.creatorName}
                      </h3>
                      {request.status === 'approved' && (
                        <Award className="w-4 h-4 text-brand-pink fill-brand-pink/20" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">@{request.handle}</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded">
                      {request.category}
                    </span>
                  </div>
                </div>

                <Badge
                  variant={
                    request.status === 'approved'
                      ? 'success'
                      : request.status === 'rejected'
                      ? 'danger'
                      : 'warning'
                  }
                  size="sm"
                  dot
                >
                  {request.status}
                </Badge>
              </div>

              {/* Card Body with Proofs */}
              <div className="p-6 space-y-4">
                {/* Social Audiences */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Total Audience Reach
                    </span>
                    <p className="text-sm font-bold text-neutral-900 mt-0.5">
                      {request.followersTotal}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Verified Views
                    </span>
                    <p className="text-sm font-bold text-neutral-900 mt-0.5">
                      {request.sampleWorkViews}
                    </p>
                  </div>
                </div>

                {/* Connected Handles */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-neutral-500 uppercase">
                    Connected Platforms
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {request.platforms.instagram && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 font-medium">
                        <Instagram className="w-3.5 h-3.5" />
                        {request.platforms.instagram}
                      </span>
                    )}
                    {request.platforms.tiktok && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 font-medium">
                        <Video className="w-3.5 h-3.5" />
                        {request.platforms.tiktok}
                      </span>
                    )}
                    {request.platforms.youtube && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-medium">
                        <Youtube className="w-3.5 h-3.5" />
                        {request.platforms.youtube}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sample Portfolio Submission */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/70 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-800">
                      Audited Video Submission:
                    </span>
                    <span className="text-neutral-400 text-[11px]">
                      {formatDate(request.submittedDate)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 italic">
                    "{request.sampleWorkTitle}"
                  </p>
                </div>

                {/* If rejected, show reason */}
                {request.rejectionReason && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                    <span className="font-bold">Rejection Note: </span>
                    {request.rejectionReason}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            {request.status === 'pending' && (
              <div className="p-4 px-6 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => setRejectingItem(request)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Decline
                </Button>

                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => handleApprove(request.id)}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                >
                  Approve Verified Badge
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectingItem && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingItem(null)}
          title={`Decline Verification for @${rejectingItem.handle}`}
          description="Provide a clear, actionable explanation so the creator can improve their media kit."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setRejectingItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Send Rejection Notice
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Textarea
              label="Feedback & Rejection Reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};
