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
  zone: 'finance' | 'hospitality' | 'research';
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
    questions: DEFAULT_QUESTIONS
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
    questions: DEFAULT_QUESTIONS
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
    questions: DEFAULT_QUESTIONS
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
    questions: DEFAULT_QUESTIONS
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
    questions: DEFAULT_QUESTIONS
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
    questions: DEFAULT_QUESTIONS
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
    questions: DEFAULT_QUESTIONS
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
    questions: DEFAULT_QUESTIONS
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
    questions: DEFAULT_QUESTIONS
  }
};

/**
 * Get random enemy for a specific zone (excludes bosses from random encounters)
 */
export function getRandomEnemy(zone: 'finance' | 'hospitality' | 'research'): EnemyData {
  const zoneEnemies = Object.values(ENEMIES).filter(
    enemy => enemy.zone === zone && !enemy.isBoss
  );
  
  return zoneEnemies[Math.floor(Math.random() * zoneEnemies.length)];
}

/**
 * Get boss enemy for a specific zone
 */
export function getBossEnemy(zone: 'finance' | 'hospitality' | 'research'): EnemyData {
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
