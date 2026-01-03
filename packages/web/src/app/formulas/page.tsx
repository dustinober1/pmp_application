"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { FullPageSkeleton } from "@/components/FullPageSkeleton";

interface Formula {
  id: string;
  name: string;
  category: string;
  expression: string;
  description: string;
  whenToUse: string;
}

interface CalcResult {
  result: number;
  steps: Array<{
    stepNumber: number;
    description: string;
    expression: string;
    value: number;
  }>;
  interpretation: string;
}

export default function FormulasPage() {
  const { user, canAccess, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  const fetchFormulas = useCallback(async () => {
    try {
      const response = await apiRequest<{ formulas: Formula[] }>("/formulas");
      setFormulas(response.data?.formulas ?? []);
    } catch (error) {
      console.error("Failed to fetch formulas:", error);
      toast.error("Failed to load formulas. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (canAccess) {
      fetchFormulas();
    }
  }, [canAccess, fetchFormulas]);

  const calculate = async () => {
    if (!selectedFormula) return;

    setCalculating(true);
    setResult(null);

    try {
      const numericInputs: Record<string, number> = {};
      for (const [key, value] of Object.entries(inputs)) {
        numericInputs[key] = parseFloat(value) || 0;
      }

      const response = await apiRequest<{ result: CalcResult }>(
        `/formulas/${selectedFormula.id}/calculate`,
        { method: "POST", body: { inputs: numericInputs } },
      );
      setResult(response.data?.result ?? null);
    } catch (error) {
      console.error("Calculation failed:", error);
      toast.error(
        "Calculation failed. Please check your inputs and try again.",
      );
    } finally {
      setCalculating(false);
    }
  };

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(formulas.map((f) => f.category)))],
    [formulas],
  );
  const filteredFormulas = useMemo(
    () =>
      selectedCategory === "all"
        ? formulas
        : formulas.filter((f) => f.category === selectedCategory),
    [formulas, selectedCategory],
  );

  const canUseCalculator = user?.tier === "pro" || user?.tier === "corporate";

  if (authLoading || loading) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Formula Reference</h1>
          <p className="text-[var(--foreground-muted)]">
            Essential PMP formulas with interactive calculator.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition ${
                selectedCategory === category
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]"
              }`}
            >
              {category.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Formula List */}
          <div className="lg:col-span-2">
            <div className="grid gap-4">
              {filteredFormulas.map((formula) => (
                <button
                  key={formula.id}
                  type="button"
                  className={`card w-full text-left cursor-pointer transition ${
                    selectedFormula?.id === formula.id
                      ? "ring-2 ring-[var(--primary)]"
                      : "hover:border-[var(--primary)]"
                  }`}
                  onClick={() => {
                    setSelectedFormula(formula);
                    setInputs({});
                    setResult(null);
                  }}
                  aria-pressed={selectedFormula?.id === formula.id}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{formula.name}</h3>
                      <p className="text-lg font-mono text-[var(--primary)] mt-1">
                        {formula.expression}
                      </p>
                    </div>
                    <span className="badge badge-primary capitalize">
                      {formula.category.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)] mt-3">
                    {formula.description}
                  </p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-2">
                    <strong>When to use:</strong> {formula.whenToUse}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Calculator Panel */}
          <div>
            <div className="card sticky top-24">
              <h2 className="font-semibold mb-4">Calculator</h2>

              {!canUseCalculator ? (
                <div className="text-center py-8">
                  <p className="text-[var(--foreground-muted)] mb-4">
                    Interactive calculator is available for High-End and
                    Corporate tiers.
                  </p>
                  <button className="btn btn-primary">Upgrade Now</button>
                </div>
              ) : selectedFormula ? (
                <div>
                  <p className="text-sm font-medium mb-2">
                    {selectedFormula.name}
                  </p>
                  <p className="text-lg font-mono text-[var(--primary)] mb-4">
                    {selectedFormula.expression}
                  </p>

                  {/* Dynamic inputs based on formula expression */}
                  <div className="space-y-3 mb-4">
                    {getVariablesFromExpression(selectedFormula.expression).map(
                      (variable) => {
                        const inputId = `variable-${variable.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
                        return (
                          <div key={variable}>
                            <label
                              htmlFor={inputId}
                              className="block text-sm font-medium mb-1"
                            >
                              {variable}
                            </label>
                            <input
                              id={inputId}
                              type="number"
                              value={inputs[variable] || ""}
                              onChange={(e) =>
                                setInputs((prev) => ({
                                  ...prev,
                                  [variable]: e.target.value,
                                }))
                              }
                              className="input"
                              placeholder={`Enter ${variable}`}
                            />
                          </div>
                        );
                      },
                    )}
                  </div>

                  <button
                    onClick={calculate}
                    disabled={calculating}
                    className="btn btn-primary w-full"
                  >
                    {calculating ? "Calculating..." : "Calculate"}
                  </button>

                  {/* Result */}
                  {result && (
                    <div className="mt-4 p-4 bg-[var(--secondary)] rounded-lg">
                      <p className="text-sm font-medium text-[var(--foreground-muted)]">
                        Result
                      </p>
                      <p className="text-2xl font-bold text-[var(--primary)]">
                        {result.result.toFixed(2)}
                      </p>
                      <p className="text-sm mt-2">{result.interpretation}</p>

                      {result.steps?.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[var(--border)]">
                          <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2">
                            Steps
                          </p>
                          {result.steps.map((step, i) => (
                            <p key={i} className="text-xs font-mono">
                              {step.expression} = {step.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-[var(--foreground-muted)] text-center py-8">
                  Select a formula to use the calculator
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper to extract variables from formula expression
function getVariablesFromExpression(expression: string): string[] {
  const parts = expression.split("=");
  if (parts.length < 2) return [];

  const rightSide = parts[1] || "";
  const variables = rightSide.match(/[A-Z]+/g) || [];
  return [...new Set(variables)];
}
