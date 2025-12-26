import Logger from "../src/utils/logger";

type SentryRule = {
  id: string;
  name: string;
};

type CreateIssueAlertRuleRequest = {
  name: string;
  actionMatch: "all" | "any" | "none";
  filterMatch?: "all" | "any" | "none";
  frequency: number;
  conditions: Array<Record<string, unknown>>;
  filters?: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
};

const SENTRY_BASE_URL = process.env.SENTRY_BASE_URL || "https://sentry.io";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function sentryRequest<T>(
  path: string,
  init: RequestInit & { method: string },
): Promise<T> {
  const authToken = requireEnv("SENTRY_AUTH_TOKEN");

  const res = await fetch(`${SENTRY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Sentry API request failed: ${init.method} ${path} -> ${res.status} ${res.statusText}: ${text}`,
    );
  }

  return (await res.json()) as T;
}

function buildEmailIssueOwnersAction(): Record<string, unknown> {
  return {
    id: "sentry.mail.actions.NotifyEmailAction",
    targetType: "IssueOwners",
    fallthroughType: "ActiveMembers",
  };
}

function buildOptionalSlackAction(): Record<string, unknown> | null {
  const workspace = process.env.SENTRY_SLACK_WORKSPACE_ID;
  const channel = process.env.SENTRY_SLACK_CHANNEL;

  if (!workspace || !channel) {
    return null;
  }

  return {
    id: "sentry.integrations.slack.notify_action.SlackNotifyServiceAction",
    workspace: Number(workspace),
    channel,
    tags: "environment,level",
    notes: "New issue alert from PMP Application",
  };
}

function buildCommonActions(): Array<Record<string, unknown>> {
  const actions: Array<Record<string, unknown>> = [buildEmailIssueOwnersAction()];

  const slackAction = buildOptionalSlackAction();
  if (slackAction) {
    actions.push(slackAction);
  }

  return actions;
}

async function listRules(orgSlug: string, projectSlug: string): Promise<SentryRule[]> {
  return sentryRequest<SentryRule[]>(`/api/0/projects/${orgSlug}/${projectSlug}/rules/`, {
    method: "GET",
  });
}

async function createRule(
  orgSlug: string,
  projectSlug: string,
  body: CreateIssueAlertRuleRequest,
): Promise<SentryRule> {
  return sentryRequest<SentryRule>(`/api/0/projects/${orgSlug}/${projectSlug}/rules/`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

async function ensureRule(
  orgSlug: string,
  projectSlug: string,
  existingRules: SentryRule[],
  rule: CreateIssueAlertRuleRequest,
): Promise<void> {
  const alreadyExists = existingRules.some((r) => r.name === rule.name);
  if (alreadyExists) {
    Logger.info(`[Sentry Alerts] Rule already exists: ${rule.name}`);
    return;
  }

  const created = await createRule(orgSlug, projectSlug, rule);
  Logger.info(`[Sentry Alerts] Created rule: ${created.name} (${created.id})`);
}

async function main() {
  const orgSlug = requireEnv("SENTRY_ORG");
  const projectSlug = requireEnv("SENTRY_PROJECT");

  Logger.info(`[Sentry Alerts] Configuring issue alert rules for ${orgSlug}/${projectSlug}`);

  const existing = await listRules(orgSlug, projectSlug);

  const common = {
    actionMatch: "all" as const,
    frequency: 5,
    actions: buildCommonActions(),
  };

  await ensureRule(orgSlug, projectSlug, existing, {
    ...common,
    name: "Critical: New Issue",
    conditions: [
      {
        id: "sentry.rules.conditions.first_seen_event.FirstSeenEventCondition",
      },
    ],
  });

  await ensureRule(orgSlug, projectSlug, existing, {
    ...common,
    name: "Critical: Regression",
    conditions: [
      {
        id: "sentry.rules.conditions.regression_event.RegressionEventCondition",
      },
    ],
  });

  Logger.info("[Sentry Alerts] Done");
}

main().catch((error) => {
  Logger.error("[Sentry Alerts] Failed to configure alerts", error);
  process.exitCode = 1;
});
