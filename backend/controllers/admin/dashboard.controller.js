import { db } from "../../db/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    /* ================= USERS ================= */
    const users = await db.query(
      `SELECT COUNT(*)::int AS total FROM users`
    );

    /* ================= PRODUCTS ================= */
    const products = await db.query(
      `SELECT COUNT(*)::int AS total FROM products`
    );

    /* ================= REVENUE ================= */
    const revenue = await db.query(`
      SELECT
        COALESCE(SUM(grand_total), 0)::numeric AS total
      FROM orders
      WHERE status = 'Delivered'
    `);

    /* ================= ORDERS STATUS ================= */
    const orders = await db.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'Pending')::int AS pending,
        COUNT(*) FILTER (WHERE status = 'Accepted')::int AS accepted,
        COUNT(*) FILTER (WHERE status = 'Delivered')::int AS delivered,
        COUNT(*)::int AS total
      FROM orders
    `);

    /* =====================================================
       TOP SELLING PRODUCTS (FIXED)
    ===================================================== */
    const topProducts = await db.query(`
      SELECT
        p.id,
        p.name,
        p.model,
        COALESCE(SUM(oi.quantity), 0)::int AS sold
      FROM products p
      LEFT JOIN order_items oi
        ON p.id = oi.product_id
      GROUP BY p.id, p.name, p.model
      ORDER BY sold DESC, p.id DESC
      LIMIT 10
    `);

    /* =====================================================
       LOW SELLING PRODUCTS (FIXED)
    ===================================================== */
    const lowProducts = await db.query(`
      SELECT
        p.id,
        p.name,
        p.model,
        COALESCE(SUM(oi.quantity), 0)::int AS sold
      FROM products p
      LEFT JOIN order_items oi
        ON p.id = oi.product_id
      GROUP BY p.id, p.name, p.model
      ORDER BY sold ASC, p.id ASC
      LIMIT 10
    `);

    /* ================= RECENT ORDERS ================= */
    const recentOrders = await db.query(`
      SELECT
        id,
        order_number,
        customer_name,
        shop_name,
        grand_total,
        status,
        created_at
      FROM orders
      ORDER BY created_at DESC
      LIMIT 10
    `);

    /* ================= RESPONSE ================= */
    return res.json({
      success: true,

      stats: {
        users: users.rows[0].total,
        products: products.rows[0].total,
        revenue: Number(revenue.rows[0].total),

        totalOrders: orders.rows[0].total,
        pending: orders.rows[0].pending,
        accepted: orders.rows[0].accepted,
        delivered: orders.rows[0].delivered,
      },

      topProducts: topProducts.rows,
      lowProducts: lowProducts.rows,
      recentOrders: recentOrders.rows,
    });
  } catch (err) {
    console.error("DASHBOARD ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};