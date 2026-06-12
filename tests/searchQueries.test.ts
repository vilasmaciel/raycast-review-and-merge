import { describe, expect, it } from "vitest";
import {
  closedUnreviewedQuery,
  myOpenPullRequestsQuery,
  pendingReviewQuery,
} from "../src/lib/searchQueries";

describe("searchQueries", () => {
  it("builds the query for my open PRs across all of GitHub", () => {
    expect(myOpenPullRequestsQuery()).toBe(
      "is:pr is:open author:@me sort:updated-desc",
    );
  });

  it("scopes my open PRs to an organization when provided", () => {
    expect(myOpenPullRequestsQuery("acme")).toBe(
      "org:acme is:pr is:open author:@me sort:updated-desc",
    );
  });

  it("builds the query for PRs pending my review", () => {
    expect(pendingReviewQuery()).toBe(
      "is:pr is:open review-requested:@me sort:updated-desc",
    );
  });

  it("scopes pending-review PRs to an organization", () => {
    expect(pendingReviewQuery("acme")).toBe(
      "org:acme is:pr is:open review-requested:@me sort:updated-desc",
    );
  });

  it("builds the closed-unreviewed query with a 30-day date floor", () => {
    expect(closedUnreviewedQuery(new Date("2026-06-12T15:30:00Z"))).toBe(
      "is:pr is:closed review-requested:@me updated:>=2026-05-13 sort:updated-desc",
    );
  });

  it("scopes the closed-unreviewed query to an organization", () => {
    expect(
      closedUnreviewedQuery(new Date("2026-06-12T15:30:00Z"), "acme"),
    ).toBe(
      "org:acme is:pr is:closed review-requested:@me updated:>=2026-05-13 sort:updated-desc",
    );
  });
});
