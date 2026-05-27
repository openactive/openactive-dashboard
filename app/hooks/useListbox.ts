import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useClickOutside } from "./useClickOutside";
import { useDisclosureTriggerKeyDown } from "./useDisclosureTriggerKeyDown";
import { useEscapeClose } from "./useEscapeClose";
import { useFocusLeaveClose } from "./useFocusLeaveClose";
import { useTabExitClose } from "./useTabExitClose";

export type ListboxOption = {
  value: string;
  label: string;
};

type UseListboxParams = {
  options: ListboxOption[];
  value: string;
  onChange: (value: string) => void;
  idPrefix?: string;
};

/**
 * Listbox with focusable option buttons — Tab moves between options (same as area picker).
 * Arrow keys, Enter, Escape, and typeahead are also supported.
 */
export function useListbox({
  options,
  value,
  onChange,
  idPrefix,
}: UseListboxParams) {
  const autoId = useId();
  const baseId = idPrefix ?? `listbox-${autoId}`;
  const triggerId = `${baseId}-trigger`;
  const labelId = `${baseId}-label`;
  const listboxId = `${baseId}-listbox`;

  const [open, setOpen] = useState(false);
  const selectedIndex = options.findIndex((o) => o.value === value);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const typeaheadRef = useRef("");
  const typeaheadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeListbox = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const openListbox = useCallback(() => {
    setOpen(true);
  }, []);

  const selectIndex = useCallback(
    (index: number) => {
      const option = options[index];
      if (!option) return;
      onChange(option.value);
      setOpen(false);
      triggerRef.current?.focus();
    },
    [options, onChange]
  );

  const focusOption = useCallback(
    (index: number) => {
      const len = options.length;
      if (len === 0) return;
      const wrapped = ((index % len) + len) % len;
      optionRefs.current[wrapped]?.focus();
    },
    [options.length]
  );

  useEffect(() => {
    if (!open) {
      typeaheadRef.current = "";
      return;
    }
    const idx = selectedIndex >= 0 ? selectedIndex : 0;
    requestAnimationFrame(() => optionRefs.current[idx]?.focus());
  }, [open, selectedIndex]);

  useEffect(() => {
    return () => {
      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
    };
  }, []);

  const handleTypeahead = useCallback(
    (char: string) => {
      typeaheadRef.current += char.toLowerCase();
      const match = options.findIndex((o) =>
        o.label.toLowerCase().startsWith(typeaheadRef.current)
      );
      if (match >= 0) focusOption(match);

      if (typeaheadTimerRef.current) clearTimeout(typeaheadTimerRef.current);
      typeaheadTimerRef.current = setTimeout(() => {
        typeaheadRef.current = "";
      }, 500);
    },
    [focusOption, options]
  );

  const handleListboxKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (
        e.key.length === 1 &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        !e.repeat
      ) {
        e.preventDefault();
        handleTypeahead(e.key);
      }
    },
    [handleTypeahead]
  );

  const handleOptionKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          focusOption(index + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          focusOption(index - 1);
          break;
        case "Home":
          e.preventDefault();
          focusOption(0);
          break;
        case "End":
          e.preventDefault();
          focusOption(options.length - 1);
          break;
      }
    },
    [focusOption, options.length]
  );

  const closeOnClickOutside = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, open, closeOnClickOutside);
  useEscapeClose(open, closeListbox);

  const handleTriggerKeyDown = useDisclosureTriggerKeyDown({
    open,
    onOpen: openListbox,
    onClose: closeListbox,
  });

  const handleFocusLeave = useFocusLeaveClose(rootRef, open, closeOnClickOutside);
  const handleTabExit = useTabExitClose(rootRef, open, closeOnClickOutside);

  const handleRootKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      handleTabExit(e);
      handleListboxKeyDown(e);
    },
    [handleListboxKeyDown, handleTabExit]
  );

  const setOptionRef = useCallback(
    (index: number) => (el: HTMLButtonElement | null) => {
      optionRefs.current[index] = el;
    },
    []
  );

  return {
    open,
    setOpen,
    rootRef,
    triggerRef,
    listboxRef,
    triggerId,
    labelId,
    listboxId,
    openListbox,
    closeListbox,
    selectIndex,
    setOptionRef,
    handleTriggerKeyDown,
    handleRootKeyDown,
    handleOptionKeyDown,
    handleFocusLeave,
  };
}
