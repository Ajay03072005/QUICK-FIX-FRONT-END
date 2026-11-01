import React, { useState, useEffect } from 'react';
import { LifeBuoy, Search, Filter, MessageSquare, ShieldAlert, CheckCircle2, User, Phone, MapPin, Send, Lock, Eye, AlertCircle, RefreshCw } from 'lucide-react';
import { supportApi } from '../../api/supportApi';
import { bookingApi } from '../../api/bookingApi';
import { useNotification } from '../../context/NotificationContext';

export default function SupportPortalPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [bookingContext, setBookingContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Composer state
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [resolutionText, setResolutionText] = useState('');

  const { showToast } = useNotification();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await supportApi.getAllTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        selectTicket(data[0]);
      }
    } catch (err) {
      console.warn("Error fetching support tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const msgList = await supportApi.getTicketMessages(ticket.uniqueId);
      setMessages(msgList);
      if (ticket.booking?.uniqueId) {
        try {
          const bkg = await bookingApi.getBookingById(ticket.booking.uniqueId);
          setBookingContext(bkg);
        } catch (e) { setBookingContext(null); }
      } else {
        setBookingContext(null);
      }
    } catch (err) {
      console.warn("Could not load messages:", err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;
    try {
      setSending(true);
      const newMsg = await supportApi.addMessage(selectedTicket.uniqueId, {
        senderName: "Support Agent",
        senderRole: "SUPPORT",
        visibility: isInternal ? "INTERNAL_NOTE" : "PUBLIC",
        messageBody: replyText
      });
      setMessages(prev => [...prev, newMsg]);
      setReplyText('');
      showToast(isInternal ? 'Internal note added' : 'Public reply sent to customer', 'success');
    } catch (err) {
      showToast('Failed to send message: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!selectedTicket) return;
    try {
      const updated = await supportApi.updateTicketStatus(selectedTicket.uniqueId, newStatus, resolutionText);
      setSelectedTicket(updated);
      setTickets(prev => prev.map(t => t.uniqueId === updated.uniqueId ? updated : t));
      showToast(`Ticket status updated to ${newStatus}`, 'success');
    } catch (err) {
      showToast('Could not update ticket status', 'error');
    }
  };

  const filteredTickets = tickets.filter(t => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <LifeBuoy className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white">Quick-Fix Support Portal</h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Case Management & Escalation Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={loadTickets} className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
          </button>
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-300">Support Agent Online</span>
          </div>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden min-h-0">
        
        {/* Column 1: Ticket Queue Sidebar */}
        <div className="col-span-3 bg-slate-950/60 border-r border-slate-800 p-4 space-y-4 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">Case Queue ({filteredTickets.length})</h2>
            <div className="flex gap-1">
              {['ALL', 'OPEN', 'RESOLVED'].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${filterStatus === st ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-10 text-center text-xs text-slate-500">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500">No support tickets found</div>
          ) : (
            <div className="space-y-2">
              {filteredTickets.map((t) => (
                <button
                  key={t.uniqueId}
                  onClick={() => selectTicket(t)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition ${
                    selectedTicket?.uniqueId === t.uniqueId
                      ? 'bg-indigo-950/60 border-indigo-500 text-white shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-900 border-slate-800/80 text-slate-300 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold mb-1">
                    <span className="text-indigo-400">#{t.uniqueId}</span>
                    <span className={`px-2 py-0.5 rounded-full font-extrabold ${
                      t.status === 'OPEN' ? 'bg-amber-500/20 text-amber-400' :
                      t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs truncate">{t.subject}</h3>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Priority: {t.priority}</span>
                    <span>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Ticket Workspace & Conversation */}
        <div className="col-span-6 bg-slate-900 flex flex-col min-h-0 border-r border-slate-800">
          {selectedTicket ? (
            <>
              {/* Ticket Details Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400">#{selectedTicket.uniqueId}</span>
                    <span className="text-xs px-2 py-0.5 bg-slate-800 rounded-md text-slate-300 font-semibold">{selectedTicket.category}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white mt-1">{selectedTicket.subject}</h2>
                </div>
                <div className="flex gap-2">
                  {selectedTicket.status !== 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Resolve Ticket
                    </button>
                  )}
                  {selectedTicket.status === 'RESOLVED' && (
                    <button
                      onClick={() => handleUpdateStatus('OPEN')}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Message Thread */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-8">No messages in conversation thread yet.</p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-4 rounded-2xl border ${
                        m.visibility === 'INTERNAL_NOTE'
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                          : m.senderRole === 'SUPPORT'
                          ? 'bg-indigo-950/40 border-indigo-500/30 text-indigo-100 ml-6'
                          : 'bg-slate-800 border-slate-700 text-slate-200 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-80">
                        <span className="flex items-center gap-1">
                          {m.visibility === 'INTERNAL_NOTE' && <Lock className="w-3 h-3 text-amber-400" />}
                          {m.senderName} ({m.senderRole})
                        </span>
                        <span>{m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ''}</span>
                      </div>
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">{m.messageBody}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendReply} className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsInternal(false)}
                      className={`px-3 py-1 rounded-lg font-bold transition text-[11px] ${!isInternal ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      Public Reply
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInternal(true)}
                      className={`px-3 py-1 rounded-lg font-bold transition text-[11px] flex items-center gap-1 ${isInternal ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                      <Lock className="w-3 h-3" /> Internal Agent Note
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isInternal ? "Write internal case note (visible only to support agents)..." : "Write response to customer..."}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={sending || !replyText.trim()}
                    className="px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs disabled:opacity-50 flex items-center gap-1.5 shadow-md"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              Select a ticket from the queue to view details and respond.
            </div>
          )}
        </div>

        {/* Column 3: Context Panel */}
        <div className="col-span-3 bg-slate-950/60 p-4 space-y-5 overflow-y-auto">
          <div>
            <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-3">Linked Context</h2>
            {selectedTicket ? (
              <div className="space-y-4 text-xs">
                {/* Requester Info */}
                <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <span className="block font-bold text-slate-400 text-[10px] uppercase">Requester Profile</span>
                  <div className="font-bold text-white text-sm">{selectedTicket.customer?.firstName || 'Customer'}</div>
                  <div className="text-slate-400 text-[11px]">{selectedTicket.customer?.phoneNumber || 'No phone'}</div>
                </div>

                {/* Booking Context */}
                {bookingContext && (
                  <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <span className="block font-bold text-slate-400 text-[10px] uppercase">Linked Booking</span>
                    <div className="font-extrabold text-indigo-400">#{bookingContext.bookingUniqueId}</div>
                    <div className="text-white font-bold">{bookingContext.serviceName}</div>
                    <div className="text-slate-400 text-[11px]">Provider: {bookingContext.providerName || 'Unassigned'}</div>
                    <div className="text-slate-400 text-[11px]">Total: ₹{bookingContext.totalAmount}</div>
                    <div className="text-slate-400 text-[11px]">Status: {bookingContext.status}</div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No active ticket selection.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
