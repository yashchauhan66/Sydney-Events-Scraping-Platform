const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');
const Event = require('../models/Event');

class ScrapingService {
  constructor() {
    this.browser = null;
    this.userAgent = process.env.USER_AGENT || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async initializeBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async scrapeWithPuppeteer(url, selector = null) {
    const browser = await this.initializeBrowser();
    const page = await browser.newPage();
    
    try {
      await page.setUserAgent(this.userAgent);
      await page.setViewport({ width: 1366, height: 768 });
      
  
      await page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      if (selector) {
        await page.waitForSelector(selector, { timeout: 10000 });
      }

      const content = await page.content();
      return cheerio.load(content);
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      throw error;
    } finally {
      await page.close();
    }
  }

  async scrapeWithAxios(url) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent
        },
        timeout: 30000
      });
      return cheerio.load(response.data);
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  async saveEvents(events, source) {
    const results = {
      new: 0,
      updated: 0,
      inactive: 0,
      errors: []
    };

    try {
      for (const eventData of events) {
        try {
        
          eventData.source = source;
          const existingEvent = await Event.findOne({
            originalEventUrl: eventData.originalEventUrl,
            source: source
          });

          if (!existingEvent) {
        
            eventData.status = 'new';
            await Event.create(eventData);
            results.new++;
          } else {
      
            const hasChanges = this.detectChanges(existingEvent, eventData);
            
            if (hasChanges) {
              eventData.status = 'updated';
              await Event.updateOne(
                { _id: existingEvent._id },
                { $set: eventData }
              );
              results.updated++;
            } else {
      
              await Event.updateOne(
                { _id: existingEvent._id },
                { $set: { lastScrapedAt: new Date() } }
              );
            }
          }
        } catch (error) {
          console.error(`Error processing event:`, error);
          results.errors.push({
            url: eventData.originalEventUrl,
            error: error.message
          });
        }
      }
      const cutoffDate = new Date();
      cutoffDate.setHours(cutoffDate.getHours() - 6);
      
      await Event.updateMany(
        { 
          source: source,
          lastScrapedAt: { $lt: cutoffDate },
          status: { $ne: 'inactive' }
        },
        { $set: { status: 'inactive' } }
      );

    } catch (error) {
      console.error(`Error in saveEvents:`, error);
      results.errors.push({ error: error.message });
    }

    return results;
  }

  detectChanges(existingEvent, newData) {
    const fieldsToCompare = [
      'title', 'dateTime', 'venueName', 'address', 
      'description', 'category', 'tags', 'imageUrl'
    ];

    for (const field of fieldsToCompare) {
      const existingValue = existingEvent[field];
      const newValue = newData[field];
      

      if (Array.isArray(existingValue) && Array.isArray(newValue)) {
        if (JSON.stringify(existingValue.sort()) !== JSON.stringify(newValue.sort())) {
          return true;
        }
      } else if (existingValue !== newValue) {
        return true;
      }
    }

    return false;
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new ScrapingService();
