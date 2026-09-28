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
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Eye, BadgeCheck } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, filterStatus } = useAppSelector((state) => state.verification);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

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

  // Pagination calculation
  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedRequests = filteredRequests.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

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
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Verifications"
        subtitle="Review and audit creator identity applications."
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl self-start max-w-sm">
        {(['all', 'pending', 'approved'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              dispatch(setVerificationFilter(s));
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all capitalize cursor-pointer ${
              filterStatus === s
                ? 'bg-white text-neutral-950 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-950'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Verification Applications Table */}
      <Card className="border-neutral-200/80 overflow-hidden">
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
            {paginatedRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-neutral-500 font-medium">
                  No verification applications found.
                </TableCell>
              </TableRow>
            ) : (
              paginatedRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-neutral-50/80 transition-colors">
                  {/* Creator */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={request.avatar} name={request.creatorName} size="sm" />
                      <div>
                        <div className="font-extrabold text-neutral-950 flex items-center gap-1.5 text-sm">
                          <span>{request.creatorName}</span>
                          {request.status === 'approved' && (
                            <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/15 shrink-0" title="Verified Creator" />
                          )}
                        </div>
                        <div className="text-xs text-neutral-500 font-semibold">
                          @{request.handle}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <span className="text-sm text-neutral-800 font-semibold">
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
                        variant="outline"
                        size="sm"
                        className="text-sm font-bold flex items-center gap-1.5"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Audit
                      </Button>
                      {request.status === 'pending' && (
                        <Button
                          variant="accent"
                          size="sm"
                          className="text-sm font-bold"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Bottom Pagination */}
        <div className="border-t border-neutral-100 px-4 py-1.5">
          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages}
            totalItems={filteredRequests.length}
            pageSize={pageSize}
            pageSizeOptions={[8, 16, 24]}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="applications"
          />
        </div>
      </Card>

      {/* Audit Modal (Light Mode) */}
      {selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title={`Audit Verification: ${selectedRequest.creatorName}`}
          description="Review identity details and social channel metrics."
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
                    className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold"
                    onClick={() => {
                      setRejectingItem(selectedRequest);
                    }}
                  >
                    Decline
                  </Button>
                  <Button
                    variant="accent"
                    size="sm"
                    className="font-bold"
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
            <div className="flex items-center gap-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <Avatar
                src={selectedRequest.avatar}
                name={selectedRequest.creatorName}
                size="md"
              />
              <div className="flex-1">
                <div className="font-extrabold text-neutral-950 text-sm flex items-center gap-1.5">
                  <span>{selectedRequest.creatorName}</span>
                  {selectedRequest.status === 'approved' && (
                    <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/15 shrink-0" title="Verified Creator" />
                  )}
                </div>
                <div className="text-neutral-500 font-medium">
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

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider block">
                  Email Address
                </span>
                <span className="font-bold text-neutral-950 break-all">
                  {selectedRequest.email || `${selectedRequest.handle}@creator.com`}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider block">
                  Category
                </span>
                <span className="font-bold text-neutral-950">
                  {selectedRequest.category}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider block">
                  Primary Platform
                </span>
                <span className="font-bold text-neutral-950">
                  {selectedRequest.platform || 'Instagram'}
                </span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                <span className="text-neutral-500 font-bold uppercase text-[10px] tracking-wider block">
                  Applied Date
                </span>
                <span className="font-bold text-neutral-950">
                  {formatDate(selectedRequest.submittedDate)}
                </span>
              </div>
            </div>

            {/* Rejection Details if Rejected */}
            {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-rose-800">
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
          title={`Decline Verification: @${rejectingItem.handle}`}
          description="Provide a clear explanation for declining this verification request."
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
