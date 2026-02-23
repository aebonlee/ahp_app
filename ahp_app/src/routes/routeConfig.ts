import type { UserRole } from '../types';

export interface RouteDefinition {
  /** Tab key used in URL ?tab=xxx */
  tab: string;
  /** Whether authentication is required */
  auth: boolean;
  /** Whether a project must be selected first */
  requireProject?: boolean;
  /** Allowed roles (empty = all authenticated roles) */
  roles?: UserRole[];
  /** Delegate rendering to PersonalServiceDashboard */
  delegate?: boolean;
  /** Redirect target tab when navigating back from project-required pages */
  projectFallbackTab?: string;
  /** Additional tab aliases that map to this route */
  aliases?: string[];
}

/**
 * Declarative route configuration.
 * Replaces the 900-line switch statement in App.tsx with a data-driven approach.
 *
 * Each route defines its access requirements:
 * - auth: requires login
 * - requireProject: requires selectedProjectId
 * - roles: restricts to specific user roles
 * - delegate: routes handled by PersonalServiceDashboard
 */
export const routes: RouteDefinition[] = [
  // ── Public routes (no auth required) ────────────────────────────────────
  { tab: 'home', auth: false },
  { tab: 'login', auth: false },
  { tab: 'register', auth: false },
  { tab: 'evaluator-workflow', auth: false },
  { tab: 'anonymous-evaluation', auth: false, aliases: ['qr-evaluation'] },

  // ── Auth-required, delegated to PersonalServiceDashboard ────────────────
  { tab: 'personal-service', auth: true, delegate: true, aliases: ['admin-dashboard', 'user-home'] },
  { tab: 'demographic-survey', auth: true, delegate: true },
  { tab: 'my-projects', auth: true, delegate: true },
  { tab: 'project-creation', auth: true, delegate: true, aliases: ['project-wizard', 'demographic-setup', 'evaluator-invitation'] },
  { tab: 'model-builder', auth: true, delegate: true },
  { tab: 'evaluator-management', auth: true, delegate: true },
  { tab: 'trash', auth: true, delegate: true },
  { tab: 'progress-monitoring', auth: true, delegate: true },
  { tab: 'results-analysis', auth: true, delegate: true },
  { tab: 'ai-paper-assistant', auth: true, delegate: true },
  { tab: 'export-reports', auth: true, delegate: true },
  { tab: 'workshop-management', auth: true, delegate: true },
  { tab: 'decision-support-system', auth: true, delegate: true },
  { tab: 'personal-settings', auth: true, delegate: true },

  // ── Auth-required, project-required ─────────────────────────────────────
  { tab: 'model-building', auth: true, requireProject: true, projectFallbackTab: 'personal-projects' },
  { tab: 'evaluation-results', auth: true, requireProject: true, projectFallbackTab: 'personal-projects' },
  { tab: 'project-completion', auth: true, requireProject: true, projectFallbackTab: 'personal-projects' },
  { tab: 'results', auth: true, requireProject: true, projectFallbackTab: 'personal-projects' },
  { tab: 'pairwise-evaluation', auth: true, requireProject: true, projectFallbackTab: 'evaluator-dashboard' },
  { tab: 'direct-evaluation', auth: true, requireProject: true, projectFallbackTab: 'evaluator-dashboard' },
  { tab: 'evaluations', auth: true, requireProject: true, projectFallbackTab: 'personal-projects' },

  // ── Auth-required, standalone routes ────────────────────────────────────
  { tab: 'super-admin', auth: true, roles: ['super_admin'], aliases: ['super-admin-dashboard'] },
  { tab: 'role-switch-admin', auth: true, roles: ['super_admin'] },
  { tab: 'role-switch-user', auth: true, roles: ['super_admin'] },
  { tab: 'role-switch-evaluator', auth: true, roles: ['super_admin'] },
  { tab: 'system-reset', auth: true, roles: ['super_admin'] },
  { tab: 'all-projects', auth: true, roles: ['super_admin'] },
  { tab: 'system-info', auth: true, roles: ['super_admin'] },
  { tab: 'system-monitoring', auth: true, roles: ['super_admin'] },
  { tab: 'system-settings', auth: true, roles: ['super_admin'] },
  { tab: 'payment-options', auth: true, roles: ['super_admin'] },
  { tab: 'users', auth: true, roles: ['super_admin'] },
  { tab: 'dashboard', auth: true },
  { tab: 'django-admin-integration', auth: true, roles: ['super_admin', 'service_admin'] },
  { tab: 'personal-users', auth: true, roles: ['super_admin', 'service_admin'] },
  { tab: 'personal-projects', auth: true },
  { tab: 'project-workflow', auth: true },
  { tab: 'evaluator-mode', auth: true },
  { tab: 'evaluator-dashboard', auth: true },
  { tab: 'evaluator-status', auth: true },
  { tab: 'evaluator-survey', auth: true },
  { tab: 'progress', auth: true },
  { tab: 'landing', auth: true },
  { tab: 'ahp-analysis', auth: true },

  // ── Auth-required, legacy admin tabs → EnhancedSuperAdminDashboard ──────
  { tab: 'projects', auth: true, roles: ['super_admin'] },
  { tab: 'monitoring', auth: true, roles: ['super_admin'] },
  { tab: 'database', auth: true, roles: ['super_admin'] },
  { tab: 'audit', auth: true, roles: ['super_admin'] },
  { tab: 'settings', auth: true, roles: ['super_admin'] },
  { tab: 'backup', auth: true, roles: ['super_admin'] },
  { tab: 'system', auth: true, roles: ['super_admin'] },

  // ── Auth-required, guide/tool pages ─────────────────────────────────────
  { tab: 'user-guide', auth: true },
  { tab: 'researcher-guide', auth: true },
  { tab: 'evaluator-guide', auth: true },
  { tab: 'ai-research-guide', auth: true },
  { tab: 'evaluation-test', auth: true },
  { tab: 'connection-test', auth: true },
  { tab: 'integration-test', auth: true },
  { tab: 'system-health', auth: true },
  { tab: 'ai-ahp-methodology', auth: true },
  { tab: 'ai-fuzzy-methodology', auth: true },
  { tab: 'ai-paper-generation', auth: true },
  { tab: 'ai-results-interpretation', auth: true },
  { tab: 'ai-quality-validation', auth: true },
  { tab: 'ai-materials-generation', auth: true },
  { tab: 'ai-chatbot-assistant', auth: true },
];

/** Build a lookup map: tab key → RouteDefinition */
const routeMap = new Map<string, RouteDefinition>();
for (const route of routes) {
  routeMap.set(route.tab, route);
  if (route.aliases) {
    for (const alias of route.aliases) {
      routeMap.set(alias, route);
    }
  }
}

/**
 * Find the route definition for a given tab key.
 * Returns undefined if no matching route exists.
 */
export function findRoute(tab: string): RouteDefinition | undefined {
  return routeMap.get(tab);
}

/**
 * Check if a user has access to a specific route.
 */
export function canAccess(route: RouteDefinition, userRole?: UserRole): boolean {
  if (!route.auth) return true;
  if (!userRole) return false;
  if (!route.roles || route.roles.length === 0) return true;
  return route.roles.includes(userRole);
}

/**
 * Get all tabs that delegate to PersonalServiceDashboard.
 */
export function getDelegatedTabs(): string[] {
  return routes
    .filter(r => r.delegate)
    .flatMap(r => [r.tab, ...(r.aliases || [])]);
}
