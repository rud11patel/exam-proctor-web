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

interface UseBrowserProctoringOptions {
  attemptId?: string;
  isActive: boolean;
  onViolation?: (eventType: ProctoringEventType, message: string) => void;
}

export function useBrowserProctoring({ attemptId, isActive, onViolation }: UseBrowserProctoringOptions) {
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [latestWarning, setLatestWarning] = useState<string | null>(null);

  const lastEventTimeRef = useRef<Record<string, number>>({});
  const wasFullscreenRef = useRef<boolean>(false);

  // Debounced API event recorder
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
        await ApiClient.request(`/attempts/${attemptId}/proctoring-events`, {
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
      } catch (err) {
        // Non-blocking background log
      }
    },
    [attemptId, isActive]
  );

  const handleViolation = useCallback(
    (eventType: ProctoringEventType, warningMessage: string, metadata?: any) => {
      setLatestWarning(warningMessage);
      if (onViolation) {
        onViolation(eventType, warningMessage);
      }
      logProctoringEvent(eventType, metadata);
    },
    [logProctoringEvent, onViolation]
  );

  // Fullscreen helper launcher
  const requestFullscreen = useCallback(() => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, []);

  useEffect(() => {
    if (!isActive || !attemptId) {
      return;
    }

    // 1. Tab Switching & Visibility Change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        handleViolation('TAB_SWITCH', 'Warning: Leaving the exam tab is recorded as a proctoring violation.', {
          hidden: true,
        });
      }
    };

    // 2. Window Blur & Focus
    const handleWindowBlur = () => {
      handleViolation('WINDOW_BLUR', 'Warning: Focus lost from examination window.', {
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
      handleViolation('CONTEXT_MENU', 'Right-click context menu is disabled during the examination.');
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
        handleViolation('FULLSCREEN_EXIT', 'Warning: Fullscreen mode was exited during the examination.');
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

    // CLEANUP MANDATORY: Remove ALL listeners when unmounting or leaving exam
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
    };
  }, [isActive, attemptId, handleViolation]);

  return {
    tabSwitchCount,
    isFullscreen,
    latestWarning,
    requestFullscreen,
  };
}
