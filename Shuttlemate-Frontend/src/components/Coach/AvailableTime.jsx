import React, { useState, useEffect } from 'react';
import { Plus, Clock, Calendar, Trash2, Edit3, Save, X, User, BookOpen, Check, XCircle, Eye, ChevronLeft } from 'lucide-react';

const AvailableTime = ({ isOpen, coachId, coachName, onClose }) => {
  const [availabilitySlots, setAvailabilitySlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('availability'); // 'availability' or 'bookings'

  const [newSlot, setNewSlot] = useState({
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '10:00',
    isRecurring: true
  });

  const daysOfWeek = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];

  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  useEffect(() => {
    if (isOpen && coachId) {
      fetchAvailability();
      if (activeView === 'bookings') {
        fetchBookings();
      }
    }
  }, [isOpen, coachId, activeView]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/Coachers/${coachId}/availability`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setAvailabilitySlots(data.data);
        }
      }
    } catch (err) {
      setError('Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      setError('');
      const response = await fetch(`http://localhost:5000/api/Coachers/${coachId}/bookings`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setBookings(data.data);
        }
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setBookingsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      setError('');
      const response = await fetch(`http://localhost:5000/api/Coachers/${coachId}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the booking in the local state
        setBookings(bookings.map(booking =>
          booking._id === bookingId ? { ...booking, status } : booking
        ));
      } else {
        setError(data.message || 'Failed to update booking status');
      }
    } catch (err) {
      setError('Failed to update booking status');
    }
  };

  const addAvailabilitySlot = async () => {
    try {
      setError('');

      if (newSlot.startTime >= newSlot.endTime) {
        setError('End time must be after start time');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/Coachers/${coachId}/availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSlot),
      });

      const data = await response.json();

      if (data.success) {
        setAvailabilitySlots([...availabilitySlots, { ...newSlot, _id: Date.now().toString() }]);
        setNewSlot({
          dayOfWeek: 0,
          startTime: '09:00',
          endTime: '10:00',
          isRecurring: true
        });
        setIsAddingNew(false);
      } else {
        setError(data.message || 'Failed to add availability slot');
      }
    } catch (err) {
      setError('Failed to add availability slot');
    }
  };

  const deleteAvailabilitySlot = async (slotId) => {
    try {
      setError('');
      const response = await fetch(`http://localhost:5000/api/Coachers/${coachId}/availability/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setAvailabilitySlots(availabilitySlots.filter(slot => slot._id !== slotId));
      } else {
        setError(data.message || 'Failed to delete availability slot');
      }
    } catch (err) {
      setError('Failed to delete availability slot');
    }
  };

  const startEdit = (slot) => {
    setEditingSlot({ ...slot });
  };

  const saveEdit = async () => {
    try {
      setError('');

      if (editingSlot.startTime >= editingSlot.endTime) {
        setError('End time must be after start time');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/Coachers/${coachId}/availability/${editingSlot._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dayOfWeek: editingSlot.dayOfWeek,
          startTime: editingSlot.startTime,
          endTime: editingSlot.endTime,
          isRecurring: editingSlot.isRecurring
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAvailabilitySlots(availabilitySlots.map(slot =>
          slot._id === editingSlot._id ? editingSlot : slot
        ));
        setEditingSlot(null);
      } else {
        setError(data.message || 'Failed to update availability slot');
      }
    } catch (err) {
      setError('Failed to update availability slot');
    }
  };

  const cancelEdit = () => {
    setEditingSlot(null);
    setError('');
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const groupSlotsByDay = () => {
    const grouped = {};
    daysOfWeek.forEach((_, index) => {
      grouped[index] = availabilitySlots.filter(slot => slot.dayOfWeek === index);
    });
    return grouped;
  };

  // Helper function to safely get user data
  const getUserData = (booking) => {
    if (!booking.userId) return null;
    
    // Handle both populated and non-populated userId
    if (typeof booking.userId === 'object') {
      return booking.userId; // Already populated
    }
    
    return null; // Not populated, just an ID
  };

  const pendingBookingsCount = bookings.filter(booking => booking.status === 'pending').length;

  if (!isOpen) return null;

  const groupedSlots = groupSlotsByDay();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                {activeView === 'availability' ? (
                  <Clock className="w-6 h-6 text-white" />
                ) : (
                  <BookOpen className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {activeView === 'availability' ? 'Available Times' : 'Booking Requests'}
                </h2>
                <div className="flex items-center text-indigo-200 mt-1">
                  <User className="w-4 h-4 mr-2" />
                  <span>{coachName}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {activeView === 'availability' && (
                <>
                  <button
                    onClick={() => setActiveView('bookings')}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 hover:scale-105 relative"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Bookings</span>
                    {pendingBookingsCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {pendingBookingsCount}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Slot</span>
                  </button>
                </>
              )}
              {activeView === 'bookings' && (
                <button
                  onClick={() => setActiveView('availability')}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all duration-200 hover:scale-105"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Availability</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Availability View */}
          {activeView === 'availability' && (
            <>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {/* Add New Slot Form */}
                  {isAddingNew && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Plus className="w-5 h-5 mr-2 text-green-600" />
                        Add New Availability Slot
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Day</label>
                          <select
                            value={newSlot.dayOfWeek}
                            onChange={(e) => setNewSlot({ ...newSlot, dayOfWeek: parseInt(e.target.value) })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            {daysOfWeek.map((day, index) => (
                              <option key={index} value={index}>{day}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                          <select
                            value={newSlot.startTime}
                            onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{formatTime(time)}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                          <select
                            value={newSlot.endTime}
                            onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            {timeSlots.map(time => (
                              <option key={time} value={time}>{formatTime(time)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-end">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={newSlot.isRecurring}
                              onChange={(e) => setNewSlot({ ...newSlot, isRecurring: e.target.checked })}
                              className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Recurring</span>
                          </label>
                        </div>
                      </div>
                      <div className="flex space-x-4 mt-6">
                        <button
                          onClick={addAvailabilitySlot}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Slot</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingNew(false);
                            setError('');
                          }}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Weekly Schedule */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {daysOfWeek.map((day, dayIndex) => (
                      <div key={dayIndex} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                          {day}
                        </h3>

                        {groupedSlots[dayIndex].length === 0 ? (
                          <div className="text-center text-gray-500 py-6">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No availability set</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {groupedSlots[dayIndex].map((slot) => (
                              <div key={slot._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                                {editingSlot && editingSlot._id === slot._id ? (
                                  <div className="space-y-3">
                                    <div className="flex space-x-2">
                                      <select
                                        value={editingSlot.startTime}
                                        onChange={(e) => setEditingSlot({ ...editingSlot, startTime: e.target.value })}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                      >
                                        {timeSlots.map(time => (
                                          <option key={time} value={time}>{formatTime(time)}</option>
                                        ))}
                                      </select>
                                      <select
                                        value={editingSlot.endTime}
                                        onChange={(e) => setEditingSlot({ ...editingSlot, endTime: e.target.value })}
                                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm"
                                      >
                                        {timeSlots.map(time => (
                                          <option key={time} value={time}>{formatTime(time)}</option>
                                        ))}
                                      </select>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <label className="flex items-center text-sm">
                                        <input
                                          type="checkbox"
                                          checked={editingSlot.isRecurring}
                                          onChange={(e) => setEditingSlot({ ...editingSlot, isRecurring: e.target.checked })}
                                          className="w-3 h-3 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
                                        />
                                        Recurring
                                      </label>
                                      <div className="flex space-x-1">
                                        <button
                                          onClick={saveEdit}
                                          className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                                        >
                                          <Save className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-semibold text-gray-800 text-sm">
                                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                      </div>
                                      <div className="text-xs text-gray-500 flex items-center mt-1">
                                        {slot.isRecurring ? (
                                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                            Recurring
                                          </span>
                                        ) : (
                                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                                            One-time
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex space-x-1">
                                      <button
                                        onClick={() => startEdit(slot)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => deleteAvailabilitySlot(slot._id)}
                                        className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-colors"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {availabilitySlots.length === 0 && !isAddingNew && (
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Availability Set</h3>
                      <p className="text-gray-600 mb-6">Add the first availability slot to get started</p>
                      <button
                        onClick={() => setIsAddingNew(true)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 mx-auto transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add First Time Slot</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Bookings View */}
          {activeView === 'bookings' && (
            <>
              {bookingsLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <>
                  {bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">No Booking Requests</h3>
                      <p className="text-gray-600">You haven't received any booking requests yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {bookings.map((booking) => {
                        const userData = getUserData(booking);
                        
                        return (
                          <div key={booking._id} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="bg-indigo-100 p-2 rounded-lg">
                                  <User className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-800">
                                    {userData?.name || 'Unknown User'}
                                  </h3>
                                  <p className="text-sm text-gray-600">
                                    {userData?.email || 'No email provided'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {userData?.phoneNumber || 'No phone number provided'}
                                  </p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)}`}>
                                {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                              </span>
                            </div>

                            <div className="space-y-3 mb-4">
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{formatDate(booking.date)}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
                              </div>
                              {booking.message && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <p className="text-sm text-gray-700">
                                    <strong>Message:</strong> {booking.message}
                                  </p>
                                </div>
                              )}
                            </div>

                            {booking.status === 'pending' && (
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'confirmed')}
                                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Accept</span>
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Reject</span>
                                </button>
                              </div>
                            )}

                            {booking.status === 'confirmed' && (
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => updateBookingStatus(booking._id, 'completed')}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                  <span>Mark Complete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailableTime;