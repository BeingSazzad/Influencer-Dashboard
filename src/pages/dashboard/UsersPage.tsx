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
import { Pagination } from '@/components/ui/Pagination';
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronDown,
} from 'lucide-react';

type SortOption =
  | 'recent'
  | 'oldest'
  | 'volume_desc'
  | 'volume_asc'
  | 'deals_desc'
  | 'deals_asc'
  | 'name_asc'
  | 'name_desc';

export const UsersPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, searchQuery, roleFilter, statusFilter } = useAppSelector(
    (state) => state.users
  );

  // Sorting & Pagination State
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Moderation Modal State
  const [selectedUserForModeration, setSelectedUserForModeration] =
    useState<MarketplaceUser | null>(null);
  const [actionType, setActionType] = useState<'warning' | 'temporary' | 'permanent'>('temporary');
  const [banReason, setBanReason] = useState('Attempted off-platform WhatsApp payment to circumvent 15% escrow fee.');
  const [escrowDisposition, setEscrowDisposition] = useState<'hold' | 'refund'>('hold');
  const [auditNotes, setAuditNotes] = useState('');

  // User Profile Inspector Drawer/Modal
  const [inspectedUser, setInspectedUser] = useState<MarketplaceUser | null>(null);

  // Enhanced Filter matching name, handle, email, company, category, and location
  const q = searchQuery.toLowerCase().trim();
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      (u.companyName && u.companyName.toLowerCase().includes(q)) ||
      (u.category && u.category.toLowerCase().includes(q)) ||
      u.location.toLowerCase().includes(q);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Sorting
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
      case 'oldest':
        return new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
      case 'volume_desc':
        return b.totalVolumeEur - a.totalVolumeEur;
      case 'volume_asc':
        return a.totalVolumeEur - b.totalVolumeEur;
      case 'deals_desc':
        return b.ordersCount - a.ordersCount;
      case 'deals_asc':
        return a.ordersCount - b.ordersCount;
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });

  // Pagination calculation
  const totalPages = Math.ceil(sortedUsers.length / pageSize) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedUsers = sortedUsers.slice(
    (validCurrentPage - 1) * pageSize,
    validCurrentPage * pageSize
  );

  // Column Header Sort Toggle
  const handleSort = (field: 'name' | 'volume' | 'deals' | 'joined') => {
    setCurrentPage(1);
    if (field === 'name') {
      setSortBy((prev) => (prev === 'name_asc' ? 'name_desc' : 'name_asc'));
    } else if (field === 'volume') {
      setSortBy((prev) => (prev === 'volume_desc' ? 'volume_asc' : 'volume_desc'));
    } else if (field === 'deals') {
      setSortBy((prev) => (prev === 'deals_desc' ? 'deals_asc' : 'deals_desc'));
    } else if (field === 'joined') {
      setSortBy((prev) => (prev === 'recent' ? 'oldest' : 'recent'));
    }
  };

  const renderSortIcon = (field: 'name' | 'volume' | 'deals' | 'joined') => {
    if (field === 'name') {
      if (sortBy === 'name_asc') return <ArrowUp className="w-3.5 h-3.5 text-neutral-900" />;
      if (sortBy === 'name_desc') return <ArrowDown className="w-3.5 h-3.5 text-neutral-900" />;
    } else if (field === 'volume') {
      if (sortBy === 'volume_desc') return <ArrowDown className="w-3.5 h-3.5 text-neutral-900" />;
      if (sortBy === 'volume_asc') return <ArrowUp className="w-3.5 h-3.5 text-neutral-900" />;
    } else if (field === 'deals') {
      if (sortBy === 'deals_desc') return <ArrowDown className="w-3.5 h-3.5 text-neutral-900" />;
      if (sortBy === 'deals_asc') return <ArrowUp className="w-3.5 h-3.5 text-neutral-900" />;
    } else if (field === 'joined') {
      if (sortBy === 'recent') return <ArrowDown className="w-3.5 h-3.5 text-neutral-900" />;
      if (sortBy === 'oldest') return <ArrowUp className="w-3.5 h-3.5 text-neutral-900" />;
    }
    return <ArrowUpDown className="w-3 h-3 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

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
      />

      {/* Control Panel: Filters, Search & Sorting */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Role Filter Tabs (All / Creators / Brands) */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start">
            {[
              { label: 'All', value: 'all' as const, count: users.length },
              { label: 'Creators', value: 'creator' as const, count: users.filter((u) => u.role === 'creator').length },
              { label: 'Brands', value: 'brand' as const, count: users.filter((u) => u.role === 'brand').length },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  dispatch(setRoleFilter(tab.value));
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  roleFilter === tab.value
                    ? 'bg-white text-neutral-950 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    roleFilter === tab.value
                      ? 'bg-neutral-100 text-neutral-900'
                      : 'bg-neutral-200/60 text-neutral-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1 lg:justify-end">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1 sm:w-64 lg:w-72">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search name, @handle, email, category..."
                value={searchQuery}
                onChange={(e) => {
                  dispatch(setSearchQuery(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full h-9 pl-9 pr-8 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink text-neutral-900 placeholder:text-neutral-400 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setSearchQuery(''));
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5 rounded transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="h-9 pl-3 pr-8 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 outline-none focus:border-brand-pink cursor-pointer appearance-none shadow-2xs"
                title="Sort directory"
              >
                <option value="recent">Sort: Recently Joined</option>
                <option value="oldest">Sort: Oldest Joined</option>
                <option value="volume_desc">Sort: Highest Volume (€)</option>
                <option value="volume_asc">Sort: Lowest Volume (€)</option>
                <option value="deals_desc">Sort: Most Campaigns</option>
                <option value="name_asc">Sort: Name (A → Z)</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Dropdown Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  dispatch(setStatusFilter(e.target.value as any));
                  setCurrentPage(1);
                }}
                className="h-9 pl-3 pr-8 text-xs font-bold bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-800 outline-none focus:border-brand-pink cursor-pointer appearance-none shadow-2xs"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Chips / Reset */}
        {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
          <div className="flex flex-wrap items-center gap-2 pt-2 text-xs text-neutral-500 border-t border-neutral-100">
            <span className="font-semibold text-neutral-400">Active filters:</span>
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-semibold text-[11px]">
                Search: "{searchQuery}"
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setSearchQuery(''));
                    setCurrentPage(1);
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {roleFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-semibold text-[11px] capitalize">
                Role: {roleFilter}
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setRoleFilter('all'));
                    setCurrentPage(1);
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 font-semibold text-[11px] capitalize">
                Status: {statusFilter}
                <button
                  type="button"
                  onClick={() => {
                    dispatch(setStatusFilter('all'));
                    setCurrentPage(1);
                  }}
                  className="hover:text-rose-600 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                dispatch(setSearchQuery(''));
                dispatch(setRoleFilter('all'));
                dispatch(setStatusFilter('all'));
                setCurrentPage(1);
              }}
              className="text-[11px] font-bold text-brand-pink hover:underline ml-auto cursor-pointer"
            >
              Reset all
            </button>
          </div>
        )}
      </Card>

      {/* Users Directory Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:text-neutral-950 transition-colors select-none group"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1.5">
                  <span>User</span>
                  {renderSortIcon('name')}
                </div>
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead
                className="cursor-pointer hover:text-neutral-950 transition-colors select-none group"
                onClick={() => handleSort('volume')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Volume</span>
                  {renderSortIcon('volume')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-neutral-950 transition-colors select-none group"
                onClick={() => handleSort('deals')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Deals</span>
                  {renderSortIcon('deals')}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:text-neutral-950 transition-colors select-none group"
                onClick={() => handleSort('joined')}
              >
                <div className="flex items-center gap-1.5">
                  <span>Joined</span>
                  {renderSortIcon('joined')}
                </div>
              </TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-neutral-500">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="font-bold text-neutral-900">No matching accounts found</p>
                    <p className="text-xs text-neutral-400">
                      Try adjusting your search keywords, role filters, or status selection.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        dispatch(setSearchQuery(''));
                        dispatch(setRoleFilter('all'));
                        dispatch(setStatusFilter('all'));
                        setCurrentPage(1);
                      }}
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={user.avatar} name={user.name} size="sm" />
                      <div>
                        <div className="font-extrabold text-neutral-950 text-sm">
                          {user.name}
                        </div>
                        <div className="text-xs text-neutral-600 font-semibold">@{user.handle} • {user.email}</div>
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
                      variant={user.status === 'active' ? 'success' : 'warning'}
                      size="sm"
                      dot
                    >
                      {user.status === 'active' ? 'Active' : 'Suspended'}
                    </Badge>
                    {user.banReason && (
                      <p className="text-[10px] text-amber-700 font-bold mt-0.5 max-w-[200px] truncate" title={user.banReason}>
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

                  <TableCell className="text-neutral-700 text-xs font-bold">
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
                          className="text-amber-700 border-amber-200 hover:bg-amber-50 font-bold text-xs"
                          onClick={() => handleOpenModeration(user)}
                        >
                          <Ban className="w-3.5 h-3.5 mr-1" />
                          Suspend
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-xs"
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

        {/* Bottom Pagination Bar */}
        <div className="border-t border-neutral-100 px-4 py-1.5">
          <Pagination
            currentPage={validCurrentPage}
            totalPages={totalPages}
            totalItems={sortedUsers.length}
            pageSize={pageSize}
            pageSizeOptions={[8, 16, 24, 50]}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            itemLabel="accounts"
          />
        </div>
      </Card>

      {/* Suspend Account Modal */}
      {selectedUserForModeration && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUserForModeration(null)}
          title={`Suspend Account: @${selectedUserForModeration.handle}`}
          description={`Temporarily restrict platform access and pause active escrow payouts for ${selectedUserForModeration.name}.`}
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
                variant="danger"
                size="sm"
                className="font-bold"
                onClick={handleExecuteModeration}
              >
                Confirm Suspension
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            {/* Violation Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Primary Reason / Policy Violation
              </label>
              <div className="relative">
                <select
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full h-10 pl-3 pr-8 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink appearance-none cursor-pointer text-neutral-800 font-semibold"
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
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Escrow Disposition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                Current Escrow Funds Handling
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEscrowDisposition('hold')}
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
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
                  className={`p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
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
                <span className="text-[10px] uppercase font-bold text-neutral-500">Account Type</span>
                <p className="text-xs font-bold text-neutral-900 capitalize">{inspectedUser.role}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500">Status</span>
                <p className="text-xs font-bold capitalize">{inspectedUser.status}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500">Location</span>
                <p className="text-xs font-bold text-neutral-900">{inspectedUser.location}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-500">Volume</span>
                <p className="text-xs font-bold text-neutral-900 tabular-nums">{formatCurrency(inspectedUser.totalVolumeEur)}</p>
              </div>
            </div>

            {inspectedUser.banReason && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Account Suspension Notice
                </span>
                <p className="text-xs text-amber-700">{inspectedUser.banReason}</p>
                {inspectedUser.notes && (
                  <p className="text-[11px] text-amber-600 italic mt-2">
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
