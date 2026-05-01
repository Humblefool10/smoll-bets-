"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/tokens";
import { BigButton } from "@/components/big-button";

interface EditCircleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    data: {
      name: string;
      habit: string;
      target: number;
      durationWeeks: number;
      stakes: string;
      verification: "honor" | "proof" | "both";
      maxMembers: number;
    },
    opts: { willReset: boolean },
  ) => Promise<void>;
  initial: {
    name: string;
    habit: string;
    target: number;
    durationWeeks: number;
    stakes: string;
    verification: "honor" | "proof" | "both";
    maxMembers: number;
  };
  minMaxMembers: number;
  // when true, target/duration changes reset the circle (logs wiped, week 1 restart).
  isActive?: boolean;
}

const inputStyle = {
  fontFamily: t.fontBody,
  fontSize: 15,
  color: t.text,
  background: t.bgAlt,
  border: `2px solid ${t.border}`,
  borderRadius: 10,
  padding: "10px 12px",
  boxShadow: t.shadowSm,
  width: "100%",
  outline: "none",
} as const;

const labelStyle = {
  fontFamily: t.fontBody,
  fontSize: 12,
  color: t.textMuted,
  display: "block",
  marginBottom: 4,
} as const;

export function EditCircleDialog({
  open,
  onClose,
  onSave,
  initial,
  minMaxMembers,
  isActive = false,
}: EditCircleDialogProps) {
  const [name, setName] = useState(initial.name);
  const [habit, setHabit] = useState(initial.habit);
  const [target, setTarget] = useState(initial.target);
  const [durationWeeks, setDurationWeeks] = useState(initial.durationWeeks);
  const [stakes, setStakes] = useState(initial.stakes);
  const [verification, setVerification] = useState<"honor" | "proof" | "both">(initial.verification);
  const [maxMembers, setMaxMembers] = useState(initial.maxMembers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial.name);
    setHabit(initial.habit);
    setTarget(initial.target);
    setDurationWeeks(initial.durationWeeks);
    setStakes(initial.stakes);
    setVerification(initial.verification);
    setMaxMembers(initial.maxMembers);
    setError(null);
    setConfirmReset(false);
  }, [open, initial]);

  const willReset =
    isActive && (target !== initial.target || durationWeeks !== initial.durationWeeks);

  if (!open) return null;

  const validate = (): string | null => {
    if (!name.trim() || !habit.trim() || !stakes.trim()) {
      return "name, habit, and stakes can't be empty.";
    }
    if (maxMembers < minMaxMembers) {
      return `max members can't be less than ${minMaxMembers} (people already in).`;
    }
    if (target < 1 || durationWeeks < 1) {
      return "target and duration must be at least 1.";
    }
    return null;
  };

  const handleSavePress = () => {
    if (saving) return;
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    if (willReset) {
      setConfirmReset(true);
      return;
    }
    void doSave();
  };

  const doSave = async () => {
    setSaving(true);
    try {
      await onSave(
        {
          name: name.trim(),
          habit: habit.trim(),
          target,
          durationWeeks,
          stakes: stakes.trim(),
          verification,
          maxMembers,
        },
        { willReset },
      );
      setConfirmReset(false);
      onClose();
    } catch (e) {
      setError((e as { message?: string })?.message || "couldn't save changes.");
      setConfirmReset(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(26, 10, 0, 0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] shadow-brutal max-h-[85vh] overflow-y-auto"
        style={{
          borderRadius: 16,
          border: `2px solid ${t.border}`,
          background: t.bg,
          padding: 20,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontFamily: t.font,
            fontWeight: 700,
            fontSize: 20,
            color: t.text,
            marginBottom: 14,
          }}
        >
          edit the bet
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label style={labelStyle}>name</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label style={labelStyle}>habit</label>
            <input
              style={inputStyle}
              value={habit}
              onChange={(e) => setHabit(e.target.value)}
              maxLength={100}
            />
          </div>

          <div>
            <label style={labelStyle}>max people</label>
            <input
              type="number"
              min={minMaxMembers}
              style={inputStyle}
              value={maxMembers}
              onChange={(e) => setMaxMembers(parseInt(e.target.value) || minMaxMembers)}
            />
          </div>

          {!isActive && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label style={labelStyle}>target / week</label>
                <input
                  type="number"
                  min={1}
                  style={inputStyle}
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="flex-1">
                <label style={labelStyle}>weeks</label>
                <input
                  type="number"
                  min={1}
                  style={inputStyle}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>stakes (loser ___)</label>
            <input
              style={inputStyle}
              value={stakes}
              onChange={(e) => setStakes(e.target.value)}
              maxLength={200}
            />
          </div>

          <div>
            <label style={labelStyle}>verification</label>
            <div className="flex gap-2">
              {(["both", "honor", "proof"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVerification(v)}
                  className="flex-1 cursor-pointer"
                  style={{
                    fontFamily: t.font,
                    fontWeight: 700,
                    fontSize: 13,
                    color: t.text,
                    background: verification === v ? t.primaryLight : t.bgAlt,
                    border: `2px solid ${t.border}`,
                    borderRadius: 10,
                    padding: "10px 12px",
                    boxShadow: t.shadowSm,
                  }}
                >
                  {v === "honor" ? "honor" : v === "proof" ? "photo" : "either"}
                </button>
              ))}
            </div>
          </div>

          {isActive && (
            <div
              style={{
                borderRadius: 12,
                border: `2px solid ${t.danger}`,
                background: t.danger + "10",
                padding: 14,
              }}
            >
              <div
                style={{
                  fontFamily: t.font,
                  fontWeight: 700,
                  fontSize: 13,
                  color: t.danger,
                  marginBottom: 4,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                warning
              </div>
              <div
                style={{
                  fontFamily: t.fontBody,
                  fontSize: 12,
                  color: t.textMuted,
                  marginBottom: 10,
                }}
              >
                changing these resets the circle. all logs wiped, week 1 restarts for everyone.
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label style={labelStyle}>target / week</label>
                  <input
                    type="number"
                    min={1}
                    style={inputStyle}
                    value={target}
                    onChange={(e) => setTarget(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="flex-1">
                  <label style={labelStyle}>weeks</label>
                  <input
                    type="number"
                    min={1}
                    style={inputStyle}
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 13,
                color: t.danger,
                background: t.danger + "15",
                border: `2px solid ${t.border}`,
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-5">
          <BigButton bg={t.positive} onClick={handleSavePress} loading={saving && !confirmReset} className="w-full">
            save changes
          </BigButton>
          <BigButton bg={t.bgAlt} onClick={onClose} className="w-full">
            cancel
          </BigButton>
        </div>
      </div>

      {confirmReset && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center px-4"
          style={{ background: "rgba(26, 10, 0, 0.6)" }}
          onClick={() => !saving && setConfirmReset(false)}
        >
          <div
            className="w-full max-w-[360px] shadow-brutal"
            style={{
              borderRadius: 16,
              border: `2px solid ${t.border}`,
              background: t.bg,
              padding: 22,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                fontFamily: t.font,
                fontWeight: 700,
                fontSize: 18,
                color: t.text,
                marginBottom: 8,
              }}
            >
              reset the circle?
            </div>
            <div
              style={{
                fontFamily: t.fontBody,
                fontSize: 14,
                color: t.text,
                lineHeight: 1.4,
                marginBottom: 16,
              }}
            >
              changing target or weeks shifts the win bar for everyone, so progress has to start over. all existing logs will be deleted and week 1 begins now.
            </div>
            <div className="flex flex-col gap-2">
              <BigButton bg={t.danger} onClick={doSave} loading={saving} className="w-full">
                reset and save
              </BigButton>
              <BigButton bg={t.bgAlt} onClick={() => setConfirmReset(false)} className="w-full">
                keep current progress
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
