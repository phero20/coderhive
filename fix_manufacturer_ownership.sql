-- Add owner_user_id column to manufacturers table if it doesn't exist
ALTER TABLE manufacturers 
ADD COLUMN IF NOT EXISTS owner_user_id bigint REFERENCES users(id);

-- Update existing manufacturers to associate them with users
-- This assigns each manufacturer to a user based on email matching
UPDATE manufacturers 
SET owner_user_id = users.id
FROM users 
WHERE manufacturers.email = users.email 
AND manufacturers.owner_user_id IS NULL;

-- For manufacturers without matching emails, assign to manufacturer role users
WITH manufacturer_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn 
  FROM users 
  WHERE role = 'manufacturer'
),
unassigned_manufacturers AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as rn 
  FROM manufacturers 
  WHERE owner_user_id IS NULL
)
UPDATE manufacturers 
SET owner_user_id = manufacturer_users.id
FROM manufacturer_users, unassigned_manufacturers
WHERE manufacturers.id = unassigned_manufacturers.id 
AND manufacturer_users.rn = unassigned_manufacturers.rn;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_manufacturers_owner_user_id 
ON manufacturers(owner_user_id);

-- Verify the updates
SELECT 
  m.name as manufacturer_name,
  u.name as owner_name,
  u.email as owner_email,
  u.role as owner_role
FROM manufacturers m
LEFT JOIN users u ON m.owner_user_id = u.id
ORDER BY m.id;
