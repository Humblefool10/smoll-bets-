"use client";

import { useState } from "react";
import { t } from "@/lib/tokens";
import { BigButton } from "@/components/big-button";
import { Pill } from "@/components/pill";

import { BackButton } from "@/components/back-button";

// ── step indicator ──────────────────────────────────────────────────────────
// gestalt: continuity — the dots show a path, not isolated states.
// the filled dot + connecting line creates forward momentum.

function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            style={{
              width: i <= current ? 10 : 8,
              height: i <= current ? 10 : 8,
              borderRadius: "50%",
              border: `2px solid ${t.border}`,
              background: i <= current ? t.primary : t.bgAlt,
              boxShadow: i <= current ? `1px 1px 0 ${t.border}` : "none",
              transition: "all 0.2s ease",
            }}
          />
          {i < total - 1 && (
            <div
              style={{
                width: 20,
                height: 2,
                background: i < current ? t.primary : t.border + "33",
                borderRadius: 1,
                transition: "background 0.2s ease",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── shared header for all steps ─────────────────────────────────────────────

function StepHeader({
  step,
  title,
  subtitle,
  onBack,
}: {
  step: number;
  title: string;
  subtitle: string;
  onBack: () => void;
}) {
  return (
    <div className="px-5 pt-2 pb-4 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <BackButton onClick={onBack} />
        <StepDots current={step} total={3} />
        <div style={{ width: 20 }} /> {/* spacer for centering */}
      </div>
      <div
        style={{
          fontFamily: t.font,
          fontWeight: 700,
          fontSize: 24,
          color: t.text,
          lineHeight: 1.1,
        }}
      >
        {title}
      </div>
      <div
        className="mt-1"
        style={{
          fontFamily: t.fontBody,
          fontSize: 14,
          color: t.textMuted,
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

// ── input field ─────────────────────────────────────────────────────────────

function Field({
  label,
  placeholder,
  value,
  onChange,
  multiline = false,
  maxLength = 100,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
}) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const shared = {
    fontFamily: t.fontBody,
    fontSize: 16,
    color: t.text,
    background: t.bgAlt,
    border: `2px solid ${t.border}`,
    borderRadius: 12,
    padding: "14px 16px",
    boxShadow: t.shadowSm,
    width: "100%",
    outline: "none",
  } as const;

  return (
    <div>
      <label
        htmlFor={id}
        style={{
          fontFamily: t.fontBody,
          fontSize: 13,
          color: t.textMuted,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          maxLength={maxLength}
          className="resize-none"
          style={shared}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          style={shared}
        />
      )}
    </div>
  );
}

// ── choice pill selector ────────────────────────────────────────────────────
// gestalt: similarity — all options look the same until selected.
// the selected state uses the primary color to break the pattern.

function ChoiceRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <label
        style={{
          fontFamily: t.fontBody,
          fontSize: 13,
          color: t.textMuted,
          display: "block",
          marginBottom: 8,
        }}
      >
        {label}
      </label>
      <div className="flex gap-2 flex-wrap" role="radiogroup" aria-label={label}>
        {options.map((opt) => (
          <div
            key={opt.value}
            role="radio"
            aria-checked={value === opt.value}
            tabIndex={0}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => e.key === "Enter" && onChange(opt.value)}
            className="cursor-pointer"
            style={{
              borderRadius: 10,
              border: `2px solid ${t.border}`,
              background: value === opt.value ? t.primary : t.bgAlt,
              padding: "10px 16px",
              boxShadow:
                value === opt.value
                  ? `2px 2px 0 ${t.border}`
                  : t.shadowSm,
              transition: "all 0.12s ease",
            }}
          >
            <span
              style={{
                fontFamily: t.font,
                fontWeight: value === opt.value ? 700 : 500,
                fontSize: 14,
                color: t.text,
              }}
            >
              {opt.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── step 1: the bet ─────────────────────────────────────────────────────────
// the obligation — what you commit to.
// grouped by gestalt proximity: name + habit are identity,
// target + duration are the measurable contract.

function StepTheBet({
  data,
  onUpdate,
  onNext,
  onBack,
}: {
  data: CircleData;
  onUpdate: (d: Partial<CircleData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = data.name.trim() && data.habit.trim();

  return (
    <div className="flex flex-col h-full" style={{ background: t.bg }}>

      <StepHeader
        step={0}
        title="the bet"
        subtitle="what are you all committing to?"
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-5">
        <Field
          label="circle name"
          placeholder="gym rats, book nerds, no scroll club..."
          value={data.name}
          onChange={(v) => onUpdate({ name: v })}
        />

        <Field
          label="the habit"
          placeholder="go for a run, read 20 pages, meditate..."
          value={data.habit}
          onChange={(v) => onUpdate({ habit: v })}
        />

        <ChoiceRow
          label="how many times per week?"
          options={[
            { value: "1", label: "1x" },
            { value: "2", label: "2x" },
            { value: "3", label: "3x" },
            { value: "4", label: "4x" },
            { value: "5", label: "5x" },
            { value: "6", label: "6x" },
            { value: "7", label: "daily" },
          ]}
          value={data.target}
          onChange={(v) => onUpdate({ target: v })}
        />

        <ChoiceRow
          label="for how long?"
          options={[
            { value: "1", label: "1 week" },
            { value: "2", label: "2 weeks" },
            { value: "3", label: "3 weeks" },
            { value: "4", label: "4 weeks" },
            { value: "5", label: "5 weeks" },
            { value: "6", label: "6 weeks" },
            { value: "7", label: "7 weeks" },
            { value: "8", label: "8 weeks" },
          ]}
          value={data.duration}
          onChange={(v) => onUpdate({ duration: v })}
        />

        <ChoiceRow
          label="how many people?"
          options={[
            { value: "2", label: "2" },
            { value: "3", label: "3" },
            { value: "4", label: "4" },
            { value: "5", label: "5" },
            { value: "6", label: "6" },
          ]}
          value={data.maxMembers}
          onChange={(v) => onUpdate({ maxMembers: v })}
        />

        {/* timezone awareness */}
        <div
          style={{
            borderRadius: 10,
            border: `2px solid ${t.border}20`,
            background: t.bgAlt,
            padding: "10px 14px",
          }}
        >
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 13,
              color: t.textMuted,
            }}
          >
            🌍 each member&apos;s week runs in their own timezone. no one gets penalized for living somewhere else.
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 pt-3">
        <BigButton
          onClick={canContinue ? onNext : undefined}
          bg={canContinue ? t.primary : t.bgAlt}
          className="w-full"
        >
          {canContinue ? "next: set the stakes" : "name it and pick a habit first"}
        </BigButton>
      </div>
    </div>
  );
}

// ── step 2: the stakes ──────────────────────────────────────────────────────
// the consequence — what happens if you fail.
// this screen breathes. it's the emotional core of the social contract.
// anthropologically, this is the "oath" moment.

function StepTheStakes({
  data,
  onUpdate,
  onNext,
  onBack,
}: {
  data: CircleData;
  onUpdate: (d: Partial<CircleData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const canContinue = data.stakes.trim();

  return (
    <div className="flex flex-col h-full" style={{ background: t.bg }}>

      <StepHeader
        step={1}
        title="the stakes"
        subtitle="make it real. what does the loser owe?"
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-5">
        <Field
          label="what's on the line?"
          placeholder="cook dinner for the group, buy everyone coffee..."
          value={data.stakes}
          onChange={(v) => onUpdate({ stakes: v })}
          multiline
        />

        {/* inspiration chips — tap to prefill */}
        <div>
          <label
            style={{
              fontFamily: t.fontBody,
              fontSize: 13,
              color: t.textMuted,
              display: "block",
              marginBottom: 8,
            }}
          >
            need ideas?
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              "cook dinner for the group",
              "buy everyone coffee",
              "host movie night",
              "do everyone's laundry",
              "wear a silly hat for a day",
              "write a public apology post",
            ].map((idea) => (
              <div
                key={idea}
                onClick={() => onUpdate({ stakes: idea })}
                className="cursor-pointer"
                style={{
                  borderRadius: 8,
                  border: `2px solid ${t.border}`,
                  background: data.stakes === idea ? t.primaryLight : t.bg,
                  padding: "6px 12px",
                  boxShadow: t.shadowSm,
                }}
              >
                <span
                  style={{
                    fontFamily: t.fontBody,
                    fontSize: 13,
                    color: t.text,
                  }}
                >
                  {idea}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ChoiceRow
          label="how do people prove it?"
          options={[
            { value: "honor", label: "🤝 honor system" },
            { value: "proof", label: "📸 photo proof" },
          ]}
          value={data.verification}
          onChange={(v) => onUpdate({ verification: v })}
        />

        {/* contextual hint based on verification choice */}
        <div
          style={{
            borderRadius: 10,
            border: `2px solid ${t.border}`,
            background: t.bgAlt,
            padding: "10px 14px",
            boxShadow: t.shadowSm,
          }}
        >
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 13,
              color: t.textMuted,
            }}
          >
            {data.verification === "honor"
              ? "your word is your bond. members self-report with one tap. best for close friends and partners."
              : "members snap a photo to log. camera only, no gallery uploads. best for groups where friendly skepticism exists."}
          </div>
        </div>
      </div>

      <div className="px-5 pb-6 pt-3">
        <BigButton
          onClick={canContinue ? onNext : undefined}
          bg={canContinue ? t.primary : t.bgAlt}
          className="w-full"
        >
          {canContinue ? "next: invite your people" : "set the stakes first"}
        </BigButton>
      </div>
    </div>
  );
}

// ── step 3: the invite ──────────────────────────────────────────────────────
// the witnesses — who sees and enforces the contract.
// commitment escalation: after investing effort in steps 1-2,
// abandoning here feels like waste (sunk cost). this is by design.
// the copy reinforces: "a circle of one is just a to-do list."

function StepTheInvite({
  data,
  onDone,
  onBack,
}: {
  data: CircleData;
  onDone: () => void;
  onBack: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const inviteUrl = "smollbets.app/invite/gym-rats-a1b2c3"; // placeholder

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `join "${data.name}" on smoll bets`,
          text: `${data.habit} ${data.target}x per week. loser ${data.stakes}. you in?`,
          url: inviteUrl,
        });
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: t.bg }}>

      <StepHeader
        step={2}
        title="bring your people"
        subtitle="a circle of one is just a to-do list."
        onBack={onBack}
      />

      <div className="flex-1 overflow-y-auto px-5 flex flex-col gap-5">
        {/* preview card — shows what invitees will see.
            gestalt: figure/ground — the card pops as the focal point. */}
        <div
          style={{
            borderRadius: 14,
            border: `2px solid ${t.border}`,
            background: t.primaryBg,
            padding: 16,
            boxShadow: t.shadow,
          }}
        >
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 12,
              color: t.textMuted,
              marginBottom: 4,
            }}
          >
            your friends will see this
          </div>
          <div
            style={{
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 20,
              color: t.text,
              marginBottom: 8,
            }}
          >
            {data.name || "your circle"}
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            <Pill color={t.primaryLight}>
              {data.habit || "habit"} {data.target}x/week
            </Pill>
            <Pill color={t.bgAlt}>{data.duration} weeks</Pill>
            <Pill color={t.danger + "22"}>
              loser {data.stakes || "..."}
            </Pill>
          </div>
          <div
            style={{
              fontFamily: t.fontBody,
              fontSize: 13,
              color: t.textMuted,
            }}
          >
            {data.verification === "honor"
              ? "honor system"
              : "photo proof required"}
            {" · "}up to {data.maxMembers} people
          </div>
        </div>

        {/* invite link */}
        <div
          className="flex items-center gap-2"
          style={{
            borderRadius: 12,
            border: `2px solid ${t.border}`,
            background: t.bgAlt,
            padding: "12px 14px",
            boxShadow: t.shadowSm,
          }}
        >
          <div
            className="flex-1 truncate"
            style={{
              fontFamily: t.fontBody,
              fontSize: 14,
              color: t.textMuted,
            }}
          >
            {inviteUrl}
          </div>
          <div
            onClick={handleCopy}
            className="cursor-pointer shrink-0"
            style={{
              borderRadius: 8,
              border: `2px solid ${t.border}`,
              background: copied ? t.positive : t.bg,
              padding: "6px 12px",
              boxShadow: t.shadowSm,
              fontFamily: t.font,
              fontWeight: 700,
              fontSize: 13,
              color: t.text,
              transition: "background 0.15s",
            }}
          >
            {copied ? "copied" : "copy"}
          </div>
        </div>

        {/* share button */}
        <BigButton onClick={handleShare} className="w-full">
          <span className="flex items-center gap-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke={t.text}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 12v3a1 1 0 001 1h8a1 1 0 001-1v-3M12 5L9 2 6 5M9 2v10" />
            </svg>
            share invite link
          </span>
        </BigButton>

        {/* skip option — don't guilt them, but be honest */}
        <div
          className="text-center"
          style={{
            fontFamily: t.fontBody,
            fontSize: 13,
            color: t.textMuted,
          }}
        >
          you can always share the link later from the circle.
        </div>
      </div>

      <div className="px-5 pb-6 pt-3">
        <BigButton onClick={onDone} bg={t.positive} className="w-full">
          done, take me to my circle
        </BigButton>
      </div>
    </div>
  );
}

// ── circle data type ────────────────────────────────────────────────────────

interface CircleData {
  name: string;
  habit: string;
  target: string;
  duration: string;
  stakes: string;
  verification: "honor" | "proof";
  maxMembers: string;
}

const defaultCircle: CircleData = {
  name: "",
  habit: "",
  target: "3",
  duration: "4",
  stakes: "",
  verification: "proof",
  maxMembers: "4",
};

// ── main create circle flow ─────────────────────────────────────────────────
// three steps. each screen is one clear decision.
// progressive disclosure: never overwhelming, always moving forward.

export function CreateCircleFlow({
  onDone,
  onCancel,
  initialData,
}: {
  onDone: (data: CircleData) => void;
  onCancel: () => void;
  initialData?: Partial<CircleData>;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CircleData>({
    ...defaultCircle,
    ...initialData,
  });

  const update = (partial: Partial<CircleData>) =>
    setData((d) => ({ ...d, ...partial }));

  return (
    <>
      {step === 0 && (
        <StepTheBet
          data={data}
          onUpdate={update}
          onNext={() => setStep(1)}
          onBack={onCancel}
        />
      )}
      {step === 1 && (
        <StepTheStakes
          data={data}
          onUpdate={update}
          onNext={() => setStep(2)}
          onBack={() => setStep(0)}
        />
      )}
      {step === 2 && (
        <StepTheInvite
          data={data}
          onDone={() => onDone(data)}
          onBack={() => setStep(1)}
        />
      )}
    </>
  );
}
