import { useMemo, useState } from 'react';
import { Calendar, Users, Clock, Check, X, Trash2, Search, Plus } from 'lucide-react';

const ReservationsPage = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(null);
  const [newReservation, setNewReservation] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    guest_number: 2,
    start_time: '',
    note: '',
    table_id: '',
  });

  const [bookings, setBookings] = useState([
    {
      id: '1',
      guestName: 'Carol Williams',
      guestPhone: '0123456789',
      guestEmail: 'carol@example.com',
      numberOfGuests: 6,
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      specialRequests: 'Window seat preferred',
      tableId: null,
      branchId: '1',
    },
    {
      id: '2',
      guestName: 'John Smith',
      guestPhone: '0987654321',
      guestEmail: 'john@example.com',
      numberOfGuests: 4,
      startTime: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString(),
      status: 'approved',
      specialRequests: '',
      tableId: null,
      branchId: '1',
    },
    {
      id: '3',
      guestName: 'Sarah Johnson',
      guestPhone: '0912345678',
      guestEmail: 'sarah@example.com',
      numberOfGuests: 2,
      startTime: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 74 * 60 * 60 * 1000).toISOString(),
      status: 'confirmed',
      specialRequests: 'Birthday celebration',
      tableId: '5',
      branchId: '1',
    },
  ]);

  const [tables] = useState([
    { id: '1', number: 1, capacity: 2, status: 'available', branchId: '1' },
    { id: '2', number: 2, capacity: 4, status: 'available', branchId: '1' },
    { id: '3', number: 3, capacity: 4, status: 'occupied', branchId: '1' },
    { id: '4', number: 4, capacity: 6, status: 'available', branchId: '1' },
    { id: '5', number: 5, capacity: 6, status: 'reserved', branchId: '1' },
    { id: '6', number: 6, capacity: 8, status: 'available', branchId: '1' },
  ]);

  const branchId = '1';

  const tabs = [
    { id: 'pending', label: 'Pending', icon: '⏳' },
    { id: 'approved', label: 'Approved', icon: '👍' },
    { id: 'confirmed', label: 'Confirmed', icon: '✓' },
    { id: 'cancelled', label: 'Cancelled', icon: '✕' },
  ];

  const branchBookings = useMemo(() => {
    return bookings.filter(b => b.branchId === branchId);
  }, [bookings, branchId]);

  const searchedBookings = useMemo(() => {
    if (!search.trim()) return branchBookings;
    
    const query = search.toLowerCase();
    return branchBookings.filter(
      b =>
        b.guestName.toLowerCase().includes(query) ||
        b.guestPhone.includes(query)
    );
  }, [branchBookings, search]);

  const groupedBookings = useMemo(() => {
    return {
      pending: searchedBookings.filter(b => b.status === 'pending'),
      approved: searchedBookings.filter(b => b.status === 'approved'),
      confirmed: searchedBookings.filter(b => b.status === 'confirmed'),
      cancelled: searchedBookings.filter(b => b.status === 'cancelled'),
    };
  }, [searchedBookings]);

  const getAvailableTables = (booking) => {
    return tables.filter(
      t =>
        t.branchId === branchId &&
        t.capacity >= booking.numberOfGuests &&
        t.status === 'available'
    );
  };

  const hasTimeConflict = (newBooking, excludeBookingId = null) => {
    return branchBookings.some(b => {
      if (b.id === excludeBookingId || b.status === 'cancelled') return false;
      if (!b.tableId) return false;

      const newStart = new Date(newBooking.startTime);
      const newEnd = new Date(newBooking.endTime);
      const existStart = new Date(b.startTime);
      const existEnd = new Date(b.endTime);

      return newStart < existEnd && newEnd > existStart;
    });
  };

  const handleCreateReservation = () => {
    if (!newReservation.customer_name || !newReservation.customer_phone || !newReservation.start_time) {
      alert('Please fill in all required fields');
      return;
    }

    const newBooking = {
      id: String(Date.now()),
      guestName: newReservation.customer_name,
      guestPhone: newReservation.customer_phone,
      guestEmail: newReservation.customer_email,
      numberOfGuests: newReservation.guest_number,
      startTime: new Date(newReservation.start_time).toISOString(),
      endTime: new Date(new Date(newReservation.start_time).getTime() + 2 * 60 * 60 * 1000).toISOString(),
      status: newReservation.table_id ? 'confirmed' : 'pending',
      specialRequests: newReservation.note,
      tableId: newReservation.table_id || null,
      branchId: branchId,
    };

    setBookings(prev => [...prev, newBooking]);
    setShowNewReservationModal(false);
    setNewReservation({
      customer_name: '',
      customer_phone: '',
      customer_email: '',
      guest_number: 2,
      start_time: '',
      note: '',
      table_id: '',
    });
    setActiveTab(newReservation.table_id ? 'confirmed' : 'pending');
  };

  const handleApprove = (bookingId) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, status: 'approved' } : b
      )
    );
  };

  const handleDecline = (bookingId) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      )
    );
  };

  const handleAssignTable = (bookingId, tableId) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking) return;

    if (hasTimeConflict(booking, bookingId)) {
      alert('This booking has time conflict with another booking!');
      return;
    }

    setBookings(prev =>
      prev.map(b =>
        b.id === bookingId
          ? { ...b, tableId, status: 'confirmed' }
          : b
      )
    );
  };

  const handleCancel = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled', tableId: null } : b
        )
      );
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      approved: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      confirmed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      cancelled: 'bg-destructive text-destructive-foreground',
    };
    return colors[status] || colors.pending;
  };

  const getTabColor = (isActive) => {
    return isActive 
      ? 'bg-primary text-primary-foreground border-primary shadow-sm' 
      : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground';
  };

  const BookingCard = ({ booking, index }) => {
    const availableTables = getAvailableTables(booking);
    const assignedTable = booking.tableId ? tables.find(t => t.id === booking.tableId) : null;

    return (
      <div 
        className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        style={{
          animation: `slideIn 0.4s ease-out ${index * 0.1}s both`
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">{booking.guestName}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <span>📞</span> {booking.guestPhone}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${getStatusColor(booking.status)}`}>
            {booking.status.toUpperCase()}
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Start Time</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatDateTime(booking.startTime)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Users className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Party Size</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {booking.numberOfGuests} {booking.numberOfGuests !== 1 ? 'Guests' : 'Guest'}
              </p>
            </div>
          </div>

          {booking.specialRequests && (
            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">Special Requests</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">📝 {booking.specialRequests}</p>
            </div>
          )}
        </div>

        {booking.status === 'pending' && (
          <div className="space-y-2 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wide">
              Available Tables ({availableTables.length})
            </p>
            {availableTables.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {availableTables.slice(0, 3).map(t => (
                  <span key={t.id} className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-md text-xs font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 shadow-sm">
                    Table {t.number} • {t.capacity} seats
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                ❌ No available tables
              </p>
            )}
          </div>
        )}

        {booking.status === 'confirmed' && assignedTable && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              ✓ Assigned to <span className="text-green-600 dark:text-green-400">Table {assignedTable.number}</span>
            </p>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          {booking.status === 'pending' && (
            <>
              <button
                onClick={() => handleApprove(booking.id)}
                className="flex-1 min-w-fit px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
              >
                <Check className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleDecline(booking.id)}
                className="flex-1 min-w-fit px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
              >
                <X className="h-4 w-4" />
                <span>Decline</span>
              </button>
            </>
          )}

          {booking.status === 'approved' && (
            <>
              <button
                onClick={() => setShowTableSelector(booking.id)}
                disabled={getAvailableTables(booking).length === 0}
                className="flex-1 min-w-fit px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white disabled:text-gray-500 dark:disabled:text-gray-400 text-sm font-medium rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                <Check className="h-4 w-4" />
                <span>Select Table</span>
              </button>
              <button
                onClick={() => handleDecline(booking.id)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}

          {booking.status === 'confirmed' && (
            <button
              onClick={() => handleCancel(booking.id)}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-900 dark:text-white hover:text-red-600 dark:hover:text-red-400 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105"
            >
              <Trash2 className="h-4 w-4" />
              <span>Cancel Booking</span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center gap-4 flex-wrap" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Reservation Management</h2>
            <p className="text-gray-600 dark:text-gray-400">Manage and track all your restaurant bookings</p>
          </div>
          <button 
            onClick={() => setShowNewReservationModal(true)}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-md flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            New Reservation
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative" style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by guest name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap" style={{ animation: 'fadeIn 0.7s ease-out' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm border transition-all duration-300 transform hover:scale-105 ${getTabColor(activeTab === tab.id)}`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {groupedBookings[tab.id].length}
              </span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-96">
          {groupedBookings[activeTab].length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {groupedBookings[activeTab].map((booking, index) => (
                <BookingCard key={booking.id} booking={booking} index={index} />
              ))}
            </div>
          ) : (
            <div 
              className="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600"
              style={{ animation: 'fadeIn 0.5s ease-out' }}
            >
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No {activeTab} bookings</h3>
              <p className="text-gray-600 dark:text-gray-400">There are no bookings in this category at the moment.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Reservation Modal */}
      {showNewReservationModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowNewReservationModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modalIn 0.3s ease-out' }}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">New Reservation</h3>
                <button
                  onClick={() => setShowNewReservationModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Customer Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={newReservation.customer_name}
                  onChange={(e) => setNewReservation({ ...newReservation, customer_name: e.target.value })}
                  placeholder="Enter customer name"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newReservation.customer_phone}
                    onChange={(e) => setNewReservation({ ...newReservation, customer_phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newReservation.customer_email}
                    onChange={(e) => setNewReservation({ ...newReservation, customer_email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Number of Guests <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={newReservation.guest_number}
                    onChange={(e) => setNewReservation({ ...newReservation, guest_number: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Reservation Date & Time <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={newReservation.start_time}
                    onChange={(e) => setNewReservation({ ...newReservation, start_time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Special Requests / Notes
                </label>
                <textarea
                  value={newReservation.note}
                  onChange={(e) => setNewReservation({ ...newReservation, note: e.target.value })}
                  placeholder="Any special requests or notes..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              {newReservation.start_time && newReservation.guest_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Select Table (Optional)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {tables
                      .filter(t => t.branchId === branchId && t.capacity >= newReservation.guest_number && t.status === 'available')
                      .map(table => (
                        <button
                          key={table.id}
                          type="button"
                          onClick={() => setNewReservation({ ...newReservation, table_id: table.id === newReservation.table_id ? '' : table.id })}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 transform hover:scale-105 ${
                            newReservation.table_id === table.id
                              ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20 shadow-md'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-orange-400'
                          }`}
                        >
                          <div className="text-lg font-bold text-gray-900 dark:text-white">Table {table.number}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">{table.capacity} seats</div>
                        </button>
                      ))}
                  </div>
                  {tables.filter(t => t.branchId === branchId && t.capacity >= newReservation.guest_number && t.status === 'available').length === 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">No available tables for {newReservation.guest_number} guests</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowNewReservationModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateReservation}
                className="px-4 py-2 orange-600 hover:bg-orange-700 text-white font-medium rounded-md flex items-center gap-2 transition-all duration-200"
              >
                <Calendar className="h-4 w-4" />
                Create Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Selector Modal */}
      {showTableSelector && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowTableSelector(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'modalIn 0.3s ease-out' }}
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Select Table</h3>
                <button
                  onClick={() => setShowTableSelector(null)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {(() => {
                const booking = bookings.find(b => b.id === showTableSelector);
                if (!booking) return null;
                const availableTables = getAvailableTables(booking);
                
                return (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-2">{booking.guestName}</h4>
                      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>👥 {booking.numberOfGuests} guests</span>
                        <span>📅 {formatDateTime(booking.startTime)}</span>
                      </div>
                    </div>

                    {availableTables.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableTables.map(table => (
                          <button
                            key={table.id}
                            onClick={() => {
                              handleAssignTable(booking.id, table.id);
                              setShowTableSelector(null);
                            }}
                            className="p-4 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200 transform hover:scale-105"
                          >
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">Table {table.number}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{table.capacity} seats</div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-red-600 dark:text-red-400 font-semibold">No available tables for this booking</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
              <button
                onClick={() => setShowTableSelector(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-md transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;