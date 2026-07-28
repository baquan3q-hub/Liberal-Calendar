-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. BẢNG LOẠI LỊCH (event_categories)
CREATE TABLE IF NOT EXISTS public.event_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  icon TEXT DEFAULT 'calendar',
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BẢNG SỰ KIỆN CHÍNH (events)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.event_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  all_day BOOLEAN DEFAULT false,
  location TEXT,
  meeting_url TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  recurrence_rule TEXT,
  timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
  
  -- Định danh cho Thành viên không đăng nhập
  created_by_name TEXT NOT NULL DEFAULT 'Thành viên',
  updated_by_name TEXT,
  deleted_by_name TEXT,
  
  -- Định danh cho Owner nếu đã đăng nhập (Nullable)
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 3. BẢNG LỊCH SỬ THAY ĐỔI (activity_logs)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL DEFAULT 'Thành viên',
  action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'restore')),
  old_data JSONB,
  new_data JSONB,
  changed_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRIGGER TỰ ĐỘNG GHI ACTIVITY LOGS
CREATE OR REPLACE FUNCTION public.log_event_activity()
RETURNS TRIGGER AS $$
DECLARE
  current_actor TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    current_actor := NEW.created_by_name;
    INSERT INTO public.activity_logs (event_id, actor_name, action, new_data)
    VALUES (NEW.id, current_actor, 'create', row_to_json(NEW)::jsonb);
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Nếu là thao tác Soft Delete
    IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
      current_actor := COALESCE(NEW.deleted_by_name, 'Thành viên');
      INSERT INTO public.activity_logs (event_id, actor_name, action, old_data, new_data)
      VALUES (NEW.id, current_actor, 'delete', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    
    -- Nếu là thao tác Restore
    ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
      current_actor := COALESCE(NEW.updated_by_name, 'Người sở hữu');
      INSERT INTO public.activity_logs (event_id, actor_name, action, old_data, new_data)
      VALUES (NEW.id, current_actor, 'restore', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    
    -- Nếu là Chỉnh sửa thông thường
    ELSE
      current_actor := COALESCE(NEW.updated_by_name, 'Thành viên');
      INSERT INTO public.activity_logs (event_id, actor_name, action, old_data, new_data)
      VALUES (NEW.id, current_actor, 'update', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_events_activity ON public.events;
CREATE TRIGGER tr_events_activity
AFTER INSERT OR UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.log_event_activity();

-- 5. SEED DATA CATEGORIES MẶC ĐỊNH
INSERT INTO public.event_categories (name, color, icon, sort_order) VALUES
  ('Họp', '#3b82f6', 'users', 1),
  ('Công việc', '#22c55e', 'briefcase', 2),
  ('Deadline', '#ef4444', 'clock', 3),
  ('Sự kiện', '#a855f7', 'calendar', 4),
  ('Công tác', '#f59e0b', 'navigation', 5),
  ('Nghỉ phép', '#06b6d4', 'palmtree', 6),
  ('Khác', '#6b7280', 'more-horizontal', 7)
ON CONFLICT DO NOTHING;

-- 6. SEED DỮ LIỆU SỰ KIỆN MẪU BAN ĐẦU
INSERT INTO public.events (
  category_id, 
  title, 
  description, 
  start_at, 
  end_at, 
  all_day, 
  location, 
  meeting_url, 
  priority, 
  created_by_name
) VALUES 
(
  (SELECT id FROM public.event_categories WHERE name = 'Họp' LIMIT 1),
  'Họp giao ban toàn công ty đầu tuần',
  'Rà soát tiến độ dự án tuần cũ và phân công kế hoạch công việc tuần mới.',
  NOW() + INTERVAL '1 hour',
  NOW() + INTERVAL '2.5 hours',
  false,
  'Phòng họp Tầng 3 & Online',
  'https://meet.google.com/abc-defg-hij',
  'important',
  'Nguyễn Văn Admin'
),
(
  (SELECT id FROM public.event_categories WHERE name = 'Deadline' LIMIT 1),
  'Deadline nộp Báo cáo Doanh thu',
  'Yêu cầu các trưởng bộ phận chốt số liệu và gửi file trước 17:00.',
  NOW() + INTERVAL '5 hours',
  NOW() + INTERVAL '6 hours',
  false,
  'Hệ thống ERP',
  NULL,
  'urgent',
  'Trần Thị B'
),
(
  (SELECT id FROM public.event_categories WHERE name = 'Sự kiện' LIMIT 1),
  'Teambuilding & Tiệc mừng Sinh nhật thành viên',
  'Chương trình giao lưu nội bộ công ty tại sảnh chính.',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day 3 hours',
  false,
  'Sảnh sự kiện Tầng 1',
  NULL,
  'normal',
  'Lê Văn C'
)
ON CONFLICT DO NOTHING;

-- 7. CẤP QUYỀN TRUY CẬP (GRANT PERMISSIONS TO ANON & AUTHENTICATED)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 8. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Categories Public Select" ON public.event_categories;
DROP POLICY IF EXISTS "Categories Admin All" ON public.event_categories;
DROP POLICY IF EXISTS "Events Public Select" ON public.events;
DROP POLICY IF EXISTS "Events Public Insert" ON public.events;
DROP POLICY IF EXISTS "Events Public Update" ON public.events;
DROP POLICY IF EXISTS "Events Owner All" ON public.events;
DROP POLICY IF EXISTS "Activity Public Insert" ON public.activity_logs;
DROP POLICY IF EXISTS "Activity Owner Select" ON public.activity_logs;

-- Category Policies
CREATE POLICY "Categories Public Select" ON public.event_categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Categories Admin All" ON public.event_categories FOR ALL TO authenticated USING (true);

-- Events Policies (Thành viên chưa đăng nhập anon được xem, thêm, sửa sự kiện)
CREATE POLICY "Events Public Select" ON public.events FOR SELECT TO anon, authenticated USING (deleted_at IS NULL OR auth.role() = 'authenticated');
CREATE POLICY "Events Public Insert" ON public.events FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Events Public Update" ON public.events FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Events Owner All" ON public.events FOR ALL TO authenticated USING (true);

-- Activity Logs Policies
CREATE POLICY "Activity Public Insert" ON public.activity_logs FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Activity Owner Select" ON public.activity_logs FOR SELECT TO authenticated USING (true);
