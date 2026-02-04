const scrapingService = require('../services/scrapingService');

class TimeoutScraper {
  constructor() {
    this.baseUrl = 'https://www.timeout.com';
    this.sydneyUrl = 'https://www.timeout.com/sydney/things-to-do/events-in-sydney-this-week';
  }

  async scrapeEvents() {
    const events = [];
    
    try {
      console.log('Starting TimeOut Sydney scraping...');
      
      const $ = await scrapingService.scrapeWithPuppeteer(
        this.sydneyUrl,
        '.card'
      );

      $('.card').each((index, element) => {
        try {
          const event = this.extractEventData($(element));
          if (event) {
            events.push(event);
          }
        } catch (error) {
          console.error('Error extracting event:', error);
        }
      });

      console.log(`Found ${events.length} events from TimeOut Sydney`);
      return events;
    } catch (error) {
      console.error('Error in TimeOut scraper:', error);
      return [];
    }
  }

  extractEventData($element) {
    try {
      const title = $element.find('h3, .card__title').text().trim();
      const url = $element.find('a').attr('href');
      
      if (!title || !url) {
        return null;
      }

      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;

      const dateTimeText = $element.find('.card__date, .date').text().trim();
      const dateTime = this.parseDateTime(dateTimeText);

      const venueName = $element.find('.card__venue, .venue').text().trim() || 'TBD';

      const imageUrl = $element.find('img').attr('src');
      
      const description = $element.find('.card__description, p').first().text().trim();

      const category = $element.find('.card__category, .category').text().trim() || 'Entertainment';

      return {
        title,
        dateTime,
        venueName,
        description,
        category,
        imageUrl,
        originalEventUrl: fullUrl,
        city: 'Sydney'
      };
    } catch (error) {
      console.error('Error extracting event data:', error);
      return null;
    }
  }

  parseDateTime(dateTimeText) {
    try {
      const now = new Date();
      
      if (dateTimeText.toLowerCase().includes('today')) {
        return new Date(now);
      } else if (dateTimeText.toLowerCase().includes('tomorrow')) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
      } else if (dateTimeText.toLowerCase().includes('this week')) {
        const thisWeek = new Date(now);
        thisWeek.setDate(thisWeek.getDate() + 3);
        return thisWeek;
      }
      
      const dateMatch = dateTimeText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
      if (dateMatch) {
        const [, day, month, year] = dateMatch;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    } catch (error) {
      console.error('Error parsing date time:', error);
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  }
}

module.exports = new TimeoutScraper();
