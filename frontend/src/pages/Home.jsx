import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { BLOOD_COMPATIBILITY, BLOOD_GROUPS, DISTRICTS, HOSPITALS } from "../constants";
import heroClinicImg from "../assets/images/hero_blood_clinic_1794828546655.jpg";
import labImg from "../assets/images/blood_bank_lab_1794828547381.jpg";
import eligibilityVideo from "../assets/eligibility.mp4";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  DropletFillIcon,
  HeartPulseIcon,
  ShieldCheckIcon,
  UserCheckIcon,
} from "../components/Icons";

const GUIDE_VIDEO_SRC = eligibilityVideo;
const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Register & Screen",
    description:
      "Complete a 2-minute donor profile with your blood group, district, and medical eligibility confirmation.",
    Icon: UserCheckIcon,
  },
  {
    step: "02",
    title: "Clinical Verification",
    description:
      "Hospital coordinators verify donor readiness and activate your profile for regional emergency matching.",
    Icon: ShieldCheckIcon,
  },
  {
    step: "03",
    title: "Donate & Save Lives",
    description:
      "Respond to urgent hospital blood requests or donate at any connected partner medical center.",
    Icon: HeartPulseIcon,
  },
];

const CLINICAL_FACTS = [
  {
    label: "Component separation",
    title: "One donation helps up to three patients",
    description:
      "A single 450 ml whole blood unit is separated into red cells, platelets, and plasma for trauma, surgery, and oncology care.",
  },
  {
    label: "No synthetic substitute",
    title: "Hospitals depend entirely on volunteer donors",
    description:
      "Human blood cannot be manufactured. Safe clinical reserves rely on regular community donations year-round.",
  },
  {
    label: "Short shelf life",
    title: "Red cells last 42 days · platelets last 5 days",
    description:
      "Continuous daily replenishment keeps surgical wards, maternity units, and emergency ICUs ready without delay.",
  },
  {
    label: "Complimentary health check",
    title: "Free vital & hemoglobin screening every visit",
    description:
      "Trained hospital staff check hemoglobin, blood pressure, and pulse before every donation—supporting thalassemia, trauma, and critical care.",
  },
];

const ELIGIBILITY_RULES = [
  "Aged between 18 and 60 years old with valid national identification",
  "Minimum body weight of 50 kg and in good general health on donation day",
  "At least 4 months (120 days) since your previous whole blood donation",
  "Normal hemoglobin level and no active fever, infection, or recent major surgery",
];

const FAQS = [
  {
    question: "How do I know if I am eligible to donate?",
    answer:
      "Review the standard screening criteria above before registering. On donation day, a hospital nurse or medical officer performs a quick hemoglobin, blood pressure, and health check to confirm final clearance.",
  },
  {
    question: "How often can I donate whole blood?",
    answer:
      "Standard whole blood intervals are every 4 months (120 days) so your iron stores recover safely. Your profile tracks your last donation date automatically.",
  },
  {
    question: "Can I direct my donation toward a specific request?",
    answer:
      "Yes. You can respond directly to an open hospital request or register in the general donor pool so nearby blood banks can contact you for compatible cross-matching.",
  },
  {
    question: "How can hospitals or organizers coordinate a blood drive?",
    answer:
      "Use the Contact page to reach the Blood Share regional coordination team for mobile unit scheduling, group drives, or inter-hospital stock transfers.",
  },
];

function parseCompatibleTypes(value, selectedType) {
  if (!value) return [];
  if (value.toLowerCase().includes("all types")) {
    return BLOOD_GROUPS.filter((group) => group !== selectedType);
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function Home() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [liveHospitals, setLiveHospitals] = useState([]);
  const [hospitalStocks, setHospitalStocks] = useState([]);
  const [searchBloodGroup, setSearchBloodGroup] = useState("All");
  const [searchDistrict, setSearchDistrict] = useState("All");
  const [loading, setLoading] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [labImgFailed, setLabImgFailed] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [compatMode, setCompatMode] = useState("give");
  const [bgPlaying, setBgPlaying] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    return true;
  });
  const [bgVideoFailed, setBgVideoFailed] = useState(false);
  const heroVideoRef = useRef(null);
  const guideVideoRef = useRef(null);

  useEffect(() => {
    [heroVideoRef.current, guideVideoRef.current].forEach((video) => {
      if (!video) return;
      if (bgPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [bgPlaying]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.publicOverview().catch(() => null),
      api.publicHospitals().catch(() => []),
      api.publicStock().catch(() => []),
    ])
      .then(([overviewData, hospitalsData, stockData]) => {
        if (!active) return;
        if (overviewData) setOverview(overviewData);
        const stocksList = overviewData?.hospitalStocks?.length
          ? overviewData.hospitalStocks
          : Array.isArray(stockData)
            ? stockData
            : [];
        if (stocksList.length) setHospitalStocks(stocksList);

        const rawList = overviewData?.hospitals?.length
          ? overviewData.hospitals
          : hospitalsData;
        if (Array.isArray(rawList) && rawList.length) {
          const normalized = rawList
            .map((item) => (typeof item === "string" ? item : item?.hospitalName))
            .filter(Boolean);
          if (normalized.length) setLiveHospitals(normalized);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const hospitalNames = liveHospitals.length ? liveHospitals : HOSPITALS;
  const hospitalUnitMap = useMemo(() => {
    const map = new Map();
    hospitalStocks.forEach((item) => {
      if (item?.hospitalName) map.set(item.hospitalName, Number(item.totalUnits || 0));
    });
    return map;
  }, [hospitalStocks]);

  const stats = [
    {
      label: "Registered Donors",
      value: overview ? Number(overview.totalDonors || 0).toLocaleString() : "—",
      context: overview
        ? `${Number(overview.activeDonors || 0).toLocaleString()} verified active today`
        : "Verified national donor registry",
    },
    {
      label: "Available Blood Units",
      value: overview ? Number(overview.availableUnits || 0).toLocaleString() : "—",
      context: `Across ${hospitalNames.length} partner hospital banks`,
    },
    {
      label: "Requests Fulfilled",
      value: overview ? Number(overview.requestsFulfilled || 0).toLocaleString() : "—",
      context: "Completed hospital blood dispatches",
    },
    {
      label: "Partner Hospitals",
      value: String(hospitalNames.length),
      context: "24/7 regional emergency coordination",
    },
  ];

  const recentRequests = useMemo(() => {
    return (overview?.recentRequests || [])
      .filter((request) => {
        if (request.status === "Fulfilled") return false;
        if (!request.requiredDate) return true;
        const [year, month, day] = request.requiredDate.split("-").map(Number);
        return new Date(year, month - 1, day) >= TODAY;
      })
      .sort((a, b) => {
        const rank = (urgency) =>
          /critical/i.test(urgency || "") ? 0 : /urgent/i.test(urgency || "") ? 1 : 2;
        const urgencyOrder = rank(a.urgency) - rank(b.urgency);
        if (urgencyOrder) return urgencyOrder;
        return (a.requiredDate || "9999-12-31").localeCompare(b.requiredDate || "9999-12-31");
      });
  }, [overview]);

  const highlightedMatches = useMemo(() => {
    if (!selectedType) return new Set();
    const record = BLOOD_COMPATIBILITY.find((item) => item.type === selectedType);
    if (!record) return new Set();
    const raw = compatMode === "give" ? record.give : record.receive;
    return new Set(parseCompatibleTypes(raw, selectedType));
  }, [selectedType, compatMode]);

  function requestTiming(request) {
    if (!request.requiredDate) return "Needed as soon as possible";
    const [year, month, day] = request.requiredDate.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);
    const daysUntil = Math.round((dueDate - TODAY) / 86400000);
    if (daysUntil === 0) return "Due today";
    if (daysUntil === 1) return "Due tomorrow";
    if (daysUntil <= 3) return `Due in ${daysUntil} days`;
    return `Required ${dueDate.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  }

  function submitDonorSearch(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchBloodGroup !== "All") params.set("bloodGroup", searchBloodGroup);
    if (searchDistrict !== "All") params.set("district", searchDistrict);
    navigate(`/search${params.size ? `?${params.toString()}` : ""}`);
  }

  return (
    <div>
      {/* 1. Hero Section + Quick Donor Search + Live KPI Strip */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        {!bgVideoFailed ? (
          <>
            <video
              ref={heroVideoRef}
              src={GUIDE_VIDEO_SRC}
              autoPlay={bgPlaying}
              loop
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
              onError={() => setBgVideoFailed(true)}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/80"
            />
          </>
        ) : null}

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid items-stretch gap-10 lg:grid-cols-12">
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-sm font-semibold text-red-600">
                Sri Lanka Hospital Blood Bank Network
              </p>
              <h1
                className="mt-3 max-w-xl font-bold tracking-tight text-slate-900"
                style={{
                  fontSize: "clamp(1.875rem, 4vw, 3.35rem)",
                  lineHeight: 1.1,
                  textWrap: "balance",
                }}
              >
                Give blood today. Keep every hospital ready.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Connect directly with verified donors, submit urgent patient blood
                requests, and track live transfusion reserves across{" "}
                {hospitalNames.length} major Sri Lankan medical centers.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/register"
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-red-700 sm:w-auto"
                >
                  <span>Donate Blood</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/need-blood"
                  className="inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 sm:w-auto"
                >
                  <span>Request Blood</span>
                </Link>
              </div>

              <form
                onSubmit={submitDonorSearch}
                className="mt-6 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm"
                aria-label="Quick donor search"
              >
                <p className="mb-2 text-xs font-semibold text-slate-600">
                  Quick Donor Finder
                </p>
                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                  <div>
                    <label className="sr-only" htmlFor="home-blood-group">
                      Blood group
                    </label>
                    <select
                      id="home-blood-group"
                      value={searchBloodGroup}
                      onChange={(event) => setSearchBloodGroup(event.target.value)}
                      className="min-h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                      <option value="All">Any blood group</option>
                      {BLOOD_GROUPS.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="sr-only" htmlFor="home-district">
                      District
                    </label>
                    <select
                      id="home-district"
                      value={searchDistrict}
                      onChange={(event) => setSearchDistrict(event.target.value)}
                      className="min-h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                    >
                      <option value="All">Any district</option>
                      {DISTRICTS.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="min-h-10 whitespace-nowrap rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-600"
                  >
                    Find Donors
                  </button>
                </div>
              </form>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-5 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span>{hospitalNames.length} Regional Hospitals</span>
                  <span aria-hidden="true">·</span>
                  <span>24/7 Emergency Coordination</span>
                  <span aria-hidden="true">·</span>
                  <span>Screened Donor Registry</span>
                </div>
                {!bgVideoFailed ? (
                  <button
                    type="button"
                    onClick={() => setBgPlaying((prev) => !prev)}
                    className="rounded-md border border-slate-200 bg-white/90 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                  >
                    {bgPlaying ? "Pause motion" : "Play motion"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-lg shadow-slate-900/5 sm:h-96 lg:h-full lg:min-h-[430px]">
                {heroImgFailed ? (
                  <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-red-50 via-white to-slate-100 p-8 text-center">
                    <HeartPulseIcon className="h-12 w-12 text-red-600" />
                    <p className="mt-4 text-lg font-semibold text-slate-900">
                      Clinical Blood Donation Network
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Connecting donors and hospital transfusion units
                    </p>
                  </div>
                ) : (
                  <>
                    <img
                      src={heroClinicImg}
                      alt="Nurse assisting a volunteer blood donor in a modern sunlit blood donation clinic"
                      referrerPolicy="no-referrer"
                      onError={() => setHeroImgFailed(true)}
                      className="h-full w-full object-cover"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/75 via-slate-950/35 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs font-semibold uppercase tracking-wider text-red-200">
                        National Donor Registry
                      </p>
                      <p className="mt-0.5 text-sm font-medium text-white/95">
                        Real-time blood bank stock &amp; verified donor matching across{" "}
                        {hospitalNames.length} hospitals
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 4-Column Live Network KPI Strip */}
          <div className="mt-10 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-white/85 p-5 shadow-xs backdrop-blur-md"
              >
                <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                {loading ? (
                  <div className="mt-2.5 h-8 w-20 animate-pulse rounded bg-slate-200" />
                ) : (
                  <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                    {stat.value}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-500">{stat.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Live Network Availability — Blood Stock by Group */}
      <section
        className="border-b border-slate-200 bg-slate-50"
        aria-labelledby="stock-strip-heading"
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-red-600">
                Live Network Availability
              </p>
              <h2
                id="stock-strip-heading"
                className="mt-1 text-2xl font-bold tracking-tight text-slate-900"
              >
                Blood stock by group
              </h2>
            </div>
            <div
              className="flex flex-wrap items-center gap-2"
              aria-label="Stock status legend"
            >
              <StatusBadge variant="success" label="Available (50+)" />
              <StatusBadge variant="warning" label="Low (25–49)" />
              <StatusBadge variant="danger" label="Critical (<25)" />
            </div>
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {BLOOD_GROUPS.map((group) => (
                <div
                  key={group}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="h-5 w-10 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-7 w-12 animate-pulse rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-16 animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : overview?.stockByGroup?.length ? (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {BLOOD_GROUPS.map((group) => {
                const stock = overview.stockByGroup.find(
                  (item) => item.bloodGroup === group
                );
                const units = Number(stock?.units || 0);
                const critical = units < 25;
                const low = units >= 25 && units < 50;
                const cardStyle = critical
                  ? "border-red-200 bg-red-50/40 hover:border-red-300"
                  : low
                    ? "border-amber-200 bg-amber-50/40 hover:border-amber-300"
                    : "border-slate-200 bg-white hover:border-slate-300";
                const valueClass = critical
                  ? "text-red-700"
                  : low
                    ? "text-amber-700"
                    : "text-emerald-700";
                const statusLabel = critical
                  ? "Critical"
                  : low
                    ? "Low"
                    : "Available";

                return (
                  <Link
                    key={group}
                    to={`/search?bloodGroup=${encodeURIComponent(group)}`}
                    className={`group rounded-xl border px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-sm ${cardStyle}`}
                    title={`Find ${group} donors`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-base font-bold text-slate-900">
                        {group}
                      </span>
                      <span className={`text-[11px] font-semibold ${valueClass}`}>
                        {statusLabel}
                      </span>
                    </div>
                    <p
                      className={`mt-1.5 font-mono text-2xl font-semibold tabular-nums ${valueClass}`}
                    >
                      {units}
                    </p>
                    <p className="mt-0.5 flex items-center justify-between text-xs text-slate-600">
                      <span>units</span>
                      <span className="font-medium text-red-600 opacity-0 transition-opacity group-hover:opacity-100">
                        Donors →
                      </span>
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p
              className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700"
              role="status"
            >
              Current stock totals are temporarily unavailable.
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <p>
              Combined unit totals from participating hospital blood banks. Click any blood
              group to search matching active donors.
            </p>
            <Link
              to="/hospitals"
              className="inline-flex items-center gap-1 whitespace-nowrap font-semibold text-red-600 hover:text-red-700"
            >
              <span>View stock by hospital</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Recent Blood Donation Requests */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-red-600">
                Active Hospital Demand
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Recent blood donation requests
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Prioritized upcoming patient requests across our partner hospitals.
              </p>
            </div>
            <Link
              to="/need-blood"
              className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-red-600 hover:text-red-700"
            >
              <span>Submit a patient request</span>
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {[1, 2].map((skeleton) => (
                <div
                  key={skeleton}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-1 items-center gap-3">
                      <div className="h-12 w-12 shrink-0 animate-pulse rounded-xl bg-red-50" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" />
                      </div>
                    </div>
                    <div className="h-6 w-20 animate-pulse rounded-md bg-slate-100" />
                  </div>
                  <div className="mt-5 flex justify-between border-t border-slate-100 pt-4">
                    <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                No open blood requests right now
              </p>
              <p className="mt-1 text-sm text-slate-600">
                No upcoming open requests are currently listed. Register as a donor so
                hospital coordinators can contact you when an urgent need arises.
              </p>
              <Link
                to="/register"
                className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Register as Donor
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {recentRequests.map((req) => {
                const isCritical = /critical/i.test(req.urgency || "");
                const isUrgent = /urgent/i.test(req.urgency || "");
                const isHighPriority = isCritical || isUrgent;
                return (
                  <article
                    key={req.id}
                    className={`flex flex-col justify-between rounded-xl border p-6 transition-all hover:shadow-sm ${
                      isHighPriority
                        ? "border-red-200 bg-red-50/25 hover:border-red-300"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 font-mono text-base font-bold text-red-700 ring-1 ring-red-200/70">
                          {req.bloodGroupType}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900">
                            {req.hospitalAddress}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-600">
                            {req.units} unit(s) needed · {req.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-1.5">
                        {isCritical ? (
                          <StatusBadge variant="danger" label="Critical" showIcon />
                        ) : isUrgent ? (
                          <StatusBadge variant="danger" label="Urgent" showIcon />
                        ) : null}
                        <StatusBadge
                          variant={
                            req.requiredDate && requestTiming(req).startsWith("Due")
                              ? "warning"
                              : "neutral"
                          }
                          label={requestTiming(req)}
                        />
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/70 pt-4 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5 tabular-nums">
                        <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        {req.status || "Pending"} request
                      </span>
                      <div className="flex items-center gap-4">
                        <Link
                          to={`/search?bloodGroup=${encodeURIComponent(req.bloodGroupType)}`}
                          className="font-medium text-slate-600 hover:text-slate-900"
                        >
                          Matching donors
                        </Link>
                        <Link
                          to="/register"
                          className="font-semibold text-red-600 hover:text-red-700"
                        >
                          Volunteer to donate →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-red-600">Donation Process</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              How Blood Share coordinates every donation
            </h2>
            <p className="mt-3 text-base text-slate-600">
              A structured three-step clinical workflow ensuring donor safety and
              rapid hospital matching.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => {
              const StepIcon = item.Icon;
              return (
                <article
                  key={item.step}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                      <StepIcon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-sm font-semibold text-slate-400 tabular-nums">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.step === "03"
                      ? `Respond to urgent hospital blood requests or donate at any of our ${hospitalNames.length} connected medical centers.`
                      : item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Clinical Impact, Essential Facts & Donor Eligibility Criteria */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-start gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="text-sm font-semibold text-red-600">Clinical Impact</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Why regular blood donation matters
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
                Consistent community donations keep emergency surgeries, trauma wards,
                and thalassemia care running without interruption.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {CLINICAL_FACTS.map((fact) => (
                  <article
                    key={fact.title}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-5"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-600">
                      <DropletFillIcon className="h-3.5 w-3.5 shrink-0" />
                      <span>{fact.label}</span>
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">
                      {fact.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                      {fact.description}
                    </p>
                  </article>
                ))}
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Clinical references:{" "}
                <a
                  className="font-medium text-slate-700 underline underline-offset-2 hover:text-red-600"
                  href="https://www.who.int/news-room/questions-and-answers/item/blood-products-why-should-i-donate-blood"
                  target="_blank"
                  rel="noreferrer"
                >
                  World Health Organization
                </a>
                {" · "}
                <a
                  className="font-medium text-slate-700 underline underline-offset-2 hover:text-red-600"
                  href="https://www.redcrossblood.org/donate-blood/blood-donation-process/what-happens-to-donated-blood.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  American Red Cross
                </a>
              </p>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-7">
                <div className="flex items-center gap-2.5 text-slate-900">
                  <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
                  <h3 className="text-lg font-semibold">
                    Donor Eligibility Criteria
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Before registering, review the standard medical screening
                  requirements for safe whole blood donation.
                </p>
                <ul className="mt-5 space-y-3.5">
                  {ELIGIBILITY_RULES.map((rule) => (
                    <li
                      key={rule}
                      className="flex items-start gap-3 text-sm text-slate-700"
                    >
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <Link
                    to="/register"
                    className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    Check Eligibility &amp; Register
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Interactive Blood Group Compatibility Matrix */}
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-red-600">
                Interactive Compatibility Reference
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Blood group donation matrix
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Select any blood group card to highlight compatible recipients or
                donors alongside our visual transfusion guide.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div
                className="inline-flex rounded-lg border border-slate-200 bg-white p-1"
                role="group"
                aria-label="Compatibility filter mode"
              >
                <button
                  type="button"
                  onClick={() => setCompatMode("give")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    compatMode === "give"
                      ? "bg-red-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Can Give To
                </button>
                <button
                  type="button"
                  onClick={() => setCompatMode("receive")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    compatMode === "receive"
                      ? "bg-red-600 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Can Receive From
                </button>
              </div>
              {selectedType ? (
                <button
                  type="button"
                  onClick={() => setSelectedType(null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Reset ({selectedType})
                </button>
              ) : null}
              {!bgVideoFailed ? (
                <button
                  type="button"
                  onClick={() => setBgPlaying((prev) => !prev)}
                  className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  {bgPlaying ? "Pause Guide Video" : "Play Guide Video"}
                </button>
              ) : null}
            </div>
          </div>

          {selectedType ? (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm">
              <p className="text-slate-700">
                <span className="font-mono font-bold text-red-700">{selectedType}</span>{" "}
                {compatMode === "give"
                  ? "red cells can be transfused to:"
                  : "patients can safely receive from:"}{" "}
                <span className="font-semibold text-slate-900">
                  {Array.from(highlightedMatches).join(", ") || selectedType}
                </span>
              </p>
              <span className="text-xs text-slate-500">
                Hospital teams always run cross-matching before transfusion.
              </span>
            </div>
          ) : null}

          <div className="mt-8 grid items-start gap-6 lg:grid-cols-12">
            {!bgVideoFailed ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#faf2ee] shadow-xs lg:col-span-4">
                <video
                  ref={guideVideoRef}
                  src={GUIDE_VIDEO_SRC}
                  autoPlay={bgPlaying}
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  aria-label="Animated blood donation compatibility guide showing donor and recipient blood types"
                  onError={() => setBgVideoFailed(true)}
                  className="block h-auto w-full"
                />
              </div>
            ) : null}

            <div
              className={`grid gap-4 sm:grid-cols-2 ${
                !bgVideoFailed ? "lg:col-span-8" : "lg:col-span-12 lg:grid-cols-4"
              }`}
            >
              {BLOOD_COMPATIBILITY.map((group) => {
                const isSelected = selectedType === group.type;
                const isMatch = highlightedMatches.has(group.type);
                const isDimmed = selectedType && !isSelected && !isMatch;

                return (
                  <button
                    key={group.type}
                    type="button"
                    onClick={() =>
                      setSelectedType((prev) =>
                        prev === group.type ? null : group.type
                      )
                    }
                    aria-pressed={isSelected}
                    className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-red-500 bg-red-50/70 ring-2 ring-red-200"
                        : isMatch
                          ? "border-emerald-300 bg-emerald-50/50"
                          : isDimmed
                            ? "border-slate-200 bg-white/70 opacity-60 hover:opacity-100"
                            : "border-slate-200 bg-white hover:border-red-200 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span
                        className={`font-mono text-2xl font-bold ${
                          isMatch && !isSelected ? "text-emerald-700" : "text-red-600"
                        }`}
                      >
                        {group.type}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {isSelected
                          ? "Selected"
                          : isMatch
                            ? compatMode === "give"
                              ? "Compatible recipient"
                              : "Compatible donor"
                            : "Click to inspect"}
                      </span>
                    </div>
                    <dl className="mt-3 grid w-full grid-cols-2 gap-3 text-xs">
                      <div>
                        <dt className="font-medium text-slate-500">Can give to</dt>
                        <dd className="mt-0.5 font-medium text-slate-900">
                          {group.give}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-slate-500">
                          Can receive from
                        </dt>
                        <dd className="mt-0.5 font-medium text-slate-900">
                          {group.receive}
                        </dd>
                      </div>
                    </dl>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Connected Partner Hospital Network */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-md shadow-slate-900/5">
                {labImgFailed ? (
                  <div className="flex h-72 flex-col items-center justify-center p-8 text-center">
                    <BuildingIcon className="h-10 w-10 text-red-600" />
                    <p className="mt-3 text-base font-semibold text-slate-900">
                      Regional Hospital Blood Bank Network
                    </p>
                  </div>
                ) : (
                  <img
                    src={labImg}
                    alt="Clinical laboratory technician preparing screened blood reserves in a hospital blood bank"
                    referrerPolicy="no-referrer"
                    onError={() => setLabImgFailed(true)}
                    className="h-72 w-full object-cover sm:h-80 lg:h-96"
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-7">
              <p className="text-sm font-semibold text-red-600">
                Hospital Blood Bank Network
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                {hospitalNames.length} connected teaching &amp; general hospitals
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Participating blood banks maintain synchronized unit inventories and
                coordinate emergency cross-matching and regional stock transfers across
                Sri Lanka.
              </p>

              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {hospitalNames.map((hospital) => {
                  const units = hospitalUnitMap.get(hospital);
                  return (
                    <li key={hospital}>
                      <Link
                        to="/hospitals"
                        className="flex items-center justify-between gap-2.5 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-800 transition-colors hover:border-red-200 hover:bg-white"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <BuildingIcon className="h-4 w-4 shrink-0 text-red-600" />
                          <span className="truncate">{hospital}</span>
                        </span>
                        {typeof units === "number" ? (
                          <span className="shrink-0 font-mono text-xs font-semibold text-slate-600 tabular-nums">
                            {units} units
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/hospitals"
                  className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  <span>View Stock by Hospital</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                >
                  Become a Registered Donor
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold text-red-600">Quick Answers</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Questions about donating
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Need help with a blood drive or specific clinical request?{" "}
              <Link
                to="/contact"
                className="font-semibold text-red-600 underline underline-offset-2 hover:text-red-700"
              >
                Contact the coordination team
              </Link>
              .
            </p>
          </div>

          <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-6">
            {FAQS.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-slate-900 transition-colors hover:text-red-600 [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <ChevronRightIcon className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-90 group-open:text-red-600" />
                </summary>
                <p className="mt-2.5 pr-6 text-sm leading-relaxed text-slate-600">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
