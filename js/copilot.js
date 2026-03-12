// Mocked AI Copilot responses
window.COPILOT = {

  getSummary(caseId) {
    const summaries = {
      "CASE-2024-0441": {
        brief: "Marcus Johnson disputes three unauthorized ACH debits totaling <strong>$1,247.00</strong> from originator APEX SERVICES LLC, withdrawn March 1–8, 2024. Customer has no prior relationship with this originator and no ACH authorization on file. Customer simultaneously filed a CFPB complaint (ref #230419-11234567) on the same day the internal case was opened, suggesting low confidence in bank resolution. The 10-day Reg E provisional credit deadline is <strong class='text-red-400'>critically overdue</strong>.",
        regulations: ["Reg E (10-day provisional credit — OVERDUE)", "CFPB (15-day acknowledgment — overdue)"],
        sentiment: { score: "High Urgency", label: "Negative — Escalation Risk", color: "red" },
        anomalies: [
          "Originator APEX SERVICES LLC has zero prior transaction history with customer",
          "Three debits in 8 days from same originator — consistent with unauthorized ACH scheme",
          "CFPB complaint filed same day as internal case (escalation indicator)",
          "Provisional credit deadline MISSED — regulatory exposure active"
        ]
      },
      "CASE-2024-0388": {
        brief: "Diana Walters disputes an inaccurate Equifax tradeline showing a charged-off auto loan (ACC-4412208) despite a full settlement of $16,200 in November 2022. Investigation confirms settlement is valid and the Equifax update was NOT submitted due to a system queue failure in Nov 2022. The inaccurate tradeline directly caused a mortgage denial on February 12, 2024, creating concrete FCRA actual damages. CFPB complaint #230815-88901234 is active. <strong class='text-red-400'>FCRA 30-day investigation deadline is past due.</strong>",
        regulations: ["FCRA (30-day investigation — OVERDUE)", "CFPB (15-day acknowledgment — OVERDUE)", "CFPB (60-day response — 32 days remaining)"],
        sentiment: { score: "Critical", label: "High Distress — Attorney Mentioned", color: "red" },
        anomalies: [
          "CRITICAL: Equifax tradeline shows Charge-Off 14+ months after confirmed full settlement",
          "System failure identified: Equifax queue did not receive Nov 2022 tradeline update",
          "Consumer suffered concrete harm: mortgage application denied Feb 12, 2024",
          "Customer mentioned attorney in call — litigation risk elevated",
          "Fraud hold on account should be reviewed — may not be necessary given dispute nature"
        ]
      },
      "CASE-2024-0512": {
        brief: "Roberto Perez filed a CFPB complaint (ref #231102-55678901) alleging deceptive overdraft fee practices — specifically high-to-low transaction ordering that maximized $245 in overdraft fees during November 2023. <strong class='text-amber-400'>Critical finding:</strong> Customer filed Chapter 13 bankruptcy on October 28, 2023, meaning the automatic stay was in effect before any of the November overdraft fees were assessed. Fee collection during automatic stay may violate 11 U.S.C. §362. Legal hold is in place. Legal review is required before any action.",
        regulations: ["CFPB (15-day acknowledgment — 3 days remaining)", "CFPB (60-day response — 48 days remaining)", "Bankruptcy §362 Automatic Stay — legal review required"],
        sentiment: { score: "High Risk", label: "Regulatory + Legal Exposure", color: "amber" },
        anomalies: [
          "CRITICAL: All November overdraft fees assessed AFTER Oct 28 automatic stay — potential §362 violation",
          "High-to-low transaction ordering pattern: UDAAP unfair practice risk",
          "Pattern matches CFPB enforcement precedent (Regions Bank 2022 consent order)",
          "Legal hold in place — no remediation without legal clearance"
        ]
      },
      "CASE-2024-0477": {
        brief: "Sarah Lee, an active-duty U.S. Army service member, disputes $320 in excess credit card interest and a $40 late fee. Customer submitted PCS orders on January 15, 2024, triggering SCRA 6% rate cap effective January 10, 2024. Bank failed to apply the rate cap for February and March billing cycles — excess interest of <strong>$184.91</strong> confirmed. Late fee during deployment is also waivable per bank policy. Total remediation owed: approximately <strong>$224.91</strong>.",
        regulations: ["SCRA (6% rate cap — violation confirmed)", "MLA (applicable)", "Reg Z (30-day acknowledgment — 22 days remaining)"],
        sentiment: { score: "Moderate", label: "Factual Dispute — Clear Resolution Path", color: "green" },
        anomalies: [
          "SCRA rate cap not applied despite PCS orders on file since Jan 15, 2024",
          "Two billing cycles of excess interest: Feb $104.17 + Mar $80.74 = $184.91",
          "Late fee during documented military deployment — waiver indicated per Policy §4.2.1",
          "Straightforward remediation path: rate cap + refund + fee waiver + apology letter"
        ]
      }
    };
    return summaries[caseId] || { brief: "No summary available.", regulations: [], sentiment: { score: "Unknown", label: "N/A", color: "gray" }, anomalies: [] };
  },

  getInvestigationMemo(caseId) {
    const memos = {
      "CASE-2024-0441": {
        title: "Reg E Investigation Memo — CASE-2024-0441",
        sections: [
          {
            heading: "1. Error Identification",
            content: "Three unauthorized ACH debits were identified: $412 (Feb 28), $533 (Mar 4), $302 (Mar 8) — total $1,247. Originator: APEX SERVICES LLC (ID: 9876543210). Authorization database query (DOC-44013) confirms zero ACH authorizations on file for this originator. Customer affidavit (DOC-44012) attests to unauthorized nature."
          },
          {
            heading: "2. Regulation E Analysis",
            content: "15 U.S.C. §1693f requires the bank to investigate and provisionally credit an unauthorized EFT within 10 business days of receiving notice. Notice received: March 9, 2024. 10-day deadline: March 19, 2024. Provisional credit has NOT been issued. This is a current regulatory violation requiring immediate remediation."
          },
          {
            heading: "3. Findings",
            content: "The transactions qualify as 'unauthorized electronic fund transfers' under Reg E §1005.2(m) — no valid authorization exists, customer has no business relationship with originator, and the debit pattern (3 debits, escalating amounts, 8-day span) is consistent with an ACH fraud scheme. Error determination: ERROR FOUND."
          },
          {
            heading: "4. Recommended Actions",
            content: "① Issue provisional credit of $1,247.00 IMMEDIATELY (deadline already passed — regulatory exposure active). ② Submit ACH return request to originating depository (ODFI) under NACHA Rule §§2.5.17. ③ Change account number to prevent future debits from this originator. ④ Notify customer of provisional credit and investigation timeline. ⑤ File ACH fraud report with NACHA."
          },
          {
            heading: "5. Applicable Regulation",
            content: "Reg E 12 CFR Part 1005. Error resolution procedures: §1005.11. Provisional credit: §1005.11(c)(2)(i). 10-day clock: §1005.11(c)(1). CFPB Examination Procedures §§ 20–22 apply."
          }
        ],
        confidence: 94,
        recommendation: "Error Found — Full Credit: $1,247.00",
        recommendationRationale: "Unauthorized ACH confirmed. No authorization on file. Provisional credit deadline passed. Immediate credit + account change required."
      },
      "CASE-2024-0388": {
        title: "FCRA Investigation Memo — CASE-2024-0388",
        sections: [
          {
            heading: "1. Tradeline Inaccuracy Confirmed",
            content: "Full settlement of $16,200 was received November 8, 2022 (SET-2022-0441). Settlement agreement is valid and on file (DOC-38801). Experian and TransUnion tradelines were updated correctly to 'Settled' (Metro 2: 13) in November 2022. Equifax tradeline was NOT updated due to a system queue failure — it still shows 'Charge-Off' (Metro 2: 97). This is a demonstrable inaccuracy reportable under 15 U.S.C. §1681s-2(b)."
          },
          {
            heading: "2. Consumer Harm Analysis",
            content: "The inaccurate Equifax tradeline directly caused denial of a mortgage application on February 12, 2024. Adverse action notice from First National Mortgage explicitly cites the charge-off tradeline. Consumer suffered concrete actual damages including mortgage denial and associated costs. Under 15 U.S.C. §1681n, willful noncompliance carries actual + punitive damages and attorney fees. Under §1681o, negligent noncompliance carries actual damages."
          },
          {
            heading: "3. FCRA Compliance Obligations",
            content: "Under FCRA §1681s-2(b), following receipt of a dispute, the furnisher must: (1) conduct a reasonable investigation, (2) review all relevant information, (3) report results to the bureau, (4) report inaccurate information as incomplete or inaccurate. The E-OSCAR dispute was submitted to Equifax on February 15, 2024. The 30-day response deadline (March 16) has passed. Immediate escalation to credit reporting team required."
          },
          {
            heading: "4. Recommended Actions",
            content: "① Submit emergency/priority E-OSCAR correction to Equifax today. Update Metro 2 status to 13 (Paid-Settled), balance $0, date of settlement Nov 8, 2022. ② Request expedited Equifax verification and tradeline refresh. ③ Generate adverse action remediation letter to customer acknowledging error and remediation steps. ④ Refer system queue failure to Operations for root cause fix. ⑤ Prepare CFPB portal response — factual error acknowledged, corrective steps documented."
          },
          {
            heading: "5. Risk Assessment",
            content: "Litigation risk: High. Consumer has concrete damages (mortgage denial), attorney was mentioned on call, and the error is clear. Early remediation + goodwill gesture recommended to reduce litigation probability. Suggest proactive outreach to customer with correction timeline and offer of bureau dispute assistance."
          }
        ],
        confidence: 97,
        recommendation: "Error Found — FCRA Correction Required",
        recommendationRationale: "Inaccuracy confirmed. Equifax tradeline must be corrected to Settled. Expedited E-OSCAR submission required today."
      },
      "CASE-2024-0512": {
        title: "CFPB / UDAAP Investigation Memo — CASE-2024-0512",
        sections: [
          {
            heading: "1. Overdraft Fee Analysis",
            content: "November 2023 overdraft fees: $35 (Nov 3) + $70 (Nov 7) + $105 (Nov 14) + $35 (Nov 21) = $245 total. Transaction ordering analysis confirms high-to-low processing on affected dates. Bank's overdraft processing policy permits high-to-low ordering — however, CFPB UDAAP authority may reach this practice if it produces consumer harm without commensurate benefit."
          },
          {
            heading: "2. CRITICAL: Automatic Stay Analysis",
            content: "Chapter 13 bankruptcy petition filed October 28, 2023 (Case #23-bk-14422). Automatic stay effective as of filing date. All November overdraft fees were assessed AFTER the automatic stay was in effect. Under 11 U.S.C. §362(a), acts to collect a debt that arose before the bankruptcy filing are automatically stayed. If these fees are characterized as collection of pre-petition debt, their assessment and collection may be void ab initio. LEGAL HOLD IS IN PLACE. No remediation action without legal clearance."
          },
          {
            heading: "3. CFPB UDAAP Analysis",
            content: "The high-to-low ordering practice constitutes potential UDAAP 'unfair' act: it causes substantial consumer harm (fees maximized), consumers cannot reasonably avoid it (not prominently disclosed), and the practice benefits the bank disproportionately. Comparable enforcement: Regions Bank (2022, $191M consent order), TD Bank (2020, $97M consent order). Internal counsel should assess whether current bank disclosures are adequate."
          },
          {
            heading: "4. Recommended Actions",
            content: "① DO NOT take any fee reversal or collection action pending legal clearance on §362 issue. ② Refer to Legal within 24 hours with bankruptcy case number and fee assessment dates. ③ Prepare CFPB portal acknowledgment response (deadline March 16 — 3 days). ④ After legal clearance: recommend full fee reversal ($245) given bankruptcy stay exposure and UDAAP risk. ⑤ Compliance: flag high-to-low ordering for systemic UDAAP review."
          },
          {
            heading: "5. Note on AI Confidence",
            content: "The bankruptcy §362 analysis requires legal review and is not a determination this tool can make with full confidence. The UDAAP analysis is pattern-based. Associate should not adopt the §362 conclusion without reviewing with in-house counsel."
          }
        ],
        confidence: 71,
        recommendation: "Pending Legal Review — Do Not Act Without Clearance",
        recommendationRationale: "Automatic stay exposure requires legal determination before any remediation. CFPB acknowledgment due in 3 days."
      },
      "CASE-2024-0477": {
        title: "SCRA / Reg Z Investigation Memo — CASE-2024-0477",
        sections: [
          {
            heading: "1. SCRA Eligibility Confirmed",
            content: "PCS orders (DOC-47701) confirm active duty status effective January 10, 2024. Under 50 U.S.C. §3937, the maximum interest rate on any pre-service obligation is 6% while on active duty. Credit card ACC-1182774 was opened June 2022 — a pre-service obligation. SCRA rate cap applies. Bank must reduce rate to 6% and forgive the difference, not merely defer it."
          },
          {
            heading: "2. Excess Interest Calculation",
            content: "February 2024: $180 charged at 19.99%. At 6%: $75.83. Excess: $104.17. March 2024: $140 charged at 19.99%. At 6%: $59.26. Excess: $80.74. Total excess interest: $184.91. This is the minimum refund required under SCRA §3937(a)(2)."
          },
          {
            heading: "3. Late Fee Analysis",
            content: "Late fee of $40 assessed February 15, 2024. Customer was on active deployment without reliable mail access per PCS orders. Bank Policy §4.2.1 provides for discretionary late fee waiver for documented military service members experiencing mail disruption. Waiver is appropriate."
          },
          {
            heading: "4. Reg Z Analysis",
            content: "The billing dispute (Reg Z / 12 CFR 1026.13) supplements the SCRA claim. Bank must acknowledge within 30 days (by April 4, 2024) and resolve within 90 days (by June 3, 2024). During investigation, bank may not: collect disputed amount, restrict account, or report as delinquent."
          },
          {
            heading: "5. Recommended Actions",
            content: "① Apply SCRA 6% rate cap immediately retroactive to January 10, 2024. ② Refund excess interest: $184.91 to account. ③ Waive $40 late fee per Policy §4.2.1. ④ Generate SCRA benefits confirmation letter. ⑤ Acknowledge Reg Z dispute in writing by April 4, 2024. ⑥ Refer SCRA rate cap failure to Compliance for process review — was automatic SCRA screening applied at PCS order receipt?"
          }
        ],
        confidence: 96,
        recommendation: "Error Found — SCRA Remediation: $224.91",
        recommendationRationale: "SCRA violation confirmed. $184.91 excess interest + $40 late fee waiver. Rate cap application required immediately."
      }
    };
    return memos[caseId] || { title: "No memo available", sections: [], confidence: 0, recommendation: "N/A", recommendationRationale: "" };
  },

  getDraftResponse(caseId, outcome) {
    const drafts = {
      "CASE-2024-0441": `[BANK LETTERHEAD]

March 13, 2024

Marcus J.
2847 W. Oak St
Chicago, IL 60612

RE: Complaint Case CASE-2024-0441 — Electronic Fund Transfer Dispute Resolution

Dear Marcus J.,

Thank you for contacting us regarding unauthorized electronic fund transfers from your checking account ending in [XXXX]. We have completed our investigation of your Reg E dispute.

FINDINGS: Our investigation confirmed that three ACH debits from APEX SERVICES LLC totaling $1,247.00 (February 28, March 4, and March 8, 2024) were unauthorized electronic fund transfers. No ACH authorization was on file for this originator.

DETERMINATION: ERROR FOUND. We have determined that an error occurred as defined under the Electronic Fund Transfer Act and Regulation E.

REMEDIATION: A credit of $1,247.00 has been applied to your account as of [DATE]. This credit is permanent. Additionally, we have initiated an ACH return with the originating financial institution and changed your account number to prevent recurrence.

YOUR RIGHTS: If you are not satisfied with our determination, you have the right to request documentation used in our investigation within 10 business days of this notice. You may also contact the Consumer Financial Protection Bureau at consumerfinance.gov/complaint.

[Associate Name], Consumer Disputes Resolution
FirstBank | [Phone] | [Secure Message]`,

      "CASE-2024-0388": `[BANK LETTERHEAD]

March 13, 2024

Diana W.
104 Maple Ave
Boston, MA 02134

RE: Case CASE-2024-0388 — Credit Bureau Dispute Resolution — FCRA

Dear Diana W.,

We are writing in response to your dispute regarding the reporting of your auto loan account ending in [XXXX] to Equifax.

FINDINGS: Our investigation confirmed that a full settlement of $16,200 was received on November 8, 2022, and a settlement agreement was executed. We identified that our November 2022 tradeline update was submitted to Experian and TransUnion, but was not transmitted to Equifax due to a system processing error. The Equifax tradeline inaccurately shows a "Charge-Off" status.

DETERMINATION: INACCURACY CONFIRMED. We have submitted a priority correction to Equifax updating your tradeline to "Settled — Paid in Full" with a zero balance and a date of last activity of November 8, 2022. Equifax typically processes updates within 3–5 business days.

We sincerely apologize for this error and for any adverse impact on your credit applications.

NEXT STEPS: You may request a free copy of your updated Equifax credit report at AnnualCreditReport.com. If you experience continued difficulty as a result of this error, please contact us immediately.

[Associate Name], Consumer Disputes Resolution
FirstBank | [Phone] | [Secure Message]`
    };
    return drafts[caseId] || `[Draft response for ${caseId} — outcome: ${outcome}]\n\nThis draft would be auto-generated based on the case outcome and applicable regulation template. Please select an outcome type to generate a specific draft.`;
  },

  getPrecedents(caseId) {
    const precedents = {
      "CASE-2024-0441": [
        { id: "CASE-2023-1142", similarity: "94%", summary: "Unauthorized ACH from unknown originator, 2 debits, $890. Outcome: Error Found — Full Credit. Resolution: 8 days." },
        { id: "CASE-2023-0887", similarity: "89%", summary: "ACH fraud scheme, 4 debits over 10 days, $2,100. Outcome: Error Found — Full Credit. Account number changed." },
        { id: "CASE-2022-2341", similarity: "81%", summary: "Unauthorized ACH, 1 debit, $550. Customer filed CFPB complaint simultaneously. Outcome: Error Found — Credit issued day 7." }
      ],
      "CASE-2024-0388": [
        { id: "CASE-2023-0551", similarity: "97%", summary: "Auto loan settled, Equifax not updated. Mortgage denied. Outcome: FCRA Error Found — Emergency tradeline correction. Customer received $500 goodwill credit." },
        { id: "CASE-2022-1890", similarity: "88%", summary: "Credit card settled, two bureaus not updated. Outcome: FCRA Error Found — Priority correction submitted." }
      ]
    };
    return precedents[caseId] || [];
  }
};
