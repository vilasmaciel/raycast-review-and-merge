import { Icon, Image, MenuBarExtra, open } from "@raycast/api";
import { PullRequest } from "../github/types";
import { approvePullRequest } from "../github/approvePullRequest";
import { confirmAndMerge } from "../github/mergePullRequest";
import { enableAutoMerge } from "../github/enableAutoMerge";
import { shortRepoName } from "../lib/groupByRepo";
import { menuBarStatusLine } from "../lib/menuBarStatus";
import {
  MenuBarAction,
  MenuBarSection,
  menuBarPrimaryAction,
} from "../lib/menuBarPrimaryAction";

interface Props {
  pr: PullRequest;
  section: MenuBarSection;
  viewerLogin: string | undefined;
  onRefresh: () => void;
}

interface ActionView {
  icon: Image.ImageLike;
  tooltip: string;
  run: () => void;
}

/** Icon, tooltip, and handler for the row's one-click smart action. */
function actionView(
  action: MenuBarAction,
  pr: PullRequest,
  onRefresh: () => void,
): ActionView {
  const label = `${shortRepoName(pr.repo)} #${pr.number}`;
  switch (action) {
    case "approve":
      return {
        icon: Icon.CheckCircle,
        tooltip: `Approve ${label}`,
        run: () => approvePullRequest(pr, onRefresh),
      };
    case "merge":
      return {
        icon: Icon.ArrowDownCircle,
        tooltip: `Merge ${label}`,
        run: () => confirmAndMerge(pr, onRefresh),
      };
    case "enable-auto-merge":
      return {
        icon: Icon.Bolt,
        tooltip: `Enable auto-merge on ${label}`,
        run: () => enableAutoMerge(pr, onRefresh),
      };
    case "open":
      return {
        icon: Icon.Globe,
        tooltip: `Open ${label} in browser`,
        run: () => open(pr.url),
      };
  }
}

export function PullRequestMenuItem({
  pr,
  section,
  viewerLogin,
  onRefresh,
}: Props) {
  const action = menuBarPrimaryAction(pr, section, viewerLogin);
  const primary = actionView(action, pr, onRefresh);
  const repo = `${shortRepoName(pr.repo)} #${pr.number}`;
  const statusLine = menuBarStatusLine(pr);
  const subtitle = statusLine ? `${repo} · ${statusLine}` : repo;

  return (
    <MenuBarExtra.Item
      title={pr.title}
      subtitle={subtitle}
      icon={primary.icon}
      tooltip={primary.tooltip}
      onAction={primary.run}
      alternate={
        action === "open" ? undefined : (
          <MenuBarExtra.Item
            title={pr.title}
            subtitle={`Open ${repo} in browser`}
            icon={Icon.Globe}
            onAction={() => open(pr.url)}
          />
        )
      }
    />
  );
}
