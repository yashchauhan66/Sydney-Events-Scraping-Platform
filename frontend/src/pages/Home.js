import React, { useState, useEffect } from 'react';
import { eventsAPI, subscriptionsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchFilters from '../components/SearchFilters';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    city: 'Sydney',
    startDate: '',
    endDate: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
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

      const response = await eventsAPI.getEvents(params);
      setEvents(response.events);
      setPagination(response.pagination);
      setError(null);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();

  }, []);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchEvents(1, newFilters);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handlePageChange = (newPage) => {
    fetchEvents(newPage);
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSubscribe = async (email, eventId, consent) => {
    try {
      await subscriptionsAPI.createSubscription({
        email,
        eventId,
        consent
      });
      
      
      if (selectedEvent?.originalEventUrl) {
        window.open(selectedEvent.originalEventUrl, '_blank');
      }
      
      handleModalClose();
    } catch (error) {
      console.error('Subscription error:', error);
      alert(error.response?.data?.error || 'Failed to subscribe. Please try again.');
    }
  };

  if (loading && events.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
    
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Discover Sydney's Best Events
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Find amazing events, festivals, and activities happening in Sydney. 
              From concerts to workshops, there's something for everyone.
            </p>
          </div>
        </div>
      </div>

      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <SearchFilters 
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

       
        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => handleEventClick(event)}
                />
              ))}
            </div>

    
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-2">
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
            )}
          </>
        ) : (
          !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new events.</p>
            </div>
          )
        )}
      </div>

  
      {showModal && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleModalClose}
          onSubscribe={handleSubscribe}
        />
      )}
    </div>
  );
};

export default Home;
