import { Hono } from 'hono';
import { healthRoutes } from './health.js';
import { adminAuthRoutes } from './admin-auth.js';

const apiRoutes = new Hono();

// Mount health routes
apiRoutes.route('/health', healthRoutes);

// Mount admin authentication routes
apiRoutes.route('/admin/auth', adminAuthRoutes);

// Future routes will be added here
// apiRoutes.route('/cards', cardRoutes);
// apiRoutes.route('/decks', deckRoutes);
// apiRoutes.route('/tribes', tribeRoutes);

export { apiRoutes };