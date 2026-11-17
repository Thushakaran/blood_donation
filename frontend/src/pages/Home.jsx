import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { BLOOD_COMPATIBILITY, BLOOD_GROUPS, DISTRICTS } from "../constants";
import heroClinicImg from "../assets/images/hero_blood_clinic_1794828546655.jpg";
import eligibilityVideo from "../assets/eligibility.mp4";
import StatusBadge from "../components/StatusBadge";
import {
  ArrowRightIcon,
  BuildingIcon,
  CalendarIcon,
  CheckCircleIcon,
  DropletFillIcon,
  HeartPulseIcon,
  ShieldCheckIcon,
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
  },
  {
    step: "02",
    title: "Clinical Verification",
    description:
      "Hospital coordinators verify donor readiness and activate your profile for regional emergency matching.",
  },
  {
    step: "03",
    title: "Donate & Save Lives",
    description:
      "Respond to urgent hospital blood requests or donate at any of our 10 connected medical centers.",
  },
];

const WHY_DONATE = [
  {
    title: "Three Lives From One Donation",
    description:
      "Every 450 ml whole blood donation is separated into red blood cells, plasma, and platelets for surgical, trauma, and oncology patients.",
  },
  {
    title: "Continuous Hospital Readiness",
    description:
      "Red cells have a 42-day shelf life and platelets last just 5 days, requiring steady daily replenishment across regional blood banks.",
  },
  {
    title: "Complimentary Health Screening",
    description:
      "Each visit includes hemoglobin, blood pressure, pulse, and infectious-disease screening performed by certified hospital staff.",
  },
];

const BLOOD_FACTS = [
  {
    label: "One donation",
    title: "Can help up to three people",
    description:
      "Donated blood can be separated into red cells, platelets, and plasma so different patients can receive the components they need.",
  },
  {
    label: "No substitute",
    title: "Blood depends on donors",
    description:
      "Blood for transfusion cannot be manufactured. Hospitals depend on people choosing to donate.",
  },
  {
    label: "Short shelf life",
    title: "Supplies need regular renewal",
    description:
      "Red cells may be stored for up to 42 days, while platelets are typically stored for up to five days.",
  },
  {
    label: "Compatibility",
    title: "Blood groups are not interchangeable",
    description:
      "O negative red cells are often used when an emergency transfusion needs to start before a patient's type is known. Clinical teams still confirm compatibility.",
  },
  {
    label: "Since 1901",
    title: "Blood groups have a history",
    description:
      "Karl Landsteiner identified the ABO blood groups in 1901. World Blood Donor Day is observed on June 14, his birthday.",
  },
  {
    label: "Who needs blood",
    title: "Donations support many kinds of care",
    description:
      "Transfusions may be needed after accidents or surgery, during childbirth or cancer treatment, and for blood disorders such as thalassemia.",
  },
];

const ELIGIBILITY_RULES = [
  "Aged between 18 and 60 years old with valid national identification",
  "Minimum body weight of 50 kg and in good general health on donation day",
  "At least 4 months (120 days) since your previous whole blood donation",
  "Normal hemoglobin level and no active fever, infection, or recent major surgery",
];

const TESTIMONIALS = [
  {
    quote:
      "When a surgical ward faces a critical O- shortage, fast coordination with eligible donors can help the care team respond.",
    name: "Hospital coordination example",
    role: "Illustrative scenario",
  },
  {
    quote:
      "Clear donation guidance and hospital contact details can make it easier for volunteers to plan a return donation.",
    name: "Volunteer donor example",
    role: "Illustrative scenario",
  },
  {
    quote:
      "Sharing current stock levels can help hospitals coordinate transfers when a local supply is low.",
    name: "Hospital network example",
    role: "Illustrative scenario",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [searchBloodGroup, setSearchBloodGroup] = useState("All");
  const [searchDistrict, setSearchDistrict] = useState("All");
  const [loading, setLoading] = useState(true);
  const [heroImgFailed, setHeroImgFailed] = useState(false);
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
    api
      .publicOverview()
      .then((data) => {
        if (active) setOverview(data);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const stats = [
    { label: "Blood groups supported", value: "8", context: "Across the ABO and Rh groups" },
    { label: "Potential components", value: "3", context: "Red cells, platelets, and plasma" },
    { label: "Red cell storage", value: "Up to 42 days", context: "Duration depends on preparation" },
    { label: "Platelet storage", value: "About 5 days", context: "Short shelf life calls for steady donations" },
  ];

  const recentRequests = (overview?.recentRequests || [])
    .filter((request) => {
      if (request.status === "Fulfilled") return false;
      if (!request.requiredDate) return true;
      const [year, month, day] = request.requiredDate.split("-").map(Number);
      return new Date(year, month - 1, day) >= TODAY;
    })
    .sort((a, b) => {
      const rank = (urgency) => /critical/i.test(urgency || "") ? 0 : /urgent/i.test(urgency || "") ? 1 : 2;
      const urgencyOrder = rank(a.urgency) - rank(b.urgency);
      if (urgencyOrder) return urgencyOrder;
      return (a.requiredDate || "9999-12-31").localeCompare(b.requiredDate || "9999-12-31");
    });

  function requestTiming(request) {
    if (!request.requiredDate) return "Needed as soon as possible";
    const [year, month, day] = request.requiredDate.split("-").map(Number);
    const dueDate = new Date(year, month - 1, day);
    const daysUntil = Math.round((dueDate - TODAY) / 86400000);
    if (daysUntil === 0) return "Due today";
    if (daysUntil === 1) return "Due tomorrow";
    if (daysUntil <= 2) return `Due in ${daysUntil} days`;
    return `Required ${dueDate.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`;
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
      {/* Hero Section with subtle looping background video */}
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
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/75"
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
                  fontSize: "clamp(1.875rem, 4vw, 3.5rem)",
                  lineHeight: 1.1,
                  textWrap: "balance",
                }}
              >
                Give blood today. Keep every hospital ready.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                Connect directly with verified donors, submit urgent hospital
                blood requests, and support safe transfusion reserves across 10
                major Sri Lankan medical centers.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
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
                className="mt-5 grid gap-2 rounded-xl border border-slate-200 bg-white/95 p-3 shadow-sm sm:grid-cols-[1fr_1fr_auto]"
                aria-label="Search for blood donors"
              >
                <label className="sr-only" htmlFor="home-blood-group">Blood group</label>
                <select
                  id="home-blood-group"
                  value={searchBloodGroup}
                  onChange={(event) => setSearchBloodGroup(event.target.value)}
                  className="min-h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                >
                  <option value="All">Any blood group</option>
                  {BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}
                </select>
                <label className="sr-only" htmlFor="home-district">District</label>
                <select
                  id="home-district"
                  value={searchDistrict}
                  onChange={(event) => setSearchDistrict(event.target.value)}
                  className="min-h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-100"
                >
                  <option value="All">Any district</option>
                  {DISTRICTS.map((district) => <option key={district}>{district}</option>)}
                </select>
                <button type="submit" className="min-h-11 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-700">
                  Search donors
                </button>
              </form>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-6 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span>10 Regional Hospitals</span>
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
                    {bgPlaying
                      ? "Pause background motion"
                      : "Play background motion"}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-72 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 sm:h-96 lg:h-full lg:min-h-[420px]">
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
                  <img
                    src={heroClinicImg}
                    alt="Nurse assisting a volunteer blood donor in a modern sunlit blood donation clinic"
                    referrerPolicy="no-referrer"
                    onError={() => setHeroImgFailed(true)}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
          </div>

          {/* 4-Column KPI Strip */}
          <div className="mt-12 grid gap-4 border-t border-slate-200 pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <p className="text-sm font-medium text-slate-600">
                  {stat.label}
                </p>
                <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-900 tabular-nums">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-slate-500">{stat.context}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current network stock by blood group */}
      <section className="border-b border-slate-200 bg-white" aria-labelledby="stock-strip-heading">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-red-600">Live Network Availability</p>
              <h2 id="stock-strip-heading" className="mt-1 text-xl font-bold tracking-tight text-slate-900">Blood stock by group</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-700" aria-label="Stock status legend">
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Available</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />Low</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-red-600" />Critical</span>
            </div>
          </div>
          {overview?.stockByGroup?.length ? (
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
              {BLOOD_GROUPS.map((group) => {
                const stock = overview.stockByGroup.find((item) => item.bloodGroup === group);
                const units = Number(stock?.units || 0);
                const critical = units < 25;
                const low = units >= 25 && units < 50;
                const dotClass = critical ? "bg-red-600" : low ? "bg-amber-500" : "bg-emerald-500";
                const valueClass = critical ? "text-red-700" : low ? "text-amber-700" : "text-emerald-700";
                return (
                  <div key={group} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-slate-900">{group}</span>
                      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} aria-hidden="true" />
                    </div>
                    <p className={`mt-1 font-mono text-xl font-semibold tabular-nums ${valueClass}`}>{units}</p>
                    <p className="text-sm text-slate-700">units · {critical ? "Critical" : low ? "Low" : "Available"}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-700" role="status">
              {loading ? "Loading current hospital stock…" : "Current stock totals are temporarily unavailable."}
            </p>
          )}
          <p className="mt-3 text-sm text-slate-700">Network totals from participating hospital inventory; confirm availability with the hospital before travelling.</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
          {HOW_IT_WORKS.map((item) => (
            <article
              key={item.step}
              className="rounded-xl border border-slate-200 bg-white p-6"
            >
              <p className="font-mono text-sm font-semibold text-red-600 tabular-nums">
                {item.step}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Recent Blood Donation Requests */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-red-600">
                Active Hospital Demand
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Recent blood donation requests
              </h2>
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
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[1, 2].map((skeleton) => (
                <div
                  key={skeleton}
                  className="h-36 animate-pulse rounded-xl border border-slate-200 bg-slate-50"
                />
              ))}
            </div>
          ) : recentRequests.length === 0 ? (
            <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm font-medium text-slate-900">
                No open blood requests right now
              </p>
              <p className="mt-1 text-sm text-slate-600">
                No upcoming open requests are currently listed. You can still
                register as a donor so hospitals can reach you when needed.
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
              {recentRequests.map((req) => (
                <article
                  key={req.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-colors hover:border-slate-300"
                >
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap sm:gap-4">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 font-mono text-base font-bold text-red-700">
                          {req.bloodGroupType}
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900">
                            {req.hospitalAddress}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {req.units} unit(s) needed · {req.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {/critical/i.test(req.urgency || "") ? (
                          <StatusBadge variant="danger" label="Critical" showIcon />
                        ) : /urgent/i.test(req.urgency || "") ? (
                          <StatusBadge variant="danger" label="Urgent" showIcon />
                        ) : null}
                        <StatusBadge
                          variant={req.requiredDate && requestTiming(req).startsWith("Due") ? "warning" : "neutral"}
                          label={requestTiming(req)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      {req.status || "Pending"} request
                    </span>
                    <Link
                      to="/register"
                      className="font-semibold text-red-600 hover:text-red-700"
                    >
                      Volunteer to donate →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Donate & Eligibility Criteria */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-sm font-semibold text-red-600">
              Clinical Impact
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Why donate blood regularly
            </h2>
            <div className="mt-8 space-y-6">
              {WHY_DONATE.map((point) => (
                <div key={point.title} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <DropletFillIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-slate-200 bg-white p-7">
              <div className="flex items-center gap-2.5 text-slate-900">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-600" />
                <h3 className="text-lg font-semibold">
                  Donor Eligibility Criteria
                </h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Before registering, review the standard medical screening
                requirements for safe donation.
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
              <div className="mt-6 border-t border-slate-100 pt-5">
                <Link
                  to="/register"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
                >
                  Check Eligibility & Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six concise blood donation facts */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-red-600">Did You Know?</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Six facts about blood donation
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-700">
              A quick look at why regular donations make a difference.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BLOOD_FACTS.map((fact) => (
              <article key={fact.title} className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-sm font-semibold text-red-700">{fact.label}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{fact.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-slate-700">{fact.description}</p>
              </article>
            ))}
          </div>
          <p className="mt-5 text-center text-sm text-slate-600">
            Sources: {" "}
            <a className="font-medium text-slate-700 underline underline-offset-2 hover:text-red-700" href="https://www.who.int/news-room/questions-and-answers/item/blood-products-why-should-i-donate-blood" target="_blank" rel="noreferrer">World Health Organization</a>
            {" · "}
            <a className="font-medium text-slate-700 underline underline-offset-2 hover:text-red-700" href="https://www.redcrossblood.org/donate-blood/blood-donation-process/what-happens-to-donated-blood.html" target="_blank" rel="noreferrer">American Red Cross</a>
          </p>
        </div>
      </section>

      {/* Common donor questions */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-red-600">Quick Answers</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Questions about donating
          </h2>
          <div className="mt-6 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-5">
            <details className="py-4">
              <summary className="cursor-pointer text-base font-semibold text-slate-900">How do I know if I can donate?</summary>
              <p className="mt-2 text-base leading-relaxed text-slate-700">Eligibility depends on your health and local donation rules. Review the registration guidance, then let the hospital team screen you before donating.</p>
            </details>
            <details className="border-t border-slate-200 py-4">
              <summary className="cursor-pointer text-base font-semibold text-slate-900">How often can I donate?</summary>
              <p className="mt-2 text-base leading-relaxed text-slate-700">Intervals depend on the type of donation and local guidance. Your donation center can tell you when you are eligible to return.</p>
            </details>
            <details className="border-t border-slate-200 py-4">
              <summary className="cursor-pointer text-base font-semibold text-slate-900">Can I choose who receives my donation?</summary>
              <p className="mt-2 text-base leading-relaxed text-slate-700">The hospital blood service tests and allocates donations according to patient needs and compatibility.</p>
            </details>
            <details className="border-t border-slate-200 py-4">
              <summary className="cursor-pointer text-base font-semibold text-slate-900">Where can I ask a question?</summary>
              <p className="mt-2 text-base leading-relaxed text-slate-700">Use the <Link to="/contact" className="font-semibold text-red-700 underline underline-offset-2">Contact page</Link> to reach the coordination team.</p>
            </details>
          </div>
        </div>
      </section>

      {/* Blood Compatibility Guide */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-red-600">
                Compatibility Reference
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Blood group donation matrix
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Visual donor-to-recipient matching guide alongside compatible
                blood type rules.
              </p>
            </div>
            {!bgVideoFailed ? (
              <button
                type="button"
                onClick={() => setBgPlaying((prev) => !prev)}
                className="self-start rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                {bgPlaying ? "Pause Guide Video" : "Play Guide Video"}
              </button>
            ) : null}
          </div>

          {/* The video sets the row height; the cards stretch to match it. */}
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            {!bgVideoFailed ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#faf2ee] lg:col-span-4">
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
                !bgVideoFailed
                  ? "lg:col-span-8 lg:grid-rows-4"
                  : "lg:col-span-12 lg:grid-cols-4"
              }`}
            >
              {BLOOD_COMPATIBILITY.map((group) => (
                <div
                  key={group.type}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-bold text-red-600">
                      {group.type}
                    </span>
                    <BuildingIcon className="h-4 w-4 text-slate-400" />
                  </div>
                  <dl className="mt-2 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="font-medium text-slate-500">
                        Can give to
                      </dt>
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-red-600">Sample Stories</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Examples of donor and hospital impact
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              These are illustrative scenarios, not verified testimonials or endorsements from real people or hospitals.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((item) => (
              <article
                key={item.name}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
              >
                <p className="text-base leading-relaxed text-slate-700">
                  “{item.quote}”
                </p>
                <footer className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {item.name} · illustrative sample
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.role}</p>
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
