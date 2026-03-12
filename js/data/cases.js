// Mock case fixtures
window.CASES = [
  {
    id: "CASE-2024-0441",
    customerId: "CUST-10042",
    accountIds: ["ACC-8821034"],
    category: "EFT / Reg E Dispute",
    complainantNarrative: "Customer states three unauthorized ACH debits totaling $1,247.00 were withdrawn from checking account between March 1–8, 2024. Customer denies authorizing any of these transactions and reports they never received a debit card for this account. Requests full reimbursement and account number change.",
    regulationTags: ["Reg E", "UDAAP"],
    priority: "P1",
    status: "Under Investigation",
    assignedTo: "A. Rivera",
    assignedId: "ASSOC-0034",
    createdAt: "2024-03-09T08:14:00Z",
    sla: {
      regE_provisional: { label: "Reg E Provisional Credit", deadline: "2024-03-19T08:14:00Z", status: "red" },
      regE_investigation: { label: "Reg E Investigation", deadline: "2024-04-23T08:14:00Z", status: "amber" }
    },
    linkedCases: ["CASE-2024-0389"],
    cfpbRef: "230419-11234567",
    determination: null,
    flags: { fourEyesRequired: true, holdReason: null },
    product: "Consumer Checking",
    channel: "Digital",
    tags: ["unauthorized-ach", "provisional-credit-pending"]
  },
  {
    id: "CASE-2024-0388",
    customerId: "CUST-20817",
    accountIds: ["ACC-4412208"],
    category: "Credit Reporting / FCRA Dispute",
    complainantNarrative: "Customer reports Equifax credit report shows a charged-off auto loan ($8,400) that was settled in full in November 2022. Bank confirmed settlement but tradeline still shows 'Charge-Off' status. Customer was denied a mortgage application on February 12, 2024, citing this tradeline. Customer requests immediate correction.",
    regulationTags: ["FCRA", "CFPB"],
    priority: "P1",
    status: "Pending Internal Review",
    assignedTo: "T. Nguyen",
    assignedId: "ASSOC-0051",
    createdAt: "2024-02-14T11:30:00Z",
    sla: {
      fcra_investigation: { label: "FCRA Investigation", deadline: "2024-03-15T11:30:00Z", status: "red" },
      cfpb_acknowledgment: { label: "CFPB Acknowledgment", deadline: "2024-03-01T11:30:00Z", status: "red" },
      cfpb_response: { label: "CFPB Response", deadline: "2024-04-14T11:30:00Z", status: "amber" }
    },
    linkedCases: [],
    cfpbRef: "230815-88901234",
    determination: null,
    flags: { fourEyesRequired: true, holdReason: "Awaiting E-OSCAR confirmation from bureau" },
    product: "Auto Loan",
    channel: "Phone",
    tags: ["tradeline-correction", "charged-off", "mortgage-impact"]
  },
  {
    id: "CASE-2024-0512",
    customerId: "CUST-33501",
    accountIds: ["ACC-7723490"],
    category: "CFPB Complaint — Overdraft Fees",
    complainantNarrative: "Customer filed CFPB complaint (ref #231102-55678901) alleging deceptive overdraft fee practices. Claims bank processed transactions in high-to-low order to maximize overdraft fees, resulting in $245 in fees during November 2023. Customer has active bankruptcy filing (Chapter 13, filed Oct 2023). Legal hold in place.",
    regulationTags: ["CFPB", "UDAAP", "Reg E"],
    priority: "P2",
    status: "Open",
    assignedTo: "M. Chen",
    assignedId: "ASSOC-0078",
    createdAt: "2024-03-01T09:45:00Z",
    sla: {
      cfpb_acknowledgment: { label: "CFPB Acknowledgment", deadline: "2024-03-16T09:45:00Z", status: "amber" },
      cfpb_response: { label: "CFPB Response", deadline: "2024-04-30T09:45:00Z", status: "green" }
    },
    linkedCases: [],
    cfpbRef: "231102-55678901",
    determination: null,
    flags: { fourEyesRequired: false, holdReason: "Legal hold — active bankruptcy Ch.13" },
    product: "Consumer Checking",
    channel: "CFPB Portal",
    tags: ["overdraft-ordering", "bankruptcy", "legal-hold", "udaap-risk"]
  },
  {
    id: "CASE-2024-0477",
    customerId: "CUST-47289",
    accountIds: ["ACC-1182774", "ACC-3308812"],
    category: "Mixed: Reg Z Billing Dispute + SCRA Benefits",
    complainantNarrative: "Active duty service member disputes $320 credit card interest charges assessed after SCRA rate cap should have applied. Customer provided PCS orders on January 15, 2024. Bank failed to apply 6% MLA/SCRA rate cap. Additionally disputes $180 late fee charged while customer was deployed without reliable mail access.",
    regulationTags: ["Reg Z", "SCRA", "MLA"],
    priority: "P2",
    status: "Under Investigation",
    assignedTo: "A. Rivera",
    assignedId: "ASSOC-0034",
    createdAt: "2024-03-05T14:20:00Z",
    sla: {
      regZ_acknowledgment: { label: "Reg Z Acknowledgment", deadline: "2024-04-04T14:20:00Z", status: "green" },
      regZ_resolution: { label: "Reg Z Resolution", deadline: "2024-06-03T14:20:00Z", status: "green" }
    },
    linkedCases: [],
    cfpbRef: null,
    determination: null,
    flags: { fourEyesRequired: false, holdReason: null },
    product: "Credit Card",
    channel: "Secure Message",
    tags: ["scra-rate-cap", "military", "billing-dispute", "pcs-orders"]
  },
  {
    id: "CASE-2024-0390",
    customerId: "CUST-10042",
    accountIds: ["ACC-9934501"],
    category: "Fraud Claim — Card Not Present",
    complainantNarrative: "Customer reports 7 card-not-present transactions totaling $892 on debit card they report was never received. Customer states card was mailed to old address despite address change completed Feb 2024. Requests provisional credit and new card issuance.",
    regulationTags: ["Reg E"],
    priority: "P2",
    status: "Resolved",
    assignedTo: "T. Nguyen",
    assignedId: "ASSOC-0051",
    createdAt: "2024-02-28T16:10:00Z",
    sla: {
      regE_provisional: { label: "Reg E Provisional Credit", deadline: "2024-03-09T16:10:00Z", status: "green" },
      regE_investigation: { label: "Reg E Investigation", deadline: "2024-04-13T16:10:00Z", status: "green" }
    },
    linkedCases: ["CASE-2024-0441"],
    cfpbRef: null,
    determination: {
      outcomeCode: "Error Found-Remediated",
      regulatoryFinding: "Error confirmed. Provisional credit made permanent. Card mailed to incorrect address per system error in address-change routing.",
      rationale: "Investigation confirmed card was mailed to prior address (2201 S. Clark, Chicago IL 60616) due to a routing error in the address-change system. Seven CNP transactions confirmed as unauthorized. Full provisional credit of $892.00 made permanent. New card issued to correct address. Root cause referred to Operations for system fix.",
      decidedAt: "2024-03-07T10:30:00Z",
      decidedBy: "T. Nguyen"
    },
    flags: { fourEyesRequired: false, holdReason: null },
    product: "Debit Card",
    channel: "Phone",
    tags: ["card-not-present", "wrong-address", "provisional-credit-issued"]
  }
];
