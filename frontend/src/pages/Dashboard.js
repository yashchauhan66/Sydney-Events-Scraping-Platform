import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import EventTable from '../components/EventTable';
import EventPreview from '../components/EventPreview';
import DashboardStats from '../components/DashboardStats';
import DashboardFilters from '../components/DashboardFilters';
import CreateEventForm from '../components/CreateEventForm';

const Dashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    city: 'Sydney',
    category: '',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  const fetchEvents = async (page = 1, newFilters = filters) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: pagination.limit,
        ...newFilters
      };

      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key];
      });

      const response = await eventsAPI.getDashboardEvents(params);
      setEvents(response.events);
      setPagination(response.pagination);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await eventsAPI.getEventStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchStats();
  
  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchEvents(1, newFilters);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const handleEventImport = async (eventId, importNotes) => {
    try {
      await eventsAPI.importEvent(eventId, importNotes);
      fetchEvents(pagination.page, filters);
      fetchStats();
      if (selectedEvent && selectedEvent._id === eventId) {
        setSelectedEvent(prev => ({
          ...prev,
          status: 'imported',
          importedAt: new Date(),
          importedBy: user,
          importNotes
        }));
      }
    } catch (error) {
      console.error('Error importing event:', error);
      alert(error.response?.data?.error || 'Failed to import event');
    }
  };

  const handleEventCreated = (newEvent) => {
    fetchEvents(pagination.page, filters);
    fetchStats();
    setShowCreateForm(false);
  };

  const handleEventDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }

    try {
      await eventsAPI.deleteEvent(eventId);
      fetchEvents(pagination.page, filters);
      fetchStats();
      if (selectedEvent && selectedEvent._id === eventId) {
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const handlePageChange = (newPage) => {
    fetchEvents(newPage);
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Event Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Manage and import Sydney events from various sources
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={() => setShowCreateForm(true)}
                className="mb-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium"
              >
                Create Event
              </button>
              <p className="text-sm text-gray-500">Welcome back,</p>
              <p className="text-lg font-medium text-gray-900">{user.displayName}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {stats && <DashboardStats stats={stats} />}

        <DashboardFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
        />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {showCreateForm && (
            <div className="lg:col-span-3">
              <CreateEventForm onEventCreated={handleEventCreated} />
            </div>
          )}

          <div className={`${showCreateForm ? 'lg:col-span-3' : 'lg:col-span-2'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Events ({pagination.total})
                </h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading events...</p>
                </div>
              ) : events.length > 0 ? (
                <>
                  <EventTable
                    events={events}
                    onEventClick={handleEventClick}
                    onEventImport={handleEventImport}
                    onEventDelete={handleEventDelete}
                  />
                  
                 
                  {pagination.pages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                          {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                          {pagination.total} results
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Previous
                          </button>
                          
                          <span className="text-sm text-gray-700">
                            Page {pagination.page} of {pagination.pages}
                          </span>
                          
                          <button
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.pages}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">Try adjusting your filters or check back later.</p>
                </div>
              )}
            </div>
          </div>

       
          <div className="lg:col-span-1">
            {selectedEvent ? (
              <EventPreview
                event={selectedEvent}
                onImport={handleEventImport}
                onClose={() => setSelectedEvent(null)}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Event Preview</h3>
                  <p className="text-gray-600 text-sm">
                    Click on an event from the table to view its details and import it to the platform.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
