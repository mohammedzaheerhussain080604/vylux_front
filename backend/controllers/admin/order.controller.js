import { db } from "../../db/db.js";

/* ================= CREATE ORDER ================= */
export const createOrder = async (req, res) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      shop_name,
      customer_name,
      phone,
      email,
      gstin,
      delivery_address,
      customer_message,
      products,
      subtotal,
      gst_amount,
      grand_total,
    } = req.body;

    if (
      !shop_name ||
      !customer_name ||
      !phone ||
      !delivery_address ||
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const order_number =
      "ORD" + Date.now() + Math.floor(Math.random() * 1000);

    const total_items = products.length;

    const total_quantity = products.reduce(
      (sum, item) => sum + (Number(item.quantity) || 0),
      0
    );

    const orderResult = await db.query(
      `
      INSERT INTO orders (
        order_number,
        user_id,
        shop_name,
        customer_name,
        phone,
        email,
        gstin,
        delivery_address,
        customer_message,
        total_items,
        total_quantity,
        subtotal,
        gst_amount,
        grand_total
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      RETURNING *
      `,
      [
        order_number,
        user_id,
        shop_name,
        customer_name,
        phone,
        email,
        gstin,
        delivery_address,
        customer_message,
        total_items,
        total_quantity,
        subtotal || 0,
        gst_amount || 0,
        grand_total || 0,
      ]
    );

    const order = orderResult.rows[0];

    // insert items (parallel)
    await Promise.all(
      products.map((item) =>
        db.query(
          `
          INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            product_name,
            watt,
            quantity,
            unit_price,
            total_price
          )
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          `,
          [
            order.id,
            item.product_id || null,
            item.variant_id || null,
            item.product_name,
            item.watt,
            Number(item.quantity) || 0,
            Number(item.unit_price) || 0,
            Number(item.total_price) || 0,
          ]
        )
      )
    );

    await db.query(
      `
      INSERT INTO order_status_history (
        order_id,
        status,
        remarks
      )
      VALUES ($1,$2,$3)
      `,
      [order.id, "Pending", "Order Created"]
    );

    return res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= USER ORDERS ================= */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user?.id;

    const result = await db.query(
      `
      SELECT *
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.status(200).json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= ADMIN ALL ORDERS ================= */
export const getAllOrders = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM orders
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      orders: result.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= ADMIN SINGLE ORDER ================= */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await db.query(
      `SELECT * FROM orders WHERE id = $1`,
      [id]
    );

    if (!order.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const items = await db.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );

    const history = await db.query(
      `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      order: order.rows[0],
      items: items.rows,
      history: history.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= UPDATE STATUS ================= */
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    await db.query(
      `
      UPDATE orders
      SET status = $1,
      updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [status, id]
    );

    await db.query(
      `
      INSERT INTO order_status_history (
        order_id,
        status,
        remarks
      )
      VALUES ($1,$2,$3)
      `,
      [id, status, remarks || ""]
    );

    return res.status(200).json({
      success: true,
      message: "Status updated",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= DELETE ORDER ================= */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM orders WHERE id = $1 RETURNING *`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order deleted",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

