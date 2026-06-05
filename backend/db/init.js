import { db } from "./db.js";

const createTables = async () => {
  try {
    /* ================= USERS ================= */
    /* ================= USERS ================= */
await db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,

    phone VARCHAR(20),
    alternate_phone VARCHAR(20),

    shop_name VARCHAR(255),
    gstin VARCHAR(50),

    address TEXT,
    pincode VARCHAR(20),

    password TEXT NOT NULL,

    role VARCHAR(20) DEFAULT 'wholesaler',

    otp VARCHAR(6),
    otp_expiry TIMESTAMPTZ,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

    /* ================= BANNERS ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        link TEXT,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= CATEGORIES ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        link TEXT,
        image TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= CONTACT SETTINGS ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS contact_settings (
        id SERIAL PRIMARY KEY,
        banner_image TEXT,
        phone_number VARCHAR(30),
        whatsapp_number VARCHAR(30),
        email VARCHAR(255),
        address TEXT,
        map_url TEXT,
        working_days VARCHAR(100),
        opening_time VARCHAR(20),
        closing_time VARCHAR(20),
        gst_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= CALLBACK REQUESTS ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS callback_requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        company VARCHAR(255),
        phone VARCHAR(30),
        requirement TEXT,
        status VARCHAR(30) DEFAULT 'New',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= PRODUCTS ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,

        name VARCHAR(255) NOT NULL,
        model VARCHAR(100),

        category_id INTEGER
          REFERENCES categories(id)
          ON DELETE SET NULL,

        power_consumption VARCHAR(50),
        color_temperature VARCHAR(50),
        rated_voltage VARCHAR(50),
        operating_voltage VARCHAR(50),
        average_life VARCHAR(50),

        main_image TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= PRODUCT IMAGES ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,

        product_id INTEGER
          REFERENCES products(id)
          ON DELETE CASCADE,

        image TEXT NOT NULL
      );
    `);

    /* ================= PRODUCT VARIANTS ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,

        product_id INTEGER
          REFERENCES products(id)
          ON DELETE CASCADE,

        watt VARCHAR(50),
        price VARCHAR(50),
        moq VARCHAR(50),
        stock VARCHAR(50),

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= CART ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,

        user_id INTEGER
          REFERENCES users(id)
          ON DELETE CASCADE,

        product_id INTEGER
          REFERENCES products(id)
          ON DELETE CASCADE,

        variant_id INTEGER
          REFERENCES product_variants(id)
          ON DELETE CASCADE,

        quantity INTEGER NOT NULL DEFAULT 1,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= ORDERS ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,

        order_number VARCHAR(50) UNIQUE NOT NULL,

        user_id INTEGER
          REFERENCES users(id)
          ON DELETE SET NULL,

        shop_name VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        email VARCHAR(255),
        gstin VARCHAR(50),

        delivery_address TEXT NOT NULL,

        customer_message TEXT,

        total_items INTEGER DEFAULT 0,
        total_quantity INTEGER DEFAULT 0,

        subtotal NUMERIC(12,2) DEFAULT 0,
        gst_amount NUMERIC(12,2) DEFAULT 0,
        grand_total NUMERIC(12,2) DEFAULT 0,

        status VARCHAR(30) DEFAULT 'Pending',

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= ORDER ITEMS ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,

        order_id INTEGER
          REFERENCES orders(id)
          ON DELETE CASCADE,

        product_id INTEGER
          REFERENCES products(id)
          ON DELETE SET NULL,

        variant_id INTEGER
          REFERENCES product_variants(id)
          ON DELETE SET NULL,

        product_name VARCHAR(255),
        watt VARCHAR(50),

        quantity INTEGER NOT NULL,

        unit_price NUMERIC(12,2) DEFAULT 0,
        total_price NUMERIC(12,2) DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* ================= ORDER STATUS HISTORY ================= */
    await db.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id SERIAL PRIMARY KEY,

        order_id INTEGER
          REFERENCES orders(id)
          ON DELETE CASCADE,

        status VARCHAR(30),
        remarks TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ All tables created successfully");
  } catch (err) {
    console.error("❌ Table creation error:", err.message);
  }
};

createTables();