import { NOTES } from "../../content/wrapup";
import { TitledBlock } from "../ui/TitledBlock";

export function MigrationNotes() {
  return (
    <TitledBlock title="Migration notes">
      <ol className="m-0 grid list-none grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-3.5 p-0">
        {NOTES.map((n, i) => (
          <li
            key={i}
            className="flex gap-3.5 rounded-[10px] border border-line bg-surface p-4"
          >
            <span className="font-mono text-[13px] leading-[1.6] font-medium text-new">
              0{i + 1}
            </span>
            <span className="text-[15px] leading-[1.6] text-text-prose">{n}</span>
          </li>
        ))}
      </ol>
    </TitledBlock>
  );
}
