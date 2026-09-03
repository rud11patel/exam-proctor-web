import { useEffect, useState, useCallback, useRef } from 'react';
import { ApiClient } from '@/services/apiClient';

export type ProctoringEventType =
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'COPY_ATTEMPT'
  | 'PASTE_ATTEMPT'
  | 'CUT_ATTEMPT'
  | 'CONTEXT_MENU'
  | 'RESTRICTED_SHORTCUT'
  | 'FULLSCREEN_EXIT';

export interface ActiveViolationToast {
  id: string;
  eventType: ProctoringEventType;
  message: string;
  timestamp: number;
}

interface UseBrowserProctoringOptions {
  attemptId?: string;
  isActive: boolean;
  onViolation?: (eventType: ProctoringEventType, message: string) => void;
  onAutoSubmit?: () => void;
}

export function useBrowserProctoring({ attemptId, isActive, onViolation, onAutoSubmit }: UseBrowserProctoringOptions) {
  const [violationCount, setViolationCount] = useState<number>(0);
  const [maxViolations, setMaxViolations] = useState<number>(5);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [latestWarning, setLatestWarning] = useState<string | null>(null);
  const [activeViolations, setActiveViolations] = useState<ActiveViolationToast[]>([]);

  const lastEventTimeRef = useRef<Record<string, number>>({});
  const wasFullscreenRef = useRef<boolean>(false);
  const toastTimersRef = useRef<Record<string, NodeJS.Timeout>>({});

  // Debounced API event recorder (persistent in PostgreSQL)
  const logProctoringEvent = useCallback(
    async (eventType: ProctoringEventType, metadata?: any) => {
      if (!attemptId || !isActive) return;

      const now = Date.now();
      const lastTime = lastEventTimeRef.current[eventType] || 0;
      // Debounce identical events within 1.5 seconds to prevent spam
      if (now - lastTime < 1500) {
        return;
      }
      lastEventTimeRef.current[eventType] = now;

      try {
        const response = await ApiClient.request(`/attempts/${attemptId}/proctoring-events`, {
          method: 'POST',
          body: JSON.stringify({
            eventType,
            metadata: {
              ...metadata,
              visibilityState: document.visibilityState,
              userAgent: navigator.userAgent,
            },
          }),
        });
        
        if (response.success && response.data) {
          if (response.data.violationCount !== undefined) {
            setViolationCount(response.data.violationCount);
          }
          if (response.data.maxViolations !== undefined) {
            setMaxViolations(response.data.maxViolations);
          }
          if (response.data.autoSubmitted && onAutoSubmit) {
            onAutoSubmit();
          }
        }
      } catch (err) {
        // Non-blocking background log
      }
    },
    [attemptId, isActive]
  );

  const dismissViolation = useCallback((id: string) => {
    setActiveViolations((prev) => prev.filter((v) => v.id !== id));
    if (toastTimersRef.current[id]) {
      clearTimeout(toastTimersRef.current[id]);
      delete toastTimersRef.current[id];
    }
  }, []);

  const handleViolation = useCallback(
    (eventType: ProctoringEventType, warningMessage: string, metadata?: any) => {
      // 1. Dispatch persistent backend log
      logProctoringEvent(eventType, metadata);

      // 2. Notify optional callback
      if (onViolation) {
        onViolation(eventType, warningMessage);
      }

      // 3. Create independent temporary UI notification (~7s lifespan)
      const toastId = `${eventType}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const toast: ActiveViolationToast = {
        id: toastId,
        eventType,
        message: warningMessage,
        timestamp: Date.now(),
      };

      setLatestWarning(warningMessage);
      setActiveViolations((prev) => [...prev, toast]);

      // Schedule auto-dismiss in 7 seconds (independent per toast)
      toastTimersRef.current[toastId] = setTimeout(() => {
        setActiveViolations((prev) => prev.filter((v) => v.id !== toastId));
        setLatestWarning((prev) => (prev === warningMessage ? null : prev));
        delete toastTimersRef.current[toastId];
      }, 7000);
    },
    [logProctoringEvent, onViolation]
  );

  // Fullscreen helper launcher
  const requestFullscreen = useCallback(async (): Promise<boolean> => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isFull);
      wasFullscreenRef.current = isFull;
      return isFull;
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    if (!isActive || !attemptId) {
      return;
    }

    // Initialize fullscreen state
    const initialFull = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).msFullscreenElement
    );
    setIsFullscreen(initialFull);
    wasFullscreenRef.current = initialFull;

    // 1. Tab Switching & Visibility Change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        handleViolation('TAB_SWITCH', 'Tab switch detected. This event has been recorded.', {
          hidden: true,
        });
      }
    };

    // 2. Window Blur & Focus
    const handleWindowBlur = () => {
      handleViolation('WINDOW_BLUR', 'Focus lost from examination window. This event has been recorded.', {
        focused: false,
      });
    };

    // 3. Copy, Paste, Cut Controls
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('COPY_ATTEMPT', 'Copying content during the examination is strictly prohibited.');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('PASTE_ATTEMPT', 'Pasting content during the examination is strictly prohibited.');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      handleViolation('CUT_ATTEMPT', 'Cutting content during the examination is strictly prohibited.');
    };

    // 4. Context Menu / Right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      handleViolation('CONTEXT_MENU', 'Right-click context menu is restricted during the examination.');
    };

    // 5. Restricted Keyboard Shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const key = e.key.toUpperCase();

      // F12 or DevTools shortcuts
      if (
        e.key === 'F12' ||
        (isCtrl && e.shiftKey && (key === 'I' || key === 'J' || key === 'C')) ||
        (isCtrl && (key === 'U' || key === 'C' || key === 'V' || key === 'X' || key === 'A'))
      ) {
        e.preventDefault();
        handleViolation('RESTRICTED_SHORTCUT', `Keyboard shortcut (${e.key}) is restricted during the exam.`, {
          key: e.key,
        });
      }
    };

    // 6. Fullscreen Monitoring
    const handleFullscreenChange = () => {
      const isFull = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );

      setIsFullscreen(isFull);

      if (wasFullscreenRef.current && !isFull) {
        handleViolation('FULLSCREEN_EXIT', 'Fullscreen exited. Examination must be taken in fullscreen mode.');
      }
      wasFullscreenRef.current = isFull;
    };

    // Attach ALL Event Listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // CLEANUP MANDATORY: Remove ALL listeners and clear toast timers on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);

      // Clear all active toast timers
      Object.values(toastTimersRef.current).forEach((t) => clearTimeout(t));
      toastTimersRef.current = {};
    };
  }, [isActive, attemptId, handleViolation]);

  return {
    tabSwitchCount,
    isFullscreen,
    latestWarning,
    activeViolations,
    dismissViolation,
    violationCount,
    maxViolations,
    requestFullscreen,
  };
}
