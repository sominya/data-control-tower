# Data Control Tower

Operational console for data products, pipelines, datasets, quality checks, process lineage, and incident assignment.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## What’s included (notional data)

- **4 data products** (Customer 360, Order Analytics, Product Catalog, Finance Reporting)
- **Pipelines** with schedules, owners, and health status
- **Datasets** with row counts, freshness, and per-dataset checks
- **Pipeline quality checks** (pass / fail / warn) by data quality dimension
- **Process lineage graphs** per pipeline (click dataset nodes to drill down)
- **Incidents** linked to failed checks — assign to team members, update status

## Hierarchy

```
Data Product
 └── Pipeline(s)
      ├── Quality checks
      ├── Process lineage graph
      └── Dataset(s)
           └── Dataset checks
```

Logged in as **Alex Chen** by default. Use **Open incident** on a failing pipeline check to create and assign an incident, or manage incidents on the Incidents page.

## Azure Static Web Apps

This project uses **Vite**, which outputs to `dist` (not Create React App’s `build`). GitHub Actions workflows under `.github/workflows/azure-static-web-apps-*.yml` must set `output_location: "dist"`.
