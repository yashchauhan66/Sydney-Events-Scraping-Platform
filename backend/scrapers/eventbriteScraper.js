const scrapingService = require('../services/scrapingService');

function EventbriteScraper() {
  this.baseUrl = 'https://www.eventbrite.com.au';
  this.sydneyUrl = 'https://www.eventbrite.com.au/d/australia--sydney/events/';
}

EventbriteScraper.prototype.scrapeEvents = async function() {
  let events = [];
  
  try {
    console.log('Starting Eventbrite scraping for Sydney...');
    
    const $ = await scrapingService.scrapeWithPuppeteer(
      this.sydneyUrl,
      '.event-card'
    );

    $('.event-card').each(function(index, element) {
      try {
        const eventData = getEventbriteEventData($(element));
        if (eventData) {
          events.push(eventData);
        }
      } catch (error) {
        console.error('Error extracting event:', error);
      }
    });

    console.log(`Found ${events.length} events from Eventbrite`);
    return events;
  } catch (error) {
    console.error('Error in Eventbrite scraper:', error);
    return [];
  }
};

function getEventbriteEventData($element) {
  try {
    const title = $element.find('.event-card__title').text().trim();
    const url = $element.find('a').attr('href');
    
    if (!title || !url) {
      return null;
    }

    const fullUrl = url.startsWith('http') ? url : `https://www.eventbrite.com.au${url}`;
    const dateTimeText = $element.find('.event-card__date').text().trim();
    const dateTime = parseEventbriteDateTime(dateTimeText);
    const venueName = $element.find('.event-card__venue').text().trim() || 'TBD';
    const imageUrl = $element.find('.event-card__image img').attr('src');
    const description = $element.find('.event-card__description').text().trim();
    const category = $element.find('.event-card__category').text().trim() || 'General';

    return {
      title: title,
      dateTime: dateTime,
      venueName: venueName,
      description: description,
      category: category,
      imageUrl: imageUrl,
      originalEventUrl: fullUrl,
      city: 'Sydney'
    };
  } catch (error) {
    console.error('Error extracting event data:', error);
    return null;
  }
}

function parseEventbriteDateTime(dateTimeText) {
  try {
    const now = new Date();
    
    if (dateTimeText.toLowerCase().includes('today')) {
      const timeMatch = dateTimeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch) {
        const timeParts = timeMatch;
        let hour = parseInt(timeParts[1]);
        const minute = parseInt(timeParts[2]);
        
        if (timeParts[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (timeParts[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
        
        const eventDate = new Date(now);
        eventDate.setHours(hour, minute, 0, 0);
        return eventDate;
      }
    } else if (dateTimeText.toLowerCase().includes('tomorrow')) {
      const timeMatch = dateTimeText.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch) {
        const timeParts = timeMatch;
        let hour = parseInt(timeParts[1]);
        const minute = parseInt(timeParts[2]);
        
        if (timeParts[3].toUpperCase() === 'PM' && hour !== 12) hour += 12;
        if (timeParts[3].toUpperCase() === 'AM' && hour === 12) hour = 0;
        
        const eventDate = new Date(now);
        eventDate.setDate(eventDate.getDate() + 1);
        eventDate.setHours(hour, minute, 0, 0);
        return eventDate;
      }
    }
    
    return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error('Error parsing date time:', error);
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
}

module.exports = new EventbriteScraper();
