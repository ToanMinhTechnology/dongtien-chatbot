// Analytics tracking for Đồng Tiền Chatbot
// Simple console logging - no backend analytics needed for Phase 1

const ANALYTICS_ENABLED = true;

const EventTypes = {
  FAQ_ANSWERED: 'FAQ_ANSWERED',
  ORDER_INITIATED: 'ORDER_INITIATED',
  ORDER_CONFIRMED: 'ORDER_CONFIRMED',
  ZALO_REDIRECT: 'ZALO_REDIRECT',
  GEMINI_FALLBACK: 'GEMINI_FALLBACK',
  INTENT_MATCH: 'INTENT_MATCH',
  INTENT_MISS: 'INTENT_MISS'
};

/**
 * Track an analytics event
 * @param {string} eventType
 * @param {object} metadata
 */
export const trackEvent = (eventType, metadata = {}) => {
  if (!ANALYTICS_ENABLED) return;

  const event = {
    timestamp: new Date().toISOString(),
    event: eventType,
    metadata
  };

  console.log(`[ANALYTICS] ${eventType}:`, metadata);

  // Store in sessionStorage for later retrieval
  try {
    const events = JSON.parse(sessionStorage.getItem('dongtien_events') || '[]');
    events.push(event);
    // Keep last 100 events
    if (events.length > 100) {
      events.shift();
    }
    sessionStorage.setItem('dongtien_events', JSON.stringify(events));
  } catch (e) {
    // Ignore storage errors
  }
};

/**
 * Get all tracked events
 * @returns {array}
 */
export const getEvents = () => {
  try {
    return JSON.parse(sessionStorage.getItem('dongtien_events') || '[]');
  } catch (e) {
    return [];
  }
};

/**
 * Get events by type
 * @param {string} eventType
 * @returns {array}
 */
export const getEventsByType = (eventType) => {
  return getEvents().filter(e => e.event === eventType);
};

/**
 * Get analytics summary
 * @returns {object}
 */
export const getAnalyticsSummary = () => {
  const events = getEvents();

  const summary = {
    totalEvents: events.length,
    faqAnswered: events.filter(e => e.event === EventTypes.FAQ_ANSWERED).length,
    ordersInitiated: events.filter(e => e.event === EventTypes.ORDER_INITIATED).length,
    ordersConfirmed: events.filter(e => e.event === EventTypes.ORDER_CONFIRMED).length,
    zaloRedirects: events.filter(e => e.event === EventTypes.ZALO_REDIRECT).length,
    geminiFallbacks: events.filter(e => e.event === EventTypes.GEMINI_FALLBACK).length,
    intentMatches: events.filter(e => e.event === EventTypes.INTENT_MATCH).length,
    intentMisses: events.filter(e => e.event === EventTypes.INTENT_MISS).length
  };

  // Calculate conversion rates
  summary.faqToOrderRate = summary.faqAnswered > 0
    ? ((summary.ordersInitiated / summary.faqAnswered) * 100).toFixed(1)
    : 0;

  summary.orderConfirmRate = summary.ordersInitiated > 0
    ? ((summary.ordersConfirmed / summary.ordersInitiated) * 100).toFixed(1)
    : 0;

  return summary;
};

/**
 * Log analytics summary to console
 */
export const logAnalyticsSummary = () => {
  const summary = getAnalyticsSummary();
  console.log('[ANALYTICS SUMMARY]', summary);
  return summary;
};

export { EventTypes };
export default { trackEvent, getEvents, getEventsByType, getAnalyticsSummary, logAnalyticsSummary, EventTypes };
