"use client";

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQ_CONTENT = {
  id: "faq",
  eyebrow: "FAQ",
  title: "Frequently Asked Questions",
  description:
    "Have questions about Expensio? We've got answers. If you can't find what you're looking for, feel free to contact us.",
  items: [
    {
      question: "How does the approval workflow function?",
      answer:
        "Expensio allows admins to create custom, multi-level approval workflows. You can assign specific approvers (like a manager, department head, or finance) and define the sequence. Expenses are automatically routed to the next person in the chain upon approval.",
    },
    {
      question: "Can employees submit expenses in different currencies?",
      answer:
        "Yes! Employees can submit expenses in any currency. Expensio automatically converts the amount to your company's default currency for seamless reporting and reimbursement, using up-to-date exchange rates.",
    },
    {
      question: "How does receipt scanning work?",
      answer:
        "Our OCR (Optical Character Recognition) technology allows employees to simply take a picture of a receipt. Expensio will auto-populate the expense details like vendor, date, and amount, saving time and reducing manual errors.",
    },
    {
      question: "What kind of roles and permissions can I set?",
      answer:
        "Expensio has three primary roles: Employee, Manager, and Admin. Admins have full control to manage users and configure approval rules. Managers can approve/reject expenses for their team, and Employees can submit and track their own expenses.",
    },
  ] as FaqItem[],
} as const;