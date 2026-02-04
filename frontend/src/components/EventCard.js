import React from 'react';

const EventCard = ({ event, onClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPastEvent = new Date(event.dateTime) < new Date();

  return (
    <div 
      className="card hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={onClick}
    >
      {event.imageUrl ? (
        <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-full h-full bg-gray-200 items-center justify-center" style={{ display: 'none' }}>
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      <div className="p-4">
        {event.status && (
          <div className="mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              event.status === 'new' ? 'bg-green-100 text-green-800' :
              event.status === 'updated' ? 'bg-blue-100 text-blue-800' :
              event.status === 'imported' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={isPastEvent ? 'text-red-600' : ''}>
            {formatDate(event.dateTime)} at {formatTime(event.dateTime)}
          </span>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{event.venueName}</span>
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {event.description}
          </p>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {event.category && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              {event.category}
            </span>
          )}
          <span className="font-medium">
            {event.source}
          </span>
        </div>

        {isPastEvent && (
          <div className="mt-2 text-xs text-red-600 font-medium">
            This event has already passed
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
