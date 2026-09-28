import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setVerificationFilter,
  approveRequest,
  rejectRequest,
} from '@/store/slices/verificationSlice';
import { VerificationRequest } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate } from '@/lib/utils';
import {
  Instagram,
  Youtube,
  Video,
  Award,
} from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, filterStatus } = useAppSelector((state) => state.verification);

  const [rejectingItem, setRejectingItem] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState(
    'Audience engagement metrics fell below our 3.5% verified benchmark.'
  );

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

      {/* Verification Applications Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator</TableHead>
              <TableHead>Audience & Reach</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Sample Submission</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-neutral-400 font-medium">
                  No verification applications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  {/* Creator */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={request.avatar} name={request.creatorName} size="sm" />
                      <div>
                        <div className="font-extrabold text-neutral-900 flex items-center gap-1.5 text-xs">
                          <span>{request.creatorName}</span>
                          {request.status === 'approved' && (
                            <Award className="w-3.5 h-3.5 text-brand-pink fill-brand-pink/20" />
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-medium">
                          @{request.handle}
                        </div>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {request.category}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Audience & Reach */}
                  <TableCell>
                    <div className="text-xs font-bold text-neutral-900 tabular-nums">
                      {request.followersTotal}
                    </div>
                    <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
                      {request.sampleWorkViews} views
                    </div>
                  </TableCell>

                  {/* Platforms */}
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-1.5">
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
                  </TableCell>

                  {/* Sample Work */}
                  <TableCell className="max-w-xs">
                    <p className="text-xs font-semibold text-neutral-900 line-clamp-1" title={request.sampleWorkTitle}>
                      "{request.sampleWorkTitle}"
                    </p>
                    <span className="text-[11px] text-neutral-400 font-medium block mt-0.5">
                      Submitted {formatDate(request.submittedDate)}
                    </span>
                    {request.rejectionReason && (
                      <p className="text-[10px] text-rose-600 font-medium mt-0.5">
                        {request.rejectionReason}
                      </p>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
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
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    {request.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-7 px-2.5 font-bold"
                          onClick={() => setRejectingItem(request)}
                        >
                          Decline
                        </Button>
                        <Button
                          variant="accent"
                          size="sm"
                          className="text-xs h-7 px-2.5 font-bold"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 font-medium">
                        Reviewed
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

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
