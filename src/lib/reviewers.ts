/** A reviewer's state on a pull request. */
export type ReviewerStatus =
  | "pending"
  | "approved"
  | "changes_requested"
  | "commented";

export interface Reviewer {
  type: "user" | "team";
  /** A user's login, or a team's name. */
  login: string;
  /** Avatar URL for users; empty string for teams (they have no avatar here). */
  avatarUrl: string;
  status: ReviewerStatus;
}

/** A `reviewRequests` node: the reviewer GitHub still expects a review from. */
export interface ReviewRequestNode {
  requestedReviewer: {
    __typename: string;
    login?: string;
    avatarUrl?: string;
    name?: string;
  } | null;
}

/** A `latestReviews` node: a review already submitted by an author. */
export interface ReviewNode {
  author: { login: string; avatarUrl: string } | null;
  state: string;
}

const REVIEW_STATE_TO_STATUS: Record<string, ReviewerStatus> = {
  APPROVED: "approved",
  CHANGES_REQUESTED: "changes_requested",
  COMMENTED: "commented",
};

/**
 * Merge the people still requested for review (pending) with the ones who have
 * already reviewed (approved / changes requested / commented) into a single
 * list. A reviewer who has been re-requested counts as pending again, so their
 * stale past review is ignored. Reviews in other states (PENDING, DISMISSED)
 * are dropped.
 */
export function buildReviewers(
  reviewRequests: ReviewRequestNode[],
  latestReviews: ReviewNode[],
): Reviewer[] {
  const reviewers: Reviewer[] = [];
  const requestedLogins = new Set<string>();

  for (const { requestedReviewer } of reviewRequests) {
    if (!requestedReviewer) continue;
    if (requestedReviewer.__typename === "Team") {
      reviewers.push({
        type: "team",
        login: requestedReviewer.name ?? "Team",
        avatarUrl: "",
        status: "pending",
      });
    } else if (requestedReviewer.login) {
      requestedLogins.add(requestedReviewer.login);
      reviewers.push({
        type: "user",
        login: requestedReviewer.login,
        avatarUrl: requestedReviewer.avatarUrl ?? "",
        status: "pending",
      });
    }
  }

  for (const { author, state } of latestReviews) {
    if (!author) continue;
    if (requestedLogins.has(author.login)) continue; // re-requested → still pending
    const status = REVIEW_STATE_TO_STATUS[state];
    if (!status) continue;
    reviewers.push({
      type: "user",
      login: author.login,
      avatarUrl: author.avatarUrl ?? "",
      status,
    });
  }

  return reviewers;
}

/**
 * Whether `login` has already submitted a review that still stands and is not
 * being asked for again — i.e. the viewer has no pending action on the PR. A
 * lingering *team* review request (common on Dependabot PRs: GitHub leaves the
 * team requested even after a member approves) does NOT keep it pending, since
 * the member already did their part. An individual re-request, or a dismissed
 * review, means they must review again, so this returns false.
 */
export function hasReviewed(
  reviewRequests: ReviewRequestNode[],
  latestReviews: ReviewNode[],
  login: string,
): boolean {
  const reRequested = reviewRequests.some(
    ({ requestedReviewer }) =>
      requestedReviewer?.__typename !== "Team" &&
      requestedReviewer?.login === login,
  );
  if (reRequested) return false;
  return latestReviews.some(
    ({ author, state }) =>
      author?.login === login && REVIEW_STATE_TO_STATUS[state] !== undefined,
  );
}
