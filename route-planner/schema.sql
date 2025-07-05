-- Route Planner Database Schema
-- Execute this SQL in your Supabase database

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'manager', 'installer')) DEFAULT 'installer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id TEXT UNIQUE NOT NULL,
  client_name TEXT NOT NULL,
  job_type TEXT CHECK (job_type IN ('delivery_only', 'install_stand', 'display_backdrop', 'shelving')) NOT NULL,
  postcodes TEXT[] NOT NULL,
  notes TEXT,
  preferred_date_start DATE,
  preferred_date_end DATE,
  vehicle_size TEXT CHECK (vehicle_size IN ('small_van', 'lwb', 'tail_lift')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
  created_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create routes table
CREATE TABLE routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs ON DELETE CASCADE NOT NULL,
  optimized_order TEXT[] NOT NULL,
  total_distance INTEGER NOT NULL,
  total_time INTEGER NOT NULL,
  route_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create team_assignments table
CREATE TABLE team_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs ON DELETE CASCADE NOT NULL,
  assigned_to UUID[] DEFAULT '{}',
  team_size INTEGER NOT NULL,
  estimated_days INTEGER NOT NULL,
  assignment_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create installers table
CREATE TABLE installers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create job_history table
CREATE TABLE job_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  details JSONB NOT NULL,
  performed_by UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_by ON jobs(created_by);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);
CREATE INDEX idx_routes_job_id ON routes(job_id);
CREATE INDEX idx_team_assignments_job_id ON team_assignments(job_id);
CREATE INDEX idx_job_history_job_id ON job_history(job_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for jobs
CREATE POLICY "Authenticated users can view jobs" ON jobs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create jobs" ON jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update jobs" ON jobs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete jobs" ON jobs FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for routes
CREATE POLICY "Authenticated users can view routes" ON routes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create routes" ON routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update routes" ON routes FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete routes" ON routes FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for team_assignments
CREATE POLICY "Authenticated users can view team assignments" ON team_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create team assignments" ON team_assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update team assignments" ON team_assignments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete team assignments" ON team_assignments FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for installers
CREATE POLICY "Authenticated users can view installers" ON installers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create installers" ON installers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update installers" ON installers FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for job_history
CREATE POLICY "Authenticated users can view job history" ON job_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create job history" ON job_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_routes_updated_at BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_team_assignments_updated_at BEFORE UPDATE ON team_assignments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_installers_updated_at BEFORE UPDATE ON installers
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();