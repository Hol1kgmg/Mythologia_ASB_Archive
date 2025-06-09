import { Hono } from 'hono';
import { healthRoutes } from './health.js';

const apiRoutes = new Hono();

// Mount health routes
apiRoutes.route('/health', healthRoutes);

// Future routes will be added here
// apiRoutes.route('/cards', cardRoutes);
// apiRoutes.route('/decks', deckRoutes);
// apiRoutes.route('/tribes', tribeRoutes);

export { apiRoutes };