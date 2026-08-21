const Razorpay = require('razorpay');
require('dotenv').config({ path: '.env.local' });

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function checkRoute() {
  try {
    // Method 1: Check transfers (main Route API)
    const transfers = await razorpay.transfers.all({ count: 1 });
    console.log("✅ Route access confirmed!");
    console.log("Transfers found:", transfers.items.length);
    
    // Method 2: Fetch a specific transfer to verify
    if (transfers.items.length > 0) {
      const transfer = await razorpay.transfers.fetch(transfers.items[0].id);
      console.log("Sample transfer:", transfer.id);
    }
  
    console.log("✅ Account created:", account.id);
  } catch (err) {
    console.error("❌ Route access issue:", err.error?.description || err.message);
    
    // Common errors:
    if (err.statusCode === 401) {
      console.log("→ Invalid API keys");
    } else if (err.statusCode === 403) {
      console.log("→ Route not enabled on this account. Contact Razorpay support.");
    }
  }
}

checkRoute();

