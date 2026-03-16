import { useState } from "react";
import { retrainModel, uploadDataset } from "../services/api";
import { Loader2 } from "lucide-react";

function UploadDataset({ onRefresh }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");
  const [loadingAction, setLoadingAction] = useState("");

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus("Please select a CSV file first.");
      return;
    }

    try {
      setLoadingAction("upload");
      const result = await uploadDataset(selectedFile);
      setStatus(`Upload complete. Rows: ${result.rows}`);
      onRefresh();
    } catch (error) {
      setStatus(error?.response?.data?.detail || "Dataset upload failed.");
    } finally {
      setLoadingAction("");
    }
  };

  const handleRetrain = async () => {
    try {
      setLoadingAction("retrain");
      const result = await retrainModel();
      const modelName = result?.result?.selected_model || "model";
      setStatus(`Retrained successfully using ${modelName}.`);
      onRefresh();
    } catch (error) {
      setStatus(error?.response?.data?.detail || "Retraining failed.");
    } finally {
      setLoadingAction("");
    }
  };

  const loading = loadingAction.length > 0;

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold font-display text-foreground">Dataset Management</h3>
      <p className="mt-1 text-xs text-muted-foreground">Upload production CSV files or retrain model with complete historical data.</p>

      <div className="mt-4 flex flex-col gap-3 lg:flex-row">
        <input
          className="glass-input h-9 w-full p-2 text-xs"
          type="file"
          accept=".csv"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
        />
        <button
          onClick={handleUpload}
          disabled={loading}
          className="h-9 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-1.5">
            {loadingAction === "upload" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loadingAction === "upload" ? "Processing..." : "Upload Dataset"}
          </span>
        </button>
        <button
          onClick={handleRetrain}
          disabled={loading}
          className="glass-button h-9 px-4 text-xs disabled:opacity-60"
        >
          <span className="inline-flex items-center gap-1.5">
            {loadingAction === "retrain" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {loadingAction === "retrain" ? "Please wait..." : "Retrain Model"}
          </span>
        </button>
      </div>

      {status && (
        <div className="glass-subtle mt-3 px-3 py-2 text-xs text-muted-foreground">
          {status}
        </div>
      )}
    </div>
  );
}

export default UploadDataset;
