const Razorpay = require('razorpay');
require('dotenv').config({ path: '.env.local' });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createTestAccount() {
  try {
    console.log("Creating test linked account...");
    
    // OPTION 1: Documented pair (GUARANTEED to work)
    const account = await razorpay.accounts.create({
      email: "vendor1@test.com",
      phone: "9000000000",
      type: "route",
      legal_business_name: "Test Vendor 1",
      business_type: "individual",
      contact_name: "Vendor One",
      profile: {
        category: "healthcare",           // Documented valid category
        subcategory: "clinic",            // Documented valid subcategory
        description: "Healthcare marketplace vendor",
        addresses: {
          registered: {
            street1: "123 Test Street",
            street2: "Near City Center",
            city: "Bengaluru",
            state: "Karnataka",
            postal_code: "560001",
            country: "IN"
          }
        }
      }
    });
    
    console.log("✅ Account created!");
    console.log("Account ID:", account.id);
    console.log("Full response:", JSON.stringify(account, null, 2));
    
    // Save for reference
    const fs = require('fs');
    fs.writeFileSync('test-account.json', JSON.stringify(account, null, 2));
    
  } catch (err) {
    console.error("❌ Error:", err.error?.description || err.message);
    
    // If healthcare also fails, try these ecommerce subcategories
    if (err.error?.description?.includes('subcategory')) {
      console.log("\n💡 Try these ecommerce subcategories:");
      console.log("   - clothing_and_accessories");
      console.log("   - electronics");
      console.log("   - home_and_furniture");
      console.log("   - food_and_beverage");
      console.log("   - beauty_and_personal_care");
    }
  }
}

createTestAccount();