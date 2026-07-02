'use client';

import { useState } from 'react';
import { UserPlus, ChevronDown, Check, X, Trash2, CheckSquare, Square } from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { TEAM_MEMBERS } from '@/lib/settingsData';
import type { TeamMember, TeamRole } from '@/lib/settingsData';

const ROLE_COLORS: Record<TeamRole, { bg: string; color: string; border: string }> = {
  admin:   { bg: 'rgba(123,147,255,0.12)', color: '#7b93ff', border: 'rgba(123,147,255,0.25)' },
  editor:  { bg: 'rgba(0,217,255,0.10)',   color: '#00d9ff', border: 'rgba(0,217,255,0.22)'   },
  analyst: { bg: 'rgba(255,179,71,0.10)',  color: '#ffb347', border: 'rgba(255,179,71,0.25)'  },
  viewer:  { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: 'var(--border-subtle)' },
};

function RoleBadge({ role }: { role: TeamRole }) {
  const s = ROLE_COLORS[role];
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono capitalize"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: TeamMember['status'] }) {
  if (status === 'active') {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 w-fit"
        style={{ background: 'rgba(16,217,138,0.10)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.2)' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#10d98a' }} />Active
      </span>
    );
  }
  if (status === 'invited') {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
        style={{ background: 'rgba(255,179,71,0.10)', color: '#ffb347', border: '1px solid rgba(255,179,71,0.2)' }}>
        Invited
      </span>
    );
  }
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
      style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
      Inactive
    </span>
  );
}

function formatLastActive(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 3600000 * 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

type Module = 'Monitoring' | 'Analytics' | 'Ads' | 'Social' | 'Email' | 'Cart' | 'Alerts' | 'SEO' | 'Settings';

const MODULES: Module[] = ['Monitoring', 'Analytics', 'Ads', 'Social', 'Email', 'Cart', 'Alerts', 'SEO', 'Settings'];

const ROLE_PERMISSIONS: Record<TeamRole, Record<Module, boolean>> = {
  admin:   { Monitoring: true,  Analytics: true,  Ads: true,  Social: true,  Email: true,  Cart: true,  Alerts: true,  SEO: true,  Settings: true  },
  editor:  { Monitoring: true,  Analytics: true,  Ads: true,  Social: true,  Email: true,  Cart: true,  Alerts: true,  SEO: true,  Settings: false },
  analyst: { Monitoring: true,  Analytics: true,  Ads: true,  Social: false, Email: false, Cart: true,  Alerts: true,  SEO: true,  Settings: false },
  viewer:  { Monitoring: true,  Analytics: true,  Ads: false, Social: false, Email: false, Cart: false, Alerts: true,  SEO: false, Settings: false },
};

const ROLES: TeamRole[] = ['admin', 'editor', 'analyst', 'viewer'];

interface RoleDropdownProps {
  currentRole: TeamRole;
  memberId: string;
  onRoleChange: (id: string, role: TeamRole) => void;
}

function RoleDropdown({ currentRole, memberId, onRoleChange }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-all"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-secondary)' }}>
        <span className="capitalize">{currentRole}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 rounded-lg overflow-hidden shadow-2xl"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', minWidth: 110 }}>
          {ROLES.map(role => (
            <button
              key={role}
              onClick={() => { onRoleChange(memberId, role); setOpen(false); }}
              className="flex items-center justify-between w-full px-3 py-2 text-xs capitalize transition-all hover:bg-white/5"
              style={{ color: role === currentRole ? '#00d9ff' : 'var(--text-secondary)' }}>
              {role}
              {role === currentRole && <Check size={11} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TeamSettings() {
  const [members, setMembers] = usePersistentState<TeamMember[]>('settings.team', TEAM_MEMBERS);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('editor');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);

  const handleRoleChange = (id: string, role: TeamRole) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
  };

  const handleRemoveConfirm = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    setRemovingId(null);
  };

  const handleInvite = () => {
    if (!inviteEmail.trim()) return;
    setInviteSending(true);
    setTimeout(() => {
      setInviteSending(false);
      setInviteSent(true);
      const newMember: TeamMember = {
        id: `tm-${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        avatar: inviteEmail.slice(0, 2).toUpperCase(),
        lastActive: new Date().toISOString(),
        status: 'invited',
      };
      setMembers(prev => [...prev, newMember]);
      setInviteEmail('');
      setTimeout(() => setInviteSent(false), 2000);
    }, 2000);
  };

  const pendingInvites = members.filter(m => m.status === 'invited');

  return (
    <div className="flex flex-col gap-6">

      {/* Members table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Team Members</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{members.length} members · {pendingInvites.length} pending invite{pendingInvites.length !== 1 ? 's' : ''}</div>
        </div>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {['Member', 'Email', 'Role', 'Last Active', 'Status', 'Actions'].map(h => (
                <th key={h} className="section-label text-left px-5 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member, i) => (
              <tr key={member.id}
                style={{ borderBottom: i < members.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>

                {/* Avatar + name */}
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: 'var(--bg-overlay)', color: 'var(--text-secondary)', border: '1px solid var(--border-dim)' }}>
                      {member.avatar}
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{member.name}</span>
                  </div>
                </td>

                {/* Email */}
                <td className="px-5 py-3">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{member.email}</span>
                </td>

                {/* Role */}
                <td className="px-5 py-3">
                  <RoleBadge role={member.role} />
                </td>

                {/* Last active */}
                <td className="px-5 py-3">
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    {formatLastActive(member.lastActive)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-3">
                  <StatusBadge status={member.status} />
                </td>

                {/* Actions */}
                <td className="px-5 py-3">
                  {removingId === member.id ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Remove?</span>
                      <button onClick={() => handleRemoveConfirm(member.id)}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,68,68,0.12)', color: '#ff4444', border: '1px solid rgba(255,68,68,0.25)' }}>
                        Yes
                      </button>
                      <button onClick={() => setRemovingId(null)}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <RoleDropdown currentRole={member.role} memberId={member.id} onRoleChange={handleRoleChange} />
                      {member.role !== 'admin' && (
                        <button onClick={() => setRemovingId(member.id)}
                          className="p-1 rounded transition-all hover:bg-white/5"
                          style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite form */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={15} style={{ color: '#00d9ff' }} />
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Invite Team Member</div>
        </div>
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <label className="section-label mb-1.5 block">Email Address</label>
            <input
              type="email"
              placeholder="colleague@yourcompany.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full text-sm px-3 py-2 rounded-lg outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <label className="section-label mb-1.5 block">Role</label>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as TeamRole)}
              className="text-sm px-3 py-2 rounded-lg outline-none"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', color: 'var(--text-primary)' }}>
              {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          <button
            onClick={handleInvite}
            disabled={inviteSending || !inviteEmail.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
            style={inviteSent
              ? { background: 'rgba(16,217,138,0.12)', color: '#10d98a', border: '1px solid rgba(16,217,138,0.25)' }
              : { background: 'rgba(0,217,255,0.10)', color: '#00d9ff', border: '1px solid rgba(0,217,255,0.2)' }}>
            {inviteSending ? 'Sending…' : inviteSent ? <><Check size={14} />Sent!</> : <><UserPlus size={14} />Send Invite</>}
          </button>
        </div>
      </div>

      {/* Permissions matrix */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Role Permissions</div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Module access by role</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <th className="section-label text-left px-5 py-3">Role</th>
                {MODULES.map(m => (
                  <th key={m} className="section-label px-3 py-3">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role, i) => (
                <tr key={role}
                  style={{ borderBottom: i < ROLES.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <td className="px-5 py-3">
                    <RoleBadge role={role} />
                  </td>
                  {MODULES.map(mod => {
                    const allowed = ROLE_PERMISSIONS[role][mod];
                    return (
                      <td key={mod} className="px-3 py-3 text-center">
                        {allowed
                          ? <CheckSquare size={14} style={{ color: '#10d98a', margin: '0 auto' }} />
                          : <Square size={14} style={{ color: 'var(--text-muted)', margin: '0 auto' }} />
                        }
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
