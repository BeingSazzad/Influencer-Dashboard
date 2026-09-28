import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import { ROUTES } from '@/constants/routes';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatCard } from '@/components/shared/StatCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import {
  TrendingUp,
  ShieldCheck,
  Scale,
  Users,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Euro,
  FileCheck,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const disputes = useAppSelector((state) => state.escrow.disputes);
  const openDisputes = disputes.filter((d) => d.status === 'open');

  const verifications = useAppSelector((state) => state.verification.requests);
  const pendingVerifications = verifications.filter((r) => r.status === 'pending');

  const users = useAppSelector((state) => state.users.users);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Marketplace Overview"
        subtitle="Real-time surveillance of Escrow deposits, Creator KYC approvals, and 15% platform take-rate metrics."
        badge={
          <Badge variant="success" size="sm" dot>
            HQ Systems Operational
          </Badge>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(ROUTES.DASHBOARD.CMS)}
            >
              Manage CMS & Legal
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => navigate(ROUTES.DASHBOARD.ESCROW)}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Review Disputes ({openDisputes.length})
            </Button>
          </>
        }
      />

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Gross Marketplace Volume"
          value="€1,248,500"
          change={18.4}
          icon={<TrendingUp className="w-5 h-5" />}
          accentColor="black"
          changePeriod="vs last month"
        />
        <StatCard
          title="Escrow in Custody"
          value="€148,500"
          change={6.2}
          icon={<Euro className="w-5 h-5" />}
          accentColor="pink"
          subtitle="34 active contract locks"
        />
        <StatCard
          title="Platform Net Fees (15%)"
          value="€187,275"
          change={21.8}
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor="emerald"
          changePeriod="vs last month"
        />
        <StatCard
          title="Active Creators & Brands"
          value="2,840"
          change={14.1}
          icon={<Users className="w-5 h-5" />}
          accentColor="amber"
          subtitle="98.4% good standing"
        />
      </div>

      {/* Urgent Operational Trays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Disputes Arbitration Card */}
        <Card hoverEffect className="border-rose-200/80">
          <CardHeader className="bg-rose-50/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-rose-950">
                    Escrow Arbitration Docket
                  </CardTitle>
                  <p className="text-xs text-rose-700">
                    {openDisputes.length} active dispute requires mediator ruling
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-white hover:bg-neutral-50"
                onClick={() => navigate(ROUTES.DASHBOARD.ESCROW)}
              >
                Go to Escrow
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {openDisputes.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                All escrow orders are delivering smoothly. No open disputes.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {openDisputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-neutral-950 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {dispute.id}
                        </span>
                        <Badge variant="danger" size="sm">
                          Action Required
                        </Badge>
                        <span className="text-xs text-neutral-400 font-medium">
                          Order #{dispute.orderId}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-neutral-950">
                        {dispute.campaignTitle}
                      </h4>
                      <p className="text-xs text-neutral-600 line-clamp-1 font-medium">
                        {dispute.disputeReason}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-neutral-600 pt-1">
                        <span>Brand: <strong className="font-bold text-neutral-950">{dispute.brandName}</strong></span>
                        <span>•</span>
                        <span>Creator: <strong className="font-bold text-neutral-950">{dispute.creatorName}</strong></span>
                      </div>
                    </div>

                    <div className="sm:text-right shrink-0">
                      <div className="text-lg font-black text-neutral-950 tabular-nums">
                        {formatCurrency(dispute.amountEur)}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-medium">
                        Platform Fee: <strong className="font-bold text-neutral-800">{formatCurrency(dispute.feeEur)}</strong>
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2.5 w-full sm:w-auto font-bold"
                        onClick={() => navigate(ROUTES.DASHBOARD.ESCROW)}
                      >
                        Arbitrate Case
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Creator KYC & Verification */}
        <Card hoverEffect>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-brand-pink">
                  <FileCheck className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle>Creator Verification Queue</CardTitle>
                  <p className="text-xs text-neutral-500 font-medium">
                    {pendingVerifications.length} creators awaiting badge audit
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="font-bold"
                onClick={() => navigate(ROUTES.DASHBOARD.VERIFICATION)}
              >
                Review All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingVerifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-neutral-500">
                Verification queue is up to date.
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {pendingVerifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 flex items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={item.avatar} name={item.creatorName} size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-neutral-950 truncate">
                            {item.creatorName}
                          </h4>
                          <span className="text-xs text-neutral-400 font-semibold">@{item.handle}</span>
                        </div>
                        <p className="text-xs text-neutral-600 font-medium">
                          <strong className="text-neutral-800">{item.category}</strong> • {item.followersTotal} audience
                        </p>
                        <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                          Work sample: "{item.sampleWorkTitle}"
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="shrink-0 font-bold"
                      onClick={() => navigate(ROUTES.DASHBOARD.VERIFICATION)}
                    >
                      Audit
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Marketplace Registrations / Users Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Marketplace Accounts</CardTitle>
              <p className="text-xs text-neutral-500 font-medium">
                Recently active Creators and Brands in compliance standing
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-bold"
              onClick={() => navigate(ROUTES.DASHBOARD.USERS)}
            >
              Full Directory ({users.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-100 text-neutral-600 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Location</th>
                  <th className="px-6 py-3">Total Volume</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.slice(0, 4).map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar src={user.avatar} name={user.name} size="sm" />
                        <div>
                          <div className="font-extrabold text-neutral-950 text-sm">{user.name}</div>
                          <div className="text-neutral-400 font-medium">@{user.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize font-bold text-neutral-800">
                      {user.role}
                    </td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-neutral-600 font-medium">{user.location}</td>
                    <td className="px-6 py-4 font-black text-neutral-950 tabular-nums text-sm">
                      {formatCurrency(user.totalVolumeEur)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="font-bold"
                        onClick={() => navigate(ROUTES.DASHBOARD.USERS)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
