import { Hono } from 'hono';
import { adminAuthRoutes } from './admin-auth.js';
import { adminMonitoringRoutes } from './admin-monitoring.js';
import { healthRoutes } from './health.js';

const apiRoutes = new Hono();

// Mount health routes
apiRoutes.route('/health', healthRoutes);

// Mount admin authentication routes
apiRoutes.route('/admin/auth', adminAuthRoutes);

// Mount admin monitoring routes
apiRoutes.route('/admin/monitoring', adminMonitoringRoutes);

// Future routes will be added here
// apiRoutes.route('/cards', cardRoutes);
// apiRoutes.route('/decks', deckRoutes);
// apiRoutes.route('/tribes', tribeRoutes);

export { apiRoutes };
