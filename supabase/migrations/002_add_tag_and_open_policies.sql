-- ========================================================
-- MIGRATION 002: BỔ SUNG CỘT TAG VÀ MỞ RỘNG QUYỀN RLS DÀNH CHO SERVER CHUNG
-- ========================================================

-- 1. Bổ sung cột tag vào bảng events (nếu chưa có)
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'Họp hành';

-- 2. Bỏ ràng buộc RLS cũ gây hạn chế thao tác xóa/sửa trên Supabase
DROP POLICY IF EXISTS "Events Public Select" ON public.events;
DROP POLICY IF EXISTS "Events Public Insert" ON public.events;
DROP POLICY IF EXISTS "Events Public Update" ON public.events;
DROP POLICY IF EXISTS "Events Owner All" ON public.events;

-- 3. Tạo chính sách RLS mở hoàn toàn (Tất cả mọi người đều có thể Xem, Thêm, Sửa, Xóa)
CREATE POLICY "Events Open Select" 
ON public.events FOR SELECT 
TO anon, authenticated 
USING (true);

CREATE POLICY "Events Open Insert" 
ON public.events FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Events Open Update" 
ON public.events FOR UPDATE 
TO anon, authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Events Open Delete" 
ON public.events FOR DELETE 
TO anon, authenticated 
USING (true);

-- 4. Cấp quyền truy cập công khai
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
