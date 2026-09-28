import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addAdminMember,
  removeAdminMember,
  toggleAdminStatus,
  setTeamSearch,
  setTeamRoleFilter,
} from '@/store/slices/teamSlice';
import { AdminRole } from '@/types/admin.types';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { UserPlus, Trash2, Search, ChevronDown } from 'lucide-react';

export const TeamPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { members, filterRole, searchQuery } = useAppSelector((state) => state.team);
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('admin');

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
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        status: 'active',
        twoFactorEnabled: false,
      })
    );

    setName('');
    setEmail('');
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team"
        subtitle="Manage administrator seats and access permissions."
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
            {[
              { id: 'all', label: 'All Roles' },
              { id: 'super_admin', label: 'Super Admin' },
              { id: 'admin', label: 'Admin' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => dispatch(setTeamRoleFilter(tab.id as 'all' | AdminRole))}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  filterRole === tab.id
                    ? 'bg-white text-neutral-900 shadow-sm'
                    : 'text-neutral-700 hover:text-neutral-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search admin name..."
              value={searchQuery}
              onChange={(e) => dispatch(setTeamSearch(e.target.value))}
              className="w-full h-9 pl-9 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-pink/20 text-neutral-900 font-medium"
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
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMembers.map((member) => (
              <TableRow
                key={member.id}
                className={member.status === 'suspended' ? 'opacity-60 bg-neutral-50/50' : ''}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar src={member.avatar} name={member.name} size="sm" />
                    <div>
                      <div className="font-bold text-neutral-950 flex items-center gap-1.5 text-sm">
                        <span>{member.name}</span>
                        {member.id === currentUser?.id && (
                          <span className="text-[10px] bg-neutral-100 text-neutral-800 px-1.5 py-0.5 rounded font-bold">
                            You
                          </span>
                        )}
                        {member.status === 'suspended' && (
                          <span className="text-[10px] bg-rose-50 text-rose-600 px-1.5 py-0.5 rounded font-bold">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-neutral-700 font-semibold">{member.email}</div>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant={member.role === 'super_admin' ? 'default' : 'neutral'} size="sm">
                    {member.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  {member.id !== currentUser?.id && (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold text-neutral-800 hover:text-neutral-950"
                        onClick={() => dispatch(toggleAdminStatus(member.id))}
                      >
                        {member.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-rose-600 hover:bg-rose-50 p-1.5"
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
          title="Add Admin"
          description="Invite a new administrator to the dashboard."
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
                Add Admin
              </Button>
            </>
          }
        >
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Elena Rostova"
              required
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. elena@influverse.com"
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600">
                Role
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AdminRole)}
                  className="w-full h-10 pl-3 pr-8 text-xs bg-white border border-neutral-200 rounded-lg outline-none focus:border-brand-pink appearance-none cursor-pointer text-neutral-800 font-semibold"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
