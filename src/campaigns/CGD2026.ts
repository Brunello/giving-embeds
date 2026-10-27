// Columbia Giving Day 2026 phases, shared by CGD2026.astro and
// CGD2026popup.astro. Each page renders the phase that's current at build time
// into its static HTML (so it reads correctly before/without JS), then its
// script re-picks the phase every second and swaps the copy in place, so an
// open page flips at the boundary without a reload.
//
// All times are pinned to Eastern with a fixed UTC offset (ISO 8601) so a
// phase starts at the same real-world instant for every visitor. DST runs
// until Nov 1, so Eastern = EDT = UTC-04:00 for all of these.
//
// Phases are in start order; the current one is the last whose start has
// passed (the first phase is the fallback before any start).

export type Site = "giving" | "alumni" | "magazine";

export interface BannerPhase {
    start: string;
    message: string;
    cta: string;
    countdownTo: string;
    links: Record<Site, string>;
}

export interface PopupPhase {
    start: string;
    // One entry per line.
    headline: string[];
    // Optional bold first line of the supporting text.
    lead?: string;
    body: string[];
    cta: string;
    link: string;
}

const BANNER_LINKS: Record<Site, string> = {
    giving: "https://givingday.columbia.edu/pages/columbia-giving-day-home?appeal_id=6ad28c45d6dbf72f7d158511&utm_source=Columbia%20Giving&utm_medium=website&utm_campaign=CGD2026banner",
    alumni: "https://givingday.columbia.edu/pages/columbia-giving-day-home?appeal_id=6aaab528aa7a08360c97a94d&utm_source=CAA%20Marketing&utm_medium=website&utm_campaign=CGD2026banner",
    magazine: "https://givingday.columbia.edu/pages/columbia-giving-day-home?appeal_id=6ac8ebc99dbe822ff177b7c1&utm_source=Columbia%20Magazine&utm_medium=website&utm_campaign=CGD2026banner",
};

const POPUP_LINK =
    "https://givingday.columbia.edu/pages/columbia-giving-day-home?appeal_id=6ad28c45d6dbf72f7d158511&utm_source=Columbia%20Giving&utm_medium=website&utm_campaign=CGD2026popup";

export const bannerPhases: BannerPhase[] = [
    {
        // Pre-Giving Day
        start: "2026-10-01T00:00:00-04:00",
        message: "Columbia Giving Day is Wednesday, October 28.",
        cta: "Learn More",
        countdownTo: "2026-10-27T23:59:59-04:00",
        links: BANNER_LINKS,
    },
    {
        // Day of Giving Day
        start: "2026-10-28T00:00:00-04:00",
        message: "Today is Columbia Giving Day!",
        cta: "Give Now",
        countdownTo: "2026-10-28T23:59:59-04:00",
        links: BANNER_LINKS,
    },
];

export const popupPhases: PopupPhase[] = [
    {
        // Pre-Giving Day
        start: "2026-10-01T00:00:00-04:00",
        headline: ["Wednesday, October 28, 2026"],
        lead: "Mark your calendar for Columbia Giving Day.",
        body: [
            "Join your Columbia community in supporting scholarship, research, and innovation.",
        ],
        cta: "Learn More",
        link: POPUP_LINK,
    },
    {
        // Day of Giving Day
        start: "2026-10-28T00:00:00-04:00",
        headline: ["Wednesday, October 28, 2026", "Today is Columbia Giving Day!"],
        body: [
            "Join your University community in supporting scholarship, research, and innovation.",
            "Amplify the impact of your gift through Columbia Giving Day Challenges—happening today\u00a0only.",
        ],
        cta: "Give Now",
        link: POPUP_LINK,
    },
];

export function currentPhase<T extends { start: string }>(phases: T[], now: number): T {
    let current = phases[0];
    for (const phase of phases) {
        if (Date.parse(phase.start) <= now) current = phase;
    }
    return current;
}

// Returns a clock for "now". Testing: ?now=2026-10-27T23:59:50-04:00 starts the
// clock at that instant and lets it keep running, so you can watch a phase
// boundary pass. Ignored if missing or unparseable.
export function clock(): () => number {
    const param = new URLSearchParams(window.location.search).get("now");
    const fake = param ? Date.parse(param) : NaN;
    if (isNaN(fake)) return () => Date.now();
    const offset = fake - Date.now();
    return () => Date.now() + offset;
}
