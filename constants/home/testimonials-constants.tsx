"use client";

export type Testimonial = {
  content: string;
  author: string;
  role: string;
  avatar: string;
  rating: number;
};

export const TESTIMONIALS_CONTENT = {
  id: "testimonials",
  eyebrow: "Testimonials",
  title: "Trusted by Growing Businesses",
  description:
    "See how companies like yours have transformed their expense management process with Expensio.",
  items: [
    {
      content:
        "The approval workflow feature is a game-changer. I can see exactly where an expense report is in the process, and our managers can approve on the go. It's saved our finance team countless hours.",
      author: "Jane Doe",
      role: "Finance Manager, Innovate Inc.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      rating: 5,
    },
    {
      content:
        "As a remote team, submitting expenses used to be a mess of emails and scanned receipts. With Expensio's OCR scanning, my team can submit expenses in seconds, and I get a clear overview of our spending.",
      author: "John Smith",
      role: "CEO, Tech Solutions",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      rating: 5,
    },
    {
      content:
        "Setting up our multi-level approval process was surprisingly easy. Now, expenses are automatically routed from the employee's manager to the department head, ensuring proper oversight without any manual work.",
      author: "Emily White",
      role: "Operations Lead, Creative Co.",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      rating: 5,
    },
    {
      content:
        "Our reimbursement times have been cut in half. The transparency of the system means fewer questions from employees and faster processing by our finance team. Highly recommended!",
      author: "Michael Brown",
      role: "Project Manager, BuildRight",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      rating: 5,
    },
    {
      content:
        "Expensio's reporting tools give us the insights we need to manage our budget effectively. We can finally see where our money is going in real-time.",
      author: "Sarah Green",
      role: "Marketing Director, GoGlobal",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      rating: 5,
    },
    {
      content:
        "The ability to define custom expense policies and have the system flag violations automatically has been crucial for maintaining compliance. It's simple, effective, and powerful.",
      author: "David Chen",
      role: "Head of Sales, NextGen",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80",
      rating: 5,
    },
  ] as Testimonial[],
  communityAvatars: [
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=128&q=80",
  ],
} as const;