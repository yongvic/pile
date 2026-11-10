import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseOffers } from "./csv";
import type { Interest, Opportunity, Organization, Profile, Report } from "./types";

export type DemoState = {
  profile: Profile | null;
  organizations: Organization[];
  opportunities: Opportunity[];
  patches: Record<string, Partial<Opportunity>>;
  interests: Interest[];
  reports: Report[];
};

const empty = (): DemoState => ({
  profile: null,
  organizations: [],
  opportunities: [],
  patches: {},
  interests: [],
  reports: [],
});

const filePath = path.join(process.cwd(), "data", "demo-state.json");
const csvPath = path.join(process.cwd(), "docs", "phase-0", "offres.csv");

let queue: Promise<unknown> = Promise.resolve();

async function readState(): Promise<DemoState> {
  try {
    const raw = await readFile(filePath, "utf8");
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

export function updateDemo(change: (state: DemoState) => void): Promise<DemoState> {
  const run = queue.then(async () => {
    const state = await readState();
    change(state);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(state, null, 2));
    return state;
  });
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readDemo(): Promise<DemoState> {
  return readState();
}

export async function readCatalog(): Promise<{ organizations: Organization[]; opportunities: Opportunity[] }> {
  const [csvText, state] = await Promise.all([readFile(csvPath, "utf8"), readState()]);
  const parsed = parseOffers(csvText);
  const organizations = new Map<string, Organization>();
  for (const organization of [...parsed.organizations, ...state.organizations]) {
    organizations.set(organization.id, organization);
  }
  const opportunities = parsed.opportunities.map((offer) => ({
    ...offer,
    ...state.patches[offer.id],
    id: offer.id,
  }));
  for (const extra of state.opportunities) {
    if (!opportunities.some((offer) => offer.id === extra.id)) opportunities.push(extra);
  }
  for (const offer of opportunities) {
    offer.organizationName = organizations.get(offer.organizationId)?.name ?? offer.organizationName;
  }
  return { organizations: [...organizations.values()], opportunities };
}

export function cvFilePath(profileId: string): string {
  return path.join(process.cwd(), "data", "cvs", `${profileId}.pdf`);
}
