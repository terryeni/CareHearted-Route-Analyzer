# Route Planning & Workforce Management Tool

A comprehensive web-based route planning and workforce recommendation system built with Next.js, TypeScript, Supabase, and Google Maps API.

## 🚀 Features

### Core Functionality
- **Job Management**: Create, edit, and track delivery/installation jobs
- **Route Optimization**: Automatic route optimization using Google Maps API
- **Team Recommendations**: AI-powered workforce sizing and team composition suggestions
- **Interactive Maps**: Visual route planning with Google Maps integration
- **Export Capabilities**: CSV and PDF export for schedules and route manifests

### Advanced Features
- **AI Analysis**: OpenAI integration for job risk assessment and complexity analysis
- **Real-time Updates**: Live job status tracking and notifications
- **Multi-format Export**: Generate detailed reports and team briefings
- **Postcode Validation**: UK postcode validation and normalization
- **Vehicle Planning**: Support for different vehicle types and requirements

### Authentication & Security
- **Supabase Authentication**: Secure login/signup with email verification
- **Role-based Access**: Admin, manager, and installer role support
- **Session Management**: Persistent authentication with automatic refresh

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Maps**: Google Maps API
- **AI**: OpenAI GPT-4
- **Export**: jsPDF, Papa Parse
- **Icons**: Heroicons

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Maps API key with the following APIs enabled:
  - Maps JavaScript API
  - Directions API
  - Distance Matrix API
  - Geocoding API
  - Places API
- OpenAI API key (optional, for AI features)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd route-planner
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# OpenAI API (optional)
OPENAI_API_KEY=your-openai-api-key

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Execute the following SQL schema in your Supabase database:

```sql
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

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installers ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view jobs" ON jobs FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create jobs" ON jobs FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update jobs" ON jobs FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete jobs" ON jobs FOR DELETE USING (auth.role() = 'authenticated');

-- Similar policies for other tables
CREATE POLICY "Authenticated users can view routes" ON routes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create routes" ON routes FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view team assignments" ON team_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create team assignments" ON team_assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

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
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📱 Usage

### Getting Started

1. **Sign Up/Login**: Create an account or sign in with existing credentials
2. **Create a Job**: Navigate to the "Create Job" tab and fill in job details
3. **Add Postcodes**: Enter UK postcodes for delivery/installation stops
4. **Optimize Route**: Click "Optimize Route" to generate the most efficient path
5. **View Map**: Switch to the "Route Map" tab to visualize the optimized route
6. **Export Data**: Use export functions to generate CSV or PDF reports

### Job Types

- **Delivery Only**: Simple package delivery (15 min per stop)
- **Install Stand**: Display stand installation (60 min per stop)
- **Display Backdrop**: Backdrop setup (45 min per stop)
- **Shelving**: Shelving installation (30 min per stop)

### Vehicle Types

- **Small Van**: For light deliveries and small installations
- **LWB (Long Wheel Base)**: For larger items and equipment
- **Tail Lift**: For heavy items requiring lifting assistance

### Team Recommendations

The system automatically suggests team composition based on:
- Job complexity and type
- Number of stops
- Estimated total time
- Vehicle requirements

## 🔧 Configuration

### Google Maps API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the required APIs:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geocoding API
   - Places API
4. Create an API key and restrict it to your domain
5. Add the API key to your `.env.local` file

### Supabase Setup

1. Create a new project at [Supabase](https://supabase.com/)
2. Go to Settings > API to get your URL and keys
3. Execute the database schema provided above
4. Configure authentication providers if needed

### OpenAI Setup (Optional)

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Add it to your `.env.local` file
3. The system will automatically use AI features when available

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Docker

```bash
# Build the image
docker build -t route-planner .

# Run the container
docker run -p 3000:3000 --env-file .env.local route-planner
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [Issues](https://github.com/your-repo/route-planner/issues) page
2. Create a new issue with detailed information
3. Include environment details and error messages

## 🗺️ Roadmap

- [ ] Mobile app for field teams
- [ ] Real-time GPS tracking
- [ ] Advanced reporting dashboard
- [ ] Integration with accounting systems
- [ ] Multi-language support
- [ ] Offline capabilities
