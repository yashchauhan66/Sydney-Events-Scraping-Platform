const mongoose = require('mongoose');
const Event = require('../models/Event');

const sampleEvents = [
  {
    title: "Sydney Opera House Performance",
    description: "World-class performance at the iconic Sydney Opera House featuring international artists.",
    dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    venueName: "Sydney Opera House",
    address: "Bennelong Point, Sydney NSW 2000",
    city: "Sydney",
    category: "Entertainment",
    tags: ["performance", "opera", "music"],
    imageUrl: "https://images.unsplash.com/photo-1516283746530-2dd2555d2ac7?w=800",
    source: "sample",
    originalEventUrl: "https://www.sydneyoperahouse.com",
    status: "new",
    isActive: true
  },
  {
    title: "Harbour Bridge Climb Experience",
    description: "Climb the iconic Sydney Harbour Bridge for breathtaking views of the city.",
    dateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    venueName: "Sydney Harbour Bridge",
    address: "Sydney NSW 2000",
    city: "Sydney",
    category: "Adventure",
    tags: ["adventure", "bridge", "climb"],
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    source: "sample",
    originalEventUrl: "https://www.bridgeclimb.com.au",
    status: "new",
    isActive: true
  },
  {
    title: "Bondi Beach Festival",
    description: "Annual beach festival with live music, food stalls, and water sports activities.",
    dateTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    venueName: "Bondi Beach",
    address: "Bondi NSW 2026",
    city: "Sydney",
    category: "Festival",
    tags: ["festival", "beach", "music"],
    imageUrl: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=800",
    source: "sample",
    originalEventUrl: "https://www.bondibeachfestival.com.au",
    status: "new",
    isActive: true
  },
  {
    title: "Royal Botanic Gardens Tour",
    description: "Guided tour through Sydney's beautiful Royal Botanic Gardens with expert horticulturists.",
    dateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    venueName: "Royal Botanic Gardens",
    address: "Mrs Macquaries Rd, Sydney NSW 2000",
    city: "Sydney",
    category: "Tour",
    tags: ["tour", "gardens", "nature"],
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    source: "sample",
    originalEventUrl: "https://www.rbgsyd.nsw.gov.au",
    status: "new",
    isActive: true
  },
  {
    title: "Darling Harbour Fireworks",
    description: "Spectacular fireworks display over Darling Harbour with live entertainment.",
    dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    venueName: "Darling Harbour",
    address: "Sydney NSW 2000",
    city: "Sydney",
    category: "Entertainment",
    tags: ["fireworks", "entertainment", "harbour"],
    imageUrl: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800",
    source: "sample",
    originalEventUrl: "https://www.darlingharbour.com",
    status: "new",
    isActive: true
  }
];

async function addSampleEvents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sydney-events');
    console.log('Connected to MongoDB');

    await Event.deleteMany({ source: 'sample' });
    console.log('Cleared existing sample events');

    const events = await Event.create(sampleEvents);
    console.log(`Added ${events.length} sample events:`);
    
    events.forEach(function(event, index) {
      console.log(`${index + 1}. ${event.title} - ${event.dateTime ? event.dateTime.toDateString() : event.dateTime}`);
    });

    console.log('\nSample events added successfully!');
  } catch (error) {
    console.error('Error adding sample events:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addSampleEvents();
