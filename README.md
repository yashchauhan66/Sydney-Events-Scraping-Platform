# Sydney Events Scraping Platform

A complete MERN stack application that automatically scrapes, stores, and displays public events for Sydney, Australia. The system demonstrates an end-to-end pipeline: scrape → store → auto-update → display → admin review → import → status tagging.

##  Features

### Event Scraping System
- **Multi-source Scraping**: Automatically scrapes events from Eventbrite, TimeOut, and Meetup (Sydney only)
- **Smart Update Detection**: Identifies new, updated, and removed events
- **Automated Scheduling**: Re-scrapes every 6 hours using node-cron
- **Status Tagging**: Events are tagged as `new`, `updated`, `inactive`, or `imported`

### Public Event Listing
- **Modern UI**: Clean, responsive design using Tailwind CSS
- **Event Cards**: Display events with title, date/time, venue, description, and source
- **Search & Filters**: Filter by category, date range, and keyword search
- **Email Subscription**: Modal for user email capture before redirecting to original event

### Admin Dashboard
- **Google OAuth Authentication**: Secure login using Passport.js
- **Event Management**: Table view with all events and their status
- **Import Functionality**: Import events to the platform with notes
- **Advanced Filters**: Filter by status, category, date range, and search
- **Event Preview**: Detailed event information panel
- **Statistics Dashboard**: Overview of total events, imports, and activity

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **MongoDB** + **Mongoose** - Database and ODM
- **Puppeteer** + **Cheerio** - Web scraping
- **Passport.js** - Google OAuth authentication
- **node-cron** - Scheduled scraping jobs
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React** + **React Router** - UI framework and routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Context API** - State management

##  Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google OAuth credentials
- Git

##  Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sydney-events-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/sydney-events

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d

# Scraping Configuration
SCRAPE_INTERVAL=*/6 * * * * # Every 6 hours
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

### 5. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 6. Start MongoDB

Make sure MongoDB is running on your system:

```bash

mongod

# Or use MongoDB Atlas for cloud instance
```

### 7. Run the Application

Start the backend server:

```bash
cd backend
npm run dev
```

Start the frontend application:

```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

##  Project Structure

```
sydney-events-platform/
├── backend/
│   ├── config/
│   │   └── passport.js              # Passport configuration
│   ├── controllers/                  # Route controllers
│   ├── jobs/
│   │   └── scrapeEvents.js          # Cron job scheduler
│   ├── models/
│   │   ├── Event.js                  # Event schema
│   │   ├── User.js                   # User schema
│   │   └── EmailSubscription.js      # Subscription schema
│   ├── routes/
│   │   ├── auth.js                   # Authentication routes
│   │   ├── events.js                 # Event routes
│   │   └── subscriptions.js          # Subscription routes
│   ├── scrapers/
│   │   ├── eventbriteScraper.js      # Eventbrite scraper
│   │   ├── timeoutScraper.js         # TimeOut scraper
│   │   └── meetupScraper.js          # Meetup scraper
│   ├── services/
│   │   ├── authService.js            # Authentication service
│   │   └── scrapingService.js        # Scraping service
│   ├── server.js                     # Main server file
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardStats.js     # Stats cards
│   │   │   ├── DashboardFilters.js   # Dashboard filters
│   │   │   ├── EventCard.js          # Event card component
│   │   │   ├── EventModal.js         # Event subscription modal
│   │   │   ├── EventPreview.js       # Event preview panel
│   │   │   ├── EventTable.js         # Events table
│   │   │   ├── LoadingSpinner.js     # Loading component
│   │   │   ├── Navbar.js             # Navigation bar
│   │   │   └── ProtectedRoute.js     # Route protection
│   │   ├── contexts/
│   │   │   └── AuthContext.js        # Authentication context
│   │   ├── pages/
│   │   │   ├── Home.js               # Public event listing
│   │   │   ├── Dashboard.js          # Admin dashboard
│   │   │   ├── Login.js              # Login page
│   │   │   └── AuthCallback.js       # OAuth callback
│   │   ├── services/
│   │   │   └── api.js                # API service
│   │   ├── App.js                    # Main App component
│   │   └── index.css                 # Global styles
│   └── package.json
└── README.md
```

##  API Endpoints

### Authentication
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Events
- `GET /api/events` - Get public events (with filters)
- `GET /api/events/:id` - Get single event
- `POST /api/events/:id/import` - Import event (protected)
- `GET /api/events/dashboard/all` - Get all events for dashboard (protected)
- `GET /api/events/dashboard/stats` - Get event statistics (protected)

### Subscriptions
- `POST /api/subscriptions` - Create email subscription
- `GET /api/subscriptions/email/:email` - Get subscriptions by email
- `GET /api/subscriptions/event/:eventId` - Get subscriptions by event

##  Usage Guide

### For Public Users
1. Browse events on the homepage
2. Use filters to find specific events
3. Click "GET TICKETS" on any event
4. Enter email and consent to receive event information
5. Get redirected to the original event page

### For Admin Users
1. Sign in with Google account
2. Access the dashboard to view all scraped events
3. Use filters to find specific events
4. Click on events to view detailed information
5. Import relevant events to the platform
6. Monitor statistics and event status

##  Security Features

- **Google OAuth**: Secure authentication using Google accounts
- **JWT Tokens**: Stateless authentication with expiration
- **Input Validation**: Server-side validation using express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet.js**: Security headers for Express
- **CORS Configuration**: Proper cross-origin resource sharing setup

##  Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://yourdomain.com
MONGODB_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
JWT_SECRET=strong-random-secret
```

### Deployment Steps
1. Build frontend: `npm run build`
2. Set up production database
3. Configure environment variables
4. Deploy backend to cloud provider (Heroku, AWS, etc.)
5. Serve frontend from CDN or static hosting
6. Set up SSL certificates
7. Configure monitoring and logging

##  Scalability Considerations

### Database Optimization
- Implement proper indexing for frequently queried fields
- Use MongoDB aggregation for complex queries
- Consider database sharding for large datasets
- Implement caching layer (Redis) for frequently accessed data

### Performance Enhancements
- Implement pagination for large datasets
- Add CDN for static assets
- Use image optimization and lazy loading
- Implement API response caching
- Add background job processing queue (Bull/Agenda)

### Monitoring & Logging
- Add structured logging (Winston)
- Implement application monitoring (New Relic, DataDog)
- Set up error tracking (Sentry)
- Add health check endpoints
- Implement performance metrics

### Security Enhancements
- Add API rate limiting per user
- Implement refresh token rotation
- Add input sanitization
- Set up web application firewall
- Regular security audits and updates

##  Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

##  License

This project is licensed under the MIT License.

##  Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **Google OAuth Error**
   - Verify OAuth credentials
   - Check redirect URI configuration
   - Ensure API is enabled in Google Cloud Console

3. **Scraping Issues**
   - Check internet connectivity
   - Verify target websites are accessible
   - Review scraper logs for errors

4. **Frontend Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify environment variables





