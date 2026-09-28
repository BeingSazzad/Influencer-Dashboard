import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addAdminMember,
  removeAdminMember,
  updateAdminRole,
  toggleAdminStatus,
  setTeamSearch,
  setTeamRoleFilter,
} from '@/store/slices/teamSlice';
import { AdminUser, AdminRole } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import {
  UserPlus,
  Trash2,
  Search,
} from 'lucide-react';

export const TeamPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { members, filterRole, searchQuery } = useAppSelector((state) => state.team);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  // Invite Admin Modal State
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('operations');
  const [avatar, setAvatar] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || m.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    dispatch(
      addAdminMember({
        name,
        email,
        role,
        avatar,
        status: 'active',
        twoFactorEnabled,
      })
    );

    setName('');
    setEmail('');
    setIsInviteModalOpen(false);
  };

  const getRoleBadgeVariant = (r: AdminRole) => {
    switch (r) {
      case 'super_admin':
        return 'default';
      case 'finance':
        return 'success';
      case 'operations':
        return 'pink';
      case 'moderator':
        return 'neutral';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle="Manage administrator seats and access permissions."
        badge={
          <Badge variant="default" size="sm">
            {members.length} Admins
          </Badge>
        }
        actions={
          <Button
            variant="accent"
            size="sm"
            className="font-bold text-xs"
            onClick={() => setIsInviteModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Add Admin
          </Button>
        }
      />

      {/* Control Bar */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl self-start">
            {(['all', 'super_admin', 'operations', 'finance', 'moderator'] as const).map(
              (r) => (
                <button
                  key={r}
                  onClick={() => dispatch(setTeamRoleFilter(r))}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all capitalize ${
                    filterRole === r
                      ? 'bg-white text-neutral-900 shadow-sm'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {r === 'all' ? 'All Roles' : r.replace('_', ' ')}
                </button>
              )
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search admin name..."
              value={searchQuery}
              onChange={(e) => dispatch(setTeamSearch(e.target.value))}
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20"
            />
          </div>
        </div>
      </Card>

      {/* Team Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Admin</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>2FA</TableHead>
              <TableHead>Active</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar} name={member.name} size="sm" />
                    <div>
                      <div className="font-extrabold text-neutral-950 flex items-center gap-1.5 text-sm">
                        <span>{member.name}</span>
                        {member.id === currentUser?.id && (
                          <span className="text-[10px] bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded font-black">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-400 font-medium">{member.email}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={getRoleBadgeVariant(member.role)} size="sm">
                    {member.role.replace('_', ' ')}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={member.status === 'active' ? 'success' : 'danger'}
                    size="sm"
                    dot
                  >
                    {member.status}
                  </Badge>
                </TableCell>

                <TableCell>
                  <Badge
                    variant={member.twoFactorEnabled ? 'success' : 'neutral'}
                    size="sm"
                  >
                    {member.twoFactorEnabled ? 'Active' : 'Off'}
                  </Badge>
                </TableCell>

                <TableCell className="text-neutral-500 text-xs">
                  {member.lastLogin}
                </TableCell>

                <TableCell className="text-right">
                  {member.id !== currentUser?.id && (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dispatch(toggleAdminStatus(member.id))}
                      >
                        {member.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50"
                        onClick={() => dispatch(removeAdminMember(member.id))}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add Administrator Modal */}
      {isInviteModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsInviteModalOpen(false)}
          title="Add New Administrator"
          description="Issue an operational key and role assignment to a team member."
          maxWidth="md"
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsInviteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={handleCreateAdmin}>
                Grant Admin Access
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <Input
              label="Full Legal Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              required
            />

            <Input
              label="Company Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. elena@influverse.com"
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Security Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
                className="w-full h-10 px-3 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink"
              >
                <option value="operations">Operations Manager</option>
                <option value="finance">Finance & Escrow Signatory</option>
                <option value="moderator">Content & Trust Moderator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <Input
              label="Avatar Image URL"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
            />

            <label className="flex items-center gap-2 pt-2 cursor-pointer select-none text-xs text-neutral-700">
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-brand-black"
              />
              <span>Mandate Two-Factor Authentication (2FA) upon first login</span>
            </label>
          </form>
        </Modal>
      )}
    </div>
  );
};
