/**
 * Enemy definitions for Arribatec Office RPG
 * 
 * Three zones with different client types:
 * - Finance: Auditor, Budget Manager, Tax Consultant, CFO (Boss)
 * - Hospitality: Angry Customer, Tour Operator, Event Planner, Hotel Manager (Boss)
 * - Research: Data Analyst, Research Director, Grant Writer, Lead Scientist (Boss)
 */

export interface QuizQuestion {
  question: string;
  answers: string[];
  correctIndex: number; // Index of the correct answer (0-3)
}

export interface EnemyData {
  id: string;
  displayName: string;
  zone: 'finance' | 'hospitality' | 'research' | 'lobby';
  isBoss: boolean;
  
  // Stats
  maxHP: number;
  difficulty: number; // 1-10, affects damage taken/dealt
  
  // Rewards
  expReward: number;
  goldReward: number;
  
  // Asset reference
  spriteKey: string;
  
  // Battle dialogue
  introText: string;
  defeatText: string;
  
  // Quiz questions
  questions: QuizQuestion[];
}

// Default office questions for enemies without specific questions
const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    question: 'What does "EOD" mean in office communication?',
    answers: ['End of Day', 'Every Other Day', 'Email on Demand', 'Executive Office Director'],
    correctIndex: 0
  },
  {
    question: 'What is a common use of Excel in an office?',
    answers: ['Video editing', 'Data analysis and spreadsheets', 'Web browsing', 'Music production'],
    correctIndex: 1
  },
  {
    question: 'What does "FYI" stand for?',
    answers: ['For Your Information', 'Find Your Invoice', 'Follow Your Instinct', 'Formal Year Index'],
    correctIndex: 0
  },
  {
    question: 'What does "ASAP" stand for?',
    answers: ['As Soon As Possible', 'Always Send A Package', 'Ask Someone About Policy', 'After Saturday And Payday'],
    correctIndex: 0
  },
  {
    question: 'What is a memo?',
    answers: ['A type of computer memory', 'A short written message or report', 'A lunch menu', 'A meeting room'],
    correctIndex: 1
  },
  {
    question: 'What does "CC" mean in email?',
    answers: ['Carbon Copy', 'Company Contact', 'Central Command', 'Client Call'],
    correctIndex: 0
  },
  {
    question: 'What is a deadline?',
    answers: ['A dangerous line', 'The final time by which something must be completed', 'A phone line', 'An obituary'],
    correctIndex: 1
  },
  {
    question: 'What is a conference call?',
    answers: ['A phone call with multiple participants', 'A call from a conference', 'An emergency call', 'A video game'],
    correctIndex: 0
  }
];

// Hospitality zone questions
const HOSPITALITY_QUESTIONS: QuizQuestion[] = [
  {
    question: 'What does "guest satisfaction" primarily measure?',
    answers: ['Room temperature', 'How happy guests are with their experience', 'Number of guests', 'Hotel size'],
    correctIndex: 1
  },
  {
    question: 'What is a concierge?',
    answers: ['A type of cheese', 'Hotel staff who assists guests with various services', 'A cleaning tool', 'A hotel room'],
    correctIndex: 1
  },
  {
    question: 'What does "front desk" refer to?',
    answers: ['The first desk in line', 'The main reception area of a hotel', 'A special type of desk', 'The CEO\'s office'],
    correctIndex: 1
  },
  {
    question: 'What is a reservation?',
    answers: ['Hesitation about something', 'An arrangement to have something held for you', 'A type of restaurant', 'A parking spot'],
    correctIndex: 1
  },
  {
    question: 'What does "check-in" mean at a hotel?',
    answers: ['Paying the bill', 'Registering your arrival', 'Leaving the hotel', 'Checking email'],
    correctIndex: 1
  },
  {
    question: 'What is room service?',
    answers: ['Cleaning the room', 'Food and drinks delivered to guest rooms', 'Room decoration', 'Room inspection'],
    correctIndex: 1
  },
  {
    question: 'What is occupancy rate?',
    answers: ['How fast rooms fill up', 'The percentage of rooms occupied', 'Room capacity', 'Staff attendance'],
    correctIndex: 1
  },
  {
    question: 'What is a hospitality suite?',
    answers: ['A software program', 'A room for entertaining guests or clients', 'A type of candy', 'A bathroom'],
    correctIndex: 1
  },
  {
    question: 'What does "turndown service" involve?',
    answers: ['Rejecting guests', 'Preparing the room for sleep, folding back bedsheets', 'Turning down the volume', 'Lowering prices'],
    correctIndex: 1
  },
  {
    question: 'What is an amenity in hospitality?',
    answers: ['A type of enemy', 'A feature that provides comfort or convenience', 'A complaint', 'A discount'],
    correctIndex: 1
  }
];

// Research zone questions
const RESEARCH_QUESTIONS: QuizQuestion[] = [
  {
    question: 'What is a hypothesis?',
    answers: ['A proven fact', 'A proposed explanation to be tested', 'A type of animal', 'Medical equipment'],
    correctIndex: 1
  },
  {
    question: 'What does "peer review" mean?',
    answers: ['Looking at your peers', 'Evaluation of work by others in the same field', 'A popularity contest', 'A performance review'],
    correctIndex: 1
  },
  {
    question: 'What is a control group in an experiment?',
    answers: ['The group that controls the experiment', 'A group not given the treatment, for comparison', 'The management team', 'Quality control'],
    correctIndex: 1
  },
  {
    question: 'What does "methodology" refer to?',
    answers: ['The study of methods', 'The system of methods used in a study', 'Math techniques', 'A religious practice'],
    correctIndex: 1
  },
  {
    question: 'What is quantitative research?',
    answers: ['Research about quantities of things', 'Research focused on numerical data and statistics', 'Counting things', 'Quality research'],
    correctIndex: 1
  },
  {
    question: 'What is a sample size?',
    answers: ['The size of free samples', 'The number of subjects in a study', 'A clothing measurement', 'A music sample length'],
    correctIndex: 1
  },
  {
    question: 'What does "empirical evidence" mean?',
    answers: ['Evidence from an empire', 'Evidence based on observation or experiment', 'Theoretical evidence', 'Legal evidence'],
    correctIndex: 1
  },
  {
    question: 'What is a literature review?',
    answers: ['Reviewing novels', 'A summary of existing research on a topic', 'A book club', 'An English exam'],
    correctIndex: 1
  },
  {
    question: 'What is data analysis?',
    answers: ['Analyzing a date', 'The process of examining data to draw conclusions', 'Data collection', 'Data storage'],
    correctIndex: 1
  },
  {
    question: 'What is a research grant?',
    answers: ['Permission to do research', 'Money given to fund research projects', 'A research result', 'A type of degree'],
    correctIndex: 1
  }
];

export const ENEMIES: Record<string, EnemyData> = {
  // ===== FINANCE ZONE =====
  'auditor': {
    id: 'auditor',
    displayName: 'Auditor',
    zone: 'finance',
    isBoss: false,
    maxHP: 60,
    difficulty: 3,
    expReward: 15,
    goldReward: 20,
    spriteKey: 'enemy-auditor',
    introText: 'An Auditor questions your expense report!',
    defeatText: 'The Auditor accepts your documentation.',
    questions: [
      {
        question: 'What is the purpose of an expense report audit?',
        answers: [
          'To increase employee salaries',
          'To verify expenses comply with company policy',
          'To reduce office supply orders',
          'To schedule team meetings'
        ],
        correctIndex: 1
      },
      {
        question: 'Which document is typically required for travel expense claims?',
        answers: [
          'Birth certificate',
          'Driver\'s license',
          'Original receipts',
          'Library card'
        ],
        correctIndex: 2
      },
      {
        question: 'What does ROI stand for in business finance?',
        answers: [
          'Return on Investment',
          'Rate of Interest',
          'Record of Income',
          'Regional Office Index'
        ],
        correctIndex: 0
      },
      {
        question: 'What is an audit trail?',
        answers: [
          'A hiking path for accountants',
          'A documented history of transactions',
          'A type of financial report',
          'An employee performance review'
        ],
        correctIndex: 1
      },
      {
        question: 'What does "reconciliation" mean in accounting?',
        answers: [
          'Making up after an argument',
          'Comparing two sets of records to ensure they match',
          'Hiring new employees',
          'Closing the office'
        ],
        correctIndex: 1
      },
      {
        question: 'What is a balance sheet?',
        answers: [
          'A gym equipment list',
          'A financial statement showing assets, liabilities, and equity',
          'A schedule for meetings',
          'A list of employee names'
        ],
        correctIndex: 1
      },
      {
        question: 'What does GAAP stand for?',
        answers: [
          'General Accounting Audit Process',
          'Generally Accepted Accounting Principles',
          'Global Asset Allocation Plan',
          'Government Approved Audit Procedures'
        ],
        correctIndex: 1
      },
      {
        question: 'What is depreciation?',
        answers: [
          'An increase in asset value',
          'The decrease in value of an asset over time',
          'Employee salary raises',
          'A type of bonus'
        ],
        correctIndex: 1
      },
      {
        question: 'What is accounts payable?',
        answers: [
          'Money customers owe the company',
          'Money the company owes to suppliers',
          'Employee salaries',
          'Tax refunds'
        ],
        correctIndex: 1
      }
    ]
  },
  
  'budget-manager': {
    id: 'budget-manager',
    displayName: 'Budget Manager',
    zone: 'finance',
    isBoss: false,
    maxHP: 70,
    difficulty: 4,
    expReward: 20,
    goldReward: 25,
    spriteKey: 'enemy-budget-manager',
    introText: 'A Budget Manager demands cost justification!',
    defeatText: 'The Budget Manager approves your proposal.',
    questions: [
      {
        question: 'What is a fiscal year?',
        answers: [
          'A 12-month period for financial reporting',
          'The year the company was founded',
          'A year with high profits',
          'The CEO\'s term of service'
        ],
        correctIndex: 0
      },
      {
        question: 'What does "budget variance" mean?',
        answers: [
          'The total budget amount',
          'The difference between budgeted and actual costs',
          'The budget approval date',
          'The number of budget categories'
        ],
        correctIndex: 1
      },
      {
        question: 'Which is a capital expenditure?',
        answers: [
          'Monthly office supplies',
          'Employee salaries',
          'Purchasing new equipment',
          'Electricity bills'
        ],
        correctIndex: 2
      },
      {
        question: 'What is a cost center?',
        answers: [
          'A shopping mall',
          'A department that incurs costs but doesn\'t generate revenue',
          'The finance office location',
          'A discount store'
        ],
        correctIndex: 1
      },
      {
        question: 'What does "forecasting" mean in budgeting?',
        answers: [
          'Predicting the weather',
          'Estimating future financial outcomes',
          'Sending emails',
          'Hiring new staff'
        ],
        correctIndex: 1
      },
      {
        question: 'What is zero-based budgeting?',
        answers: [
          'Having no budget at all',
          'Starting each budget cycle from zero and justifying all expenses',
          'Only budgeting for free items',
          'A budget that equals exactly zero'
        ],
        correctIndex: 1
      },
      {
        question: 'What is an operating budget?',
        answers: [
          'A budget for surgeries',
          'Day-to-day revenue and expense projections',
          'A budget for buying companies',
          'A budget for office decorations'
        ],
        correctIndex: 1
      },
      {
        question: 'What does "overhead" mean in business?',
        answers: [
          'Costs above your head',
          'Ongoing business expenses not directly tied to production',
          'Office ceiling repairs',
          'Management salaries only'
        ],
        correctIndex: 1
      },
      {
        question: 'What is a profit margin?',
        answers: [
          'The edge of a profit chart',
          'The percentage of revenue that becomes profit',
          'Extra space in the budget',
          'Bonus pay for employees'
        ],
        correctIndex: 1
      }
    ]
  },
  
  'tax-consultant': {
    id: 'tax-consultant',
    displayName: 'Tax Consultant',
    zone: 'finance',
    isBoss: false,
    maxHP: 75,
    difficulty: 5,
    expReward: 25,
    goldReward: 30,
    spriteKey: 'enemy-tax-consultant',
    introText: 'A Tax Consultant challenges your compliance!',
    defeatText: 'The Tax Consultant withdraws their objections.',
    questions: [
      {
        question: 'What is a tax deduction?',
        answers: [
          'Money the government owes you',
          'An expense that reduces taxable income',
          'A type of bank account',
          'A penalty fee'
        ],
        correctIndex: 1
      },
      {
        question: 'When are quarterly tax payments typically due?',
        answers: [
          'January, April, July, October',
          'Every month',
          'April 15, June 15, September 15, January 15',
          'December 31 only'
        ],
        correctIndex: 2
      },
      {
        question: 'What is a W-2 form?',
        answers: [
          'A wrestling form',
          'A wage and tax statement from an employer',
          'A work schedule',
          'A vacation request'
        ],
        correctIndex: 1
      },
      {
        question: 'What is taxable income?',
        answers: [
          'All money you earn',
          'Income after allowable deductions',
          'Only salary income',
          'Money in a bank account'
        ],
        correctIndex: 1
      },
      {
        question: 'What is an audit in tax terms?',
        answers: [
          'A hearing test',
          'An examination of tax returns by tax authorities',
          'A music event',
          'A job interview'
        ],
        correctIndex: 1
      },
      {
        question: 'What is VAT?',
        answers: [
          'Very Angry Taxes',
          'Value Added Tax',
          'Voluntary Action Tax',
          'Vehicle Assessment Tax'
        ],
        correctIndex: 1
      },
      {
        question: 'What is a tax credit?',
        answers: [
          'A loan from the government',
          'A dollar-for-dollar reduction in tax owed',
          'Extra taxes you pay',
          'A credit card for taxes'
        ],
        correctIndex: 1
      },
      {
        question: 'What does "tax liability" mean?',
        answers: [
          'Being sued for taxes',
          'The total amount of tax you owe',
          'Tax insurance',
          'Tax problems'
        ],
        correctIndex: 1
      },
      {
        question: 'What is a 1099 form used for?',
        answers: [
          'Filing a complaint',
          'Reporting non-employee income',
          'Ordering office supplies',
          'Vacation requests'
        ],
        correctIndex: 1
      }
    ]
  },
  
  'cfo-boss': {
    id: 'cfo-boss',
    displayName: 'CFO',
    zone: 'finance',
    isBoss: true,
    maxHP: 180,
    difficulty: 9,
    expReward: 100,
    goldReward: 200,
    spriteKey: 'enemy-cfo',
    introText: 'The CFO demands to see your business case!',
    defeatText: 'The CFO is convinced by your financial arguments!',
    questions: [
      {
        question: 'What is ROI and why is it important?',
        answers: ['Return on Investment - measures profitability', 'Rate of Inflation - tracks prices', 'Report on Income - for taxes', 'Range of Interest - for loans'],
        correctIndex: 0
      },
      {
        question: 'What is EBITDA?',
        answers: ['Earnings Before Interest, Taxes, Depreciation, Amortization', 'Every Business Income Tax Deduction Allowed', 'Executive Board Investment Terms Agreement', 'Estimated Budget Income Tax Due Annually'],
        correctIndex: 0
      },
      {
        question: 'What is a P&L statement?',
        answers: ['Profit and Loss - shows revenues and expenses', 'Price and Liability statement', 'Payment and Loan agreement', 'Product and Logistics report'],
        correctIndex: 0
      },
      {
        question: 'What is working capital?',
        answers: ['Money spent on office equipment', 'Current assets minus current liabilities', 'Employee wages', 'Building costs'],
        correctIndex: 1
      },
      {
        question: 'What is cash flow?',
        answers: ['Money kept in a vault', 'The movement of money in and out of a business', 'Cash register procedures', 'Payroll processing'],
        correctIndex: 1
      },
      {
        question: 'What is a balance sheet?',
        answers: ['A weighing scale for cash', 'A financial statement showing assets, liabilities, and equity', 'A scale for measuring office supplies', 'A budget planning tool'],
        correctIndex: 1
      },
      {
        question: 'What is fiscal year?',
        answers: ['A calendar year only', 'A 12-month accounting period used for financial reporting', 'The year a company was founded', 'Tax season'],
        correctIndex: 1
      },
      {
        question: 'What is liquidity in finance?',
        answers: ['Water-based investments', 'How easily assets can be converted to cash', 'Beverage company stocks', 'Swimming pool maintenance'],
        correctIndex: 1
      },
      {
        question: 'What is equity in business terms?',
        answers: ['Fair treatment of employees', 'Ownership interest in the company', 'Equal pay policies', 'Equipment inventory'],
        correctIndex: 1
      },
      {
        question: 'What does IPO stand for?',
        answers: ['Internal Payment Order', 'Initial Public Offering', 'Investment Portfolio Overview', 'Income Per Output'],
        correctIndex: 1
      }
    ]
  },
  
  // ===== HOSPITALITY ZONE =====
  'angry-customer': {
    id: 'angry-customer',
    displayName: 'Angry Customer',
    zone: 'hospitality',
    isBoss: false,
    maxHP: 55,
    difficulty: 3,
    expReward: 15,
    goldReward: 20,
    spriteKey: 'enemy-angry-customer',
    introText: 'An Angry Customer has complaints!',
    defeatText: 'The Customer is satisfied with your response.',
    questions: HOSPITALITY_QUESTIONS
  },
  
  'tour-operator': {
    id: 'tour-operator',
    displayName: 'Tour Operator',
    zone: 'hospitality',
    isBoss: false,
    maxHP: 70,
    difficulty: 4,
    expReward: 20,
    goldReward: 25,
    spriteKey: 'enemy-tour-operator',
    introText: 'A Tour Operator has scheduling conflicts!',
    defeatText: 'The Tour Operator accepts your itinerary.',
    questions: HOSPITALITY_QUESTIONS
  },
  
  'event-planner': {
    id: 'event-planner',
    displayName: 'Event Planner',
    zone: 'hospitality',
    isBoss: false,
    maxHP: 65,
    difficulty: 5,
    expReward: 25,
    goldReward: 30,
    spriteKey: 'enemy-event-planner',
    introText: 'An Event Planner demands impossible arrangements!',
    defeatText: 'The Event Planner agrees to your plan.',
    questions: HOSPITALITY_QUESTIONS
  },
  
  'hotel-manager-boss': {
    id: 'hotel-manager-boss',
    displayName: 'Hotel Manager',
    zone: 'hospitality',
    isBoss: true,
    maxHP: 170,
    difficulty: 9,
    expReward: 100,
    goldReward: 200,
    spriteKey: 'enemy-hotel-manager',
    introText: 'The Hotel Manager challenges your hospitality standards!',
    defeatText: 'The Hotel Manager is impressed by your service excellence!',
    questions: HOSPITALITY_QUESTIONS
  },
  
  // ===== RESEARCH ZONE =====
  'data-analyst': {
    id: 'data-analyst',
    displayName: 'Data Analyst',
    zone: 'research',
    isBoss: false,
    maxHP: 65,
    difficulty: 4,
    expReward: 15,
    goldReward: 20,
    spriteKey: 'enemy-data-analyst',
    introText: 'A Data Analyst questions your methodology!',
    defeatText: 'The Data Analyst accepts your analysis.',
    questions: RESEARCH_QUESTIONS
  },
  
  'research-director': {
    id: 'research-director',
    displayName: 'Research Director',
    zone: 'research',
    isBoss: false,
    maxHP: 75,
    difficulty: 5,
    expReward: 20,
    goldReward: 25,
    spriteKey: 'enemy-research-director',
    introText: 'A Research Director challenges your hypothesis!',
    defeatText: 'The Research Director approves your research.',
    questions: RESEARCH_QUESTIONS
  },
  
  'grant-writer': {
    id: 'grant-writer',
    displayName: 'Grant Writer',
    zone: 'research',
    isBoss: false,
    maxHP: 70,
    difficulty: 6,
    expReward: 25,
    goldReward: 30,
    spriteKey: 'enemy-grant-writer',
    introText: 'A Grant Writer demands more evidence!',
    defeatText: 'The Grant Writer accepts your proposal.',
    questions: RESEARCH_QUESTIONS
  },
  
  'lead-scientist-boss': {
    id: 'lead-scientist-boss',
    displayName: 'Lead Scientist',
    zone: 'research',
    isBoss: true,
    maxHP: 200,
    difficulty: 10,
    expReward: 100,
    goldReward: 200,
    spriteKey: 'enemy-lead-scientist',
    introText: 'The Lead Scientist demands peer review!',
    defeatText: 'The Lead Scientist acknowledges your scientific rigor!',
    questions: RESEARCH_QUESTIONS
  },
  
  // ===== LOBBY ZONE - SPECIAL ENEMIES =====
  'anders': {
    id: 'anders',
    displayName: 'ANDERS',
    zone: 'lobby',
    isBoss: true,
    maxHP: 250,
    difficulty: 9,
    expReward: 150,
    goldReward: 300,
    spriteKey: 'enemy-anders',
    introText: 'ANDERS BLOCKS YOUR PATH! HE DEMANDS YOU PROVE YOUR NEXUS KNOWLEDGE!',
    defeatText: 'ANDERS IS IMPRESSED! YOU TRULY UNDERSTAND THE NEXUS PLATFORM!',
    questions: [
      {
        question: 'WHAT IS THE NEXUS PLATFORM PRIMARILY DESIGNED FOR?',
        answers: [
          'SINGLE-USER DESKTOP APPLICATIONS',
          'MULTI-TENANT WEB APPLICATIONS',
          'MOBILE GAME DEVELOPMENT',
          'CRYPTOCURRENCY MINING'
        ],
        correctIndex: 1
      },
      {
        question: 'WHAT AUTHENTICATION SYSTEM DOES THE NEXUS PLATFORM USE?',
        answers: [
          'BASIC AUTH WITH PLAIN PASSWORDS',
          'NO AUTHENTICATION REQUIRED',
          'KEYCLOAK WITH OAUTH2/OIDC AND JWT TOKENS',
          'FINGERPRINT SCANNING ONLY'
        ],
        correctIndex: 2
      },
      {
        question: 'WHAT IS THE ONE-LINE SETUP METHOD CALLED IN ARRIBATEC.NEXUS.CLIENT?',
        answers: [
          'BUILDER.ADDNEXUSMAGIC()',
          'BUILDER.ADDARRIBATECNEXUS()',
          'BUILDER.SETUPEVERYTHING()',
          'BUILDER.CONFIGURETENANT()'
        ],
        correctIndex: 1
      },
      {
        question: 'WHAT DOES THE MASTER API PROVIDE IN THE NEXUS PLATFORM?',
        answers: [
          'ONLY DATABASE BACKUPS',
          'TENANT/USER/DATABASE MANAGEMENT',
          'JUST EMAIL NOTIFICATIONS',
          'ONLY LOGGING FUNCTIONALITY'
        ],
        correctIndex: 1
      },
      {
        question: 'WHAT MIDDLEWARE ORDER IS CRITICAL FOR V2.3.0?',
        answers: [
          'AUTHORIZATION -> AUTHENTICATION -> CORS',
          'REQUESTCONTEXT -> CORS -> AUTHENTICATION -> NEXUSCONTEXT -> AUTHORIZATION',
          'CORS -> AUTHORIZATION -> AUTHENTICATION',
          'AUTHENTICATION -> REQUESTCONTEXT -> CORS'
        ],
        correctIndex: 1
      },
      {
        question: 'WHAT DATABASES DOES THE NEXUS PLATFORM SUPPORT VIA CONTEXT-AWARE CONNECTIONS?',
        answers: [
          'ONLY SQL SERVER',
          'ONLY POSTGRESQL',
          'SQL SERVER, POSTGRESQL, MYSQL, ORACLE',
          'ONLY MONGODB'
        ],
        correctIndex: 2
      },
      {
        question: 'WHAT IS USED FOR STRUCTURED LOGGING IN THE NEXUS PLATFORM?',
        answers: [
          'CONSOLE.WRITELINE ONLY',
          'SERILOG WITH CONSOLE, FILE, AND LOKI SINKS',
          'NO LOGGING AVAILABLE',
          'PRINT STATEMENTS'
        ],
        correctIndex: 1
      },
      {
        question: 'WHAT DOES DYNAMIC JWT VALIDATION IN V2.3.0 ALLOW?',
        answers: [
          'STATIC KEYCLOAK CONFIGURATION ONLY',
          'NO TOKEN VALIDATION',
          'EACH TENANT CAN USE A DIFFERENT KEYCLOAK REALM',
          'ONLY ONE REALM FOR ALL TENANTS'
        ],
        correctIndex: 2
      },
      {
        question: 'WHAT REVERSE PROXY DOES THE NEXUS PLATFORM USE?',
        answers: [
          'NGINX ONLY',
          'APACHE',
          'TRAEFIK WITH AUTOMATIC SSL',
          'NO PROXY NEEDED'
        ],
        correctIndex: 2
      },
      {
        question: 'HOW SHOULD TENANT DATA BE ISOLATED IN DATABASE QUERIES?',
        answers: [
          'NO ISOLATION NEEDED',
          'ALWAYS FILTER BY TENANTID',
          'USE SEPARATE SERVERS',
          'ENCRYPT EVERYTHING'
        ],
        correctIndex: 1
      }
    ]
  },
  
  // LARS HUGO - Special cycling/running enthusiast with a cap
  'lars-hugo': {
    id: 'lars-hugo',
    displayName: 'Lars Hugo',
    zone: 'lobby',
    isBoss: true,
    maxHP: 200,
    difficulty: 7,
    expReward: 120,
    goldReward: 250,
    spriteKey: 'enemy-lars-hugo',
    introText: 'Lars Hugo adjusts his cap and blocks your path! "Before you pass, answer my athletic questions!"',
    defeatText: 'Lars Hugo tips his cap to you. "Well done! You know your sports!"',
    questions: [
      {
        question: 'I always wear my cap during morning runs. What\'s the optimal heart rate zone for endurance training?',
        answers: [
          '50-60% of max heart rate',
          '60-70% of max heart rate',
          '70-80% of max heart rate',
          '90-100% of max heart rate'
        ],
        correctIndex: 2
      },
      {
        question: 'My cap protects me from sun on long bike rides. What\'s a typical Tour de France stage distance?',
        answers: [
          '50-80 km',
          '100-150 km',
          '150-200 km',
          '300-400 km'
        ],
        correctIndex: 2
      },
      {
        question: 'Even with my cap on, I stay hydrated! How much water should a cyclist drink per hour?',
        answers: [
          '100-200 ml',
          '500-750 ml',
          '2-3 liters',
          '5 liters'
        ],
        correctIndex: 1
      },
      {
        question: 'I tip my cap to proper running form! What should your foot strike pattern be?',
        answers: [
          'Always heel strike hard',
          'Midfoot or forefoot strike',
          'Run on your toes only',
          'Stomp as loud as possible'
        ],
        correctIndex: 1
      },
      {
        question: 'My lucky cap has seen many marathons! What is the official marathon distance?',
        answers: [
          '40.000 km',
          '42.195 km',
          '45.500 km',
          '50.000 km'
        ],
        correctIndex: 1
      },
      {
        question: 'This cap keeps sweat out of my eyes during interval training! What is HIIT?',
        answers: [
          'Highly Ineffective Indoor Training',
          'High Intensity Interval Training',
          'Happy Inactive Indoor Time',
          'Hardcore Insane Ironman Training'
        ],
        correctIndex: 1
      },
      {
        question: 'I\'ve worn this cap in many triathlons! What are the three sports in a triathlon?',
        answers: [
          'Running, jumping, throwing',
          'Swimming, cycling, running',
          'Cycling, rowing, skiing',
          'Walking, jogging, sprinting'
        ],
        correctIndex: 1
      },
      {
        question: 'My cap\'s visor helps me see the road ahead! What gear ratio is best for climbing hills on a bike?',
        answers: [
          'High gear (big front, small back)',
          'Low gear (small front, big back)',
          'No gears needed',
          'Only use middle gear'
        ],
        correctIndex: 1
      },
      {
        question: 'I never run without my cap! What\'s the recommended weekly mileage increase for runners?',
        answers: [
          '50% increase per week',
          '10% increase per week',
          'Double every week',
          '100% increase per week'
        ],
        correctIndex: 1
      },
      {
        question: 'This cap has crossed many finish lines with me! What does "bonking" mean in endurance sports?',
        answers: [
          'Hitting your head',
          'Running out of glycogen/energy',
          'Falling off your bike',
          'Winning a race'
        ],
        correctIndex: 1
      }
    ]
  },
  
  // OLE JAKOB - Professional businessman who knows everything about Arribatec
  'ole-jakob': {
    id: 'ole-jakob',
    displayName: 'Ole Jakob',
    zone: 'lobby',
    isBoss: true,
    maxHP: 220,
    difficulty: 8,
    expReward: 150,
    goldReward: 300,
    spriteKey: 'enemy-ole-jakob',
    introText: 'Ole Jakob straightens his tie and smiles. "Ah, a new colleague! Let me see if you really know Arribatec..."',
    defeatText: 'Ole Jakob nods approvingly. "Impressive! You truly understand our company values."',
    questions: [
      {
        question: 'What is Arribatec\'s main slogan that appears on their website?',
        answers: [
          'Technology First',
          'We simplify complexity',
          'Digital Innovation Hub',
          'The Future is Now'
        ],
        correctIndex: 1
      },
      {
        question: 'Arribatec was founded by former employees of which company?',
        answers: [
          'Microsoft',
          'SAP',
          'Unit4',
          'Oracle'
        ],
        correctIndex: 2
      },
      {
        question: 'What is the name of the cloud-based industrial ERP system that Arribatec offers for manufacturing and logistics?',
        answers: [
          'NetSuite',
          'RamBase',
          'Dynamics 365',
          'Odoo'
        ],
        correctIndex: 1
      },
      {
        question: 'What is Arribatec\'s headquarters phone number?',
        answers: [
          '+47 2200 1100',
          '+47 4000 3355',
          '+47 5500 8899',
          '+47 9900 4400'
        ],
        correctIndex: 1
      },
      {
        question: 'According to Arribatec, what do they give clients more time to focus on?',
        answers: [
          'Marketing campaigns',
          'Value-adding tasks',
          'Staff meetings',
          'Paperwork'
        ],
        correctIndex: 1
      },
      {
        question: 'What type of partner status does Arribatec have with Unit4?',
        answers: [
          'Bronze Partner',
          'Silver Partner',
          'Gold Partner',
          'Elite Partner'
        ],
        correctIndex: 3
      },
      {
        question: 'Arribatec describes themselves as passionate about what kind of technology?',
        answers: [
          'Artificial Intelligence',
          'Sustainable technology',
          'Quantum computing',
          'Blockchain'
        ],
        correctIndex: 1
      },
      {
        question: 'What does Arribatec offer through their Training Center?',
        answers: [
          'Gym memberships',
          'Skills development and courses',
          'Team building activities',
          'Language lessons'
        ],
        correctIndex: 1
      },
      {
        question: 'Which of these is NOT a service offered by Arribatec?',
        answers: [
          'ERP Systems',
          'IT Security',
          'Social Media Marketing',
          'Software Development'
        ],
        correctIndex: 2
      },
      {
        question: 'Arribatec helps connect which three things according to their consultancy page?',
        answers: [
          'Hardware, software, and networks',
          'People, processes, and systems',
          'Sales, marketing, and finance',
          'Customers, suppliers, and partners'
        ],
        correctIndex: 1
      }
    ]
  },
  
  // KRISTIANE - Medical professional with lab coat and blonde hair
  'kristiane': {
    id: 'kristiane',
    displayName: 'Dr. Kristiane',
    zone: 'lobby',
    isBoss: true,
    maxHP: 200,
    difficulty: 7,
    expReward: 130,
    goldReward: 280,
    spriteKey: 'enemy-kristiane',
    introText: 'Dr. Kristiane adjusts her lab coat and peers at you over her glasses. "Time for a medical examination of your knowledge!"',
    defeatText: 'Dr. Kristiane smiles warmly. "Excellent diagnosis! You have a healthy mind."',
    questions: [
      {
        question: 'What is the normal resting heart rate for adults?',
        answers: [
          '40-50 beats per minute',
          '60-100 beats per minute',
          '120-140 beats per minute',
          '150-180 beats per minute'
        ],
        correctIndex: 1
      },
      {
        question: 'Which organ is responsible for filtering blood and producing urine?',
        answers: [
          'Liver',
          'Spleen',
          'Kidney',
          'Pancreas'
        ],
        correctIndex: 2
      },
      {
        question: 'What does "stat" mean in medical terminology?',
        answers: [
          'Standard treatment',
          'Immediately/Urgent',
          'Statistical analysis',
          'Standing order'
        ],
        correctIndex: 1
      },
      {
        question: 'What is the normal body temperature in Celsius?',
        answers: [
          '35.0°C',
          '37.0°C',
          '39.0°C',
          '41.0°C'
        ],
        correctIndex: 1
      },
      {
        question: 'Which vitamin is primarily obtained from sunlight exposure?',
        answers: [
          'Vitamin A',
          'Vitamin B12',
          'Vitamin C',
          'Vitamin D'
        ],
        correctIndex: 3
      },
      {
        question: 'What is the largest organ in the human body?',
        answers: [
          'Liver',
          'Brain',
          'Skin',
          'Heart'
        ],
        correctIndex: 2
      },
      {
        question: 'How many bones are in the adult human body?',
        answers: [
          '106',
          '156',
          '206',
          '256'
        ],
        correctIndex: 2
      },
      {
        question: 'What blood type is considered the universal donor?',
        answers: [
          'A positive',
          'B negative',
          'AB positive',
          'O negative'
        ],
        correctIndex: 3
      },
      {
        question: 'Which part of the brain controls balance and coordination?',
        answers: [
          'Cerebrum',
          'Cerebellum',
          'Brainstem',
          'Hypothalamus'
        ],
        correctIndex: 1
      },
      {
        question: 'What is the medical term for high blood pressure?',
        answers: [
          'Hypotension',
          'Hypertension',
          'Tachycardia',
          'Arrhythmia'
        ],
        correctIndex: 1
      }
    ]
  },
  
  // FREDRIK - Drummer who wears band shirts and asks pop quiz questions
  'fredrik': {
    id: 'fredrik',
    displayName: 'Fredrik',
    zone: 'lobby',
    isBoss: true,
    maxHP: 190,
    difficulty: 7,
    expReward: 125,
    goldReward: 260,
    spriteKey: 'enemy-fredrik',
    introText: 'Fredrik twirls his drumsticks and grins. "Hey! Let\'s see if you know your pop culture!"',
    defeatText: 'Fredrik gives you a drumroll of approval. "Rock on! You really know your stuff!"',
    questions: [
      {
        question: 'Which band is known for the song "Smells Like Teen Spirit"?',
        answers: [
          'Pearl Jam',
          'Nirvana',
          'Soundgarden',
          'Alice in Chains'
        ],
        correctIndex: 1
      },
      {
        question: 'What year did the first iPhone release?',
        answers: [
          '2005',
          '2006',
          '2007',
          '2008'
        ],
        correctIndex: 2
      },
      {
        question: 'Which TV show features the character Walter White?',
        answers: [
          'The Sopranos',
          'Breaking Bad',
          'Better Call Saul',
          'Ozark'
        ],
        correctIndex: 1
      },
      {
        question: 'Who played Iron Man in the Marvel Cinematic Universe?',
        answers: [
          'Chris Evans',
          'Chris Hemsworth',
          'Robert Downey Jr.',
          'Mark Ruffalo'
        ],
        correctIndex: 2
      },
      {
        question: 'What is the best-selling video game of all time?',
        answers: [
          'Tetris',
          'Minecraft',
          'GTA V',
          'Wii Sports'
        ],
        correctIndex: 1
      },
      {
        question: 'Which artist painted the Mona Lisa?',
        answers: [
          'Michelangelo',
          'Vincent van Gogh',
          'Leonardo da Vinci',
          'Pablo Picasso'
        ],
        correctIndex: 2
      },
      {
        question: 'What is the name of the coffee shop in the TV show Friends?',
        answers: [
          'Central Perk',
          'The Coffee House',
          'Java Joe\'s',
          'Morning Brew'
        ],
        correctIndex: 0
      },
      {
        question: 'Which planet is known as the Red Planet?',
        answers: [
          'Venus',
          'Jupiter',
          'Mars',
          'Saturn'
        ],
        correctIndex: 2
      },
      {
        question: 'Who wrote the Harry Potter book series?',
        answers: [
          'Stephen King',
          'J.R.R. Tolkien',
          'J.K. Rowling',
          'George R.R. Martin'
        ],
        correctIndex: 2
      },
      {
        question: 'What band was Freddie Mercury the lead singer of?',
        answers: [
          'The Beatles',
          'Led Zeppelin',
          'Queen',
          'Pink Floyd'
        ],
        correctIndex: 2
      }
    ]
  }
};

/**
 * Get random enemy for a specific zone (excludes bosses from random encounters)
 */
export function getRandomEnemy(zone: 'finance' | 'hospitality' | 'research' | 'lobby'): EnemyData {
  const zoneEnemies = Object.values(ENEMIES).filter(
    enemy => enemy.zone === zone && !enemy.isBoss
  );
  
  // If no regular enemies in zone, return a boss (for lobby with only Anders)
  if (zoneEnemies.length === 0) {
    const bosses = Object.values(ENEMIES).filter(
      enemy => enemy.zone === zone && enemy.isBoss
    );
    if (bosses.length > 0) {
      return bosses[Math.floor(Math.random() * bosses.length)];
    }
  }
  
  return zoneEnemies[Math.floor(Math.random() * zoneEnemies.length)];
}

/**
 * Get boss enemy for a specific zone
 */
export function getBossEnemy(zone: 'finance' | 'hospitality' | 'research' | 'lobby'): EnemyData {
  const boss = Object.values(ENEMIES).find(
    enemy => enemy.zone === zone && enemy.isBoss
  );
  
  if (!boss) {
    throw new Error(`No boss found for zone: ${zone}`);
  }
  
  return boss;
}

/**
 * Get all boss IDs for tracking defeated bosses
 */
export function getAllBossIds(): string[] {
  return Object.values(ENEMIES)
    .filter(enemy => enemy.isBoss)
    .map(enemy => enemy.id);
}
