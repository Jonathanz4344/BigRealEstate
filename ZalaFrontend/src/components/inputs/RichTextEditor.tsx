import clsx from "clsx";
import { produce } from "immer";
import { useEffect, useRef, useState } from "react";

type Command = {
  label: string;
  command: string;
  prompt?: string;
};

const DEFAULT_COMMANDS: Command[] = [
  { label: "B", command: "bold" },
  { label: "I", command: "italic" },
  { label: "U", command: "underline" },
  // { label: "Link", command: "createLink", prompt: "Enter URL" },
  // { label: "• List", command: "insertUnorderedList" },
  // { label: "1. List", command: "insertOrderedList" },
];

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  commands?: Command[];
};

export const RichTextEditor = ({
  value,
  onChange,
  label,
  placeholder,
  commands = DEFAULT_COMMANDS,
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);

  const blackListCommands = [
    "createLink",
    "insertUnorderedList",
    "insertOrderedList",
  ];
  const [activeCommands, setActiveCommands] = useState<string[]>([]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const toggleCommand = (command: Command) =>
    setActiveCommands(
      produce((draft) => {
        if (draft.includes(command.command))
          return draft.filter((cmd) => cmd !== command.command);
        draft.push(command.command);
      })
    );

  const runCommand = (command: Command) => {
    if (!editorRef.current || typeof document === "undefined") return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      editorRef.current?.focus();
    }

    if (command.command === "createLink") {
      const url = window.prompt(command.prompt ?? "Enter link URL");
      if (!url) return;
      document.execCommand(command.command, false, url);
    } else {
      document.execCommand(command.command, false);
    }

    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML ?? "");

    if (!blackListCommands.includes(command.command)) toggleCommand(command);
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML ?? "");
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-secondary text-sm font-semibold">{label}</label>
      )}
      <div className="flex flex-wrap gap-2">
        {commands.map((command) => (
          <button
            key={command.label}
            type="button"
            onClick={() => runCommand(command)}
            className={clsx(
              "px-3 py-1 cursor-pointer rounded-md border text-sm transition",
              "text-secondary border-secondary hover:bg-secondary hover:text-white",
              activeCommands.includes(command.command)
                ? "bg-white border-2 text-secondary font-bold"
                : ""
            )}
          >
            {command.label}
          </button>
        ))}
      </div>
      <div
        ref={editorRef}
        className="min-h-[200px] max-h-[200px] overflow-y-scroll rounded-[15px] border-2 box-shadow-sm bg-white border-secondary p-3 text-secondary focus:outline-none focus:border-accent"
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
};
