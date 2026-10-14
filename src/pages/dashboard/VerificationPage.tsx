import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setVerificationFilter,
  approveRequest,
  rejectRequest,
} from '@/store/slices/verificationSlice';
import { setCreatorVerified } from '@/store/slices/usersSlice';
import { VerificationRequest } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Textarea } from '@/components/ui/Textarea';
import { Pagination } from '@/components/ui/Pagination';
import { formatDate } from '@/lib/utils';
import { Eye, BadgeCheck, Check, ExternalLink, Globe, Video, Users, TrendingUp, Layers } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { requests, filterStatus } = useAppSelector((state) => state.verification);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modals
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [approvingItem, setApprovingItem] = useState<VerificationRequest | null>(null);
  const [rejectingItem, setRejectingItem] = useState<VerificationRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState(
    'Profile information or identity could not be verified against platform standards.'
  );

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;

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
    const req = requests.find((r) => r.id === id);
    dispatch(approveRequest(id));
    if (req) {
      dispatch(
        setCreatorVerified({
          handle: req.handle,
          creatorId: req.creatorId,
          isVerified: true,
        })
      );
    }
    if (selectedRequest?.id === id) {
      setSelectedRequest((prev) => (prev ? { ...prev, status: 'approved' } : null));
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
        subtitle="Review and manage creator identity applications."
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-neutral-100 p-1 rounded-xl self-start max-w-md">
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
                            <span title="Verified Creator" className="inline-flex">
                              <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/15 shrink-0" />
                            </span>
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs font-bold flex items-center gap-1.5"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                      {request.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => setApprovingItem(request)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
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

      {/* Audit Modal (Light Mode, 2-Column Responsive Layout) */}
      {selectedRequest && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedRequest(null)}
          title={`Verification Details: ${selectedRequest.creatorName}`}
          description="Review identity details, verified audience reach, and portfolio deliverables."
          maxWidth="lg"
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
                  <button
                    type="button"
                    onClick={() => setApprovingItem(selectedRequest)}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Creator</span>
                  </button>
                </div>
              )}
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Top Identity Banner */}
            <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedRequest.avatar}
                  name={selectedRequest.creatorName}
                  size="md"
                />
                <div>
                  <div className="font-extrabold text-neutral-950 text-sm flex items-center gap-1.5">
                    <span>{selectedRequest.creatorName}</span>
                    {selectedRequest.status === 'approved' && (
                      <span title="Verified Creator" className="inline-flex">
                        <BadgeCheck className="w-4 h-4 text-sky-500 fill-sky-500/15 shrink-0" />
                      </span>
                    )}
                  </div>
                  <div className="text-neutral-500 font-medium">
                    @{selectedRequest.handle} • {selectedRequest.email}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="neutral" size="sm">
                  {selectedRequest.category}
                </Badge>
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
            </div>

            {/* 2-Column Audit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Metrics & Social Channels */}
              <div className="space-y-3">
                {/* Audience Metrics */}
                <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                    <TrendingUp className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Audience Reach &amp; Metrics</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 bg-neutral-50 rounded-lg">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Total Followers</span>
                      <span className="text-sm font-black text-neutral-950">{selectedRequest.followersTotal || '350K+'}</span>
                    </div>
                    <div className="p-2.5 bg-neutral-50 rounded-lg">
                      <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Avg. Views</span>
                      <span className="text-sm font-black text-neutral-950">{selectedRequest.avgViews || '65K'}</span>
                    </div>
                  </div>
                </div>

                {/* Live Social Channels (Clickable Links) */}
                <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                    <Users className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Live Social Profiles</span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {selectedRequest.platforms?.instagram && (
                      <a
                        href={selectedRequest.platforms.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200/60 text-xs font-semibold text-neutral-800"
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-extrabold text-[10px] uppercase px-1.5 py-0.5 rounded bg-pink-100 text-pink-700">IG</span>
                          <span>Instagram Profile</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      </a>
                    )}
                    {selectedRequest.platforms?.tiktok && (
                      <a
                        href={selectedRequest.platforms.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200/60 text-xs font-semibold text-neutral-800"
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-extrabold text-[10px] uppercase px-1.5 py-0.5 rounded bg-neutral-900 text-white">TT</span>
                          <span>TikTok Profile</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      </a>
                    )}
                    {selectedRequest.platforms?.youtube && (
                      <a
                        href={selectedRequest.platforms.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors border border-neutral-200/60 text-xs font-semibold text-neutral-800"
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-extrabold text-[10px] uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">YT</span>
                          <span>YouTube Channel</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                      </a>
                    )}
                    {!selectedRequest.platforms && (
                      <div className="text-xs text-neutral-500 py-1">Primary: {selectedRequest.platform || 'Instagram'}</div>
                    )}
                  </div>
                </div>

                {/* Location & Languages */}
                <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                    <Globe className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Location &amp; Languages</span>
                  </div>
                  <div className="space-y-1.5 pt-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Base Location:</span>
                      <span className="font-bold text-neutral-900">{selectedRequest.location || 'European Union'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500 font-medium">Languages:</span>
                      <span className="font-bold text-neutral-900">
                        {selectedRequest.languages ? selectedRequest.languages.join(', ') : 'English'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sample Deliverable & Collab Preferences */}
              <div className="space-y-3">
                {/* Sample Deliverable Card */}
                <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                      <Video className="w-3.5 h-3.5 text-neutral-600" />
                      <span>Sample Deliverable &amp; UGC</span>
                    </div>
                    {selectedRequest.sampleWorkViews && (
                      <Badge variant="neutral" size="sm" className="font-extrabold">
                        {selectedRequest.sampleWorkViews}
                      </Badge>
                    )}
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2">
                    <p className="font-bold text-neutral-950 text-xs leading-snug">
                      {selectedRequest.sampleWorkTitle || 'High-Engagement Brand Collaboration Video & Reel'}
                    </p>
                    {selectedRequest.sampleWorkUrl && (
                      <a
                        href={selectedRequest.sampleWorkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-brand-black hover:underline"
                      >
                        <span>Inspect Deliverable Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Collaboration Preferences */}
                <div className="p-3.5 bg-white rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-neutral-900 text-xs">
                    <Layers className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Collaboration Scope</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(selectedRequest.collaborationPreferences || ['UGC Video', 'Dedicated Reel', 'Brand Rights 30d']).map((pref) => (
                      <span
                        key={pref}
                        className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 text-[11px] font-bold border border-neutral-200"
                      >
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Application Metadata */}
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Applied Date:</span>
                    <span className="font-bold text-neutral-950">{formatDate(selectedRequest.submittedDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-medium">Application ID:</span>
                    <span className="font-mono font-bold text-neutral-800">{selectedRequest.id}</span>
                  </div>
                </div>

                {/* Decline Notice if rejected */}
                {selectedRequest.status === 'rejected' && selectedRequest.rejectionReason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1 text-rose-800">
                    <span className="font-bold block text-[11px]">Decline Reason:</span>
                    <p className="text-xs leading-relaxed">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
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

      {/* Confirm Creator Approval Dialog */}
      <ConfirmDialog
        isOpen={Boolean(approvingItem)}
        onClose={() => setApprovingItem(null)}
        onConfirm={() => {
          if (approvingItem) {
            handleApprove(approvingItem.id);
            setApprovingItem(null);
          }
        }}
        title="Approve Creator Identity"
        description={`Are you sure you want to approve identity verification for ${approvingItem?.creatorName} (@${approvingItem?.handle})? This will award the verified creator badge and grant access to marketplace campaign contracts.`}
        variant="success"
        confirmLabel="Approve Creator"
      />
    </div>
  );
};
