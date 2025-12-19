const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const categories = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Tutoring",
  "Carpentry",
  "Painting",
];

const providerUsers = [
  {
    id: "user_provider_1",
    name: "John Smith",
    email: "john@example.com",
    role: "provider",
  },
  {
    id: "user_provider_2",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "provider",
  },
  {
    id: "user_provider_3",
    name: "Mike Brown",
    email: "mike@example.com",
    role: "provider",
  },
];

async function seed() {
  console.log("Starting seed...");

  // 1. Create Users
  console.log("Creating users...");
  for (const user of providerUsers) {
    const { error } = await supabase.from("users").upsert(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: new Date(),
        updated_at: new Date(),
      },
      { onConflict: "id" }
    );

    if (error) console.error(`Error creating user ${user.name}:`, error.message);
  }

  // 2. Create Service Providers
  console.log("Creating service providers...");
  const providers = [];
  
  for (const user of providerUsers) {
    // Check if provider exists
    let { data: provider } = await supabase
      .from("service_providers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!provider) {
      const { data, error } = await supabase
        .from("service_providers")
        .insert({
          user_id: user.id,
          is_verified: true,
          rating: (4 + Math.random()).toFixed(1),
          total_jobs: Math.floor(Math.random() * 100),
          availability_status: "available",
        })
        .select()
        .single();
        
      if (error) {
        console.error(`Error creating provider for ${user.name}:`, error.message);
      } else {
        provider = data;
      }
    }
    
    if (provider) providers.push({ ...provider, name: user.name }); // Attach name for next step
  }

  // 3. Create Services
  console.log("Creating services...");
  
  // Distribute services among providers
  const servicesList = [
    { title: "Leaky Faucet Repair", category: "Plumbing", price: 80 },
    { title: "Pipe Installation", category: "Plumbing", price: 150 },
    { title: "Home Wiring", category: "Electrical", price: 200 },
    { title: "Switch Replacement", category: "Electrical", price: 60 },
    { title: "Deep House Cleaning", category: "Cleaning", price: 120 },
    { title: "Carpet Cleaning", category: "Cleaning", price: 90 },
    { title: "Math Tutoring", category: "Tutoring", price: 40 },
    { title: "Custom Shelves", category: "Carpentry", price: 300 },
    { title: "Interior Painting", category: "Painting", price: 250 },
  ];

  for (let i = 0; i < servicesList.length; i++) {
    const service = servicesList[i];
    const provider = providers[i % providers.length]; // Round robin

    if (!provider) continue;

    // Check if service exists (simple check by title and provider)
    const { data: existing } = await supabase
      .from("services")
      .select("id")
      .eq("provider_id", provider.id)
      .eq("title", service.title)
      .single();

    if (!existing) {
      const { error } = await supabase.from("services").insert({
        provider_id: provider.id,
        title: service.title,
        description: `Professional ${service.title} services by ${provider.name}`,
        category: service.category,
        price: service.price,
        location: "New York, NY",
        is_active: true,
      });

      if (error) console.error(`Error creating service ${service.title}:`, error.message);
    }
  }

  console.log("Seed completed successfully!");
}

seed().catch(console.error);
