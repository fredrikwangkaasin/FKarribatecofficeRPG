-- GameStates table for Arribatec Office RPG
-- Stores player game state with tenant isolation

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GameStates')
BEGIN
    CREATE TABLE GameStates (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        TenantId NVARCHAR(50) NOT NULL,
        UserId NVARCHAR(100) NOT NULL,
        
        -- Player position
        PositionX INT NOT NULL DEFAULT 400,
        PositionY INT NOT NULL DEFAULT 300,
        CurrentZone NVARCHAR(50) NOT NULL DEFAULT 'lobby',
        
        -- Player stats
        Level INT NOT NULL DEFAULT 1,
        Exp INT NOT NULL DEFAULT 0,
        Gold INT NOT NULL DEFAULT 0,
        CurrentHP INT NOT NULL DEFAULT 100,
        MaxHP INT NOT NULL DEFAULT 100,
        Logic INT NOT NULL DEFAULT 10,
        Resilience INT NOT NULL DEFAULT 8,
        Charisma INT NOT NULL DEFAULT 7,
        
        -- Progress tracking
        DefeatedBosses NVARCHAR(MAX) NOT NULL DEFAULT '[]', -- JSON array of boss IDs
        
        -- Metadata
        PlayTime INT DEFAULT 0, -- Total play time in seconds
        LastSaved DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT UK_GameStates_TenantUser UNIQUE (TenantId, UserId)
    );
    
    CREATE INDEX IX_GameStates_TenantId ON GameStates(TenantId);
    CREATE INDEX IX_GameStates_UserId ON GameStates(UserId);
    
    PRINT 'GameStates table created successfully';
END
ELSE
BEGIN
    PRINT 'GameStates table already exists';
END
GO

-- QuizQuestions table for pre-generated battle questions
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'QuizQuestions')
BEGIN
    CREATE TABLE QuizQuestions (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        Zone NVARCHAR(50) NOT NULL,           -- lobby, finance, hospitality, research
        Difficulty INT NOT NULL DEFAULT 1,     -- 1-5
        EnemyType NVARCHAR(50) NULL,          -- Optional: specific enemy type
        
        Question NVARCHAR(500) NOT NULL,
        Answer1 NVARCHAR(200) NOT NULL,
        Answer2 NVARCHAR(200) NOT NULL,
        Answer3 NVARCHAR(200) NOT NULL,
        Answer4 NVARCHAR(200) NOT NULL,
        CorrectIndex INT NOT NULL,            -- 0-3
        
        IsActive BIT NOT NULL DEFAULT 1,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT CK_CorrectIndex CHECK (CorrectIndex >= 0 AND CorrectIndex <= 3)
    );
    
    CREATE INDEX IX_QuizQuestions_Zone ON QuizQuestions(Zone);
    CREATE INDEX IX_QuizQuestions_Difficulty ON QuizQuestions(Difficulty);
    CREATE INDEX IX_QuizQuestions_Active ON QuizQuestions(IsActive) WHERE IsActive = 1;
    
    PRINT 'QuizQuestions table created successfully';
END
GO

-- UserAnsweredQuestions - tracks which questions each user answered correctly
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserAnsweredQuestions')
BEGIN
    CREATE TABLE UserAnsweredQuestions (
        Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        TenantId NVARCHAR(50) NOT NULL,
        UserId NVARCHAR(100) NOT NULL,
        QuestionId UNIQUEIDENTIFIER NOT NULL,
        AnsweredCorrectly BIT NOT NULL,
        AnsweredAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        
        CONSTRAINT FK_UserAnswered_Question FOREIGN KEY (QuestionId) 
            REFERENCES QuizQuestions(Id) ON DELETE CASCADE,
        CONSTRAINT UK_UserAnswered_Once UNIQUE (TenantId, UserId, QuestionId)
    );
    
    CREATE INDEX IX_UserAnswered_User ON UserAnsweredQuestions(TenantId, UserId);
    CREATE INDEX IX_UserAnswered_Question ON UserAnsweredQuestions(QuestionId);
    
    PRINT 'UserAnsweredQuestions table created successfully';
END
GO
