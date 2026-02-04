import React from 'react';

const EventTable = ({ events, onEventClick, onEventImport, onEventDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
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

  const handleImport = (event) => {
    const importNotes = prompt('Add any import notes (optional):');
    onEventImport(event._id, importNotes);
  };

  const handleDelete = (event) => {
    onEventDelete(event._id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Event
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date & Time
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Venue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Source
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {events.map((event) => (
            <tr 
              key={event._id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onEventClick(event)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {event.imageUrl && (
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={event.imageUrl}
                        alt={event.title}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                      {event.title}
                    </div>
                    {event.category && (
                      <div className="text-xs text-gray-500">
                        {event.category}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {formatDate(event.dateTime)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(event.dateTime)}
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {event.venueName}
                </div>
                {event.city && (
                  <div className="text-xs text-gray-500">
                    {event.city}
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {event.source}
                </div>
              </td>
              <td className="px-6 py-4">
                {getStatusBadge(event.status)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                    className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                  >
                    View
                  </button>
                  {event.status !== 'imported' && (
                    <>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImport(event);
                        }}
                        className="text-green-600 hover:text-green-900 text-sm font-medium"
                      >
                        Import
                      </button>
                    </>
                  )}
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(event);
                    }}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventTable;
