-- Política de Seguridad (Row Level Security) para DailyMenu

-- 1. Habilitar RLS en la tabla DailyMenu
ALTER TABLE "DailyMenu" ENABLE ROW LEVEL SECURITY;

-- 2. Política SELECT: Los usuarios solo pueden ver sus propios menús (o los admins pueden ver todos)
CREATE POLICY "Users can view their own daily menus"
ON "DailyMenu"
FOR SELECT
USING (
  "userId" = auth.uid()::text OR
  (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('ADMIN', 'COACH')
);

-- 3. Política INSERT: Los usuarios solo pueden insertar sus propios menús
CREATE POLICY "Users can insert their own menus"
ON "DailyMenu"
FOR INSERT
WITH CHECK (
  "userId" = auth.uid()::text OR
  (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('ADMIN', 'COACH')
);

-- 4. Política UPDATE: Solo el usuario o un ADMIN puede actualizar el menú
CREATE POLICY "Users can update their own menus"
ON "DailyMenu"
FOR UPDATE
USING (
  "userId" = auth.uid()::text OR
  (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('ADMIN', 'COACH')
);

-- 5. Política DELETE: Solo ADMINs o el propio usuario
CREATE POLICY "Users can delete their own menus"
ON "DailyMenu"
FOR DELETE
USING (
  "userId" = auth.uid()::text OR
  (SELECT role FROM "User" WHERE id = auth.uid()::text) IN ('ADMIN', 'COACH')
);
