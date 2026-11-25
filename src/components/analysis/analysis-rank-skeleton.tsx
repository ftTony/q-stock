import { ANALYSIS_RANK_ROW_H } from "@/components/analysis/analysis-rank-row";

const bar = "block animate-pulse rounded-none bg-[var(--surface-2)]";

export function analysisRankSkeletonCount(viewportH: number): number {
  return Math.max(12, Math.ceil(viewportH / ANALYSIS_RANK_ROW_H) + 2);
}

export function AnalysisRankSkeletonLeft({
  count,
  check,
  symW,
  nameW,
}: {
  count: number;
  check: number;
  symW: number;
  nameW: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr
          key={`sk-l-${i}`}
          style={{ height: ANALYSIS_RANK_ROW_H }}
          className="h-[41px] max-h-[41px]"
        >
          <td
            className="box-border h-[41px] max-h-[41px] overflow-hidden border-b border-[var(--border)]/70 px-2 align-middle"
            style={{ width: check, height: ANALYSIS_RANK_ROW_H }}
          >
            <span className={`${bar} h-3.5 w-3.5`} />
          </td>
          <td
            className="box-border h-[41px] max-h-[41px] overflow-hidden border-b border-[var(--border)]/70 px-2 align-middle"
            style={{ width: symW, height: ANALYSIS_RANK_ROW_H }}
          >
            <span className={`${bar} h-3 w-12`} />
          </td>
          <td
            className="box-border h-[41px] max-h-[41px] overflow-hidden border-b border-[var(--border)]/70 px-2 align-middle"
            style={{ width: nameW, height: ANALYSIS_RANK_ROW_H }}
          >
            <span className={`${bar} h-3 w-[72%]`} />
          </td>
        </tr>
      ))}
    </>
  );
}

export function AnalysisRankSkeletonMid({
  count,
  colCount,
}: {
  count: number;
  colCount: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr
          key={`sk-m-${i}`}
          style={{ height: ANALYSIS_RANK_ROW_H }}
          className="h-[41px] max-h-[41px]"
        >
          <td
            colSpan={colCount}
            className="box-border h-[41px] max-h-[41px] overflow-hidden border-b border-[var(--border)]/70 px-2 align-middle"
            style={{ height: ANALYSIS_RANK_ROW_H }}
          >
            <span className={`${bar} h-3 w-full max-w-[92%]`} />
          </td>
        </tr>
      ))}
    </>
  );
}

export function AnalysisRankSkeletonRight({
  count,
  actW,
}: {
  count: number;
  actW: number;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <tr
          key={`sk-r-${i}`}
          style={{ height: ANALYSIS_RANK_ROW_H }}
          className="h-[41px] max-h-[41px]"
        >
          <td
            className="box-border h-[41px] max-h-[41px] overflow-hidden border-b border-[var(--border)]/70 px-2 align-middle"
            style={{ width: actW, height: ANALYSIS_RANK_ROW_H }}
          >
            <span className={`${bar} ml-auto h-3 w-14`} />
          </td>
        </tr>
      ))}
    </>
  );
}
