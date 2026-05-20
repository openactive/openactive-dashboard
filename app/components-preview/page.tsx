"use client";

import { useState } from "react";
import { StatCard } from "../components/StatCard";
import { FilterDropdown, FilterOption } from "../components/FilterDropdown";
import { Panel } from "../components/Panel";
import { Badge } from "../components/Badge";

const regionOptions: FilterOption[] = [
  { value: "all", label: "All Regions" },
  { value: "london", label: "London" },
  { value: "south-east", label: "South East" },
  { value: "north-west", label: "North West" },
  { value: "scotland", label: "Scotland" },
];

const statusOptions: FilterOption[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "error", label: "Error" },
];

export default function ComponentsPage() {
  const [region, setRegion] = useState("all");
  const [status, setStatus] = useState("all");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-oa-grey-900">
          Component Library
        </h1>
        <p className="mt-2 text-oa-grey-500">
          Development reference for reusable UI components. This page is not
          linked from the main navigation.
        </p>
      </header>

      {/* ───────────────────────── StatCard ───────────────────────── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-oa-grey-800 mb-4">
          StatCard
        </h2>
        <p className="text-sm text-oa-grey-500 mb-6">
          Key metric tiles with optional trend indicators. Supports
          &quot;up&quot;, &quot;down&quot;, and &quot;neutral&quot; trends with
          configurable positive/negative semantics.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Feeds"
            value="1,247"
            change="+8.2%"
            trend="up"
          />
          <StatCard
            label="Active Opportunities"
            value="3.4M"
            change="+124K"
            trend="up"
            unit="sessions"
          />
          <StatCard
            label="Error Rate"
            value="2.1"
            change="+0.3%"
            trend="up"
            positiveIsGood={false}
            unit="%"
          />
          <StatCard
            label="Data Coverage"
            value="68"
            change="-2.1%"
            trend="down"
            unit="%"
          />
          <StatCard label="Last Updated" value="12 min ago" />
          <StatCard
            label="Avg Response Time"
            value="342"
            change="-18ms"
            trend="down"
            positiveIsGood={false}
            unit="ms"
          />
        </div>
      </section>

      {/* ───────────────────────── Badge ───────────────────────── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-oa-grey-800 mb-4">Badge</h2>
        <p className="text-sm text-oa-grey-500 mb-6">
          Inline status indicators with semantic colour variants.
        </p>
        <div className="flex flex-wrap gap-3">
          <Badge variant="success">Active</Badge>
          <Badge variant="warning">Degraded</Badge>
          <Badge variant="error">Down</Badge>
          <Badge variant="info">Beta</Badge>
          <Badge variant="neutral">Archived</Badge>
          <Badge variant="success">RPDE Valid</Badge>
          <Badge variant="error">Missing Fields</Badge>
          <Badge variant="info">OpenActive 2.0</Badge>
        </div>
      </section>

      {/* ───────────────────────── FilterDropdown ───────────────────────── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-oa-grey-800 mb-4">
          FilterDropdown
        </h2>
        <p className="text-sm text-oa-grey-500 mb-6">
          Accessible custom listbox dropdown for filtering. Closes on outside
          click or Escape key.
        </p>
        <div className="flex flex-wrap gap-4">
          <FilterDropdown
            label="Region"
            options={regionOptions}
            value={region}
            onChange={setRegion}
          />
          <FilterDropdown
            label="Status"
            options={statusOptions}
            value={status}
            onChange={setStatus}
          />
        </div>
        <p className="mt-4 text-xs text-oa-grey-400">
          Selected: region=<code>{region}</code>, status=<code>{status}</code>
        </p>
      </section>

      {/* ───────────────────────── Panel ───────────────────────── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-oa-grey-800 mb-4">Panel</h2>
        <p className="text-sm text-oa-grey-500 mb-6">
          White card container for grouping dashboard content. Supports optional
          title, description, and full-bleed (noPadding) mode.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Panel
            title="Feed Health Overview"
            description="Last 30 days of feed availability data"
          >
            <div className="h-40 rounded bg-oa-grey-100 flex items-center justify-center text-sm text-oa-grey-400">
              Chart placeholder
            </div>
          </Panel>

          <Panel title="Regional Distribution">
            <div className="h-40 rounded bg-oa-grey-100 flex items-center justify-center text-sm text-oa-grey-400">
              Map placeholder
            </div>
          </Panel>

          <Panel
            title="Full-Bleed Chart"
            description="Using noPadding for edge-to-edge content"
            noPadding
          >
            <div className="h-40 bg-oa-grey-100 flex items-center justify-center text-sm text-oa-grey-400">
              Full-width chart placeholder
            </div>
          </Panel>

          <Panel>
            <p className="text-sm text-oa-grey-600">
              A Panel without a title — useful for simple card wrappers.
            </p>
          </Panel>
        </div>
      </section>

      {/* ───────────────────────── Combined Example ───────────────────────── */}
      <section className="mb-16">
        <h2 className="text-xl font-semibold text-oa-grey-800 mb-4">
          Combined Example
        </h2>
        <p className="text-sm text-oa-grey-500 mb-6">
          A realistic dashboard section showing components working together.
        </p>
        <Panel title="Layer 1 — Ecosystem Summary">
          <div className="flex flex-wrap gap-3 mb-6">
            <FilterDropdown
              label="Region"
              options={regionOptions}
              value={region}
              onChange={setRegion}
            />
            <FilterDropdown
              label="Status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="Publishers"
              value="187"
              change="+12"
              trend="up"
            />
            <StatCard
              label="Feed Uptime"
              value="99.2"
              change="-0.1%"
              trend="down"
              unit="%"
            />
            <StatCard
              label="Data Quality"
              value="B+"
              change="Stable"
              trend="neutral"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Badge variant="success">System Healthy</Badge>
            <Badge variant="info">v2.0 Compliant</Badge>
          </div>
        </Panel>
      </section>
    </div>
  );
}
