/**
 * Comprehensive dynamic content data for the WebinarInfographic component.
 * Powers the central circular infographic, 4 connected cards, areas covered, and audience cards.
 */

export const WEBINAR_INFOGRAPHICS_DATA = {
  'webinar-hipaa-1': {
    intro: "This webinar will help you understand what's new with HIPAA from a regulation, enforcement and risk standpoint. You will get clarity on the latest updates and practical guidance to protect your practice or business.",
    centralTitle: 'HIPAA',
    centralSubtitle: '2026',
    centralIcon: 'shield-cross',
    keyPoints: [
      {
        icon: 'document',
        title: '2026 HIPAA Changes',
        desc: 'Understand the latest regulatory updates and proposed changes.'
      },
      {
        icon: 'gavel',
        title: 'Enforcement & Audits',
        desc: "Learn about OCR's audit program, current enforcement trends and real-life cases."
      },
      {
        icon: 'shield-check',
        title: 'Security & Breach Risks',
        desc: 'Get insights on increasing cyber attacks, state laws and liability for patient remedies.'
      },
      {
        icon: 'lightbulb',
        title: 'Practical Compliance Guidance',
        desc: 'Learn actionable steps to avoid fines, reduce risk and stay compliant.'
      }
    ],
    areasCovered: [
      {
        icon: 'document',
        title: 'HIPAA Administrative Simplification Updates',
        sub: 'Privacy Rule and Security Rule'
      },
      {
        icon: 'shield-check',
        title: "NPRM's for the HIPAA Security Rule",
        sub: 'Key changes and updates'
      },
      {
        icon: 'users',
        title: 'Rights of Access',
        sub: 'Care coordination and information sharing'
      },
      {
        icon: 'laptop-medical',
        title: 'Notice of Privacy Practices, 21st Century Cures Act',
        sub: "and Telemedicine (Do's and Don'ts)"
      },
      {
        icon: 'database',
        title: 'Fines, Devices, Texting & Emailing',
        sub: 'New guidelines and risk areas'
      },
      {
        icon: 'search',
        title: 'Protected Health Information',
        sub: 'New definition and scope'
      },
      {
        icon: 'clock',
        title: 'Real-Life Audits',
        sub: 'Recent cases and lessons learned'
      },
      {
        icon: 'share-nodes',
        title: 'Business Associates',
        sub: 'Roles and increased burden'
      },
      {
        icon: 'alert-triangle',
        title: 'Breach Notification',
        sub: 'Requirements and risk factors'
      }
    ],
    professionals: {
      title: 'Healthcare Professionals',
      items: [
        'Practice Managers',
        "MD's and other Medical Professionals",
        'Compliance Officers',
        'Business Associates working with medical practices or hospitals'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Private Practice',
        'Hospitals',
        'Billing Companies',
        'Transcription Companies',
        'Home Health Groups'
      ],
      col2: [
        'Health insurance',
        'Ambulatory Services',
        'IT Companies',
        'Attorneys'
      ]
    }
  },

  'webinar-hipaa-2': {
    intro: 'Explore how artificial intelligence technologies are transforming clinical workflows, automated charting, and diagnostic pipelines, and how healthcare organizations must manage PHI security, vendor audits, and OCR compliance.',
    centralTitle: 'HIPAA',
    centralSubtitle: '+ AI',
    centralIcon: 'brain',
    keyPoints: [
      {
        icon: 'brain',
        title: 'AI Compliance Frameworks',
        desc: 'Navigate HHS and OCR guidance on generative AI and clinical documentation tools.'
      },
      {
        icon: 'search',
        title: 'AI Vendor Risk & BAAs',
        desc: 'Audit third-party AI platforms, zero-retention SLAs, and cloud security contracts.'
      },
      {
        icon: 'shield',
        title: 'PHI Security in LLMs',
        desc: 'Prevent unauthorized PHI leakage and manage algorithm training privacy standards.'
      },
      {
        icon: 'lightbulb',
        title: 'Practical AI Policies',
        desc: 'Implement enforceable staff usage policies for ChatGPT and automated charting tools.'
      }
    ],
    areasCovered: [
      {
        icon: 'brain',
        title: 'Generative AI\nDefinitions & Scope',
        sub: 'Current HHS / OCR\nRegulatory Guidelines'
      },
      {
        icon: 'database',
        title: 'De-Identification\nStandards for LLMs',
        sub: 'Safe Harbor &\nExpert Determination'
      },
      {
        icon: 'share-nodes',
        title: 'AI Vendor\nBAA Vetting',
        sub: 'Zero-Data-Retention\nVerification'
      },
      {
        icon: 'document',
        title: 'Staff Permissible\nUse Policies',
        sub: 'Clinician & Admin\nGuidelines'
      },
      {
        icon: 'search',
        title: 'OCR AI\nEnforcement Actions',
        sub: 'Case Studies &\nRegulatory Penalties'
      },
      {
        icon: 'lock',
        title: 'Clinical Charting\n& Automation',
        sub: 'EHR Integration\nSafeguards'
      },
      {
        icon: 'shield-check',
        title: 'Patient Rights\n& Transparency',
        sub: 'Algorithmic Decision\nDisclosure'
      },
      {
        icon: 'alert-triangle',
        title: 'Cybersecurity\n& Prompt Injection',
        sub: 'Defending Against\nMedical AI Threats'
      }
    ],
    professionals: {
      title: 'Healthcare IT & Clinical Leaders',
      items: [
        'Chief Information Officers & CTOs',
        'Privacy & Security Officers',
        'Clinical Informatics Directors',
        'Health AI Software Vendors & Engineers'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Hospital Systems',
        'Digital Health Startups',
        'Health IT Vendors',
        'Medical Practice Groups',
        'Telehealth Providers'
      ],
      col2: [
        'Health Plans & Payers',
        'Diagnostic Imaging Labs',
        'Managed Service Providers',
        'Healthcare Legal Firms'
      ]
    }
  },

  'webinar-hipaa-3': {
    intro: 'Master the NIST-aligned methodology required to conduct, document, and remediate annual HIPAA Security Risk Assessments (SRAs) to protect patient data and pass OCR investigations with confidence.',
    centralTitle: 'SECURITY',
    centralSubtitle: 'RISK',
    centralIcon: 'lock',
    keyPoints: [
      {
        icon: 'document',
        title: 'NIST Risk Framework',
        desc: 'Understand the core components of an OCR-defensible Security Risk Assessment.'
      },
      {
        icon: 'gear',
        title: 'Technical Safeguards',
        desc: 'Audit encryption, role-based access controls, and immutable backup systems.'
      },
      {
        icon: 'shield',
        title: 'Threat Identification',
        desc: 'Assess vulnerabilities across administrative, physical, and technical safeguards.'
      },
      {
        icon: 'lightbulb',
        title: 'Corrective Action Plans',
        desc: 'Build realistic, defensible remediation roadmaps that prioritize high-impact risks.'
      }
    ],
    areasCovered: [
      {
        icon: 'document',
        title: 'Administrative\nSafeguards Review',
        sub: 'Policies, Procedures\n& Workforce Training'
      },
      {
        icon: 'lock',
        title: 'Physical Security\nControls',
        sub: 'Workstation &\nFacility Access'
      },
      {
        icon: 'gear',
        title: 'Technical\nSafeguards Audit',
        sub: 'Encryption, MFA\n& Audit Logs'
      },
      {
        icon: 'alert-triangle',
        title: 'Ransomware &\nPhishing Exposure',
        sub: 'Vulnerability Threat\nMatrix'
      },
      {
        icon: 'share-nodes',
        title: 'Third-Party\nVendor Risks',
        sub: 'Cloud BAAs &\nSubcontractor Assets'
      },
      {
        icon: 'search',
        title: 'OCR Audit\nScrutiny Factors',
        sub: 'Common SRA Deficiencies\n& Violations'
      },
      {
        icon: 'chart',
        title: 'Risk Scoring\nMethodology',
        sub: 'Impact vs Likelihood\nCalculations'
      },
      {
        icon: 'shield-check',
        title: 'Corrective Action\nRoadmap (CAP)',
        sub: 'Budgeting & Milestone\nTracking'
      }
    ],
    professionals: {
      title: 'Security & Risk Professionals',
      items: [
        'Information Security Officers (CISOs)',
        'HIPAA Security Officers',
        'IT Directors & Systems Admins',
        'Practice Administrators & Office Managers'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Medical Clinics & Practices',
        'Hospital Networks',
        'Dental & Specialty Clinics',
        'Ambulatory Surgical Centers',
        'Behavioral Health Centers'
      ],
      col2: [
        'Managed Service Providers (MSPs)',
        'Healthcare SaaS Vendors',
        'Third-Party Administrators',
        'Healthcare Compliance Consultants'
      ]
    }
  },

  'webinar-hipaa-4': {
    intro: 'Demystify the latest technical specifications, encryption mandates, and mandatory multi-factor authentication requirements under the updated HIPAA Security Rule.',
    centralTitle: 'SECURITY',
    centralSubtitle: 'RULE',
    centralIcon: 'shield-check',
    keyPoints: [
      {
        icon: 'document',
        title: 'Required vs Addressable',
        desc: 'Understand strict legal distinctions and documentation requirements for each standard.'
      },
      {
        icon: 'gear',
        title: 'Immutable Backups',
        desc: 'Protect critical patient data against modern ransomware encryption techniques.'
      },
      {
        icon: 'lock',
        title: 'MFA & Access Control',
        desc: 'Implement robust role-based authentication across local and cloud environments.'
      },
      {
        icon: 'lightbulb',
        title: 'Incident Response Playbooks',
        desc: 'Create actionable forensic response procedures for fast breach containment.'
      }
    ],
    areasCovered: [
      {
        icon: 'document',
        title: 'Updated Security\nRule Overview',
        sub: 'Key Statutory &\nPolicy Adjustments'
      },
      {
        icon: 'lock',
        title: 'Multi-Factor\nAuthentication (MFA)',
        sub: 'Mandatory Endpoint\nControls'
      },
      {
        icon: 'database',
        title: 'Immutable Backup\nArchitectures',
        sub: 'Ransomware-Proof\nData Recovery'
      },
      {
        icon: 'smartphone',
        title: 'BYOD & Mobile\nDevice Security',
        sub: 'Remote Work &\nTelemetry Gear'
      },
      {
        icon: 'search',
        title: 'Log Auditing &\nContinuous Monitoring',
        sub: 'SIEM & Access\nAnomaly Detection'
      },
      {
        icon: 'share-nodes',
        title: 'Cloud Storage\n& SaaS Governance',
        sub: 'BAA Encryption\nStandards'
      },
      {
        icon: 'alert-triangle',
        title: 'Incident Response\nPlaybooks',
        sub: 'Containment &\nEradication Protocols'
      },
      {
        icon: 'shield-check',
        title: 'OCR Security\nEnforcement Trends',
        sub: 'Audit Defense &\nPenalty Mitigation'
      }
    ],
    professionals: {
      title: 'Healthcare IT & Security Staff',
      items: [
        'Security Officers & Network Admins',
        'Privacy Officers & Legal Counsel',
        'Health System IT Directors',
        'Cloud Solutions Architects'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Integrated Delivery Networks',
        'Community Hospitals',
        'Outpatient Clinics',
        'Specialty Healthcare Practices',
        'Diagnostic Imaging Centers'
      ],
      col2: [
        'Health Information Exchanges (HIEs)',
        'Medical Billing Companies',
        'Healthcare Cloud Providers',
        'Cyber Insurance Carriers'
      ]
    }
  },

  'webinar-hipaa-5': {
    intro: 'Get ahead of proposed federal rulemaking, reproductive health privacy expansions, and federal health IT roadmaps shaping the future of healthcare compliance.',
    centralTitle: 'HIPAA',
    centralSubtitle: '2027',
    centralIcon: 'calendar',
    keyPoints: [
      {
        icon: 'document',
        title: 'NPRM Analysis',
        desc: 'Detailed breakdown of upcoming Notice of Proposed Rulemaking statutory changes.'
      },
      {
        icon: 'gavel',
        title: 'State vs Federal Preemption',
        desc: 'Resolve conflicting state privacy laws and enhanced federal penalties.'
      },
      {
        icon: 'shield',
        title: 'Reproductive Privacy',
        desc: 'Navigate heightened privacy protections and restrictions on disclosure to law enforcement.'
      },
      {
        icon: 'lightbulb',
        title: 'Multi-Year Roadmaps',
        desc: 'Build strategic compliance roadmaps that anticipate long-term HHS regulations.'
      }
    ],
    areasCovered: [
      {
        icon: 'calendar',
        title: '2027 Rulemaking\nTimelines',
        sub: 'HHS & OCR\nRegulatory Roadmap'
      },
      {
        icon: 'document',
        title: 'Reproductive Health\nPrivacy Final Rule',
        sub: 'Restricted Disclosure\nAttestations'
      },
      {
        icon: 'share-nodes',
        title: 'Information Blocking\n& Interoperability',
        sub: 'ONC / ASTP Rule\nHarmonization'
      },
      {
        icon: 'gavel',
        title: 'State vs Federal\nPreemption Dynamics',
        sub: 'Navigating Strict\nState Privacy Laws'
      },
      {
        icon: 'search',
        title: 'State AG\nEnforcement Trends',
        sub: 'Multi-State Inquiries\n& Class Actions'
      },
      {
        icon: 'lock',
        title: 'Patient EHI\nAccess Portals',
        sub: 'App Developer API\nSafeguards'
      },
      {
        icon: 'chart',
        title: 'Multi-Year\nStrategic Planning',
        sub: 'Budgeting for\nFuture Compliance'
      },
      {
        icon: 'shield-check',
        title: 'Workforce\nReadiness Programs',
        sub: 'Updating Training &\nOperating Policies'
      }
    ],
    professionals: {
      title: 'Executive & Compliance Leadership',
      items: [
        'Chief Compliance Officers (CCOs)',
        'Healthcare General Counsel & Attorneys',
        'Hospital Executive Leadership & C-Suite',
        'Privacy Program Directors'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Academic Medical Centers',
        'Multi-State Health Systems',
        'Health Plans & Insurers',
        'Specialty Hospital Networks',
        'Women’s Health Providers'
      ],
      col2: [
        'Healthcare Law Practices',
        'Health Data Analytics Firms',
        'Electronic Health Record Vendors',
        'Healthcare Policy Organizations'
      ]
    }
  },

  'webinar-hipaa-6': {
    intro: 'Understand the finalized rule aligning 42 CFR Part 2 with HIPAA privacy rules, fundamentally transforming how substance use disorder (SUD) treatment records are shared, disclosed, and protected.',
    centralTitle: '42 CFR',
    centralSubtitle: 'PART 2',
    centralIcon: 'shield-cross',
    keyPoints: [
      {
        icon: 'document',
        title: '42 CFR Part 2 Alignment',
        desc: 'Harmonize substance use disorder confidentiality with HIPAA privacy standards.'
      },
      {
        icon: 'search',
        title: 'Redisclosure Safeguards',
        desc: 'Manage mandatory Notice to Accompany Disclosures and redisclosure permissions.'
      },
      {
        icon: 'lock',
        title: 'Single Consent Formats',
        desc: 'Implement single universal consent for all future treatment, payment, and operations (TPO).'
      },
      {
        icon: 'lightbulb',
        title: 'EHR Record Segmentation',
        desc: 'Configure electronic systems to safeguard SUD treatment notes and diagnostic data.'
      }
    ],
    areasCovered: [
      {
        icon: 'document',
        title: 'SAMHSA & HIPAA\nHarmonization Overview',
        sub: '42 CFR Part 2 Final\nRule Provisions'
      },
      {
        icon: 'user-check',
        title: 'Single Universal\nConsent Forms',
        sub: 'TPO Disclosure\nPermissions'
      },
      {
        icon: 'lock',
        title: 'Redisclosure Limits\n& Notice Rules',
        sub: 'Mandatory Patient\nNotices'
      },
      {
        icon: 'database',
        title: 'EHR SUD Record\nSegmentation',
        sub: 'Data Tagging &\nAccess Filtering'
      },
      {
        icon: 'gavel',
        title: 'Court Orders &\nSubpoena Protocols',
        sub: 'Strict Criminal &\nCivil Protection'
      },
      {
        icon: 'search',
        title: 'Breach Notification\nUnder Part 2',
        sub: 'Harmonized OCR\nReporting Deadlines'
      },
      {
        icon: 'share-nodes',
        title: 'Health Information\nExchanges (HIEs)',
        sub: 'Compliant SUD Data\nSharing'
      },
      {
        icon: 'shield-check',
        title: 'Workforce Part 2\nCompliance Training',
        sub: 'Staff Operational\nPlaybooks'
      }
    ],
    professionals: {
      title: 'Behavioral Health & Legal Teams',
      items: [
        'Substance Use Disorder (SUD) Clinicians',
        'Behavioral Health Center Directors',
        'Hospital Privacy & HIM Officers',
        'Healthcare Billing & Coding Supervisors'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'SUD Treatment Centers',
        'Behavioral Health Clinics',
        'Community Mental Health Centers',
        'Federally Qualified Health Centers',
        'Psychiatric Facilities'
      ],
      col2: [
        'General Acute Care Hospitals',
        'Health Information Exchanges',
        'Behavioral Health Billing Services',
        'State Healthcare Agencies'
      ]
    }
  },

  'webinar-hipaa-7': {
    intro: 'Equip Privacy and Security Officers with the tools, templates, and actionable strategies needed to lead high-performing compliance programs, manage investigations, and present risk metrics to leadership.',
    centralTitle: 'COMPLIANCE',
    centralSubtitle: 'OFFICER',
    centralIcon: 'user-check',
    keyPoints: [
      {
        icon: 'document',
        title: 'Statutory Officer Duties',
        desc: 'Clarify individual accountability and federal roles for Privacy and Security Officers.'
      },
      {
        icon: 'gavel',
        title: 'OCR Inquiries & Defense',
        desc: 'Respond effectively to OCR data requests, corrective action plans, and audit notices.'
      },
      {
        icon: 'shield',
        title: 'Internal Investigations',
        desc: 'Master evidence gathering, whistleblower handling, and formal sanction documentation.'
      },
      {
        icon: 'lightbulb',
        title: 'Workforce Training',
        desc: 'Build engaging, role-specific annual training programs that foster a compliance culture.'
      }
    ],
    areasCovered: [
      {
        icon: 'user-check',
        title: 'Privacy & Security\nOfficer Mandates',
        sub: 'Federal Duties &\nPersonal Liability'
      },
      {
        icon: 'document',
        title: 'Workforce Training\nProgram Design',
        sub: 'Engaging, Role-Based\nAnnual Modules'
      },
      {
        icon: 'search',
        title: 'Internal Privacy\nInvestigation Protocol',
        sub: 'Evidence Gathering &\nDocumentation'
      },
      {
        icon: 'alert-triangle',
        title: 'Whistleblower &\nSanction Policies',
        sub: 'Consistent Disciplinary\nFrameworks'
      },
      {
        icon: 'chart',
        title: 'Board-Level Risk\nReporting Metrics',
        sub: 'Executive KPI Dashboards\n& Budget Justification'
      },
      {
        icon: 'gavel',
        title: 'OCR Resolution\nAgreements Analysis',
        sub: 'Case Studies &\nLesson Extraction'
      },
      {
        icon: 'share-nodes',
        title: 'BAA Lifecycle\nManagement',
        sub: 'Vendor Auditing &\nTracking Systems'
      },
      {
        icon: 'shield-check',
        title: 'Annual Compliance\nProgram Evaluation',
        sub: 'Effectiveness Reviews\n& Benchmarking'
      }
    ],
    professionals: {
      title: 'Compliance & Administrative Leaders',
      items: [
        'Appointed Privacy & Security Officers',
        'Healthcare Risk Managers',
        'Human Resources Directors',
        'Practice Managers & Clinical Administrators'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Physician Practice Groups',
        'Regional Health Systems',
        'Specialty Surgery Centers',
        'Dental Support Organizations',
        'Home Healthcare Providers'
      ],
      col2: [
        'Healthcare Consulting Firms',
        'Third-Party Billing Agencies',
        'Clinical Research Organizations',
        'Healthcare Management Companies'
      ]
    }
  },

  'webinar-hipaa-8': {
    intro: 'Learn how healthcare systems, behavioral clinics, and FQHCs must configure EHR workflows to honor universal patient consent while participating in modern health data exchanges and care coordination.',
    centralTitle: 'EHR &',
    centralSubtitle: 'CONSENT',
    centralIcon: 'database',
    keyPoints: [
      {
        icon: 'document',
        title: 'Universal Consent Rules',
        desc: 'Implement compliant opt-in and opt-out workflows under revised SAMHSA Part 2.'
      },
      {
        icon: 'share-nodes',
        title: 'HIE Participation',
        desc: 'Facilitate secure cross-organization care coordination without violating federal rules.'
      },
      {
        icon: 'database',
        title: 'EHR Data Tagging',
        desc: 'Configure electronic record tags and granular data segmentation for SUD records.'
      },
      {
        icon: 'lightbulb',
        title: 'BAA Adjustments',
        desc: 'Update Business Associate Agreements and technical vendor contracts for Part 2 alignment.'
      }
    ],
    areasCovered: [
      {
        icon: 'user-check',
        title: 'Opt-In vs Opt-Out\nMechanisms',
        sub: 'Patient Consent Form\nModernization'
      },
      {
        icon: 'database',
        title: 'EHR Granular Data\nSegmentation',
        sub: 'Tag-Based Role\nAccess Restrictions'
      },
      {
        icon: 'share-nodes',
        title: 'Health Information\nExchange Workflows',
        sub: 'Compliant SUD Record\nFederation'
      },
      {
        icon: 'gavel',
        title: 'Accounting of\nDisclosures Tracking',
        sub: 'Electronic Audit Trail\nRequirements'
      },
      {
        icon: 'search',
        title: 'Subpoena & Court\nOrder Handling',
        sub: 'Legal Standards for\nSUD Record Release'
      },
      {
        icon: 'document',
        title: 'BAA Part 2\nContract Amendments',
        sub: 'Vendor Liability &\nFlow-Down Clauses'
      },
      {
        icon: 'smartphone',
        title: 'Patient Portal SUD\nData Controls',
        sub: 'Preventing Unintended\nProxy Exposure'
      },
      {
        icon: 'shield-check',
        title: 'Clinical Workflow\nStaff Guidance',
        sub: 'Balancing Care Access &\nStrict Privacy'
      }
    ],
    professionals: {
      title: 'Clinical IT & Records Directors',
      items: [
        'Health Information Management (HIM) Directors',
        'EHR Configuration Specialists',
        'Behavioral Health IT Managers',
        'Care Coordination Supervisors'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Behavioral Health Networks',
        'Federally Qualified Health Centers (FQHCs)',
        'Integrated Care Clinics',
        'Inpatient Addiction Centers',
        'Outpatient Counseling Agencies'
      ],
      col2: [
        'EHR Software Vendors',
        'Regional Health Information Exchanges',
        'Healthcare Informatics Consultancies',
        'Healthcare Data Integration Providers'
      ]
    }
  },

  'webinar-hipaa-9': {
    intro: 'Protect your organization against downstream liability by mastering third-party vendor due diligence, BAA contracting clauses, and ransomware incident response protocols.',
    centralTitle: 'VENDOR',
    centralSubtitle: 'RISK',
    centralIcon: 'share-nodes',
    keyPoints: [
      {
        icon: 'document',
        title: 'BAA Clause Essentials',
        desc: 'Draft ironclad BAA contracts covering breach notification timelines and indemnification.'
      },
      {
        icon: 'search',
        title: 'Subcontractor Audits',
        desc: 'Track fourth-party cloud vendors and downstream subcontractor compliance obligations.'
      },
      {
        icon: 'shield',
        title: 'Vendor Due Diligence',
        desc: 'Evaluate SOC 2, HITRUST, and security questionnaires before granting PHI access.'
      },
      {
        icon: 'lightbulb',
        title: 'Breach Response Protocols',
        desc: 'Establish joint incident response and liability management when a vendor is breached.'
      }
    ],
    areasCovered: [
      {
        icon: 'document',
        title: 'BAA Contract\nMaster Checklist',
        sub: 'Mandatory 2027\nStatutory Clauses'
      },
      {
        icon: 'shield-check',
        title: 'Vendor Security\nQuestionnaires',
        sub: 'SOC 2 & HITRUST\nCertification Auditing'
      },
      {
        icon: 'share-nodes',
        title: 'Downstream Subcontractor\nGovernance',
        sub: 'Managing Multi-Tier\nCloud Vendors'
      },
      {
        icon: 'alert-triangle',
        title: 'Vendor Ransomware\nResponse Protocols',
        sub: 'Coordinated Breach\nNotification'
      },
      {
        icon: 'gavel',
        title: 'Liability Allocation\n& Indemnification',
        sub: 'Defending Against\nVendor Negligence'
      },
      {
        icon: 'database',
        title: 'Cloud Storage & SaaS\nSecurity Controls',
        sub: 'Encryption in Transit\n& at Rest'
      },
      {
        icon: 'search',
        title: 'OCR Vendor Breach\nEnforcement Cases',
        sub: 'Direct Liability vs\nCovered Entity Fines'
      },
      {
        icon: 'lock',
        title: 'Vendor Offboarding\n& Data Return',
        sub: 'Certified Media\nDestruction Standards'
      }
    ],
    professionals: {
      title: 'Procurement & Compliance Teams',
      items: [
        'Healthcare Procurement Directors',
        'Vendor Risk Managers',
        'Privacy Officers & Contract Counsel',
        'Chief Information Security Officers (CISOs)'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Health Systems & Hospitals',
        'Medical Device Manufacturers',
        'Healthcare Billing Companies',
        'Cloud Hosting Providers',
        'Digital Health Platforms'
      ],
      col2: [
        'Third-Party Administrators (TPAs)',
        'Healthcare IT Consultancies',
        'Healthcare Legal Firms',
        'Cyber Insurance Risk Analysts'
      ]
    }
  },

  'webinar-hipaa-10': {
    intro: 'Navigate the strict 60-day federal reporting clock, Four-Factor Risk Assessments, and forensic investigation protocols when responding to healthcare data breaches and ransomware incidents.',
    centralTitle: 'BREACH',
    centralSubtitle: 'RESPONSE',
    centralIcon: 'alert-triangle',
    keyPoints: [
      {
        icon: 'document',
        title: '60-Day Federal Clock',
        desc: 'Understand statutory reporting deadlines to affected individuals, OCR, and media.'
      },
      {
        icon: 'shield',
        title: 'Digital Forensics',
        desc: 'Collaborate effectively with cyber insurance carriers, law enforcement, and forensic experts.'
      },
      {
        icon: 'search',
        title: 'Four-Factor Assessment',
        desc: 'Prove low probability of PHI compromise to defend against unwarranted notifications.'
      },
      {
        icon: 'lightbulb',
        title: 'Crisis Communications',
        desc: 'Draft compliant public press releases, individual notice letters, and website statements.'
      }
    ],
    areasCovered: [
      {
        icon: 'calendar',
        title: '60-Day Notification\nTimelines',
        sub: 'HHS Secretary &\nPatient Deadlines'
      },
      {
        icon: 'search',
        title: 'Four-Factor Risk\nAssessment',
        sub: 'Proving Low Probability\nof Compromise'
      },
      {
        icon: 'alert-triangle',
        title: 'Ransomware & Extortion\nPlaybooks',
        sub: 'Investigation &\nContainment Steps'
      },
      {
        icon: 'shield-check',
        title: 'Digital Forensics\nCoordination',
        sub: 'Log Preservation &\nEvidence Handling'
      },
      {
        icon: 'document',
        title: 'Compliant Notice Letter\nDrafting',
        sub: 'Mandatory Required\nDisclosures'
      },
      {
        icon: 'share-nodes',
        title: 'Media & Public\nBroadcast Outlets',
        sub: '500+ Individual Breach\nMandates'
      },
      {
        icon: 'gavel',
        title: 'OCR Investigation\nAudit Readiness',
        sub: 'Preparing Defensible\nDocumentation'
      },
      {
        icon: 'lock',
        title: 'Corrective Action\nImplementation',
        sub: 'Preventing Recurrence\n& Mitigating Fines'
      }
    ],
    professionals: {
      title: 'Incident Response & Risk Teams',
      items: [
        'Incident Response Commanders',
        'Privacy & Security Officers',
        'Healthcare Legal Counsel',
        'Healthcare Executives & Communications Staff'
      ]
    },
    organizations: {
      title: 'Companies / Organizations',
      col1: [
        'Hospital Networks & Clinics',
        'Diagnostic Laboratories',
        'Pharmacy Chains',
        'Health Plans & Insurers',
        'Ambulatory Care Centers'
      ],
      col2: [
        'Digital Forensics Firms',
        'Cyber Insurance Carriers',
        'Healthcare PR & Crisis Firms',
        'Healthcare Defense Law Firms'
      ]
    }
  }
};

/**
 * Returns complete infographic data for any webinar object.
 */
export function getWebinarInfographicData(webinar) {
  if (!webinar) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-1'];
  }

  // 1. Direct object override if provided on webinar
  if (webinar.infographic) {
    return webinar.infographic;
  }

  // 2. Direct ID lookup
  const cleanId = String(webinar.id || '');
  if (WEBINAR_INFOGRAPHICS_DATA[cleanId]) {
    return WEBINAR_INFOGRAPHICS_DATA[cleanId];
  }

  // Numeric index lookup (e.g. 1 -> webinar-hipaa-1)
  const numIndex = parseInt(cleanId, 10);
  if (!isNaN(numIndex) && numIndex >= 1 && numIndex <= 10) {
    const key = `webinar-hipaa-${numIndex}`;
    if (WEBINAR_INFOGRAPHICS_DATA[key]) {
      return WEBINAR_INFOGRAPHICS_DATA[key];
    }
  }

  // 3. Keyword matching based on title / category
  const text = `${webinar.title || ''} ${webinar.category || ''} ${webinar.badgeLabel || ''}`.toLowerCase();

  if (text.includes('ai') || text.includes('artificial intelligence') || text.includes('generative')) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-2'];
  }
  if (text.includes('risk assessment') || text.includes('sra') || text.includes('how to conduct')) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-3'];
  }
  if (text.includes('security rule') || text.includes('clarified and explained')) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-4'];
  }
  if (text.includes('2027') && (text.includes('beyond') || text.includes('upcoming'))) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-5'];
  }
  if (text.includes('substance') || text.includes('42 cfr') || (text.includes('samhsa') && !text.includes('ehr'))) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-6'];
  }
  if (text.includes('compliance officer') || text.includes('officer training')) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-7'];
  }
  if (text.includes('ehr') || (text.includes('samhsa') && text.includes('consent'))) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-8'];
  }
  if (text.includes('vendor') || text.includes('baa') || text.includes('business associate')) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-9'];
  }
  if (text.includes('breach') || text.includes('ransomware') || text.includes('ocr')) {
    return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-10'];
  }

  return WEBINAR_INFOGRAPHICS_DATA['webinar-hipaa-1'];
}
