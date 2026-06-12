import { getPreferenceValues } from "@raycast/api";

interface Preferences {
  githubToken: string;
  organization?: string;
}

export function getOrganization(): string | undefined {
  const organization = getPreferenceValues<Preferences>().organization?.trim();
  return organization ? organization : undefined;
}
