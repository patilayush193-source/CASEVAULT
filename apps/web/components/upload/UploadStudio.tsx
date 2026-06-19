'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { SlideCategory } from '@casevault/types';
import * as api from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

/* ─── Constants ──────────────────────────────────────────────────────── */
const CATEGORIES: SlideCategory[] = [
  'Technology',
  'Finance',
  'Healthcare',
  'Marketing',
  'Operations',
  'Sustainability',
  'Other',
];

const STEPS = ['Drop', 'Describe', 'Summarize', 'Review'] as const;
type Step = (typeof STEPS)[number];

/* ─── Types ──────────────────────────────────────────────────────────── */
interface FormData {
  file: File | null;
  previewImage: File | null;
  title: string;
  competitionName: string;
  year: string;
  category: SlideCategory;
  executiveSummary: string;
}

/* ─── Component ──────────────────────────────────────────────────────── */
export default function UploadStudio() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const prefersReducedMotion = useReducedMotion();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    file: null,
    previewImage: null,
    title: '',
    competitionName: '',
    year: new Date().getFullYear().toString(),
    category: 'Technology',
    executiveSummary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── redirect if not authenticated ──────────────────────────────── */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  /* ── animation variants ─────────────────────────────────────────── */
  const variants = prefersReducedMotion
    ? {}
    : {
        initial: { x: 40, opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: -40, opacity: 0 },
      };

  /* ── step navigation ────────────────────────────────────────────── */
  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return formData.file !== null;
      case 1:
        return !!(formData.title && formData.competitionName && formData.year && formData.category);
      case 2:
        return true; // summary is optional
      case 3:
        return true;
      default:
        return false;
    }
  };

  /* ── submit ─────────────────────────────────────────────────────── */
  const handleSubmit = useCallback(async () => {
    if (!formData.file) return;
    setSubmitting(true);
    setError(null);

    try {
      const fd = new globalThis.FormData();
      fd.append('file', formData.file);
      if (formData.previewImage) {
        fd.append('preview_image', formData.previewImage);
      }
      fd.append('title', formData.title);
      fd.append('competition_name', formData.competitionName);
      fd.append('year', formData.year);
      fd.append('category', formData.category);
      if (formData.executiveSummary) {
        fd.append('executive_summary', formData.executiveSummary);
      }

      await api.createSlide(fd);
      router.push('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [formData, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-24 flex flex-col items-center">
      <div className="w-full max-w-xl">
        {/* ── progress bar ─────────────────────────────────────────── */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border transition-colors ${
                  i <= step
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-surface text-textMuted'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`ml-2 text-xs font-medium hidden sm:inline ${
                  i <= step ? 'text-textPrimary' : 'text-textMuted'
                }`}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 transition-colors ${
                    i < step ? 'bg-accent/40' : 'bg-border'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── step content ─────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="drop" {...variants} transition={{ duration: 0.3 }}>
              <DropStep formData={formData} setFormData={setFormData} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div key="describe" {...variants} transition={{ duration: 0.3 }}>
              <DescribeStep formData={formData} setFormData={setFormData} />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div key="summarize" {...variants} transition={{ duration: 0.3 }}>
              <SummarizeStep formData={formData} setFormData={setFormData} />
            </motion.div>
          )}
          {step === 3 && (
            <motion.div key="review" {...variants} transition={{ duration: 0.3 }}>
              <ReviewStep formData={formData} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── error message ────────────────────────────────────────── */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* ── navigation ───────────────────────────────────────────── */}
        <div className="flex justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              variant="primary"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Continue
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => void handleSubmit()}
              loading={submitting}
              disabled={!formData.file}
            >
              Upload Deck
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Step 1: Drop
 * ═══════════════════════════════════════════════════════════════════════ */
function DropStep({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const [dragActive, setDragActive] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/pdf') {
          setFormData((prev) => ({ ...prev, file }));
        }
      }
    },
    [setFormData],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setFormData((prev) => ({ ...prev, file: e.target.files![0] }));
      }
    },
    [setFormData],
  );

  const handlePreviewChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.[0]) {
        setFormData((prev) => ({ ...prev, previewImage: e.target.files![0] }));
      }
    },
    [setFormData],
  );

  return (
    <div className="space-y-6">
      <h2 className="display-lg text-textPrimary">Drop your deck</h2>

      {/* PDF drop zone */}
      <div
        className={`relative rounded-xl border-2 border-dashed p-10 text-center transition-all cursor-pointer ${
          dragActive
            ? 'border-accent scale-[1.02] shadow-[0_0_0_2px_rgba(0,245,212,0.4)]'
            : 'border-border hover:border-borderHi'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex flex-col items-center gap-3">
          <svg
            className={`w-12 h-12 transition-colors ${dragActive ? 'text-accent' : 'text-textMuted'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>

          {formData.file ? (
            <div className="text-sm">
              <p className="text-accent font-medium">{formData.file.name}</p>
              <p className="text-textMuted text-xs mt-1">
                {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-textSecondary">
                Drag & drop your PDF here, or click to browse
              </p>
              <p className="text-xs text-textMuted mt-1">Max 50 MB</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview image (optional) */}
      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-textSecondary mb-2 block">
          Preview Image (optional)
        </label>
        <div
          className="rounded-lg border border-border bg-surface p-4 cursor-pointer hover:border-borderHi transition-colors"
          onClick={() => previewRef.current?.click()}
        >
          <input
            ref={previewRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePreviewChange}
          />
          {formData.previewImage ? (
            <p className="text-sm text-accent">{formData.previewImage.name}</p>
          ) : (
            <p className="text-sm text-textMuted">Click to add a preview image (JPEG, PNG, WEBP · max 5 MB)</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Step 2: Describe
 * ═══════════════════════════════════════════════════════════════════════ */
function DescribeStep({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  return (
    <div className="space-y-6">
      <h2 className="display-lg text-textPrimary">Describe your deck</h2>

      <Input
        label="Title"
        placeholder="e.g. Market Entry Strategy for Southeast Asia"
        value={formData.title}
        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
      />

      <Input
        label="Competition Name"
        placeholder="e.g. HBS Case Competition 2026"
        value={formData.competitionName}
        onChange={(e) =>
          setFormData((p) => ({ ...p, competitionName: e.target.value }))
        }
      />

      <Input
        label="Year"
        type="number"
        placeholder="2026"
        value={formData.year}
        onChange={(e) => setFormData((p) => ({ ...p, year: e.target.value }))}
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium tracking-wider uppercase text-textSecondary">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              category: e.target.value as SlideCategory,
            }))
          }
          className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm text-textPrimary outline-none focus:border-accent transition-colors"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Step 3: Summarize
 * ═══════════════════════════════════════════════════════════════════════ */
function SummarizeStep({
  formData,
  setFormData,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}) {
  const charCount = formData.executiveSummary.length;
  const MAX = 300;

  const counterColor =
    charCount >= MAX
      ? 'text-red-400'
      : charCount >= MAX * 0.8
        ? 'text-accent'
        : 'text-textMuted';

  return (
    <div className="space-y-6">
      <h2 className="display-lg text-textPrimary">Executive Summary</h2>
      <p className="text-sm text-textSecondary">
        Give reviewers a quick overview. Keep it concise.
      </p>

      <div className="relative">
        <textarea
          value={formData.executiveSummary}
          onChange={(e) => {
            if (e.target.value.length <= MAX) {
              setFormData((p) => ({
                ...p,
                executiveSummary: e.target.value,
              }));
            }
          }}
          rows={5}
          placeholder="Briefly describe the problem, your approach, and the key recommendation…"
          className="w-full bg-surface border border-border rounded-lg px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted outline-none focus:border-accent transition-colors resize-none"
        />
        <span className={`absolute bottom-3 right-3 text-xs font-mono ${counterColor}`}>
          {charCount}/{MAX}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════
 * Step 4: Review
 * ═══════════════════════════════════════════════════════════════════════ */
function ReviewStep({ formData }: { formData: FormData }) {
  return (
    <div className="space-y-6">
      <h2 className="display-lg text-textPrimary">Review & Submit</h2>

      <div className="rounded-xl border border-border bg-surface/50 p-6 space-y-4">
        <ReviewRow label="File" value={formData.file?.name ?? '—'} />
        <ReviewRow
          label="Preview"
          value={formData.previewImage?.name ?? 'None'}
        />
        <ReviewRow label="Title" value={formData.title} />
        <ReviewRow label="Competition" value={formData.competitionName} />
        <ReviewRow label="Year" value={formData.year} />
        <ReviewRow label="Category" value={formData.category} />
        {formData.executiveSummary && (
          <ReviewRow label="Summary" value={formData.executiveSummary} />
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-textMuted w-24 shrink-0">
        {label}
      </span>
      <span className="text-sm text-textSecondary break-all">{value}</span>
    </div>
  );
}
