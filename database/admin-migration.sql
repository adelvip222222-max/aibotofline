-- Optional manual migration for Admin/Developer features.
-- The API can also add these columns automatically, but this script is useful for explicit deployment.

IF COL_LENGTH('Users', 'Role') IS NULL
  ALTER TABLE Users ADD Role NVARCHAR(20) NULL;

IF COL_LENGTH('Users', 'LockedUntil') IS NULL
  ALTER TABLE Users ADD LockedUntil DATETIME2 NULL;

IF COL_LENGTH('Users', 'LastLogin') IS NULL
  ALTER TABLE Users ADD LastLogin DATETIME2 NULL;

IF COL_LENGTH('Users', 'CreatedAt') IS NULL
  ALTER TABLE Users ADD CreatedAt DATETIME2 NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE() WITH VALUES;

IF COL_LENGTH('Users', 'Email') IS NULL
  ALTER TABLE Users ADD Email NVARCHAR(100) NULL;

IF COL_LENGTH('Users', 'UserGroup') IS NULL
  ALTER TABLE Users ADD UserGroup NVARCHAR(100) NULL;

UPDATE Users SET Role = 'student' WHERE Role IS NULL OR Role = '';

-- Example: make a user admin
-- UPDATE Users SET Role = 'admin' WHERE StudentCode = '12325';
