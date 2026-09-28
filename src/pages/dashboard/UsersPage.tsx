import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSearchQuery,
  setRoleFilter,
  setStatusFilter,
  banOrSuspendUser,
  reactivateUser,
} from '@/store/slices/usersSlice';
import { MarketplaceUser, UserStatus } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Textarea } from '@/components/ui/Textarea';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Search,
  Filter,
  ShieldAlert,
  CheckCircle,
  Ban,
  AlertTriangle,
  RotateCcw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, searchQuery, roleFilter, statusFilter } = useAppSelector(
    (state) => state.users
  );

  // Moderation Modal State
  const [selectedUserForModeration, setSelectedUserForModeration] =
    useState<MarketplaceUser | null>(null);
  const [actionType, setActionType] = useState<'warning' | 'temporary' | 'permanent'>('temporary');
  const [banReason, setBanReason] = useState('Attempted off-platform WhatsApp payment to circumvent 15% escrow fee.');
  const [escrowDisposition, setEscrowDisposition] = useState<'hold' | 'refund'>('hold');
  const [auditNotes, setAuditNotes] = useState('');

  // User Profile Inspector Drawer/Modal
  const [inspectedUser, setInspectedUser] = useState<MarketplaceUser | null>(null);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.handle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenModeration = (user: MarketplaceUser) => {
    setSelectedUserForModeration(user);
    setActionType('temporary');
    setBanReason('');
    setEscrowDisposition('hold');
    setAuditNotes('');
  };

  const handleExecuteModeration = () => {
    if (!selectedUserForModeration) return;

    dispatch(
      banOrSuspendUser({
        userId: selectedUserForModeration.id,
        actionType,
        reason: banReason || 'Violation of Platform Rules',
        escrowDisposition,
        notes: auditNotes,
      })
    );

    setSelectedUserForModeration(null);
  };

  const handleReactivate = (userId: string) => {
    dispatch(reactivateUser(userId));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage registered creators and brand accounts."
        badge={
          <Badge variant="neutral" size="sm">
            {users.length} Users
          </Badge>
        }
      />

      {/* Control Panel: Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Role Filter Tabs (All / Creators / Brands) */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-white/5 p-1 rounded-xl self-start">
            {[
              { label: 'All', value: 'all' as const, count: users.length },
              { label: 'Creators', value: 'creator' as const, count: users.filter((u) => u.role === 'creator').length },
              { label: 'Brands', value: 'brand' as const, count: users.filter((u) => u.role === 'brand').length },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => dispatch(setRoleFilter(tab.value))}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  roleFilter === tab.value
                    ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    roleFilter === tab.value
                      ? 'bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-white'
                      : 'bg-neutral-200/60 dark:bg-white/5 text-neutral-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, @handle, or email..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 dark:bg-white/5 border border-neutral-200 dark:border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink text-neutral-900 dark:text-white"
              />
            </div>

            {/* Status Dropdown Filter */}
            <select
              value={statusFilter}
              onChange={(e) => dispatch(setStatusFilter(e.target.value as any))}
              className="h-9 px-3 text-xs font-bold bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 rounded-lg text-neutral-700 dark:text-neutral-200 outline-none focus:border-brand-pink cursor-pointer w-full sm:w-auto"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Directory Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Deals</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-neutral-400">
                  No accounts found matching your query or filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <div>
                        <div className="font-extrabold text-neutral-950 flex items-center gap-1.5 text-sm">
                          <span>{user.name}</span>
                          {user.role === 'creator' && user.rating && (
                            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60">
                              ★ {user.rating}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 font-medium">@{user.handle} • {user.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={user.role === 'creator' ? 'pink' : 'neutral'}
                      size="sm"
                    >
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        user.status === 'active'
                          ? 'success'
                          : user.status === 'suspended'
                          ? 'warning'
                          : 'danger'
                      }
                      size="sm"
                      dot
                    >
                      {user.status}
                    </Badge>
                    {user.banReason && (
                      <p className="text-[10px] text-rose-600 font-bold mt-0.5 max-w-[200px] truncate" title={user.banReason}>
                        {user.banReason}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="font-black text-neutral-950 tabular-nums text-sm">
                    {formatCurrency(user.totalVolumeEur)}
                  </TableCell>

                  <TableCell className="text-neutral-800 tabular-nums font-bold">
                    {user.ordersCount} campaigns
                  </TableCell>

                  <TableCell className="text-neutral-500 text-xs font-semibold">
                    {formatDate(user.joinedDate)}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectedUser(user)}
                        title="View Full Profile & History"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>

                      {user.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-rose-600 border-rose-200 hover:bg-rose-50"
                          onClick={() => handleOpenModeration(user)}
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          Moderate
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          onClick={() => handleReactivate(user.id)}
                        >
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Moderation Action Modal (Ban / Suspend) */}
      {selectedUserForModeration && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUserForModeration(null)}
          title={`Moderate Account: @${selectedUserForModeration.handle}`}
          description={`Take targeted disciplinary or compliance action against ${selectedUserForModeration.name}.`}
          maxWidth="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUserForModeration(null)}
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'permanent' ? 'danger' : 'accent'}
                size="sm"
                onClick={handleExecuteModeration}
              >
                Confirm {actionType === 'permanent' ? 'Permanent Ban' : 'Account Suspension'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Action Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Action Severity
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setActionType('warning')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    actionType === 'warning'
                      ? 'border-brand-black bg-neutral-900 text-white font-bold'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="text-xs">Warning</div>
                  <div className="text-[10px] opacity-70">Log strike only</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('temporary')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    actionType === 'temporary'
                      ? 'border-amber-600 bg-amber-500 text-white font-bold'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="text-xs">Temporary</div>
                  <div className="text-[10px] opacity-70">14-Day Freeze</div>
                </button>

                <button
                  type="button"
                  onClick={() => setActionType('permanent')}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    actionType === 'permanent'
                      ? 'border-rose-600 bg-rose-600 text-white font-bold'
                      : 'border-neutral-200 bg-neutral-50 text-neutral-700'
                  }`}
                >
                  <div className="text-xs">Permanent</div>
                  <div className="text-[10px] opacity-70">Full Blacklist</div>
                </button>
              </div>
            </div>

            {/* Violation Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Primary Reason / Policy Violation
              </label>
              <select
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                className="w-full h-10 px-3 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink"
              >
                <option value="Attempted off-platform WhatsApp payment to circumvent 15% escrow fee.">
                  Escrow Fee Circumvention (Off-platform deal attempt)
                </option>
                <option value="Repeated non-delivery of deliverables within deadline.">
                  Delinquent Deliverable Default (Breach of Campaign SLA)
                </option>
                <option value="Fabricated portfolio metrics and fraudulent follower graph.">
                  Fraudulent Metrics / Bot Engagement
                </option>
                <option value="Abusive or defamatory communication with counterpart.">
                  Harassment & Unprofessional Conduct
                </option>
                <option value="Unauthorized brand asset disclosure before embargo release.">
                  Confidentiality & NDA Breach
                </option>
              </select>
            </div>

            {/* Escrow Disposition */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Current Escrow Funds Handling
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEscrowDisposition('hold')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    escrowDisposition === 'hold'
                      ? 'border-brand-pink bg-pink-50 text-neutral-900 font-bold'
                      : 'border-neutral-200 bg-white text-neutral-600'
                  }`}
                >
                  Lock in Trust Hold
                </button>
                <button
                  type="button"
                  onClick={() => setEscrowDisposition('refund')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors ${
                    escrowDisposition === 'refund'
                      ? 'border-brand-pink bg-pink-50 text-neutral-900 font-bold'
                      : 'border-neutral-200 bg-white text-neutral-600'
                  }`}
                >
                  Automate Full Refund
                </button>
              </div>
            </div>

            {/* Internal Audit Notes */}
            <Textarea
              label="Internal Security Log (Private to Admins)"
              placeholder="Provide evidence links, chat screenshots, or transaction hashes for future audit..."
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* User Details View Drawer */}
      {inspectedUser && (
        <Modal
          isOpen={true}
          onClose={() => setInspectedUser(null)}
          title={
            <div className="flex items-center gap-3">
              <Avatar src={inspectedUser.avatar} name={inspectedUser.name} size="md" />
              <div>
                <h3 className="text-base font-bold text-neutral-900">{inspectedUser.name}</h3>
                <p className="text-xs text-neutral-400">@{inspectedUser.handle} • {inspectedUser.id}</p>
              </div>
            </div>
          }
          maxWidth="lg"
          footer={
            <Button variant="primary" size="sm" onClick={() => setInspectedUser(null)}>
              Close Audit View
            </Button>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">Account Type</span>
                <p className="text-xs font-bold text-neutral-900 capitalize">{inspectedUser.role}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">Status</span>
                <p className="text-xs font-bold capitalize">{inspectedUser.status}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">Location</span>
                <p className="text-xs font-bold text-neutral-900">{inspectedUser.location}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">Volume</span>
                <p className="text-xs font-bold text-neutral-900 tabular-nums">{formatCurrency(inspectedUser.totalVolumeEur)}</p>
              </div>
            </div>

            {inspectedUser.banReason && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                  Active Moderation Sanction
                </span>
                <p className="text-xs text-rose-700">{inspectedUser.banReason}</p>
                {inspectedUser.notes && (
                  <p className="text-[11px] text-rose-600 italic mt-2">
                    Internal notes: {inspectedUser.notes}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Platform Activity & Trust Score
              </h4>
              <div className="border border-neutral-200 rounded-xl p-4 divide-y divide-neutral-100 text-xs">
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Corporate / Legal Entity</span>
                  <span className="font-semibold text-neutral-800">{inspectedUser.companyName || 'Individual Creator'}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Contact Email</span>
                  <span className="font-semibold text-neutral-800">{inspectedUser.email}</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Stripe Connect ID</span>
                  <span className="font-mono text-neutral-700">acct_1N9xInfluverse28</span>
                </div>
                <div className="py-2 flex justify-between">
                  <span className="text-neutral-500">Escrow Dispute History</span>
                  <span className="font-semibold text-emerald-600">0 Disputes Filed Against</span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
