/**
 * Enemy definitions for Arribatec Office RPG
 * 
 * Three zones with different client types:
 * - Finance: Auditor, Budget Manager, Tax Consultant, CFO (Boss)
 * - Hospitality: Angry Customer, Tour Operator, Event Planner, Hotel Manager (Boss)
 * - Research: Data Analyst, Research Director, Grant Writer, Lead Scientist (Boss)
 */

export interface EnemyData {
  id: string;
  displayName: string;
  zone: 'finance' | 'hospitality' | 'research';
  isBoss: boolean;
  
  // Stats
  maxHP: number;
  logic: number;      // Attack stat
  resilience: number; // Defense stat
  charisma: number;   // Special stat
  
  // Rewards
  expReward: number;
  goldReward: number;
  
  // Asset reference
  spriteKey: string;
  
  // Battle dialogue
  introText: string;
  defeatText: string;
}

export const ENEMIES: Record<string, EnemyData> = {
  // ===== FINANCE ZONE =====
  'auditor': {
    id: 'auditor',
    displayName: 'Auditor',
    zone: 'finance',
    isBoss: false,
    maxHP: 60,
    logic: 8,
    resilience: 7,
    charisma: 5,
    expReward: 15,
    goldReward: 20,
    spriteKey: 'enemy-auditor',
    introText: 'An Auditor questions your expense report!',
    defeatText: 'The Auditor accepts your documentation.'
  },
  
  'budget-manager': {
    id: 'budget-manager',
    displayName: 'Budget Manager',
    zone: 'finance',
    isBoss: false,
    maxHP: 70,
    logic: 9,
    resilience: 8,
    charisma: 6,
    expReward: 20,
    goldReward: 25,
    spriteKey: 'enemy-budget-manager',
    introText: 'A Budget Manager demands cost justification!',
    defeatText: 'The Budget Manager approves your proposal.'
  },
  
  'tax-consultant': {
    id: 'tax-consultant',
    displayName: 'Tax Consultant',
    zone: 'finance',
    isBoss: false,
    maxHP: 75,
    logic: 10,
    resilience: 9,
    charisma: 7,
    expReward: 25,
    goldReward: 30,
    spriteKey: 'enemy-tax-consultant',
    introText: 'A Tax Consultant challenges your compliance!',
    defeatText: 'The Tax Consultant withdraws their objections.'
  },
  
  'cfo-boss': {
    id: 'cfo-boss',
    displayName: 'CFO',
    zone: 'finance',
    isBoss: true,
    maxHP: 180,
    logic: 15,
    resilience: 14,
    charisma: 12,
    expReward: 100,
    goldReward: 200,
    spriteKey: 'enemy-cfo',
    introText: 'The CFO demands to see your business case!',
    defeatText: 'The CFO is convinced by your financial arguments!'
  },
  
  // ===== HOSPITALITY ZONE =====
  'angry-customer': {
    id: 'angry-customer',
    displayName: 'Angry Customer',
    zone: 'hospitality',
    isBoss: false,
    maxHP: 55,
    logic: 7,
    resilience: 6,
    charisma: 9,
    expReward: 15,
    goldReward: 20,
    spriteKey: 'enemy-angry-customer',
    introText: 'An Angry Customer has complaints!',
    defeatText: 'The Customer is satisfied with your response.'
  },
  
  'tour-operator': {
    id: 'tour-operator',
    displayName: 'Tour Operator',
    zone: 'hospitality',
    isBoss: false,
    maxHP: 70,
    logic: 8,
    resilience: 7,
    charisma: 10,
    expReward: 20,
    goldReward: 25,
    spriteKey: 'enemy-tour-operator',
    introText: 'A Tour Operator has scheduling conflicts!',
    defeatText: 'The Tour Operator accepts your itinerary.'
  },
  
  'event-planner': {
    id: 'event-planner',
    displayName: 'Event Planner',
    zone: 'hospitality',
    isBoss: false,
    maxHP: 65,
    logic: 9,
    resilience: 8,
    charisma: 11,
    expReward: 25,
    goldReward: 30,
    spriteKey: 'enemy-event-planner',
    introText: 'An Event Planner demands impossible arrangements!',
    defeatText: 'The Event Planner agrees to your plan.'
  },
  
  'hotel-manager-boss': {
    id: 'hotel-manager-boss',
    displayName: 'Hotel Manager',
    zone: 'hospitality',
    isBoss: true,
    maxHP: 170,
    logic: 14,
    resilience: 13,
    charisma: 16,
    expReward: 100,
    goldReward: 200,
    spriteKey: 'enemy-hotel-manager',
    introText: 'The Hotel Manager challenges your hospitality standards!',
    defeatText: 'The Hotel Manager is impressed by your service excellence!'
  },
  
  // ===== RESEARCH ZONE =====
  'data-analyst': {
    id: 'data-analyst',
    displayName: 'Data Analyst',
    zone: 'research',
    isBoss: false,
    maxHP: 65,
    logic: 10,
    resilience: 7,
    charisma: 6,
    expReward: 15,
    goldReward: 20,
    spriteKey: 'enemy-data-analyst',
    introText: 'A Data Analyst questions your methodology!',
    defeatText: 'The Data Analyst accepts your analysis.'
  },
  
  'research-director': {
    id: 'research-director',
    displayName: 'Research Director',
    zone: 'research',
    isBoss: false,
    maxHP: 75,
    logic: 11,
    resilience: 8,
    charisma: 7,
    expReward: 20,
    goldReward: 25,
    spriteKey: 'enemy-research-director',
    introText: 'A Research Director challenges your hypothesis!',
    defeatText: 'The Research Director approves your research.'
  },
  
  'grant-writer': {
    id: 'grant-writer',
    displayName: 'Grant Writer',
    zone: 'research',
    isBoss: false,
    maxHP: 70,
    logic: 12,
    resilience: 9,
    charisma: 8,
    expReward: 25,
    goldReward: 30,
    spriteKey: 'enemy-grant-writer',
    introText: 'A Grant Writer demands more evidence!',
    defeatText: 'The Grant Writer accepts your proposal.'
  },
  
  'lead-scientist-boss': {
    id: 'lead-scientist-boss',
    displayName: 'Lead Scientist',
    zone: 'research',
    isBoss: true,
    maxHP: 200,
    logic: 16,
    resilience: 15,
    charisma: 10,
    expReward: 100,
    goldReward: 200,
    spriteKey: 'enemy-lead-scientist',
    introText: 'The Lead Scientist demands peer review!',
    defeatText: 'The Lead Scientist acknowledges your scientific rigor!'
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
