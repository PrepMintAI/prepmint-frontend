// src/hooks/useEvaluationPoll.ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { getEvaluationStatus } from '@/lib/api';

type EvaluationResult = {
  score?: number;
  feedback?: string;
  details?: Record<string, unknown>;
  [key: string]: unknown;
};

type EvaluationStatus = {
  status: 'pending' | 'processing' | 'done' | 'failed';
  progress?: number;
  result?: EvaluationResult;
  error?: string;
  jobId?: string;
};

type UseEvaluationPollOptions = {
  enabled?: boolean; // Allow pausing polling
  onComplete?: (result: EvaluationResult) => void;
  onError?: (error: string) => void;
};

export default function useEvaluationPoll(
  jobId?: string | null,
  options: UseEvaluationPollOptions = {}
) {
  const { enabled = true, onComplete, onError } = options;
  const [status, setStatus] = useState<EvaluationStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const stopped = useRef(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!jobId || !enabled) {
      setStatus(null);
      setIsPolling(false);
      return;
    }

    // Type narrowing: jobId is now guaranteed to be string
    const validJobId: string = jobId;

    let interval = 2000; // Start with 2s
    const maxInterval = 8000; // Cap at 8s
    stopped.current = false;
    setIsPolling(true);

    async function poll() {
      if (stopped.current) return;

      try {
        const { data } = await getEvaluationStatus(validJobId);
        setStatus(data);

        // Terminal states
        if (data.status === 'done') {
          setIsPolling(false);
          onComplete?.(data.result);
          return;
        }

        if (data.status === 'failed') {
          setIsPolling(false);
          onError?.(data.error || 'Evaluation failed');
          return;
        }

        // Continue polling with exponential backoff
        if (!stopped.current) {
          timerRef.current = window.setTimeout(poll, interval);
          if (interval < maxInterval) {
            interval += 1000; // Gradually increase delay
          }
        }
      } catch (error) {
        console.error('Polling error:', error);

        // Retry on network errors
        if (!stopped.current) {
          timerRef.current = window.setTimeout(poll, 5000);
        }
      }
    }

    poll();

    // Cleanup on unmount or jobId change
    return () => {
      stopped.current = true;
      setIsPolling(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [jobId, enabled, onComplete, onError]);

  return { status, isPolling };
}
