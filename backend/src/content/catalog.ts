import { ProductCatalog } from "./types";

export const fusionCloudCatalog: ProductCatalog[] = [
  {
    id: "financials",
    name: "Fusion Cloud Financials",
    skills: [
      {
        id: "invoicing-basics",
        name: "Invoicing",
        path: ["Financials", "Receivables", "Invoicing"],
        lessons: [
          {
            id: "create-invoice",
            title: "Create Invoice",
            objective: "Generate and validate a customer invoice for billed services.",
            keywords: ["invoice", "billing", "receivables", "customer"],
            prerequisites: ["Customer account setup", "Validated billing schedule"],
            questionSet: "financials-invoicing-create-invoice",
          },
        ],
      },
      {
        id: "close-period",
        name: "Period Close",
        path: ["Financials", "General Ledger", "Period Close"],
        lessons: [
          {
            id: "review-close-checklist",
            title: "Review Period Close Checklist",
            objective: "Confirm all ledgers are balanced and ready for close.",
            keywords: ["close", "ledger", "reconciliation", "checklist"],
            prerequisites: ["Subledger close completed", "Journal entries posted"],
            questionSet: "financials-close-checklist",
          },
        ],
      },
    ],
  },
  {
    id: "hcm",
    name: "Fusion Cloud HCM",
    skills: [
      {
        id: "payroll-operations",
        name: "Payroll Operations",
        path: ["HCM", "Payroll", "Run Payroll"],
        lessons: [
          {
            id: "run-payroll",
            title: "Run Payroll",
            objective: "Process a payroll run and validate the results before submission.",
            keywords: ["payroll", "pay run", "earnings", "deductions"],
            prerequisites: ["Time collection approved", "Pay period open"],
            questionSet: "hcm-payroll-run-payroll",
          },
        ],
      },
    ],
  },
  {
    id: "scm",
    name: "Fusion Cloud SCM",
    skills: [
      {
        id: "procurement-approvals",
        name: "Procurement Approvals",
        path: ["SCM", "Procurement", "Approvals"],
        lessons: [
          {
            id: "approve-purchase-order",
            title: "Approve Purchase Order",
            objective: "Review and approve a purchase order to release it to suppliers.",
            keywords: ["purchase order", "approval", "procurement", "supplier"],
            prerequisites: ["Budget check complete", "PO submitted for approval"],
            questionSet: "scm-procurement-approve-po",
          },
        ],
      },
      {
        id: "supplier-onboarding",
        name: "Supplier Management",
        path: ["SCM", "Procurement", "Supplier Management"],
        lessons: [
          {
            id: "capture-supplier-profile",
            title: "Capture Supplier Profile",
            objective: "Collect supplier details and route for compliance review.",
            keywords: ["supplier", "onboarding", "risk", "profile"],
            prerequisites: ["Supplier registration request received"],
            questionSet: "scm-procurement-supplier-profile",
          },
        ],
      },
    ],
  },
];
