"use client";

import { useState, useEffect } from "react";
import { t } from "@/lib/tokens";
import { BigButton } from "@/components/big-button";

interface EditCircleDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    habit: string;
    target: number;
    durationWeeks: number;
    stakes: string;
    verification: "honor" | "proof";
    maxMembers: number;
  }) => Promise<void>;
  initial: {
    name: string;
    habit: string;
    target: number;
    durationWeeks: number;
    stakes: string;
    verification: "honor" | "proof";
    maxMembers: number;
  };
  minMaxMembers: number;
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
}: EditCircleDialogProps) {
  const [name, setName] = useState(initial.name);
  const [habit, setHabit] = useState(initial.habit);
  const [target, setTarget] = useState(initial.target);
  const [durationWeeks, setDurationWeeks] = useState(initial.durationWeeks);
  const [stakes, setStakes] = useState(initial.stakes);
  const [verification, setVerification] = useState<"honor" | "proof">(initial.verification);
  const [maxMembers, setMaxMembers] = useState(initial.maxMembers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  }, [open, initial]);

  if (!open) return null;

  const handleSave = async () => {
    if (saving) return;
    if (!name.trim() || !habit.trim() || !stakes.trim()) {
      setError("name, habit, and stakes can't be empty.");
      return;
    }
    if (maxMembers < minMaxMembers) {
      setError(`max members can't be less than ${minMaxMembers} (people already in).`);
      return;
    }
    if (target < 1 || durationWeeks < 1) {
      setError("target and duration must be at least 1.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        habit: habit.trim(),
        target,
        durationWeeks,
        stakes: stakes.trim(),
        verification,
        maxMembers,
      });
      onClose();
    } catch (e) {
      setError((e as { message?: string })?.message || "couldn't save changes.");
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
            <div className="flex-1">
              <label style={labelStyle}>max people</label>
              <input
                type="number"
                min={minMaxMembers}
                style={inputStyle}
                value={maxMembers}
                onChange={(e) => setMaxMembers(parseInt(e.target.value) || minMaxMembers)}
              />
            </div>
          </div>

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
              {(["honor", "proof"] as const).map((v) => (
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
                  {v === "honor" ? "honor system" : "photo proof"}
                </button>
              ))}
            </div>
          </div>

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
          <BigButton bg={t.positive} onClick={handleSave} loading={saving} className="w-full">
            save changes
          </BigButton>
          <BigButton bg={t.bgAlt} onClick={onClose} className="w-full">
            cancel
          </BigButton>
        </div>
      </div>
    </div>
  );
}
