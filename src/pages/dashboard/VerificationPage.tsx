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
import { Eye, Award } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, filterStatus } = useAppSelector((state) => state.verification);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [rejectingItem, setRejectingItem] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState(
    'Profile information or identity could not be verified against platform standards.'
  );

  const filteredRequests = requests.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const handleApprove = (id: string) => {
    dispatch(approveRequest(id));
    if (selectedRequest?.id === id) {
      setSelectedRequest(null);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectingItem) return;
    dispatch(rejectRequest({ id: rejectingItem.id, reason: rejectionReason }));
    setRejectingItem(null);
    if (selectedRequest?.id === rejectingItem.id) {
      setSelectedRequest(null);
    }
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
      <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 p-1 rounded-xl self-start max-w-sm">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => dispatch(setVerificationFilter(s))}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
              filterStatus === s
                ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
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
              <TableHead>Email</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-neutral-400 font-medium">
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
                        <div className="font-extrabold text-neutral-950 dark:text-white flex items-center gap-1.5 text-xs">
                          <span>{request.creatorName}</span>
                          {request.status === 'approved' && (
                            <Award className="w-3.5 h-3.5 text-brand-pink fill-brand-pink/20" />
                          )}
                        </div>
                        <div className="text-[11px] text-neutral-400 font-medium">
                          @{request.handle}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <span className="text-xs text-neutral-600 dark:text-neutral-300 font-medium">
                      {request.email || `${request.handle}@creator.com`}
                    </span>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="neutral" size="sm">
                      {request.category}
                    </Badge>
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

                  {/* Action */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-7 px-2.5 font-bold flex items-center gap-1"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Details</span>
                      </Button>
                      {request.status === 'pending' && (
                        <>
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
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Creator Details Modal */}
      {selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title="Creator Details"
          description={`Application ID: ${selectedRequest.id}`}
          maxWidth="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </Button>
              {selectedRequest.status === 'pending' && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                    onClick={() => {
                      setRejectingItem(selectedRequest);
                    }}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => handleApprove(selectedRequest.id)}
                  >
                    Approve Creator
                  </Button>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Creator Header Card */}
            <div className="flex items-center gap-3 p-3.5 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/60 dark:border-white/10">
              <Avatar
                src={selectedRequest.avatar}
                name={selectedRequest.creatorName}
                size="md"
              />
              <div className="flex-1">
                <div className="font-extrabold text-neutral-900 dark:text-white text-sm">
                  {selectedRequest.creatorName}
                </div>
                <div className="text-neutral-400 font-medium">
                  @{selectedRequest.handle}
                </div>
              </div>
              <Badge
                variant={
                  selectedRequest.status === 'approved'
                    ? 'success'
                    : selectedRequest.status === 'rejected'
                    ? 'danger'
                    : 'warning'
                }
                size="sm"
                dot
              >
                {selectedRequest.status}
              </Badge>
            </div>

            {/* Information Grid based on Actual Signup Data */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/60 dark:border-white/10 space-y-1">
                <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider block">
                  Email Address
                </span>
                <span className="font-bold text-neutral-900 dark:text-white break-all">
                  {selectedRequest.email || `${selectedRequest.handle}@creator.com`}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/60 dark:border-white/10 space-y-1">
                <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider block">
                  Category
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedRequest.category}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/60 dark:border-white/10 space-y-1">
                <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider block">
                  Primary Platform
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {selectedRequest.platform || 'Instagram'}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-white/5 rounded-xl border border-neutral-200/60 dark:border-white/10 space-y-1">
                <span className="text-neutral-400 font-bold uppercase text-[10px] tracking-wider block">
                  Applied Date
                </span>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {formatDate(selectedRequest.submittedDate)}
                </span>
              </div>
            </div>

            {/* Rejection Details if Rejected */}
            {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 space-y-1 text-rose-800 dark:text-rose-300">
                <span className="font-bold block text-[11px]">Decline Reason:</span>
                <p className="text-xs leading-relaxed">{selectedRequest.rejectionReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {rejectingItem && (
        <Modal
          isOpen={true}
          onClose={() => setRejectingItem(null)}
          title={`Decline Verification for @${rejectingItem.handle}`}
          description="Provide a clear, actionable explanation for declining this verification request."
          footer={
            <>
              <Button variant="outline" size="sm" onClick={() => setRejectingItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Confirm Decline
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Textarea
              label="Decline Reason"
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
