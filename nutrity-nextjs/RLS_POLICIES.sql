-- Política de Seguridad (Row Level Security) para DailyMenu

-- 1. Habilitar RLS en la tabla DailyMenu
ALTER TABLE "DailyMenu" ENABLE ROW LEVEL SECURITY;

-- 2. Política SELECT: Los usuarios solo pueden ver sus propios menús (o los admins pueden ver todos, o los coaches pueden ver los de su organización)
DROP POLICY IF EXISTS "Users can view their own daily menus" ON "DailyMenu";
CREATE POLICY "Users can view their own daily menus"
ON "DailyMenu"
FOR SELECT
USING (
  "userId" = auth.uid()::text OR
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'ADMIN' OR
  (
    (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'COACH' AND 
    "organizationId" = (SELECT "organizationId" FROM "User" WHERE id = auth.uid()::text)
  )
);

-- 3. Política INSERT: Los usuarios solo pueden insertar sus propios menús
DROP POLICY IF EXISTS "Users can insert their own menus" ON "DailyMenu";
CREATE POLICY "Users can insert their own menus"
ON "DailyMenu"
FOR INSERT
WITH CHECK (
  "userId" = auth.uid()::text OR
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'ADMIN' OR
  (
    (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'COACH' AND 
    "organizationId" = (SELECT "organizationId" FROM "User" WHERE id = auth.uid()::text)
  )
);

-- 4. Política UPDATE: Solo el usuario, un ADMIN o un COACH de la misma organización
DROP POLICY IF EXISTS "Users can update their own menus" ON "DailyMenu";
CREATE POLICY "Users can update their own menus"
ON "DailyMenu"
FOR UPDATE
USING (
  "userId" = auth.uid()::text OR
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'ADMIN' OR
  (
    (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'COACH' AND 
    "organizationId" = (SELECT "organizationId" FROM "User" WHERE id = auth.uid()::text)
  )
);

-- 5. Política DELETE: Solo ADMINs, el propio usuario o COACH de la organización
DROP POLICY IF EXISTS "Users can delete their own menus" ON "DailyMenu";
CREATE POLICY "Users can delete their own menus"
ON "DailyMenu"
FOR DELETE
USING (
  "userId" = auth.uid()::text OR
  (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'ADMIN' OR
  (
    (SELECT role FROM "User" WHERE id = auth.uid()::text) = 'COACH' AND 
    "organizationId" = (SELECT "organizationId" FROM "User" WHERE id = auth.uid()::text)
  )
);
