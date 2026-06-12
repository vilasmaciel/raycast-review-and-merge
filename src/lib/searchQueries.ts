export const CLOSED_REVIEW_WINDOW_DAYS = 30;

function scope(organization: string | undefined): string {
  return organization ? `org:${organization} ` : "";
}

export function myOpenPullRequestsQuery(organization?: string): string {
  return `${scope(organization)}is:pr is:open author:@me sort:updated-desc`;
}

export function pendingReviewQuery(organization?: string): string {
  return `${scope(organization)}is:pr is:open review-requested:@me sort:updated-desc`;
}

export function closedUnreviewedQuery(
  now: Date,
  organization?: string,
): string {
  const floor = new Date(
    now.getTime() - CLOSED_REVIEW_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  );
  const day = floor.toISOString().slice(0, 10);
  return `${scope(organization)}is:pr is:closed review-requested:@me updated:>=${day} sort:updated-desc`;
}
