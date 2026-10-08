import { SUMMARY } from "../../content/wrapup";
import { TitledBlock } from "../ui/TitledBlock";

export function ChapterSummary() {
  return (
    <TitledBlock title="In one sentence">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3">
        {SUMMARY.map(([k, v]) => (
          <div
            key={k}
            className="flex flex-col gap-3 rounded-[10px] border border-line p-[18px]"
          >
            <span className="font-mono text-xs leading-none font-medium text-text-faint">
              {k}
            </span>
            <span className="text-base leading-[1.55] text-text-bright">{v}</span>
          </div>
        ))}
      </div>
    </TitledBlock>
  );
}
