import { useState } from "react";
import { Loader2, WandSparkles } from "lucide-react";
import { runWhatIfScenario } from "../services/api";
import { formatDuration } from "../utils/time";

const initialState = {
  original_machine_id: "M2",
  new_machine_id: "M3",
  original_workers: 3,
  new_workers: 5,
  batch_size: 120,
  raw_material_quantity: 150,
  production_priority: "High",
  quality_check_level: "Strict",
  machine_load: 0.75,
  temperature_control: "Stable",
  shift: "Morning",
};

function ScenarioSimulator() {
  const [form, setForm] = useState(initialState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));

  const handleRunScenario = async () => {
    try {
      setLoading(true);
      setError("");
      const payload = {
        ...form,
        original_workers: Number(form.original_workers),
        new_workers: Number(form.new_workers),
        batch_size: Number(form.batch_size),
        raw_material_quantity: Number(form.raw_material_quantity),
        machine_load: Number(form.machine_load),
      };
      const response = await runWhatIfScenario(payload);
      setResult(response);
    } catch (apiError) {
      setError(apiError?.response?.data?.detail || "Scenario simulation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-5">
      <h3 className="mb-4 font-display text-sm font-semibold text-foreground">Scenario Simulator</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-xs text-muted-foreground">
          Original Workers
          <input type="number" className="glass-input mt-1 h-9 w-full px-2" value={form.original_workers} onChange={(event) => update("original_workers", event.target.value)} />
        </label>
        <label className="text-xs text-muted-foreground">
          New Workers
          <input type="number" className="glass-input mt-1 h-9 w-full px-2" value={form.new_workers} onChange={(event) => update("new_workers", event.target.value)} />
        </label>
        <label className="text-xs text-muted-foreground">
          Batch Size
          <input type="number" className="glass-input mt-1 h-9 w-full px-2" value={form.batch_size} onChange={(event) => update("batch_size", event.target.value)} />
        </label>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-xs text-muted-foreground">
          Original Machine
          <select className="glass-input mt-1 h-9 w-full px-2" value={form.original_machine_id} onChange={(event) => update("original_machine_id", event.target.value)}>
            {["M1", "M2", "M3", "M4", "M5"].map((machine) => (
              <option key={machine} value={machine}>{machine}</option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted-foreground">
          New Machine
          <select className="glass-input mt-1 h-9 w-full px-2" value={form.new_machine_id} onChange={(event) => update("new_machine_id", event.target.value)}>
            {["M1", "M2", "M3", "M4", "M5"].map((machine) => (
              <option key={machine} value={machine}>{machine}</option>
            ))}
          </select>
        </label>
      </div>

      <button onClick={handleRunScenario} disabled={loading} className="mt-4 inline-flex h-9 items-center rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <WandSparkles className="mr-1.5 h-3.5 w-3.5" />} 
        {loading ? "Simulating..." : "Run Scenario"}
      </button>

      {result && (
        <div className="glass-pane mt-4 p-3 text-xs text-foreground">
          <p>Original Time: {formatDuration(result.original_time)}</p>
          <p>New Estimated Time: {formatDuration(result.new_estimated_time)}</p>
          <p>Improvement: {formatDuration(Math.abs(result.improvement_minutes))} {result.improved ? "faster" : "slower"}</p>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}

export default ScenarioSimulator;
