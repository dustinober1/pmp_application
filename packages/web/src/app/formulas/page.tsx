"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";

interface Formula {
  id: string;
  name: string;
  category: string;
  expression: string;
  description: string;
  whenToUse: string;
}

// Static list of essential PMP formulas
const STATIC_FORMULAS: Formula[] = [
  // Earned Value Management
  {
    id: "ev",
    name: "Earned Value",
    category: "EVM",
    expression: "EV = % Complete × BAC",
    description: "The value of work actually completed to date.",
    whenToUse: "When measuring progress and forecasting project performance.",
  },
  {
    id: "cv",
    name: "Cost Variance",
    category: "EVM",
    expression: "CV = EV - AC",
    description:
      "The difference between earned value and actual cost. Positive = under budget.",
    whenToUse: "When analyzing cost performance on a project.",
  },
  {
    id: "sv",
    name: "Schedule Variance",
    category: "EVM",
    expression: "SV = EV - PV",
    description:
      "The difference between earned value and planned value. Positive = ahead of schedule.",
    whenToUse: "When analyzing schedule performance on a project.",
  },
  {
    id: "cpi",
    name: "Cost Performance Index",
    category: "EVM",
    expression: "CPI = EV / AC",
    description: "Ratio of earned value to actual cost. >1 means under budget.",
    whenToUse: "When forecasting if the project will complete within budget.",
  },
  {
    id: "spi",
    name: "Schedule Performance Index",
    category: "EVM",
    expression: "SPI = EV / PV",
    description:
      "Ratio of earned value to planned value. >1 means ahead of schedule.",
    whenToUse: "When forecasting if the project will complete on time.",
  },
  {
    id: "eac",
    name: "Estimate at Completion",
    category: "EVM",
    expression: "EAC = BAC / CPI",
    description: "Expected total cost of the project at completion.",
    whenToUse:
      "When forecasting the final project cost based on current performance.",
  },
  {
    id: "etc",
    name: "Estimate to Complete",
    category: "EVM",
    expression: "ETC = EAC - AC",
    description: "Expected cost to complete all remaining work.",
    whenToUse:
      "When determining how much more money is needed to finish the project.",
  },
  {
    id: "vac",
    name: "Variance at Completion",
    category: "EVM",
    expression: "VAC = BAC - EAC",
    description: "Expected cost variance at project completion.",
    whenToUse: "When forecasting the final budget variance.",
  },
  // Communication
  {
    id: "channels",
    name: "Communication Channels",
    category: "Communication",
    expression: "Channels = N × (N - 1) / 2",
    description:
      "Number of potential communication paths among N stakeholders.",
    whenToUse:
      "When planning communication requirements and identifying complexity.",
  },
  // Procurement
  {
    id: "ptp",
    name: "Point of Total Assumption",
    category: "Procurement",
    expression:
      "PTA = (Ceiling Price - Target Price) / Buyer Share + Target Cost",
    description: "The cost at which the seller assumes all cost overruns.",
    whenToUse: "When analyzing fixed price incentive fee contracts.",
  },
  // Scheduling
  {
    id: "float",
    name: "Float (Slack)",
    category: "Scheduling",
    expression: "Float = LS - ES = LF - EF",
    description:
      "Amount of time an activity can be delayed without delaying the project.",
    whenToUse: "When analyzing schedule flexibility and critical path.",
  },
  // Quality
  {
    id: "ev_pv",
    name: "Expected Value (Decision Tree)",
    category: "Quality",
    expression: "EMV = Probability × Impact",
    description: "Expected Monetary Value for decision analysis.",
    whenToUse:
      "When quantifying risk impacts and making decisions under uncertainty.",
  },
  // Agile
  {
    id: "velocity",
    name: "Velocity",
    category: "Agile",
    expression: "Velocity = Total Story Points Completed",
    description: "Amount of work a team completes in a single iteration.",
    whenToUse: "When forecasting future iteration capacity in Agile projects.",
  },
];

export default function FormulasPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);

  const categories = useMemo(
    () => [
      "all",
      ...Array.from(new Set(STATIC_FORMULAS.map((f) => f.category))),
    ],
    [],
  );
  const filteredFormulas = useMemo(
    () =>
      selectedCategory === "all"
        ? STATIC_FORMULAS
        : STATIC_FORMULAS.filter((f) => f.category === selectedCategory),
    [selectedCategory],
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Formula Reference</h1>
          <p className="text-[var(--foreground-muted)]">
            Essential PMP formulas for exam preparation.
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
                  onClick={() => setSelectedFormula(formula)}
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

          {/* Formula Detail */}
          <div>
            <div className="card sticky top-24">
              <h2 className="font-semibold mb-4">Formula Detail</h2>

              {selectedFormula ? (
                <div>
                  <p className="text-sm font-medium mb-2">
                    {selectedFormula.name}
                  </p>
                  <p className="text-lg font-mono text-[var(--primary)] mb-4">
                    {selectedFormula.expression}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-[var(--foreground-muted)]">
                        Category
                      </p>
                      <span className="badge badge-primary capitalize">
                        {selectedFormula.category.replace("_", " ")}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--foreground-muted)]">
                        Description
                      </p>
                      <p className="text-sm mt-1">
                        {selectedFormula.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[var(--foreground-muted)]">
                        When to Use
                      </p>
                      <p className="text-sm mt-1">
                        {selectedFormula.whenToUse}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[var(--foreground-muted)] text-center py-8">
                  Select a formula to view details
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
