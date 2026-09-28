import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAdminProfile, toggleTwoFactor } from '@/store/slices/authSlice';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { ImageUploadBox } from '@/components/shared/ImageUploadBox';
import {
  User,
  Lock,
  KeyRound,
  ShieldCheck,
  CheckCircle,
  Save,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.currentUser);

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [profileSuccessNotice, setProfileSuccessNotice] = useState(false);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Platform Escrow Policy Settings
  const [escrowFeeRate, setEscrowFeeRate] = useState('15.0');
  const [arbitrationSlaHours, setArbitrationSlaHours] = useState('72');
  const [autoReleaseDays, setAutoReleaseDays] = useState('7');
  const [policySavedNotice, setPolicySavedNotice] = useState(false);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateAdminProfile({ name, email, avatar }));
    setProfileSuccessNotice(true);
    setTimeout(() => setProfileSuccessNotice(false), 2500);
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordNotice({
        type: 'error',
        text: 'Please fill in both current and new password.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({
        type: 'error',
        text: 'New password and confirmation do not match.',
      });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordNotice({
        type: 'error',
        text: 'Password must be at least 8 characters long.',
      });
      return;
    }

    setPasswordNotice({
      type: 'success',
      text: 'Admin master password updated successfully.',
    });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordNotice(null), 3000);
  };

  const handleSavePlatformPolicy = () => {
    setPolicySavedNotice(true);
    setTimeout(() => setPolicySavedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Profile, security credentials, and escrow parameters."
        badge={
          <Badge variant="default" size="sm">
            Root Admin
          </Badge>
        }
      />

      {/* SECTION 1: ADMIN PROFILE & AVATAR */}
      <Card className="p-6">
        <div className="pb-3 border-b border-neutral-100 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900">
              Profile
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium">
              Your name and avatar for audit trails.
            </p>
          </div>
          {profileSuccessNotice && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved</span>
            </div>
          )}
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <ImageUploadBox
            label="Avatar"
            description="Square photo for audit trails."
            value={avatar}
            onChange={setAvatar}
            aspectRatio="avatar"
            previewBg="light"
            recommendedDimensions="Recommended: Square JPG or PNG"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-neutral-500 font-medium">
              Role: <strong className="capitalize text-neutral-900 font-bold">{currentUser?.role?.replace('_', ' ')}</strong>
            </div>
            <Button
              type="submit"
              variant="accent"
              size="sm"
              className="font-bold text-xs"
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Card>

      {/* SECTION 2: PASSWORD CHANGE & 2FA */}
      <Card className="p-6">
        <div className="pb-3 border-b border-neutral-100 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900">
              Security
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium">
              Password rotation and two-factor authentication.
            </p>
          </div>
          {passwordNotice && (
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                passwordNotice.type === 'success'
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                  : 'text-rose-700 bg-rose-50 border-rose-200'
              }`}
            >
              {passwordNotice.type === 'success' ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              <span>{passwordNotice.text}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Change Password Form */}
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Master Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                leftIcon={<KeyRound className="w-4 h-4" />}
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                leftIcon={<KeyRound className="w-4 h-4" />}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm">
                Update Admin Password
              </Button>
            </div>
          </form>

          {/* Two-Factor Authentication (2FA) */}
          <div className="pt-6 border-t border-neutral-100 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-900">
                  Two-Factor Authentication (TOTP / Authenticator)
                </span>
                <Badge
                  variant={currentUser?.twoFactorEnabled ? 'success' : 'warning'}
                  size="sm"
                >
                  {currentUser?.twoFactorEnabled ? 'Enforced' : 'Disabled'}
                </Badge>
              </div>
              <p className="text-xs text-neutral-500 max-w-lg">
                Require a 6-digit one-time code from 1Password or Google Authenticator on every login attempt.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => dispatch(toggleTwoFactor())}
            >
              {currentUser?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </Button>
          </div>
        </div>
      </Card>

      {/* SECTION 3: ESCROW PLATFORM RULES & SLAs */}
      <Card className="p-6">
        <div className="pb-3 border-b border-neutral-100 mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-neutral-900">
              Escrow Parameters
            </h3>
            <p className="text-[11px] text-neutral-400 font-medium">
              Platform take-rates and dispute SLAs.
            </p>
          </div>
          {policySavedNotice && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Saved</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Platform Fee (%)"
              value={escrowFeeRate}
              onChange={(e) => setEscrowFeeRate(e.target.value)}
              helperText="Charged on deposit"
            />
            <Input
              label="Auto-Release (Days)"
              value={autoReleaseDays}
              onChange={(e) => setAutoReleaseDays(e.target.value)}
              helperText="Days after delivery"
            />
            <Input
              label="Arbitration SLA (Hours)"
              value={arbitrationSlaHours}
              onChange={(e) => setArbitrationSlaHours(e.target.value)}
              helperText="Target ruling time"
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="accent"
              size="sm"
              className="font-bold text-xs"
              onClick={handleSavePlatformPolicy}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Parameters
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
