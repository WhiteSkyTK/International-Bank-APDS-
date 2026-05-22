import React, { useEffect, useState, useCallback } from 'react';
import { EmployeeLayout } from '../../components/layout/EmployeeLayout';
import { Shield, Loader2, RefreshCw } from 'lucide-react';
import { empFetch } from '../../utils/empFetch';

// ↑ local empFetch block DELETED — imported from shared utility above

const ACTION_STYLES = {
    CUSTOMER_LOGIN:    'bg-blue-100 text-blue-700',
    CUSTOMER_REGISTER: 'bg-green-100 text-green-700',
    EMPLOYEE_LOGIN:    'bg-purple-100 text-purple-700',
    PAYMENT_SUBMITTED: 'bg-orange-100 text-orange-700',
    PAYMENT_VERIFIED:  'bg-green-100 text-green-700',
    PAYMENT_REJECTED:  'bg-red-100 text-red-600',
    SWIFT_SUBMISSION:  'bg-blue-100 text-blue-700',
};

export const EmployeeSecurityLog = () => {
    const [logs,    setLogs]    = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await empFetch('https://localhost:5000/api/employee/audit-log');
            if (!res) return;
            if (!res.ok) throw new Error('Server returned an error response.');
            const data = await res.json();
            setLogs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.warn('Security log fetch failed:', err.message);
            setError('Could not load security audit log.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <EmployeeLayout title="Security Audit Log">
            <div className="max-w-5xl space-y-4">

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Shield size={18} className="text-red-600" />
                        <p className="text-sm text-gray-500 font-medium">
                            {!loading && `${logs.length} events recorded`}
                        </p>
                    </div>
                    <button type="button" onClick={load}
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-700 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition">
                        <RefreshCw size={13} /> Refresh
                    </button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-xs text-yellow-800 font-medium">
                    🔒 This log records all authentication events, payment actions, and system access. All entries are immutable and stored securely.
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
                        <Loader2 size={20} className="animate-spin" />
                        <span className="text-sm">Loading audit log…</span>
                    </div>
                )}

                {!loading && error && (
                    <p className="text-red-500 text-sm p-4 bg-red-50 rounded-2xl border border-red-200">{error}</p>
                )}

                {!loading && !error && logs.length === 0 && (
                    <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100">
                        <p className="text-3xl mb-3">📋</p>
                        <p className="text-sm font-medium">No audit events recorded yet.</p>
                    </div>
                )}

                {!loading && !error && logs.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    {['Timestamp','Action','Performed By','Role','IP Address','Details'].map((h) => (
                                        <th key={h} className="text-left px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                                            {new Date(log.createdAt).toLocaleString('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase whitespace-nowrap ${ACTION_STYLES[log.action] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {log.action?.replaceAll('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-xs font-mono text-gray-700">{log.performedBy}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${log.role === 'employee' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {log.role}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-xs text-gray-400 font-mono">{log.ipAddress ?? '—'}</td>
                                        <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate">{log.details ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </EmployeeLayout>
    );
};