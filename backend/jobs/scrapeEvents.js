const cron = require('node-cron');
const scrapingService = require('../services/scrapingService');
const eventbriteScraper = require('../scrapers/eventbriteScraper');
const timeoutScraper = require('../scrapers/timeoutScraper');
const meetupScraper = require('../scrapers/meetupScraper');

function ScrapeEventsJob() {
  this.isRunning = false;
  this.scrapeInterval = process.env.SCRAPE_INTERVAL || '0 */6 * * *';
}

ScrapeEventsJob.prototype.runScraping = async function() {
  if (this.isRunning) {
    console.log('Scraping job already running, skipping...');
    return;
  }

  this.isRunning = true;
  console.log('Starting scheduled event scraping job...');
  
  const totalResults = {
    eventbrite: { new: 0, updated: 0, inactive: 0, errors: [] },
    timeout: { new: 0, updated: 0, inactive: 0, errors: [] },
    meetup: { new: 0, updated: 0, inactive: 0, errors: [] },
    total: { new: 0, updated: 0, inactive: 0, errors: [] }
  };

  try {
    try {
      console.log('Scraping Eventbrite...');
      const eventbriteEvents = await eventbriteScraper.scrapeEvents();
      const eventbriteResults = await scrapingService.saveEvents(eventbriteEvents, 'Eventbrite');
      totalResults.eventbrite = eventbriteResults;
      console.log('Eventbrite results:', eventbriteResults);
    } catch (error) {
      console.error('Eventbrite scraping failed:', error);
      totalResults.eventbrite.errors.push({ error: error.message });
    }

    await scrapingService.delay(2000);

    try {
      console.log('Scraping TimeOut...');
      const timeoutEvents = await timeoutScraper.scrapeEvents();
      const timeoutResults = await scrapingService.saveEvents(timeoutEvents, 'TimeOut');
      totalResults.timeout = timeoutResults;
      console.log('TimeOut results:', timeoutResults);
    } catch (error) {
      console.error('TimeOut scraping failed:', error);
      totalResults.timeout.errors.push({ error: error.message });
    }

    await scrapingService.delay(2000);

    try {
      console.log('Scraping Meetup...');
      const meetupEvents = await meetupScraper.scrapeEvents();
      const meetupResults = await scrapingService.saveEvents(meetupEvents, 'Meetup');
      totalResults.meetup = meetupResults;
      console.log('Meetup results:', meetupResults);
    } catch (error) {
      console.error('Meetup scraping failed:', error);
      totalResults.meetup.errors.push({ error: error.message });
    }

    totalResults.total.new = totalResults.eventbrite.new + totalResults.timeout.new + totalResults.meetup.new;
    totalResults.total.updated = totalResults.eventbrite.updated + totalResults.timeout.updated + totalResults.meetup.updated;
    totalResults.total.inactive = totalResults.eventbrite.inactive + totalResults.timeout.inactive + totalResults.meetup.inactive;
    totalResults.total.errors = [
      ...totalResults.eventbrite.errors,
      ...totalResults.timeout.errors,
      ...totalResults.meetup.errors
    ];

    console.log('Scraping job completed. Total results:', totalResults.total);

  } catch (error) {
    console.error('Fatal error in scraping job:', error);
    totalResults.total.errors.push({ error: error.message });
  } finally {
    this.isRunning = false;
    await scrapingService.closeBrowser();
  }

  return totalResults;
};

ScrapeEventsJob.prototype.start = function() {
  console.log(`Starting scraping scheduler with cron pattern: ${this.scrapeInterval}`);
  
  cron.schedule(this.scrapeInterval, async function() {
    await this.runScraping();
  }.bind(this));

  setTimeout(async function() {
    await this.runScraping();
  }.bind(this), 5000);

  console.log('Scraping scheduler started. Next run will be according to cron schedule.');
};

ScrapeEventsJob.prototype.triggerManually = async function() {
  console.log('Manually triggering scraping job...');
  return await this.runScraping();
};

const scrapeJob = new ScrapeEventsJob();
scrapeJob.start();

module.exports = scrapeJob;
