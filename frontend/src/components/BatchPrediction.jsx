import { useState } from "react";
import { addBatch, predictBatch } from "../services/api";
import { Sparkles, Plus, Timer, Loader2 } from "lucide-react";
import { formatDuration } from "../utils/time";

const initialForm = {
  Product_Type: "Oncology_Drug_A",
  Production_Line: "Line_1",
  Machine_ID: "M1",
  Workers_Assigned: 5,
  Raw_Material_Quantity: 150,
  Batch_Size: 120,
  Production_Priority: "High",
  Quality_Check_Level: "Strict",
  Machine_Load: 0.75,
  Temperature_Control: "Stable",
  Shift: "Night"
};

const MACHINE_OPTIONS = ["M1", "M2", "M3", "M4", "M5"];
const PRODUCT_OPTIONS = ["Oncology_Drug_A", "Oncology_Drug_B", "Oncology_Drug_C", "Oncology_Drug_D"];
const LINE_OPTIONS = ["Line_1", "Line_2", "Line_3"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const QUALITY_OPTIONS = ["Standard", "Enhanced", "Strict"];
const SHIFT_OPTIONS = ["Morning", "Evening", "Night"];
const TEMP_OPTIONS = ["Stable", "Moderate", "Sensitive"];

function Field({ label, children }) {
  return (
    <label className="space-y-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div>{children}</div>
    </label>
  );
}

const inputClassName =
  "glass-input h-9 w-full px-3 text-sm";

function BatchPrediction({ onRefresh }) {
  const [form, setForm] = useState(initialForm);
  const [prediction, setPrediction] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  const updateField = (name, value) => {
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePredict = async () => {
    try {
      setLoadingAction("predict");
      const payload = {
        Machine_ID: form.Machine_ID,
        Workers_Assigned: Number(form.Workers_Assigned),
        Batch_Size: Number(form.Batch_Size),
        Raw_Material_Quantity: Number(form.Raw_Material_Quantity),
        Production_Priority: form.Production_Priority,
        Machine_Load: Number(form.Machine_Load),
        Quality_Check_Level: form.Quality_Check_Level,
        Shift: form.Shift,
        Temperature_Control: form.Temperature_Control
      };
      const result = await predictBatch(payload);
      setPrediction(result.predicted_processing_time_minutes);
      setMessage("");
    } catch (error) {
      setMessage(error?.response?.data?.detail || "Prediction failed.");
    } finally {
      setLoadingAction("");
    }
  };

  const handleAddBatch = async () => {
    try {
      setLoadingAction("add");
      const payload = {
        ...form,
        Workers_Assigned: Number(form.Workers_Assigned),
        Batch_Size: Number(form.Batch_Size),
        Raw_Material_Quantity: Number(form.Raw_Material_Quantity),
        Machine_Load: Number(form.Machine_Load)
      };
      const result = await addBatch(payload);
      setPrediction(result.predicted_processing_time);
      setMessage(
        result.auto_retrained
          ? "Batch added and model auto-retrained (20-record threshold reached)."
          : `Batch added. Pending records for auto-retrain: ${result.pending_records_for_auto_retrain}`
      );
      onRefresh();
    } catch (error) {
      setMessage(error?.response?.data?.detail || "Failed to add batch.");
    } finally {
      setLoadingAction("");
    }
  };

  const loading = loadingAction.length > 0;

  return (
    <div className="glass-card animate-slide-up p-5">
      <h3 className="mb-5 flex items-center gap-2 font-display text-sm font-semibold text-foreground">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-accent/15 bg-accent/10">
          <Sparkles className="h-3.5 w-3.5 text-accent" />
        </div>
        Batch Prediction
      </h3>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Product Type">
          <select value={form.Product_Type} onChange={(event) => updateField("Product_Type", event.target.value)} className={inputClassName}>
            {PRODUCT_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Production Line">
          <select value={form.Production_Line} onChange={(event) => updateField("Production_Line", event.target.value)} className={inputClassName}>
            {LINE_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Machine ID">
          <select value={form.Machine_ID} onChange={(event) => updateField("Machine_ID", event.target.value)} className={inputClassName}>
            {MACHINE_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Shift">
          <select value={form.Shift} onChange={(event) => updateField("Shift", event.target.value)} className={inputClassName}>
            {SHIFT_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Workers Assigned">
          <input type="number" min="1" value={form.Workers_Assigned} onChange={(event) => updateField("Workers_Assigned", event.target.value)} className={inputClassName} />
        </Field>

        <Field label="Raw Material Quantity (kg)">
          <input type="number" min="1" step="0.1" value={form.Raw_Material_Quantity} onChange={(event) => updateField("Raw_Material_Quantity", event.target.value)} className={inputClassName} />
        </Field>

        <Field label="Batch Size (units)">
          <input type="number" min="1" value={form.Batch_Size} onChange={(event) => updateField("Batch_Size", event.target.value)} className={inputClassName} />
        </Field>

        <Field label="Machine Load">
          <input type="number" min="0" max="1" step="0.01" value={form.Machine_Load} onChange={(event) => updateField("Machine_Load", event.target.value)} className={inputClassName} />
        </Field>

        <Field label="Production Priority">
          <select value={form.Production_Priority} onChange={(event) => updateField("Production_Priority", event.target.value)} className={inputClassName}>
            {PRIORITY_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Quality Check Level">
          <select value={form.Quality_Check_Level} onChange={(event) => updateField("Quality_Check_Level", event.target.value)} className={inputClassName}>
            {QUALITY_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>

        <Field label="Temperature Control">
          <select value={form.Temperature_Control} onChange={(event) => updateField("Temperature_Control", event.target.value)} className={inputClassName}>
            {TEMP_OPTIONS.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-5 flex gap-2">
        <button onClick={handlePredict} disabled={loading} className="flex h-10 flex-1 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          {loadingAction === "predict" ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
          {loadingAction === "predict" ? "Processing..." : "Predict Processing Time"}
        </button>
        <button onClick={handleAddBatch} disabled={loading} className="glass-button flex h-10 items-center justify-center px-4 text-sm disabled:opacity-60">
          {loadingAction === "add" ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Plus className="mr-1 h-4 w-4" />}
          {loadingAction === "add" ? "Saving..." : "Add Batch"}
        </button>
      </div>

      {prediction !== null && (
        <div className="glow-border animate-slide-up mt-5 rounded-xl border border-primary/15 bg-primary/5 p-5 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Timer className="h-4 w-4 text-primary" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Predicted Processing Time</p>
          </div>
          <p className="glow-text font-mono text-2xl font-bold">{formatDuration(prediction)}</p>
          <p className="mt-1 text-xs text-muted-foreground">estimated processing duration</p>
        </div>
      )}
      {message && <div className="glass-subtle mt-3 px-4 py-2 text-xs text-muted-foreground">{message}</div>}
    </div>
  );
}

export default BatchPrediction;
