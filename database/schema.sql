-- Create Users Table
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY(1,1),
    StudentId NVARCHAR(20) UNIQUE NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    PasswordHash NVARCHAR(256) NOT NULL,
    Email NVARCHAR(100),
    Department NVARCHAR(50),
    AcademicYear INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    LastLogin DATETIME2,
    IsActive BIT DEFAULT 1
);

-- Create ChatSessions Table
CREATE TABLE ChatSessions (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
    SessionTitle NVARCHAR(200),
    ModelUsed NVARCHAR(50),
    StartedAt DATETIME2 DEFAULT GETDATE(),
    LastActivityAt DATETIME2,
    IsActive BIT DEFAULT 1
);

-- Create ChatMessages Table
CREATE TABLE ChatMessages (
    Id BIGINT PRIMARY KEY IDENTITY(1,1),
    SessionId INT NOT NULL FOREIGN KEY REFERENCES ChatSessions(Id) ON DELETE CASCADE,
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
    Role NVARCHAR(20) NOT NULL, -- 'user' or 'assistant'
    Content NVARCHAR(MAX) NOT NULL,
    Images NVARCHAR(MAX), -- JSON array of base64 strings
    Timestamp DATETIME2 DEFAULT GETDATE()
);

-- Create StudentAnalytics Table
CREATE TABLE StudentAnalytics (
    Id INT PRIMARY KEY IDENTITY(1,1),
    UserId INT NOT NULL FOREIGN KEY REFERENCES Users(Id) ON DELETE CASCADE,
    TotalQuestions INT DEFAULT 0,
    TotalSessions INT DEFAULT 0,
    AverageSessionLength FLOAT,
    MostAskedTopic NVARCHAR(100),
    LastActiveDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE()
);

-- Create Indexes for better performance
CREATE INDEX idx_Users_StudentId ON Users(StudentId);
CREATE INDEX idx_ChatSessions_UserId ON ChatSessions(UserId);
CREATE INDEX idx_ChatSessions_IsActive ON ChatSessions(IsActive);
CREATE INDEX idx_ChatMessages_SessionId ON ChatMessages(SessionId);
CREATE INDEX idx_ChatMessages_UserId ON ChatMessages(UserId);
CREATE INDEX idx_StudentAnalytics_UserId ON StudentAnalytics(UserId);

-- Insert sample data (optional)
INSERT INTO Users (StudentId, FullName, PasswordHash, Email, Department, AcademicYear, IsActive)
VALUES 
    ('20201001', 'محمد علي', '$2b$10$salt$hashedpassword', 'mohammed@example.com', 'هندسة البرمجيات', 3, 1),
    ('20201002', 'فاطمة محمد', '$2b$10$salt$hashedpassword', 'fatima@example.com', 'علوم الحاسوب', 2, 1);
