-- Seed quiz questions for Arribatec Office RPG
-- Run this to populate the QuizQuestions table with initial questions

-- Lobby zone questions (difficulty 1-3)
INSERT INTO QuizQuestions (Id, Zone, Difficulty, Question, Answer1, Answer2, Answer3, Answer4, CorrectIndex, IsActive, CreatedAt)
VALUES
-- Difficulty 1 (Easy)
(NEWID(), 'lobby', 1, 'What is appropriate office attire?', 'Business casual', 'Pajamas', 'Swimsuit', 'Halloween costume', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 1, 'What should you do when the fire alarm sounds?', 'Evacuate calmly', 'Ignore it and keep working', 'Make coffee first', 'Take a nap', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 1, 'What is a good way to start the workday?', 'Check emails and plan tasks', 'Go back to sleep', 'Leave for lunch early', 'Skip all meetings', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 1, 'What is the purpose of a coffee break?', 'To refresh and recharge', 'To avoid work entirely', 'To gossip about the boss', 'To steal supplies', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 1, 'How should you greet colleagues in the morning?', 'With a friendly hello', 'By ignoring them', 'With a loud horn', 'By throwing paper', 0, 1, GETUTCDATE()),
-- Difficulty 2 (Medium)
(NEWID(), 'lobby', 2, 'What does RSVP stand for in meeting invitations?', 'Respond if you please (French)', 'Really Should Visit Please', 'Random Schedule Very Promptly', 'Respond Soon Via Phone', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 2, 'What is the best practice for email subject lines?', 'Clear and specific', 'Empty or vague', 'ALL CAPS ALWAYS', 'Include your life story', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 2, 'When should you reply all to an email?', 'When everyone needs the information', 'Always, for everything', 'Never', 'Only on Mondays', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 2, 'What is hot-desking?', 'Not having an assigned desk', 'Working in a sauna', 'A spicy lunch spot', 'Setting your desk on fire', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 2, 'What is the elevator pitch?', 'A brief, persuasive speech', 'Fixing elevators', 'A baseball term', 'Selling elevators', 0, 1, GETUTCDATE()),
-- Difficulty 3 (Hard)
(NEWID(), 'lobby', 3, 'What does KPI stand for?', 'Key Performance Indicator', 'Kitchen Party Invitation', 'Keep Paying Interest', 'Knowledge Per Individual', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 3, 'What is synergy in business terms?', 'Combined effect greater than parts', 'A type of energy drink', 'Synchronized swimming', 'A new font', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 3, 'What does "circle back" mean in office speak?', 'Return to discuss later', 'Run in circles', 'Draw circles on paper', 'A dance move', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 3, 'What is a stakeholder?', 'Someone with interest in a project', 'A vampire hunter', 'A steak restaurant owner', 'A fence builder', 0, 1, GETUTCDATE()),
(NEWID(), 'lobby', 3, 'What does "pivot" mean in business?', 'Change strategy or direction', 'A basketball move', 'A door hinge', 'A famous actor''s name', 0, 1, GETUTCDATE());
GO

-- Finance zone questions
INSERT INTO QuizQuestions (Id, Zone, Difficulty, Question, Answer1, Answer2, Answer3, Answer4, CorrectIndex, IsActive, CreatedAt)
VALUES
-- Difficulty 1
(NEWID(), 'finance', 1, 'What does ROI stand for?', 'Return on Investment', 'Run on Ice', 'Report on Items', 'Rest on Island', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 1, 'What is a budget?', 'A financial plan for spending', 'A type of bird', 'A small room', 'A French pastry', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 1, 'What is revenue?', 'Income from business activities', 'A river in France', 'A type of revenge', 'A musical term', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 1, 'What is an invoice?', 'A bill for goods or services', 'A type of voice', 'A car part', 'An inside vote', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 1, 'What does P&L stand for?', 'Profit and Loss', 'Paper and Laptop', 'Pizza and Lunch', 'Pencils and Ledgers', 0, 1, GETUTCDATE()),
-- Difficulty 2
(NEWID(), 'finance', 2, 'What is depreciation?', 'Decrease in asset value over time', 'Appreciation in reverse', 'A type of depression', 'Speeding up', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 2, 'What is a balance sheet?', 'A financial statement showing assets and liabilities', 'A yoga pose', 'A scale for weighing', 'A bed sheet from Balance Inc.', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 2, 'What is an audit?', 'Examination of financial records', 'A hearing test', 'A type of audio', 'An auto edit', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 2, 'What is cash flow?', 'Movement of money in and out', 'A waterfall of coins', 'A cash register dance', 'A river of bills', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 2, 'What is a fiscal year?', 'A 12-month accounting period', 'A year dedicated to fish', 'A physical year', 'A fast year', 0, 1, GETUTCDATE()),
-- Difficulty 3
(NEWID(), 'finance', 3, 'What is EBITDA?', 'Earnings Before Interest, Taxes, Depreciation, Amortization', 'Every Business Is Totally Different Anyway', 'Electronic Business Information Technology Data Analysis', 'Enthusiastic Business Ideas That Drive Action', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 3, 'What is a liability?', 'Something a company owes', 'The ability to lie', 'A type of cable', 'A library ability', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 3, 'What is accounts receivable?', 'Money owed to the company', 'Accounts that receive things', 'A type of radio', 'A receiving desk', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 3, 'What is a dividend?', 'A payment to shareholders', 'A divided end', 'A math operation', 'A diving indent', 0, 1, GETUTCDATE()),
(NEWID(), 'finance', 3, 'What is working capital?', 'Current assets minus current liabilities', 'Capital that works hard', 'A city for workers', 'Money for gym membership', 0, 1, GETUTCDATE());
GO

-- Hospitality/HR zone questions
INSERT INTO QuizQuestions (Id, Zone, Difficulty, Question, Answer1, Answer2, Answer3, Answer4, CorrectIndex, IsActive, CreatedAt)
VALUES
-- Difficulty 1
(NEWID(), 'hospitality', 1, 'What does HR stand for?', 'Human Resources', 'Happy Robots', 'Hotel Reservations', 'High Rollers', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 1, 'What is PTO?', 'Paid Time Off', 'Please Turn Over', 'Pizza To Order', 'Print This Out', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 1, 'What is onboarding?', 'Introducing new employees to the company', 'Getting on a boat', 'Surfing lessons', 'Skateboard tricks', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 1, 'What is a performance review?', 'An evaluation of work performance', 'A theater critique', 'A car inspection', 'A dance competition', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 1, 'What is team building?', 'Activities to improve team collaboration', 'Construction work', 'Building a sports team', 'Stacking chairs', 0, 1, GETUTCDATE()),
-- Difficulty 2
(NEWID(), 'hospitality', 2, 'What is a 401(k)?', 'A retirement savings plan', 'An office room number', 'A running pace', 'A type of form', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 2, 'What is workplace diversity?', 'Variety of different backgrounds and perspectives', 'Having many desks', 'Different office plants', 'Multiple coffee types', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 2, 'What is an employee handbook?', 'A guide to company policies', 'A novel about workers', 'A hand exercise book', 'A phone book for staff', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 2, 'What is a non-compete clause?', 'An agreement not to work for competitors', 'A section without competition', 'A non-racing clause', 'A peace treaty', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 2, 'What is harassment in the workplace?', 'Unwanted behavior that makes someone uncomfortable', 'Asking questions', 'Having meetings', 'Eating at your desk', 0, 1, GETUTCDATE()),
-- Difficulty 3
(NEWID(), 'hospitality', 3, 'What is FMLA?', 'Family and Medical Leave Act', 'Friday Monday Leave Agreement', 'Full Moon Lunch Arrangement', 'Free Meal Lunch Access', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 3, 'What is an NDA?', 'Non-Disclosure Agreement', 'New Department Announcement', 'No Drama Allowed', 'Never Do Anything', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 3, 'What is attrition?', 'Gradual reduction in workforce', 'A type of nutrition', 'Adding friction', 'A tribute', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 3, 'What is a probationary period?', 'A trial period for new employees', 'A robot training time', 'A problem zone', 'A probe mission', 0, 1, GETUTCDATE()),
(NEWID(), 'hospitality', 3, 'What is succession planning?', 'Preparing for leadership transitions', 'Planning successions of kings', 'Sequential planning', 'Success planning', 0, 1, GETUTCDATE());
GO

-- Research/IT zone questions
INSERT INTO QuizQuestions (Id, Zone, Difficulty, Question, Answer1, Answer2, Answer3, Answer4, CorrectIndex, IsActive, CreatedAt)
VALUES
-- Difficulty 1
(NEWID(), 'research', 1, 'What does IT stand for?', 'Information Technology', 'Ice Tea', 'Italian Toast', 'In Transit', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 1, 'What is debugging?', 'Finding and fixing code errors', 'Removing insects', 'Bug collection', 'Pest control service', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 1, 'What is a password?', 'A secret word for access', 'A past word', 'A type of noodle', 'A sword made of pasta', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 1, 'What is software?', 'Computer programs and applications', 'Soft clothing', 'A comfortable chair', 'A gentle war', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 1, 'What is a backup?', 'A copy of data for safety', 'Moving backwards', 'A back injury', 'A backup singer', 0, 1, GETUTCDATE()),
-- Difficulty 2
(NEWID(), 'research', 2, 'What does API stand for?', 'Application Programming Interface', 'Apple Pie Index', 'Automated Pizza Installer', 'Advanced Personal Intelligence', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 2, 'What is Git?', 'A version control system', 'A type of guitar', 'Get It Together', 'A present', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 2, 'What is the cloud in computing?', 'Remote servers for storage and processing', 'Weather phenomenon', 'A fluffy thing', 'Cotton candy', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 2, 'What is agile methodology?', 'A flexible development approach', 'A yoga style', 'A running technique', 'A type of monkey', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 2, 'What is a firewall?', 'Security system blocking unauthorized access', 'A wall made of fire', 'A fire safety wall', 'A wallpaper design', 0, 1, GETUTCDATE()),
-- Difficulty 3
(NEWID(), 'research', 3, 'What is machine learning?', 'AI that learns from data', 'Teaching machines to sew', 'Gym for robots', 'Machine education', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 3, 'What is SQL?', 'Structured Query Language', 'Super Quick Language', 'Sequential Question Logic', 'Squirrel', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 3, 'What is DevOps?', 'Development and Operations combined', 'Developer Options', 'Device Operations', 'Developing Optimizations', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 3, 'What is a microservice?', 'A small, independent service component', 'A tiny waiter', 'Small customer service', 'Microscopic service', 0, 1, GETUTCDATE()),
(NEWID(), 'research', 3, 'What is containerization?', 'Packaging apps with dependencies', 'Putting things in containers', 'Shipping industry', 'Container shopping', 0, 1, GETUTCDATE());
GO

-- Print summary
SELECT Zone, COUNT(*) as QuestionCount FROM QuizQuestions GROUP BY Zone ORDER BY Zone;
GO

PRINT 'Seed questions inserted successfully!';
GO
