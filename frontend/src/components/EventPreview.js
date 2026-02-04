import React, { useState } from 'react';

const EventPreview = ({ event, onImport, onClose }) => {
  const [importNotes, setImportNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
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

  const handleImport = () => {
    setLoading(true);
    onImport(event._id, importNotes);
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const styles = {
      new: 'bg-green-100 text-green-800',
      updated: 'bg-blue-100 text-blue-800',
      inactive: 'bg-gray-100 text-gray-800',
      imported: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.new}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (!event) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
     
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Event Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      
      <div className="p-6">
       
        {event.imageUrl && (
          <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-4">
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
        )}

       
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
          <div className="flex items-center space-x-2">
            {getStatusBadge(event.status)}
            {event.category && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {event.category}
              </span>
            )}
          </div>
        </div>

       
        <div className="space-y-3 mb-4">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Date & Time</p>
              <p className="text-sm text-gray-600">{formatDate(event.dateTime)}</p>
              <p className="text-sm text-gray-600">{formatTime(event.dateTime)}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Venue</p>
              <p className="text-sm text-gray-600">{event.venueName}</p>
              {event.address && (
                <p className="text-sm text-gray-600">{event.address}</p>
              )}
              <p className="text-sm text-gray-600">{event.city}</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-900">Source</p>
              <p className="text-sm text-gray-600">{event.source}</p>
            </div>
          </div>
        </div>

       
        {event.description && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600 line-clamp-4">{event.description}</p>
          </div>
        )}

       
        {event.tags && event.tags.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {event.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

  
        {event.status === 'imported' && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-medium text-purple-900 mb-1">Import Information</h4>
            <p className="text-xs text-purple-700">
              Imported by {event.importedBy?.displayName || 'Unknown'} on{' '}
              {event.importedAt ? new Date(event.importedAt).toLocaleDateString() : 'Unknown'}
            </p>
            {event.importNotes && (
              <p className="text-xs text-purple-700 mt-1">Notes: {event.importNotes}</p>
            )}
          </div>
        )}

        
        {event.status !== 'imported' && (
          <div className="border-t border-gray-200 pt-4">
            <div className="mb-3">
              <label htmlFor="importNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Import Notes (optional)
              </label>
              <textarea
                id="importNotes"
                value={importNotes}
                onChange={(e) => setImportNotes(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Add any notes about this import..."
              />
            </div>
            <button
              onClick={handleImport}
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importing...' : 'Import to Platform'}
            </button>
          </div>
        )}

    
        {event.originalEventUrl && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <a
              href={event.originalEventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-800 font-medium"
            >
              View Original Event →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPreview;
