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
        title="Verifications"
        subtitle="Review and audit creator identity applications."
        badge={
          <Badge variant="pink" size="sm">
            {requests.filter((r) => r.status === 'pending').length} Pending
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} hoverEffect className="p-4 sm:p-5 flex flex-col justify-between">
            <div>
              {/* Card Header with Creator Info */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={request.avatar} name={request.creatorName} size="md" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-neutral-900">
                        {request.creatorName}
                      </h3>
                      {request.status === 'approved' && (
                        <Award className="w-3.5 h-3.5 text-brand-pink fill-brand-pink/20" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-400">@{request.handle}</p>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.2 rounded">
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

              {/* Stats strip */}
              <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-neutral-50 border border-neutral-100 font-medium text-neutral-700 mt-3">
                <span><strong>{request.followersTotal}</strong> reach</span>
                <span className="text-neutral-300">•</span>
                <span><strong>{request.sampleWorkViews}</strong> views</span>
              </div>

              {/* Connected Platforms */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                {request.platforms.instagram && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-pink-50 text-pink-700 font-medium">
                    <Instagram className="w-3 h-3" />
                    {request.platforms.instagram}
                  </span>
                )}
                {request.platforms.tiktok && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-neutral-100 text-neutral-800 font-medium">
                    <Video className="w-3 h-3" />
                    {request.platforms.tiktok}
                  </span>
                )}
                {request.platforms.youtube && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-rose-50 text-rose-700 font-medium">
                    <Youtube className="w-3 h-3" />
                    {request.platforms.youtube}
                  </span>
                )}
              </div>

              {/* Audited Video Submission */}
              <div className="mt-2.5 p-2.5 bg-neutral-50 rounded-lg border border-neutral-100 text-xs">
                <span className="text-[10px] text-neutral-400 block font-medium">Audited Sample ({formatDate(request.submittedDate)}):</span>
                <p className="text-xs text-neutral-700 line-clamp-1 italic mt-0.5">
                  "{request.sampleWorkTitle}"
                </p>
              </div>

              {request.rejectionReason && (
                <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                  <span className="font-semibold">Reason: </span>{request.rejectionReason}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            {request.status === 'pending' && (
              <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8"
                  onClick={() => setRejectingItem(request)}
                >
                  Decline
                </Button>

                <Button
                  variant="accent"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => handleApprove(request.id)}
                >
                  Approve
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
