-- ========== TYPES ==========
CREATE TYPE public.app_role AS ENUM ('admin', 'owner', 'service_center');
CREATE TYPE public.vehicle_type AS ENUM ('bike', 'car', 'truck', 'bus', 'scooter', 'machinery');
CREATE TYPE public.fuel_type AS ENUM ('petrol', 'diesel', 'electric', 'hybrid', 'cng', 'lpg');
CREATE TYPE public.service_type AS ENUM ('oil_change', 'brake_pad', 'wheel_alignment', 'wheel_balancing', 'tire_replacement', 'battery_replacement', 'general_service', 'engine_repair', 'custom');
CREATE TYPE public.job_status AS ENUM ('pending', 'in_progress', 'waiting_parts', 'completed', 'delivered');
CREATE TYPE public.mechanic_status AS ENUM ('available', 'busy', 'off_duty');

-- ========== UPDATED_AT FUNCTION ==========
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ========== PROFILES ==========
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== USER ROLES ==========
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- ========== AUTO-CREATE PROFILE ON SIGNUP ==========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', ''),
    NEW.email
  );
  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'owner')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========== VEHICLES ==========
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  type vehicle_type NOT NULL DEFAULT 'car',
  manufacturer TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  year INTEGER NOT NULL DEFAULT 2024,
  fuel_type fuel_type NOT NULL DEFAULT 'petrol',
  engine_number TEXT DEFAULT '',
  chassis_number TEXT DEFAULT '',
  current_mileage INTEGER NOT NULL DEFAULT 0,
  purchase_date DATE,
  image_url TEXT,
  health_score INTEGER NOT NULL DEFAULT 100,
  next_service_date DATE,
  insurance_expiry DATE,
  puc_expiry DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view own vehicles" ON public.vehicles FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert own vehicles" ON public.vehicles FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own vehicles" ON public.vehicles FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own vehicles" ON public.vehicles FOR DELETE USING (auth.uid() = owner_id);
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== SERVICE RECORDS ==========
CREATE TABLE public.service_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_type service_type NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mileage_at_service INTEGER NOT NULL DEFAULT 0,
  service_center_name TEXT NOT NULL DEFAULT '',
  mechanic_name TEXT DEFAULT '',
  parts_replaced TEXT[] DEFAULT '{}',
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  bill_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners can view own service records" ON public.service_records FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owners can insert own service records" ON public.service_records FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own service records" ON public.service_records FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own service records" ON public.service_records FOR DELETE USING (auth.uid() = owner_id);
CREATE TRIGGER update_service_records_updated_at BEFORE UPDATE ON public.service_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== SERVICE CENTER: MECHANICS ==========
CREATE TABLE public.mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  status mechanic_status NOT NULL DEFAULT 'available',
  active_jobs INTEGER NOT NULL DEFAULT 0,
  completed_jobs INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Centers can view own mechanics" ON public.mechanics FOR SELECT USING (auth.uid() = center_id);
CREATE POLICY "Centers can insert own mechanics" ON public.mechanics FOR INSERT WITH CHECK (auth.uid() = center_id);
CREATE POLICY "Centers can update own mechanics" ON public.mechanics FOR UPDATE USING (auth.uid() = center_id);
CREATE POLICY "Centers can delete own mechanics" ON public.mechanics FOR DELETE USING (auth.uid() = center_id);
CREATE TRIGGER update_mechanics_updated_at BEFORE UPDATE ON public.mechanics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== SERVICE CENTER: CUSTOMERS ==========
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT,
  vehicle_numbers TEXT[] DEFAULT '{}',
  total_visits INTEGER NOT NULL DEFAULT 0,
  total_spend NUMERIC(10,2) NOT NULL DEFAULT 0,
  last_visit DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Centers can view own customers" ON public.customers FOR SELECT USING (auth.uid() = center_id);
CREATE POLICY "Centers can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = center_id);
CREATE POLICY "Centers can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = center_id);
CREATE POLICY "Centers can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = center_id);
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== SERVICE CENTER: JOB CARDS ==========
CREATE TABLE public.job_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  center_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL DEFAULT '',
  vehicle_number TEXT NOT NULL,
  vehicle_model TEXT NOT NULL DEFAULT '',
  mileage INTEGER NOT NULL DEFAULT 0,
  problem_description TEXT NOT NULL DEFAULT '',
  service_tasks TEXT[] DEFAULT '{}',
  parts_required TEXT[] DEFAULT '{}',
  estimated_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  actual_cost NUMERIC(10,2),
  mechanic_id UUID REFERENCES public.mechanics(id),
  mechanic_name TEXT DEFAULT '',
  status job_status NOT NULL DEFAULT 'pending',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.job_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Centers can view own job cards" ON public.job_cards FOR SELECT USING (auth.uid() = center_id);
CREATE POLICY "Centers can insert own job cards" ON public.job_cards FOR INSERT WITH CHECK (auth.uid() = center_id);
CREATE POLICY "Centers can update own job cards" ON public.job_cards FOR UPDATE USING (auth.uid() = center_id);
CREATE POLICY "Centers can delete own job cards" ON public.job_cards FOR DELETE USING (auth.uid() = center_id);
CREATE TRIGGER update_job_cards_updated_at BEFORE UPDATE ON public.job_cards FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== INDEXES ==========
CREATE INDEX idx_vehicles_owner ON public.vehicles(owner_id);
CREATE INDEX idx_service_records_vehicle ON public.service_records(vehicle_id);
CREATE INDEX idx_service_records_owner ON public.service_records(owner_id);
CREATE INDEX idx_job_cards_center ON public.job_cards(center_id);
CREATE INDEX idx_job_cards_status ON public.job_cards(status);
CREATE INDEX idx_mechanics_center ON public.mechanics(center_id);
CREATE INDEX idx_customers_center ON public.customers(center_id);