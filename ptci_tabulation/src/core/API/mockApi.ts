/**
 * Mock API adapter — lets the frontend run WITHOUT the PHP backend.
 *
 * Enabled only when `VITE_MOCK_API=true` is set in `.env`. When active, every
 * axios request is answered locally (with a small artificial delay) from an
 * in-browser dataset persisted in localStorage, so login, session checks,
 * candidate CRUD, score submissions and the admin scoreboards all work.
 *
 * Login: any non-empty username/password is accepted.
 *   - username containing "admin"  -> admin role  (e.g. `admin` / `123`)
 *   - anything else                 -> judge role  (e.g. `judge1` / `123`)
 *
 * Remove the flag from `.env` (or set it to false) once the real backend
 * is available — nothing else needs to change.
 */
import { AxiosError, type AxiosAdapter, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import type { UserData } from "../../features/auth/types/types";
import type { CandidatesData, CandidateTeamOptions, GenderOptions } from "../../features/settings/types/candidates";

export const IS_MOCK_API = import.meta.env.VITE_MOCK_API === "true";

const STORAGE_KEY = "mock-api:v1";
const MIN_DELAY_MS = 200;
const MAX_DELAY_MS = 500;

type Category = "production" | "uniform" | "swimwear" | "formalwear" | "qna" | "talent" | "top_5";

type ScoreRow = {
    score_id: string;
    judge_id: string;
    cand_id: string;
    fields: Record<string, number>;
    total_score: number;
    created_at: string;
};

type MockState = {
    session: UserData | null;
    users: Record<string, UserData>;
    candidates: CandidatesData[];
    scores: Record<Category, ScoreRow[]>;
    nextCandId: number;
    nextScoreId: number;
};

const CATEGORY_FIELDS: Record<Category, string[]> = {
    production: ["choreography", "projection", "audience_impact"],
    uniform: ["poise_and_bearings", "personality_and_projection", "neatness", "overall_impact"],
    swimwear: ["stage_presence", "figure_and_fitness", "poise_and_bearing", "overall_impact"],
    formalwear: ["poise_and_bearing", "personality/projection", "appropriateness/ellegance", "overall_impact"],
    qna: ["total_score"],
    talent: ["mastery", "performance_choreography", "overall_impression", "audience_impact"],
    top_5: ["qna", "beauty"],
};

const SEED_JUDGE_IDS = ["1", "2", "3"];
const TEAMS: CandidateTeamOptions[] = ["red", "yellow", "green", "purple", "blue"];
const MALE_NAMES = ["Juan Dela Cruz", "Miguel Santos", "Carlo Reyes", "Paolo Garcia", "Rafael Mendoza", "Gabriel Torres", "Marco Villanueva", "Enzo Bautista", "Andres Ramos", "Luis Fernandez"];
const FEMALE_NAMES = ["Maria Clara", "Andrea Santos", "Bianca Reyes", "Sofia Garcia", "Isabella Mendoza", "Angela Torres", "Camille Villanueva", "Nicole Bautista", "Patricia Ramos", "Katrina Fernandez"];

// ---------- helpers ----------

const nowIso = () => new Date().toISOString().slice(0, 19).replace("T", " ");
const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const round2 = (n: number) => Math.round(n * 100) / 100;
const avg = (nums: number[]) => (nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0);

/** Deterministic 1–10 score so seeded data is stable between reloads. */
const seededScore = (candIdx: number, judgeIdx: number, fieldIdx: number) =>
    5 + ((candIdx * 7 + judgeIdx * 3 + fieldIdx * 5) % 6);

/** Small stable hash so each judge username gets its own id. */
const hashId = (s: string) => {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return String(1000 + (h % 9000));
};

const buildCandidates = (): CandidatesData[] => {
    const make = (names: string[], gender: GenderOptions, offset: number): CandidatesData[] =>
        names.map((name, i) => ({
            cand_id: String(offset + i + 1),
            cand_number: String(i + 1),
            cand_name: name,
            cand_team: TEAMS[i % TEAMS.length]!,
            cand_gender: gender,
            created_at: nowIso(),
        }));
    return [...make(MALE_NAMES, "male", 0), ...make(FEMALE_NAMES, "female", MALE_NAMES.length)];
};

const seedScores = (candidates: CandidatesData[], category: Category, startId: number): ScoreRow[] => {
    const rows: ScoreRow[] = [];
    let id = startId;
    candidates.forEach((c, ci) => {
        SEED_JUDGE_IDS.forEach((judgeId, ji) => {
            const fields: Record<string, number> = {};
            CATEGORY_FIELDS[category].forEach((f, fi) => (fields[f] = seededScore(ci, ji, fi)));
            rows.push({
                score_id: String(id++),
                judge_id: judgeId,
                cand_id: c.cand_id,
                fields,
                total_score: Object.values(fields).reduce((a, b) => a + b, 0),
                created_at: nowIso(),
            });
        });
    });
    return rows;
};

const buildInitialState = (): MockState => {
    const candidates = buildCandidates();
    // Seed admin-side scoreboards with three fake judges; leave the other
    // categories empty so the judge forms can be exercised from scratch.
    const talent = seedScores(candidates, "talent", 1);
    const uniform = seedScores(candidates, "uniform", 1000);
    const top5 = seedScores(candidates, "top_5", 2000);
    return {
        session: null,
        users: {},
        candidates,
        scores: { production: [], uniform, swimwear: [], formalwear: [], qna: [], talent, top_5: top5 },
        nextCandId: candidates.length + 1,
        nextScoreId: 5000,
    };
};

const saveState = (state: MockState) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore quota errors */ }
};

const loadState = (): MockState => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as MockState;
    } catch { /* fall through to a fresh state */ }
    const fresh = buildInitialState();
    saveState(fresh);
    return fresh;
};

/** Wipes the mock dataset (session, candidates, scores) and reloads. */
export const resetMockApi = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("rulesAgreed");
    window.location.reload();
};

// ---------- request/response plumbing ----------

class MockHttpError extends Error {
    status: number;
    body: unknown;
    constructor(status: number, body: unknown) {
        super(`Mock HTTP ${status}`);
        this.status = status;
        this.body = body;
    }
}

const fail = (status: number, message: string): never => {
    throw new MockHttpError(status, { status, message });
};

const parseBody = (config: InternalAxiosRequestConfig): Record<string, unknown> => {
    const d = config.data;
    if (d == null || d === "") return {};
    if (typeof d === "string") { try { return JSON.parse(d); } catch { return {}; } }
    return d as Record<string, unknown>;
};

const num = (v: unknown) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };
const str = (v: unknown) => (v == null ? "" : String(v));

const candidateById = (state: MockState, id: string) => state.candidates.find((c) => c.cand_id === id);

// ---------- endpoint handlers ----------

type Handler = (ctx: { state: MockState; body: Record<string, unknown>; query: URLSearchParams }) => unknown;

const requireSession = (state: MockState): UserData => state.session ?? fail(401, "Unauthorized. Please log in.");

const submitScore = (category: Category): Handler => ({ state, body }) => {
    const user = requireSession(state);
    const candId = str(body.cand_id);
    if (!candidateById(state, candId)) fail(404, "Contestant not found.");
    if (state.scores[category].some((s) => s.judge_id === user.id && s.cand_id === candId))
        fail(422, "You have already submitted a score for this candidate.");

    const fields: Record<string, number> = {};
    for (const f of CATEGORY_FIELDS[category]) fields[f] = num(body[f]);
    const total = Object.values(fields).reduce((a, b) => a + b, 0);
    const row: ScoreRow = { score_id: String(state.nextScoreId++), judge_id: user.id, cand_id: candId, fields, total_score: total, created_at: nowIso() };
    state.scores[category].push(row);
    return { status: 200, message: "Score submitted successfully.", score_id: Number(row.score_id), total_score: String(total), has_submitted: true };
};

const talentTotalsByCandidate = (state: MockState) => {
    const map = new Map<string, number[]>();
    for (const s of state.scores.talent) map.set(s.cand_id, [...(map.get(s.cand_id) ?? []), s.total_score]);
    return map;
};

const handlers: Record<string, Partial<Record<string, Handler>>> = {
    "/auth/login": {
        POST: ({ state, body }) => {
            const username = str(body.username).trim();
            const password = str(body.password);
            if (!username || !password) fail(422, "Username and password are required.");
            const role = username.toLowerCase().includes("admin") ? "admin" : "judge";
            const id = role === "admin" ? "1" : hashId(username);
            const existing = state.users[id];
            const user: UserData = existing ?? { id, username, role, has_submitted: false };
            state.users[id] = user;
            state.session = user;
            return { status: 200, loggedIn: true, user, redirect: role === "admin" ? "/dashboard" : "/judge" };
        },
    },
    "/auth/check-session": {
        POST: ({ state }) => {
            const user = state.session ?? fail(401, "No active session.");
            return { status: 200, loggedIn: true, user };
        },
    },
    "/auth/logout": {
        POST: ({ state }) => {
            state.session = null;
            return { status: 200, loggedIn: false, message: "Logged out." };
        },
    },
    "/auth/has-submitted": {
        PUT: ({ state }) => {
            const user = requireSession(state);
            const updated = { ...user, has_submitted: true };
            state.users[user.id] = updated;
            state.session = updated;
            return { status: "success", message: "User marked as submitted.", has_submitted: true };
        },
    },

    "/contestants": {
        GET: ({ state }) => ({ status: 200, message: "Contestants fetched successfully.", data: state.candidates }),
        POST: ({ state, body }) => {
            requireSession(state);
            const cand: CandidatesData = {
                cand_id: String(state.nextCandId++),
                cand_number: str(body.cand_number),
                cand_name: str(body.cand_name),
                cand_team: str(body.cand_team) as CandidateTeamOptions,
                cand_gender: str(body.cand_gender) as GenderOptions,
                created_at: nowIso(),
            };
            if (!cand.cand_name || !cand.cand_number) fail(422, "Candidate number and name are required.");
            state.candidates.push(cand);
            return { status: "success", message: "Contestant created successfully." };
        },
    },
    "/contestants/:id": {
        PUT: ({ state, body }) => {
            requireSession(state);
            const cand = candidateById(state, str(body.cand_id)) ?? fail(404, "Contestant not found.");
            cand.cand_number = str(body.cand_number ?? cand.cand_number);
            cand.cand_name = str(body.cand_name ?? cand.cand_name);
            cand.cand_team = str(body.cand_team ?? cand.cand_team) as CandidateTeamOptions;
            cand.cand_gender = str(body.cand_gender ?? cand.cand_gender) as GenderOptions;
            return { status: "success", message: "Contestant updated successfully." };
        },
        DELETE: ({ state, body }) => {
            requireSession(state);
            const id = str(body.cand_id);
            if (!candidateById(state, id)) fail(404, "Contestant not found.");
            state.candidates = state.candidates.filter((c) => c.cand_id !== id);
            for (const cat of Object.keys(state.scores) as Category[])
                state.scores[cat] = state.scores[cat].filter((s) => s.cand_id !== id);
            return { status: "success", message: "Contestant deleted successfully." };
        },
    },

    "/scores/production": { POST: submitScore("production") },
    "/scores/uniform": { POST: submitScore("uniform") },
    "/scores/swimwear": { POST: submitScore("swimwear") },
    "/scores/formalwear": { POST: submitScore("formalwear") },
    "/scores/qna": { POST: submitScore("qna") },
    "/scores/talent": { POST: submitScore("talent") },
    "/scores/top-five": { POST: submitScore("top_5") },

    "/scores/uniform/final": {
        GET: ({ state }) => {
            requireSession(state);
            const data = state.candidates.flatMap((c) => {
                const rows = state.scores.uniform.filter((s) => s.cand_id === c.cand_id);
                if (!rows.length) return [];
                const f = (k: string) => String(round2(avg(rows.map((r) => r.fields[k] ?? 0))));
                return [{
                    score_id: rows[0]!.score_id,
                    cand_id: c.cand_id, cand_number: c.cand_number, cand_name: c.cand_name,
                    cand_team: c.cand_team, cand_gender: c.cand_gender,
                    poise_and_bearings: f("poise_and_bearings"),
                    personality_and_projection: f("personality_and_projection"),
                    neatness: f("neatness"),
                    overall_impact: f("overall_impact"),
                    total_score: String(round2(avg(rows.map((r) => r.total_score)))),
                }];
            });
            return { stats: 200, status: 200, message: "Uniform scores fetched successfully.", data };
        },
    },
    "/scores/talent/judges": {
        GET: ({ state, query }) => {
            requireSession(state);
            const gender = query.get("gender") ?? "male";
            const data: Record<string, unknown[]> = {};
            for (const s of state.scores.talent) {
                const c = candidateById(state, s.cand_id);
                if (!c || c.cand_gender !== gender) continue;
                (data[s.judge_id] ??= []).push({
                    score_id: s.score_id, cand_id: c.cand_id, cand_number: c.cand_number, cand_name: c.cand_name,
                    cand_team: c.cand_team, cand_gender: c.cand_gender, judge_id: s.judge_id,
                    mastery: String(s.fields.mastery ?? 0),
                    performance_choreography: String(s.fields.performance_choreography ?? 0),
                    overall_impression: String(s.fields.overall_impression ?? 0),
                    audience_impact: String(s.fields.audience_impact ?? 0),
                    total_score: String(s.total_score),
                });
            }
            return { status: 200, message: "Judge scores fetched successfully.", data };
        },
    },
    "/scores/talent/final": {
        GET: ({ state, query }) => {
            requireSession(state);
            const gender = query.get("gender") ?? "male";
            const totals = talentTotalsByCandidate(state);
            const data = state.candidates
                .filter((c) => c.cand_gender === gender && totals.has(c.cand_id))
                .map((c) => ({
                    cand_id: c.cand_id, cand_number: c.cand_number, cand_name: c.cand_name,
                    cand_team: c.cand_team, cand_gender: c.cand_gender,
                    talent_final_score: String(round2(avg(totals.get(c.cand_id)!))),
                    created_at: c.created_at, updated_at: nowIso(),
                }))
                .sort((a, b) => Number(b.talent_final_score) - Number(a.talent_final_score));
            return { status: 200, message: "Talent final scores fetched successfully.", data };
        },
    },
    "/scores/top-five/candidates": {
        GET: ({ state }) => {
            requireSession(state);
            const totals = talentTotalsByCandidate(state);
            const topFor = (gender: GenderOptions) => state.candidates
                .filter((c) => c.cand_gender === gender)
                .map((c) => ({
                    cand_id: c.cand_id, cand_number: c.cand_number, cand_name: c.cand_name,
                    cand_team: c.cand_team, cand_gender: c.cand_gender,
                    total_score: String(round2(avg(totals.get(c.cand_id) ?? [0]))),
                }))
                .sort((a, b) => Number(b.total_score) - Number(a.total_score))
                .slice(0, 5);
            return { status: 200, message: "Top 5 candidates fetched successfully.", data: [...topFor("male"), ...topFor("female")] };
        },
    },
};

// ---------- the adapter ----------

const mockAdapter: AxiosAdapter = async (config) => {
    const url = new URL(config.url ?? "/", "http://mock.local");
    const method = (config.method ?? "get").toUpperCase();
    // Parametric route: /contestants/:id -> handler key "/contestants/:id" with cand_id taken from the URL
    const idMatch = /^\/contestants\/(\d+)$/.exec(url.pathname);
    const routeKey = idMatch ? "/contestants/:id" : url.pathname;
    const route = handlers[routeKey];
    const handler = route?.[method];

    await sleep(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));

    const respond = (status: number, data: unknown): AxiosResponse => ({
        data, status, statusText: status === 200 ? "OK" : "Error",
        headers: {}, config, request: { mock: true },
    });

    try {
        if (!route) fail(404, `Mock endpoint not found: ${routeKey}`);
        if (!handler) fail(405, `Method ${method} not allowed on ${url.pathname}`);

        const state = loadState();
        const body = parseBody(config);
        if (idMatch) body.cand_id = idMatch[1];
        const data = handler!({ state, body, query: url.searchParams });
        saveState(state);
        return respond(200, data);
    } catch (e) {
        if (e instanceof MockHttpError) {
            const response = respond(e.status, e.body);
            const code = e.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST;
            throw new AxiosError(`Request failed with status code ${e.status}`, code, config, response.request, response);
        }
        throw e;
    }
};

export const installMockApi = (instance: AxiosInstance) => {
    instance.defaults.adapter = mockAdapter;
    console.info("%c[MOCK API] Backend calls are being answered locally. Set VITE_MOCK_API=false in .env to disable.", "color:#a68c6a;font-weight:bold");
};
