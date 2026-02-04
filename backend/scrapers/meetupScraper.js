const scrapingService = require('../services/scrapingService');

function MeetupScraper() {
  this.baseUrl = 'https://www.meetup.com';
  this.sydneyUrl = 'https://www.meetup.com/find/?location=Sydney&source=EVENTS';
}

MeetupScraper.prototype.scrapeEvents = async function() {
  let events = [];
  
  try {
    console.log('Starting Meetup Sydney scraping...');
    
    const $ = await scrapingService.scrapeWithPuppeteer(
      this.sydneyUrl,
      '.event-card'
    );

    $('.event-card').each(function(index, element) {
      try {
        const eventData = getEventDataFromElement($(element));
        if (eventData) {
          events.push(eventData);
        }
      } catch (error) {
        console.error('Error extracting event:', error);
      }
    });

    console.log(`Found ${events.length} events from Meetup Sydney`);
    return events;
  } catch (error) {
    console.error('Error in Meetup scraper:', error);
    return [];
  }
};

function getEventDataFromElement($element) {
  try {
    const title = $element.find('.event-card__title, .title').text().trim();
    const url = $element.find('a').attr('href');
    
    if (!title || !url) {
      return null;
    }

    const fullUrl = url.startsWith('http') ? url : `https://www.meetup.com${url}`;
    const dateTimeText = $element.find('.event-card__date, .date').text().trim();
    const dateTime = parseMeetupDateTime(dateTimeText);
    const venueName = $element.find('.event-card__venue, .venue').text().trim() || 'TBD';
    const imageUrl = $element.find('img').attr('src');
    const description = $element.find('.event-card__description, p').first().text().trim();
    const category = $element.find('.event-card__category, .category').text().trim() || 'Meetup';
    
    let tags = [];
    $element.find('.tag, .event-card__tag').each(function(i, tag) {
      const tagText = $(tag).text().trim();
      if (tagText) tags.push(tagText);
    });

    return {
      title: title,
      dateTime: dateTime,
      venueName: venueName,
      description: description,
      category: category,
      tags: tags,
      imageUrl: imageUrl,
      originalEventUrl: fullUrl,
      city: 'Sydney'
    };
  } catch (error) {
    console.error('Error extracting event data:', error);
    return null;
  }
}

function parseMeetupDateTime(dateTimeText) {
  try {
    const now = new Date();
    
    const meetupDateMatch = dateTimeText.match(/(\w{3}),?\s+(\w{3})\s+(\d{1,2}),?\s+(\d{4}),?\s+(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (meetupDateMatch) {
      const parts = meetupDateMatch;
      const monthMap = {
        'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
        'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
      };
      
      let hour = parseInt(parts[5]);
      const minute = parseInt(parts[6]);
      const month = monthMap[parts[2].toLowerCase()];
      
      if (parts[7].toUpperCase() === 'PM' && hour !== 12) hour += 12;
      if (parts[7].toUpperCase() === 'AM' && hour === 12) hour = 0;
      
      return new Date(parseInt(parts[4]), month, parseInt(parts[3]), hour, minute);
    }
    
    if (dateTimeText.toLowerCase().includes('today')) {
      return new Date(now);
    } else if (dateTimeText.toLowerCase().includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + 2);
    return futureDate;
  } catch (error) {
    console.error('Error parsing date time:', error);
    return new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
  }
}

module.exports = new MeetupScraper();
