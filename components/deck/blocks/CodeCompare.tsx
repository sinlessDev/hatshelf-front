import type { CodeBlock as CodeBlockType, HighlightedCode } from "@/lib/slides/types";
import { CodeBlock } from "./CodeBlock";

type Props = {
  bad: CodeBlockType & HighlightedCode;
  good: CodeBlockType & HighlightedCode;
};

export function CodeCompare({ bad, good }: Props) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
      <CodeBlock block={bad} />
      <CodeBlock block={good} />
    </div>
  );
}
