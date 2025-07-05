# 🚀 Demo Setup Guide

This guide will help you run the Route Planner application locally in demo mode for review purposes.

## Quick Start (Demo Mode)

The application is pre-configured to run in demo mode with sample data, so you can see all features without setting up external APIs.

### Prerequisites

- Node.js 18+ and npm
- Git

### 1. Install Dependencies

```bash
cd route-planner
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Open the Application

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 Demo Features

### Automatic Login
- The demo automatically logs you in as "Demo User"
- No registration required in demo mode

### Sample Data
The demo includes:
- **4 Sample Jobs** with different types and statuses
- **Real UK Postcodes** from London area
- **Mock Route Optimization** that simulates Google Maps API
- **AI Analysis Responses** that demonstrate OpenAI integration

### Available Actions
1. **View Jobs** - See the job list with different statuses
2. **Create New Job** - Add jobs with postcode validation
3. **Optimize Routes** - Click the rocket icon to simulate route optimization
4. **Export Data** - Download CSV reports
5. **View Demo Map** - See the route visualization demo

## 🔍 What You Can Review

### ✅ Core Functionality
- **Job Management**: Create, view, and manage jobs
- **Route Planning**: Simulate route optimization
- **Team Recommendations**: See AI-powered workforce suggestions
- **Export Features**: Download CSV schedules
- **Authentication Flow**: Login/logout (demo mode)

### ✅ UI/UX Features
- **Responsive Design**: Works on desktop and mobile
- **Modern Interface**: Tailwind CSS styling
- **Interactive Elements**: Forms, modals, notifications
- **Professional Look**: Clean, business-ready design

### ✅ Technical Features
- **TypeScript**: Full type safety
- **Component Architecture**: Modular React components
- **API Design**: RESTful endpoints
- **Error Handling**: Graceful error management
- **Performance**: Optimized build and loading

## 📊 Demo Data Overview

### Sample Jobs
1. **ACME Retail Store** - Shelving installation (4 stops)
2. **Fashion Forward Boutique** - Display backdrop (3 stops) 
3. **Quick Mart Express** - Delivery only (6 stops)
4. **Tech Solutions Hub** - Install stand (2 stops)

### Features Demonstrated
- Different job types with varying time estimates
- Postcode validation for UK addresses
- Status workflow (pending → scheduled → in progress → completed)
- Vehicle size planning
- Team size recommendations

## 🔧 Customizing Demo Data

You can modify the demo data in `src/lib/demo-data.ts`:

```typescript
// Add more sample jobs
export const DEMO_JOBS: Job[] = [
  // ... existing jobs
  {
    id: 'custom-job',
    job_id: 'JOB-2024-CUSTOM',
    client_name: 'Your Company',
    // ... other properties
  }
]
```

## 🚀 Production Setup

To use the real application with external APIs:

1. **Set up Supabase**:
   - Create account at [supabase.com](https://supabase.com)
   - Run the SQL schema from `schema.sql`
   - Get your API keys

2. **Get Google Maps API Key**:
   - Enable required APIs in Google Cloud Console
   - Create and configure API key

3. **Get OpenAI API Key** (optional):
   - Create account at [platform.openai.com](https://platform.openai.com)
   - Generate API key

4. **Update Environment**:
   - Set `NEXT_PUBLIC_DEMO_MODE=false`
   - Add real API keys to `.env.local`

## 🐛 Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Use a different port
npm run dev -- -p 3001
```

**Dependencies not installing:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Build errors:**
```bash
# Check for TypeScript errors
npm run build
```

## 📝 Review Checklist

When reviewing the application, check:

- [ ] **Authentication**: Login/logout works smoothly
- [ ] **Job Creation**: Form validation and submission
- [ ] **Job List**: Filtering, sorting, and actions
- [ ] **Route Optimization**: Demo route planning
- [ ] **Map Visualization**: Demo map display
- [ ] **Export Features**: CSV download
- [ ] **Responsive Design**: Mobile and desktop views
- [ ] **Error Handling**: Form validation and API errors
- [ ] **Performance**: Page loading and interactions
- [ ] **Accessibility**: Keyboard navigation and screen readers

## 🎯 Next Steps

After reviewing the demo:

1. **Provide Feedback**: Note any issues or suggestions
2. **Test Edge Cases**: Try invalid inputs, long job lists
3. **Review Code**: Check the component structure and API design
4. **Plan Production**: Decide on deployment and API setup

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Restart the development server
3. Clear browser cache and cookies
4. Check this guide for troubleshooting steps

The demo is designed to showcase all major features without external dependencies. Enjoy exploring the Route Planner! 🚀