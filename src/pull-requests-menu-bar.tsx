import { Icon, LaunchType, MenuBarExtra, launchCommand } from "@raycast/api";
import { withAccessToken } from "@raycast/utils";
import { github } from "./github/auth";
import {
  usePullRequestSearch,
  useReviewRequests,
} from "./github/usePullRequests";
import {
  closedUnreviewedQuery,
  myOpenPullRequestsQuery,
  pendingReviewQuery,
} from "./lib/searchQueries";
import { getSearchScope } from "./preferences";
import { menuBarTitle } from "./lib/menuBarTitle";
import { PullRequestMenuItem } from "./components/PullRequestMenuItem";

function PullRequestsMenuBar() {
  const scope = getSearchScope();
  const review = useReviewRequests(
    pendingReviewQuery(scope),
    closedUnreviewedQuery(new Date(), scope),
  );
  const mine = usePullRequestSearch(myOpenPullRequestsQuery(scope));

  const toReview = review.data?.pending ?? [];
  const myPrs = mine.data?.pullRequests ?? [];
  const viewerLogin = review.data?.viewerLogin ?? mine.data?.viewerLogin;
  const isLoading = review.isLoading || mine.isLoading;
  const hasError = Boolean(review.error || mine.error);
  const { title, tooltip } = menuBarTitle(toReview, myPrs);

  function onRefresh() {
    review.revalidate();
    mine.revalidate();
  }

  return (
    <MenuBarExtra
      icon={{ source: "pull-request-open.svg" }}
      title={title}
      tooltip={tooltip}
      isLoading={isLoading}
    >
      {hasError && (
        <MenuBarExtra.Item
          title="Couldn't refresh — showing cached data"
          icon={Icon.Warning}
          onAction={onRefresh}
        />
      )}

      {toReview.length > 0 && (
        <MenuBarExtra.Section title={`To Review (${toReview.length})`}>
          {toReview.map((pr) => (
            <PullRequestMenuItem
              key={pr.id}
              pr={pr}
              section="review"
              viewerLogin={viewerLogin}
              onRefresh={onRefresh}
            />
          ))}
        </MenuBarExtra.Section>
      )}

      {myPrs.length > 0 && (
        <MenuBarExtra.Section title={`Mine (${myPrs.length})`}>
          {myPrs.map((pr) => (
            <PullRequestMenuItem
              key={pr.id}
              pr={pr}
              section="mine"
              viewerLogin={viewerLogin}
              onRefresh={onRefresh}
            />
          ))}
        </MenuBarExtra.Section>
      )}

      {!isLoading && !hasError && toReview.length === 0 && myPrs.length === 0 && (
        <MenuBarExtra.Item title="No pull requests" icon={Icon.Check} />
      )}

      <MenuBarExtra.Section>
        <MenuBarExtra.Item
          title="Refresh Now"
          icon={Icon.ArrowClockwise}
          onAction={onRefresh}
        />
        <MenuBarExtra.Item
          title="Open My Pull Requests…"
          icon={Icon.List}
          onAction={() => {
            launchCommand({
              name: "my-pull-requests",
              type: LaunchType.UserInitiated,
            }).catch(() => undefined);
          }}
        />
      </MenuBarExtra.Section>
    </MenuBarExtra>
  );
}

export default withAccessToken(github)(PullRequestsMenuBar);
