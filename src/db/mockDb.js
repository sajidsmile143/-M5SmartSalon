// Initial Seed Data matching exact User Requirements for M5 SmartSalon

export const SUPABASE_SQL_SCHEMA = `-- M5 SmartSalon - Supabase Relational Database Schema

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('Customer', 'Barber', 'Admin');
CREATE TYPE booking_status AS ENUM ('Pending', 'Completed', 'No-Show');

-- 2. Users Table
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'Customer',
  wallet_balance DECIMAL(10, 2) DEFAULT 0.00,
  referral_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Services Table
CREATE TABLE services (
  service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  price INT NOT NULL,
  duration_minutes INT NOT NULL,
  is_add_on BOOLEAN DEFAULT FALSE,
  category TEXT DEFAULT 'Hair'
);

-- 4. Bookings Table
CREATE TABLE bookings (
  booking_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  service_ids UUID[] NOT NULL,
  total_bill INT NOT NULL,
  wallet_discount_used INT DEFAULT 0,
  final_paid INT NOT NULL,
  booking_date_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  status booking_status DEFAULT 'Pending'
);

-- 5. Marketing Logs Table
CREATE TABLE marketing_logs (
  log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  last_visit_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  days_inactive INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
`;

export const INITIAL_USERS = [
  {
    User_ID: "usr-001",
    Name: "Ali Khan",
    Phone_Number: "+92 300 1234567",
    Role: "Customer",
    Wallet_Balance: 200,
    Referral_Code: "ALI500",
    Last_Visit_Date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString() // 26 days ago (Inactive trigger!)
  },
  {
    User_ID: "usr-002",
    Name: "Usman Tariq",
    Phone_Number: "+92 321 9876543",
    Role: "Customer",
    Wallet_Balance: 150,
    Referral_Code: "USMAN100",
    Last_Visit_Date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
  },
  {
    User_ID: "usr-003",
    Name: "Hamza Ahmed",
    Phone_Number: "+92 333 5554433",
    Role: "Customer",
    Wallet_Balance: 0,
    Referral_Code: "HAMZA777",
    Last_Visit_Date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
  },
  {
    User_ID: "usr-004",
    Name: "Zubair Gori",
    Phone_Number: "+92 301 4250420",
    Role: "Barber",
    Wallet_Balance: 0,
    Referral_Code: "ZUBAIRG",
    Last_Visit_Date: new Date().toISOString()
  }
];

export const INITIAL_SERVICES = [
  // Main Services (Is_AddOn: false)
  {
    Service_ID: "srv-101",
    Service_Name: "Signature Haircut & Style",
    Price: 600,
    Duration_Minutes: 30,
    Is_AddOn: false,
    Category: "Hair Styling",
    Icon: "✂️"
  },
  {
    Service_ID: "srv-102",
    Service_Name: "Beard Royal Trim & Grooming",
    Price: 400,
    Duration_Minutes: 20,
    Is_AddOn: false,
    Category: "Beard Care",
    Icon: "🪒"
  },
  {
    Service_ID: "srv-103",
    Service_Name: "Luxury Charcoal Facial",
    Price: 1200,
    Duration_Minutes: 45,
    Is_AddOn: false,
    Category: "Skincare",
    Icon: "🧴"
  },
  {
    Service_ID: "srv-104",
    Service_Name: "Head & Shoulder Spa Massage",
    Price: 800,
    Duration_Minutes: 30,
    Is_AddOn: false,
    Category: "Relaxation",
    Icon: "💆‍♂️"
  },

  // Add-On Services (Is_AddOn: true)
  {
    Service_ID: "srv-201",
    Service_Name: "Refreshing Face Wash & Cleanse",
    Price: 150,
    Duration_Minutes: 10,
    Is_AddOn: true,
    Category: "Quick Care",
    Icon: "🫧"
  },
  {
    Service_ID: "srv-202",
    Service_Name: "Precision Threading / Eyebrows",
    Price: 100,
    Duration_Minutes: 10,
    Is_AddOn: true,
    Category: "Detailing",
    Icon: "🧵"
  },
  {
    Service_ID: "srv-203",
    Service_Name: "Premium Hair Black/Brown Color",
    Price: 500,
    Duration_Minutes: 20,
    Is_AddOn: true,
    Category: "Coloring",
    Icon: "🎨"
  },
  {
    Service_ID: "srv-204",
    Service_Name: "Hot Towel Steam Treatment",
    Price: 200,
    Duration_Minutes: 10,
    Is_AddOn: true,
    Category: "Relaxation",
    Icon: "♨️"
  }
];

export const INITIAL_BOOKINGS = [
  {
    Booking_ID: "bk-901",
    Customer_ID: "usr-001",
    Customer_Name: "Ali Khan",
    Customer_Phone: "+92 300 1234567",
    Service_Ids: ["srv-101", "srv-201"],
    Service_Names: ["Signature Haircut & Style", "Refreshing Face Wash & Cleanse"],
    Total_Bill: 750,
    Wallet_Discount: 100,
    Final_Paid: 650,
    Booking_Date_Time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Today in 2 hours
    Status: "Pending"
  },
  {
    Booking_ID: "bk-902",
    Customer_ID: "usr-002",
    Customer_Name: "Usman Tariq",
    Customer_Phone: "+92 321 9876543",
    Service_Ids: ["srv-102"],
    Service_Names: ["Beard Royal Trim & Grooming"],
    Total_Bill: 400,
    Wallet_Discount: 0,
    Final_Paid: 400,
    Booking_Date_Time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    Status: "Completed"
  },
  {
    Booking_ID: "bk-903",
    Customer_ID: "usr-001",
    Customer_Name: "Ali Khan",
    Customer_Phone: "+92 300 1234567",
    Service_Ids: ["srv-101"],
    Service_Names: ["Signature Haircut & Style"],
    Total_Bill: 600,
    Wallet_Discount: 0,
    Final_Paid: 600,
    Booking_Date_Time: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(), // 28 days ago
    Status: "Completed"
  }
];

export const INITIAL_MARKETING_LOGS = [
  {
    Log_ID: "log-501",
    Customer_ID: "usr-001",
    Customer_Name: "Ali Khan",
    Customer_Phone: "+92 300 1234567",
    Last_Visit_Date: new Date(Date.now() - 26 * 24 * 60 * 60 * 1000).toISOString(),
    Days_Inactive: 26,
    Status: "Alert Triggered",
    Message_Template: "Salam Ali Khan! 💈 M5 SmartSalon par aap ki picli visit ko 26 din ho gaye hain. Abhi haircut book karein aur Rs 100 wallet cashback payen! Click: https://m5salon.app/book"
  }
];
