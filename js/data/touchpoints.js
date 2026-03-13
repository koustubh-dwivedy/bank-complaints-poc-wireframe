// Mock touchpoint events keyed by case ID
// Each touchpoint has: id, customerId, accountId, caseId, type, category, occurredAt,
//   title, description, sourceSystem, icon, payload, aiFlag

window.TOUCHPOINTS = {

  "CASE-2024-0441": [
    {
      id: "TP-10001", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "account_opened", category: "account_lifecycle",
      occurredAt: "2011-03-22T09:00:00Z",
      title: "Checking Account Opened",
      description: "Consumer Checking account ACC-8821034 opened at branch #0042, Chicago Loop.",
      sourceSystem: "Core Banking", icon: "account",
      payload: { accountType: "Consumer Checking", openedAt: "Branch #0042", initialDeposit: "$500.00" },
      aiFlag: null
    },
    {
      id: "TP-10002", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "debit_transaction", category: "financial",
      occurredAt: "2024-02-28T14:33:00Z",
      title: "ACH Debit — $412.00",
      description: "ACH debit from 'APEX SERVICES LLC' — $412.00. Originator ID: 9876543210.",
      sourceSystem: "Core Banking", icon: "transaction",
      payload: {
        amount: -412.00, transactionType: "ACH Debit", merchant: "APEX SERVICES LLC",
        originatorId: "9876543210", runningBalance: "$3,218.44", status: "Posted"
      },
      aiFlag: { severity: "high", message: "Originator ID not found in prior 12 months of transaction history. Possible unauthorized ACH." }
    },
    {
      id: "TP-10003", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "debit_transaction", category: "financial",
      occurredAt: "2024-03-04T08:12:00Z",
      title: "ACH Debit — $533.00",
      description: "ACH debit from 'APEX SERVICES LLC' — $533.00. Same originator as Feb 28 debit.",
      sourceSystem: "Core Banking", icon: "transaction",
      payload: {
        amount: -533.00, transactionType: "ACH Debit", merchant: "APEX SERVICES LLC",
        originatorId: "9876543210", runningBalance: "$2,685.44", status: "Posted"
      },
      aiFlag: { severity: "high", message: "Second consecutive debit from same unknown originator within 5 days. Pattern consistent with unauthorized ACH scheme." }
    },
    {
      id: "TP-10004", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "debit_transaction", category: "financial",
      occurredAt: "2024-03-08T11:45:00Z",
      title: "ACH Debit — $302.00",
      description: "ACH debit from 'APEX SERVICES LLC' — $302.00.",
      sourceSystem: "Core Banking", icon: "transaction",
      payload: {
        amount: -302.00, transactionType: "ACH Debit", merchant: "APEX SERVICES LLC",
        originatorId: "9876543210", runningBalance: "$2,383.44", status: "Posted"
      },
      aiFlag: { severity: "high", message: "Third debit from same originator. Total: $1,247.00 across 3 transactions. Customer has not set up ACH authorization for this originator per authorization records." }
    },
    {
      id: "TP-10005", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "inbound_call", category: "voice",
      occurredAt: "2024-03-09T07:58:00Z",
      title: "Inbound Call — Dispute Filed",
      description: "Customer called to report 3 unauthorized ACH debits. Call duration: 22 min. Outcome: Reg E dispute opened. Provisional credit discussion deferred.",
      sourceSystem: "CRM / Telephony", icon: "phone",
      payload: {
        duration: "22:14", agentId: "AGENT-0092", outcomeCode: "DISPUTE_OPENED",
        recording: "available", transcript: "available",
        callSummary: "Customer identified 3 ACH debits from APEX SERVICES LLC as unauthorized. States no business relationship with this entity and no debit card linked to account. Dispute CASE-2024-0441 opened."
      },
      aiFlag: null
    },
    {
      id: "TP-10006", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "complaint_filed", category: "complaint",
      occurredAt: "2024-03-09T08:14:00Z",
      title: "Reg E Dispute Case Opened — CASE-2024-0441",
      description: "Formal Reg E EFT dispute case opened. Three unauthorized ACH debits totaling $1,247.00. 10-day provisional credit clock started.",
      sourceSystem: "Complaints Platform", icon: "complaint",
      payload: {
        caseId: "CASE-2024-0441", regulation: "Reg E", provisionalCreditDeadline: "2024-03-19T08:14:00Z",
        investigationDeadline: "2024-04-23T08:14:00Z", totalDisputedAmount: 1247.00
      },
      aiFlag: null
    },
    {
      id: "TP-10007", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "cfpb_complaint", category: "regulatory",
      occurredAt: "2024-03-09T10:22:00Z",
      title: "CFPB Portal Complaint Filed",
      description: "Customer filed CFPB complaint ref #230419-11234567 citing unauthorized EFT / failure to resolve. 15-day acknowledgment clock started.",
      sourceSystem: "CFPB ARC Portal", icon: "regulatory",
      payload: {
        cfpbRef: "230419-11234567", productCode: "Checking or savings account",
        issueCode: "Unauthorized transactions or other transaction problem",
        acknowledgmentDeadline: "2024-03-24T10:22:00Z", responseDeadline: "2024-05-08T10:22:00Z"
      },
      aiFlag: { severity: "medium", message: "CFPB complaint filed same day as internal dispute. Suggests customer has low confidence in bank resolution. Escalation risk elevated." }
    },
    {
      id: "TP-10008", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "outbound_call", category: "voice",
      occurredAt: "2024-03-11T13:00:00Z",
      title: "Outbound Call — Provisional Credit Explanation",
      description: "Associate contacted customer to explain provisional credit timeline. Call duration: 8 min. Customer requested update within 5 business days.",
      sourceSystem: "CRM / Telephony", icon: "phone",
      payload: {
        duration: "08:02", agentId: "ASSOC-0034", outcomeCode: "CUSTOMER_UPDATED",
        recording: "available", transcript: "available"
      },
      aiFlag: null
    },
    {
      id: "TP-10009", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "secure_message", category: "voice",
      occurredAt: "2024-03-12T09:15:00Z",
      title: "Secure Message — Customer Status Request",
      description: "Customer sent secure message asking for status update and requesting provisional credit be applied immediately.",
      sourceSystem: "Digital Banking", icon: "message",
      payload: {
        threadId: "SM-2024-88821", messageCount: 1,
        preview: "I've been waiting 3 days and haven't received my provisional credit yet. When will this be resolved?"
      },
      aiFlag: { severity: "medium", message: "Customer uses phrase 'waiting 3 days' — sentiment negative. Monitor for escalation language." }
    },
    {
      id: "TP-10010", customerId: "CUST-10042", accountId: "ACC-8821034",
      caseId: "CASE-2024-0441", type: "document_received", category: "account_lifecycle",
      occurredAt: "2024-03-12T14:30:00Z",
      title: "Document Received — Customer Affidavit",
      description: "Customer submitted signed dispute affidavit via secure message attachment. Document status: Received / Pending Review.",
      sourceSystem: "Document Management", icon: "document",
      payload: {
        documentId: "DOC-44012", documentType: "Dispute Affidavit",
        status: "received", pages: 2, submittedVia: "Secure Message"
      },
      aiFlag: null
    },
    {
      id: "TP-10011",
      customerId: "CUST-10042",
      accountId: "ACC-8821034",
      caseId: "CASE-2024-0441",
      type: "document_generated",
      category: "document",
      occurredAt: "2024-03-14T10:00:00Z",
      title: "Provisional Credit Decision Letter",
      description: "Bank-generated provisional credit decision letter issued to customer per Reg E §205.11(c)(2). Sent via secure message. Stored in DMS.",
      sourceSystem: "Document Management",
      icon: "document",
      payload: {
        documentId: "DOC-44015",
        documentType: "Provisional Credit Letter",
        format: "PDF",
        pages: 2,
        sentVia: "Secure Message",
        creditAmount: 1247.00,
        determinationDeadline: "2024-04-23T08:14:00Z"
      },
      aiFlag: null
    }
  ],

  "CASE-2024-0388": [
    {
      id: "TP-20001", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "account_opened", category: "account_lifecycle",
      occurredAt: "2019-08-10T10:00:00Z",
      title: "Auto Loan Originated",
      description: "Auto loan ACC-4412208 originated. Balance: $24,500. Term: 60 months. Rate: 6.9%.",
      sourceSystem: "Loan Origination", icon: "account",
      payload: { loanType: "Auto", originalBalance: 24500, term: 60, rate: "6.9%", vehicle: "2019 Honda CR-V" },
      aiFlag: null
    },
    {
      id: "TP-20002", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "delinquency_change", category: "loan_servicing",
      occurredAt: "2021-11-15T00:00:00Z",
      title: "Delinquency — 30 DPD",
      description: "Account 30 days past due. Customer not responding to outreach.",
      sourceSystem: "Loan Servicing", icon: "alert",
      payload: { dpdStatus: "30 DPD", missedPayments: 1, balance: 16200 },
      aiFlag: null
    },
    {
      id: "TP-20003", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "delinquency_change", category: "loan_servicing",
      occurredAt: "2021-12-18T00:00:00Z",
      title: "Account Charged Off",
      description: "Auto loan charged off after 60 DPD. Balance at charge-off: $16,200. Sent to internal collections.",
      sourceSystem: "Loan Servicing", icon: "alert",
      payload: { chargeOffDate: "2021-12-18", chargeOffBalance: 16200, sentToCollections: true },
      aiFlag: null
    },
    {
      id: "TP-20004", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "tradeline_update", category: "credit_bureau",
      occurredAt: "2021-12-31T00:00:00Z",
      title: "Tradeline Update — Charged Off Reported",
      description: "Tradeline update submitted to Equifax, Experian, TransUnion reporting charge-off status. Metro 2 code: 97.",
      sourceSystem: "Credit Reporting", icon: "credit",
      payload: { bureaus: ["Equifax", "Experian", "TransUnion"], metro2Status: "97 (Charge-Off)", balance: 16200 },
      aiFlag: null
    },
    {
      id: "TP-20005", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "payment_received", category: "financial",
      occurredAt: "2022-11-08T00:00:00Z",
      title: "Settlement Payment — $16,200 Full Balance",
      description: "Full settlement of $16,200 received from customer. Settlement agreement signed. Account status should be updated to 'Settled in Full.'",
      sourceSystem: "Collections", icon: "transaction",
      payload: { paymentAmount: 16200, settlementAgreementId: "SET-2022-0441", status: "Settled In Full" },
      aiFlag: null
    },
    {
      id: "TP-20006", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "tradeline_update", category: "credit_bureau",
      occurredAt: "2022-11-30T00:00:00Z",
      title: "Tradeline Update — Settlement Reported (Partial Only)",
      description: "Tradeline updated to Experian and TransUnion: status changed to 'Settled.' Equifax update NOT submitted — system error.",
      sourceSystem: "Credit Reporting", icon: "credit",
      payload: {
        bureaus: ["Experian", "TransUnion"], equifaxUpdated: false,
        metro2Status: "13 (Paid-Settled)", note: "Equifax update missing — system queue failure Nov 2022"
      },
      aiFlag: { severity: "high", message: "FCRA VIOLATION INDICATOR: Equifax tradeline still shows Charge-Off (Metro 2: 97) despite settlement Nov 2022. This is a reportable inaccuracy under 15 U.S.C. §1681s-2." }
    },
    {
      id: "TP-20007", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "credit_pull", category: "credit_bureau",
      occurredAt: "2024-02-12T00:00:00Z",
      title: "Hard Inquiry — Mortgage Application",
      description: "Hard credit inquiry by First National Mortgage (NMLS #12345) for mortgage application. Equifax score pulled: 618.",
      sourceSystem: "Credit Bureau", icon: "credit",
      payload: { inquiryType: "Hard", lender: "First National Mortgage", bureau: "Equifax", score: 618 },
      aiFlag: null
    },
    {
      id: "TP-20008", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "adverse_action", category: "regulatory",
      occurredAt: "2024-02-12T00:00:00Z",
      title: "Adverse Action — Mortgage Denied",
      description: "First National Mortgage denied mortgage application. Adverse action reason #1: Derogatory public records or collections. References charged-off auto loan on Equifax.",
      sourceSystem: "External", icon: "regulatory",
      payload: {
        lender: "First National Mortgage", action: "Denied",
        reasons: ["Derogatory account — charge-off (Equifax)", "Excessive debt obligations"],
        note: "Denial directly attributable to inaccurate Equifax tradeline"
      },
      aiFlag: { severity: "critical", message: "Consumer suffered concrete harm (mortgage denial) due to inaccurate Equifax tradeline. FCRA §1681n actual damages may apply. Urgency: CRITICAL." }
    },
    {
      id: "TP-20009", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "inbound_call", category: "voice",
      occurredAt: "2024-02-14T10:45:00Z",
      title: "Inbound Call — FCRA Dispute Filed",
      description: "Customer called to dispute Equifax tradeline. Emotional, mentions she was denied a mortgage. FCRA dispute opened. Duration: 35 min.",
      sourceSystem: "CRM / Telephony", icon: "phone",
      payload: {
        duration: "35:22", agentId: "ASSOC-0051", outcomeCode: "FCRA_DISPUTE_OPENED",
        recording: "available", transcript: "available",
        escalationLanguage: true
      },
      aiFlag: { severity: "medium", message: "Escalation language detected: customer mentioned 'attorney' and 'CFPB.' High CFPB escalation probability if not resolved quickly." }
    },
    {
      id: "TP-20010", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "cfpb_complaint", category: "regulatory",
      occurredAt: "2024-02-15T08:30:00Z",
      title: "CFPB Portal Complaint Filed",
      description: "Customer filed CFPB complaint ref #230815-88901234 citing inaccurate credit reporting / failure to update settled account.",
      sourceSystem: "CFPB ARC Portal", icon: "regulatory",
      payload: {
        cfpbRef: "230815-88901234", productCode: "Credit reporting",
        issueCode: "Incorrect information on your report",
        acknowledgmentDeadline: "2024-03-01T08:30:00Z", responseDeadline: "2024-04-14T08:30:00Z"
      },
      aiFlag: null
    },
    {
      id: "TP-20011", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "eoscar_dispute", category: "credit_bureau",
      occurredAt: "2024-02-15T14:00:00Z",
      title: "E-OSCAR Dispute Submitted — Equifax",
      description: "E-OSCAR dispute submitted to Equifax. Dispute code: 001 (Not his/hers). Expected response within 30 days.",
      sourceSystem: "Credit Reporting / E-OSCAR", icon: "credit",
      payload: {
        bureau: "Equifax", disputeCode: "001", status: "Submitted",
        submittedBy: "ASSOC-0051", responseDeadline: "2024-03-16T14:00:00Z"
      },
      aiFlag: null
    },
    {
      id: "TP-20012", customerId: "CUST-20817", accountId: "ACC-4412208",
      caseId: "CASE-2024-0388", type: "fraud_hold", category: "fraud_risk",
      occurredAt: "2024-02-16T09:00:00Z",
      title: "Fraud Hold Placed — Account Review",
      description: "Fraud hold placed on ACC-4412208 pending review of identity verification. Standard procedure during credit dispute investigation.",
      sourceSystem: "Fraud Operations", icon: "fraud",
      payload: { holdType: "Identity Review", placedBy: "FRAUD-AUTO", expectedLiftDate: "2024-02-23T00:00:00Z" },
      aiFlag: null
    }
  ],

  "CASE-2024-0512": [
    {
      id: "TP-30001", customerId: "CUST-33501", accountId: "ACC-7723490",
      caseId: "CASE-2024-0512", type: "account_opened", category: "account_lifecycle",
      occurredAt: "2017-09-03T00:00:00Z",
      title: "Checking Account Opened",
      description: "Consumer checking account ACC-7723490 opened online. Overdraft protection: Opted in.",
      sourceSystem: "Core Banking", icon: "account",
      payload: { accountType: "Consumer Checking", overdraftOptIn: true, openedVia: "Online" },
      aiFlag: null
    },
    {
      id: "TP-30002", customerId: "CUST-33501", accountId: "ACC-7723490",
      caseId: "CASE-2024-0512", type: "fee_assessed", category: "financial",
      occurredAt: "2023-11-03T00:00:00Z",
      title: "Overdraft Fee — $35",
      description: "Overdraft fee assessed. Transaction: Grocery purchase $127.44 processed before $340 payroll deposit (received same day, processed later).",
      sourceSystem: "Core Banking", icon: "fee",
      payload: { feeType: "Overdraft", amount: 35, triggerTransaction: "WHOLE FOODS $127.44", processingOrder: "High-to-Low" },
      aiFlag: { severity: "high", message: "High-to-low transaction ordering contributed to this overdraft. CFPB UDAAP risk: Unfair practice pattern if high-to-low ordering systematically maximizes fee revenue." }
    },
    {
      id: "TP-30003", customerId: "CUST-33501", accountId: "ACC-7723490",
      caseId: "CASE-2024-0512", type: "fee_assessed", category: "financial",
      occurredAt: "2023-11-07T00:00:00Z",
      title: "Overdraft Fee — $35 (x2)",
      description: "Two overdraft fees assessed on same day. Transactions processed high-to-low causing cascade.",
      sourceSystem: "Core Banking", icon: "fee",
      payload: { feeType: "Overdraft", amount: 70, count: 2, processingOrder: "High-to-Low" },
      aiFlag: { severity: "high", message: "Multiple same-day overdrafts from high-to-low ordering. Pattern matches CFPB enforcement action precedents (e.g., Regions Bank 2022)." }
    },
    {
      id: "TP-30004", customerId: "CUST-33501", accountId: "ACC-7723490",
      caseId: "CASE-2024-0512", type: "fee_assessed", category: "financial",
      occurredAt: "2023-11-14T00:00:00Z",
      title: "Overdraft Fee — $35 (x3)",
      description: "Three overdraft fees assessed. Total November fees to date: $175.",
      sourceSystem: "Core Banking", icon: "fee",
      payload: { feeType: "Overdraft", amount: 105, count: 3 },
      aiFlag: null
    },
    {
      id: "TP-30005", customerId: "CUST-33501", accountId: "ACC-7723490",
      caseId: "CASE-2024-0512", type: "bankruptcy_filing", category: "regulatory",
      occurredAt: "2023-10-28T00:00:00Z",
      title: "Bankruptcy Filing — Chapter 13",
      description: "Chapter 13 bankruptcy petition filed. Case #23-bk-14422 (N.D. Illinois). Automatic stay in effect. Legal hold placed on account.",
      sourceSystem: "Legal / Compliance", icon: "regulatory",
      payload: {
        bankruptcyType: "Chapter 13", caseNumber: "23-bk-14422",
        court: "N.D. Illinois", automaticStay: true, filedDate: "2023-10-28"
      },
      aiFlag: { severity: "critical", message: "Overdraft fees assessed AFTER automatic stay effective (Oct 28). Fee collection during automatic stay may violate 11 U.S.C. §362. Refer to Legal." }
    },
    {
      id: "TP-30006", customerId: "CUST-33501", accountId: "ACC-7723490",
      caseId: "CASE-2024-0512", type: "cfpb_complaint", category: "regulatory",
      occurredAt: "2023-11-02T00:00:00Z",
      title: "CFPB Portal Complaint Filed",
      description: "Customer filed CFPB complaint ref #231102-55678901 citing deceptive overdraft practices and fee maximization.",
      sourceSystem: "CFPB ARC Portal", icon: "regulatory",
      payload: {
        cfpbRef: "231102-55678901",
        narrative: "Bank processes transactions from highest to lowest dollar amount to generate the most overdraft fees possible. This cost me $245 in one month...",
        acknowledgmentDeadline: "2024-03-16T09:45:00Z", responseDeadline: "2024-04-30T09:45:00Z"
      },
      aiFlag: null
    },
    {
      id: "TP-30007", customerId: "CUST-33501", accountId: "ACC-7723490",
      caseId: "CASE-2024-0512", type: "secure_message", category: "voice",
      occurredAt: "2024-02-28T11:00:00Z",
      title: "Secure Message — Customer Fee Dispute",
      description: "Customer sent secure message disputing November overdraft fees. References bankruptcy filing and states fees should not have been assessed.",
      sourceSystem: "Digital Banking", icon: "message",
      payload: {
        threadId: "SM-2024-33201", messageCount: 2,
        preview: "I filed for bankruptcy in October and these fees were charged after my filing. I believe this violates my automatic stay. I want these reversed."
      },
      aiFlag: { severity: "critical", message: "Customer explicitly invokes automatic stay. Fees assessed after Oct 28 are potentially void under 11 U.S.C. §362. Immediate legal review required." }
    }
  ],

  "CASE-2024-0477": [
    {
      id: "TP-40001", customerId: "CUST-47289", accountId: "ACC-1182774",
      caseId: "CASE-2024-0477", type: "account_opened", category: "account_lifecycle",
      occurredAt: "2022-06-01T00:00:00Z",
      title: "Credit Card Account Opened",
      description: "Signature Rewards Visa card ACC-1182774 opened. Credit limit: $8,000. APR: 19.99%.",
      sourceSystem: "Core Banking", icon: "account",
      payload: { accountType: "Credit Card", creditLimit: 8000, apr: "19.99%", card: "Signature Rewards Visa" },
      aiFlag: null
    },
    {
      id: "TP-40002", customerId: "CUST-47289", accountId: "ACC-1182774",
      caseId: "CASE-2024-0477", type: "document_received", category: "account_lifecycle",
      occurredAt: "2024-01-15T00:00:00Z",
      title: "PCS Orders Received — SCRA Benefit Trigger",
      description: "Customer submitted Permanent Change of Station (PCS) orders dated Jan 10, 2024. SCRA 6% rate cap should be applied effective this date.",
      sourceSystem: "Document Management", icon: "document",
      payload: {
        documentType: "PCS Orders", branch: "U.S. Army", effectiveDate: "2024-01-10",
        scraCapApplicable: true, requiredRateCap: "6%", documentId: "DOC-77821"
      },
      aiFlag: { severity: "critical", message: "SCRA rate cap required effective 2024-01-10. Current account APR 19.99% has NOT been reduced. Each billing cycle without rate cap is a SCRA violation. Immediate remediation required." }
    },
    {
      id: "TP-40003", customerId: "CUST-47289", accountId: "ACC-1182774",
      caseId: "CASE-2024-0477", type: "interest_charge", category: "financial",
      occurredAt: "2024-02-01T00:00:00Z",
      title: "Interest Charge — $180 (19.99% APR)",
      description: "February billing cycle interest charge at 19.99% APR. SCRA rate cap not yet applied despite PCS orders on file since Jan 15.",
      sourceSystem: "Card Servicing", icon: "fee",
      payload: { chargeType: "Interest", amount: 180, apr: "19.99%", scraShouldApply: true, excessCharge: 104.17 },
      aiFlag: { severity: "high", message: "Interest overcharge: $180 assessed vs $75.83 (6% SCRA cap). Overcharge: $104.17 for February. SCRA violation confirmed for this billing cycle." }
    },
    {
      id: "TP-40004", customerId: "CUST-47289", accountId: "ACC-1182774",
      caseId: "CASE-2024-0477", type: "late_fee", category: "financial",
      occurredAt: "2024-02-15T00:00:00Z",
      title: "Late Fee — $40",
      description: "Late fee assessed. Customer states she was deployed without reliable mail access and did not receive statement.",
      sourceSystem: "Card Servicing", icon: "fee",
      payload: { feeType: "Late Fee", amount: 40, waivable: true, reason: "Military deployment — mail access impaired" },
      aiFlag: { severity: "medium", message: "Late fee during active military deployment. SCRA protections may require fee waiver. Bank policy §4.2.1 provides discretionary waiver for documented military deployment." }
    },
    {
      id: "TP-40005", customerId: "CUST-47289", accountId: "ACC-1182774",
      caseId: "CASE-2024-0477", type: "interest_charge", category: "financial",
      occurredAt: "2024-03-01T00:00:00Z",
      title: "Interest Charge — $140 (19.99% APR)",
      description: "March billing cycle interest charge. SCRA rate cap still not applied. Second month of violation.",
      sourceSystem: "Card Servicing", icon: "fee",
      payload: { chargeType: "Interest", amount: 140, apr: "19.99%", scraShouldApply: true, excessCharge: 80.74 },
      aiFlag: { severity: "high", message: "Second billing cycle SCRA violation. Total excess interest: $184.91. Total remediation owed: $184.91 interest refund + $40 late fee waiver = $224.91." }
    },
    {
      id: "TP-40006", customerId: "CUST-47289", accountId: "ACC-1182774",
      caseId: "CASE-2024-0477", type: "secure_message", category: "voice",
      occurredAt: "2024-03-05T10:00:00Z",
      title: "Secure Message — Reg Z / SCRA Dispute Filed",
      description: "Customer filed dispute via secure message referencing SCRA, MLA, and Reg Z. Attached copy of PCS orders previously submitted.",
      sourceSystem: "Digital Banking", icon: "message",
      payload: {
        threadId: "SM-2024-47201", messageCount: 1,
        preview: "I submitted my PCS orders in January. My interest rate was never reduced to 6% as required by SCRA. I have been charged $320 in excess interest and a $40 late fee while deployed.",
        attachments: ["PCS_Orders_Redacted.pdf"]
      },
      aiFlag: null
    }
  ]
};

// Document fixtures per case
window.DOCUMENTS = {
  "CASE-2024-0441": [
    { id: "DOC-44012", name: "Customer Dispute Affidavit", type: "Customer Submitted", status: "reviewed", pages: 2, received: "2024-03-12", preview: "Signed statement from customer attesting to unauthorized nature of three ACH debits." },
    { id: "DOC-44013", name: "ACH Transaction Detail Report", type: "Bank Generated", status: "reviewed", pages: 1, received: "2024-03-10", preview: "Core banking pull of ACH debit details: originator ID, trace numbers, posting timestamps." },
    { id: "DOC-44014", name: "ACH Authorization Records Search", type: "Bank Generated", status: "reviewed", pages: 1, received: "2024-03-11", preview: "Authorization database query — no authorization on file for originator 9876543210." },
    { id: "DOC-44015", name: "Provisional Credit Decision Letter", type: "Bank Generated", status: "reviewed", pages: 2, received: "2024-03-14", preview: "Provisional credit of $1,247.00 issued per Reg E §205.11(c)(2). Letter sent via secure message Mar 14, 2024." }
  ],
  "CASE-2024-0388": [
    { id: "DOC-38801", name: "Settlement Agreement Nov 2022", type: "Bank Generated", status: "reviewed", pages: 3, received: "2024-02-14", preview: "Signed settlement agreement confirming full payoff of $16,200 dated Nov 8, 2022." },
    { id: "DOC-38802", name: "Equifax Credit Report (Customer Provided)", type: "Customer Submitted", status: "reviewed", pages: 7, received: "2024-02-14", preview: "Customer-provided credit report showing charged-off tradeline for ACC-4412208." },
    { id: "DOC-38803", name: "E-OSCAR Submission Confirmation", type: "Bank Generated", status: "pending", pages: 1, received: "2024-02-15", preview: "E-OSCAR submission receipt for Equifax dispute, ref #EO-2024-88321." }
  ],
  "CASE-2024-0512": [
    { id: "DOC-51201", name: "Bankruptcy Filing — Ch.13 Petition", type: "Customer Submitted", status: "reviewed", pages: 12, received: "2024-03-01", preview: "Chapter 13 bankruptcy petition, Case #23-bk-14422, N.D. Illinois, filed Oct 28, 2023." },
    { id: "DOC-51202", name: "November 2023 Statement", type: "Bank Generated", status: "reviewed", pages: 2, received: "2024-03-01", preview: "Account statement showing transaction ordering and overdraft fees assessed Nov 2023." }
  ],
  "CASE-2024-0477": [
    { id: "DOC-47701", name: "PCS Orders (Redacted)", type: "Customer Submitted", status: "reviewed", pages: 2, received: "2024-01-15", preview: "U.S. Army PCS orders, effective Jan 10, 2024. Submitted by customer Jan 15, 2024." },
    { id: "DOC-47702", name: "Billing Statements Feb–Mar 2024", type: "Bank Generated", status: "reviewed", pages: 4, received: "2024-03-05", preview: "Two billing cycle statements showing 19.99% APR applied despite SCRA eligibility." }
  ]
};
