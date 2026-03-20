import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Database, Search } from "lucide-react";
import { formatDuration } from "../utils/time";

const DATASET_WINDOW_SIZE = 500;
const SECTION_SIZE = 100;

function splitIntoSections(records, size) {
  const sections = [];
  for (let i = 0; i < records.length; i += size) {
    sections.push(records.slice(i, i + size));
  }
  return sections;
}

function DatasetViewer({ dataset }) {
  const [search, setSearch] = useState("");
  const [expandedSections, setExpandedSections] = useState({ 0: true });

  const filtered = useMemo(() => {
    if (!search) return dataset;
    const query = search.toLowerCase();
    return dataset.filter(
      (d) =>
        String(d.Batch_ID || "").toLowerCase().includes(query) ||
        String(d.Product_Type || "").toLowerCase().includes(query)
    );
  }, [search, dataset]);

  const latestRecords = useMemo(
    () => filtered.slice(-DATASET_WINDOW_SIZE).reverse(),
    [filtered]
  );

  const sections = useMemo(
    () => splitIntoSections(latestRecords, SECTION_SIZE),
    [latestRecords]
  );

  useEffect(() => {
    setExpandedSections({ 0: true });
  }, [search, dataset]);

  const toggleSection = (index) => {
    setExpandedSections((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));
  };

  const renderRows = (rows) => (
    <tbody>
      {rows.map((d) => (
        <tr key={d.Batch_ID} className="glass-row border-b border-border/20 transition-colors">
          <td className="px-3 py-2 font-mono font-semibold text-primary">{d.Batch_ID}</td>
          <td className="px-3 py-2 text-muted-foreground">{String(d.Product_Type || "").replace("Oncology_", "")}</td>
          <td className="px-3 py-2">{d.Production_Line}</td>
          <td className="px-3 py-2">{d.Machine_ID}</td>
          <td className="px-3 py-2 font-mono">{d.Workers_Assigned}</td>
          <td className="px-3 py-2 font-mono">{d.Raw_Material_Quantity}</td>
          <td className="px-3 py-2 font-mono">{d.Batch_Size}</td>
          <td className="px-3 py-2">
            <span className={`priority-${String(d.Production_Priority || "low").toLowerCase()}`}>
              {d.Production_Priority}
            </span>
          </td>
          <td className="px-3 py-2">{d.Quality_Check_Level}</td>
          <td className="px-3 py-2 font-mono">{d.Machine_Load}</td>
          <td className="px-3 py-2">{d.Temperature_Control}</td>
          <td className="px-3 py-2">{d.Shift}</td>
          <td className="px-3 py-2 font-mono font-semibold">{formatDuration(d.Processing_Time)}</td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="glass-card animate-slide-up overflow-hidden">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h3 className="flex items-center gap-2 font-display text-sm font-semibold text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-warning/15 bg-warning/10">
            <Database className="h-3.5 w-3.5 text-warning" />
          </div>
          Production Dataset
        </h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search batches..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="glass-input h-8 w-48 pl-7 pr-2 text-xs"
            />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground">
            showing {latestRecords.length} of {filtered.length} records
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="data-table w-full text-[11px]">
          <thead>
            <tr className="glass-table-head border-y border-border">
              {[
                "Batch",
                "Product",
                "Line",
                "Machine",
                "Workers",
                "Material",
                "Size",
                "Priority",
                "Quality",
                "Load",
                "Temp",
                "Shift",
                "Time"
              ].map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-3 py-2 text-left text-[9px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          {sections.length > 0 ? renderRows(sections[0]) : <tbody />}
        </table>

        {sections.slice(1).map((sectionRows, idx) => {
          const sectionIndex = idx + 1;
          const start = sectionIndex * SECTION_SIZE + 1;
          const end = sectionIndex * SECTION_SIZE + sectionRows.length;
          const expanded = Boolean(expandedSections[sectionIndex]);

          return (
            <div key={`dataset-section-${sectionIndex}`} className="border-t border-border/30">
              <button
                type="button"
                onClick={() => toggleSection(sectionIndex)}
                className="glass-subtle flex w-full items-center justify-between px-5 py-2 text-left text-[10px] text-muted-foreground"
              >
                <span>
                  Records {start}-{end} (collapsed by default)
                </span>
                {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {expanded && (
                <table className="data-table w-full text-[11px]">
                  {renderRows(sectionRows)}
                </table>
              )}
            </div>
          );
        })}

        <div className="glass-subtle border-t border-border/30 px-5 py-2 text-center text-[10px] text-muted-foreground">
          Showing latest {latestRecords.length} records in {Math.max(sections.length, 1)} section(s)
        </div>
      </div>
    </div>
  );
}

export default DatasetViewer;
