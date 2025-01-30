const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.erh7g8c.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.21pdv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let paymentsCollection;

async function run() {
  try {
    await client.connect();
    paymentsCollection = client.db("SafeKeySolutions").collection("payments");
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
run().catch(console.dir);

// Endpoint to create a Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const { productName, price, name, email, phone, address } = req.body;

    // Validate required fields
    if (!productName || !price || !name || !email || !phone || !address) {
      return res.status(400).send({
        success: false,
        error: "All fields are required",
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: productName,
            },
            unit_amount: price, // price in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `http://127.0.0.1:5500/Index.html`,
      cancel_url: `http://127.0.0.1:5500/Index.html`,
      customer_email: email,

      // Optional: Add metadata for additional customer information
      metadata: {
        name,
        phone,
        address,
      },
    });

    // Optionally save initial payment info (before confirmation)
    await paymentsCollection.insertOne({
      name,
      email,
      phone,
      address,
      productName,
      price: price / 100, // convert back to dollars for storage
      status: "pending",
      sessionId: session.id,
      createdAt: new Date(),
    });

    // Send the session ID back to the client
    res.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create checkout session",
    });
  }
});

// Webhook to handle successful payments
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // Update the payment status in MongoDB
      await paymentsCollection.updateOne(
        { sessionId: session.id },
        {
          $set: {
            status: "completed",
            paidAt: new Date(),
            transactionId: session.payment_intent,
          },
        }
      );
    }

    res.json({ received: true });
  }
);

// Test route
app.get("/", (req, res) => {
  res.send("Antivirus server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
