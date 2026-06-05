import { db } from "../../db/db.js";

/* ======================================
   ADD TO CART (JWT USER AUTO DETECT)
====================================== */
export const addToCart = async (req, res) => {
  try {
    const user_id = req.user.id; // 🔥 FROM JWT

    const { product_id, variant_id, quantity } = req.body;

    // check existing item
    const existing = await db.query(
      `SELECT * FROM cart 
       WHERE user_id=$1 AND product_id=$2 AND variant_id=$3`,
      [user_id, product_id, variant_id]
    );

    if (existing.rows.length > 0) {
      const updated = await db.query(
        `UPDATE cart
         SET quantity = quantity + $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING *`,
        [quantity, existing.rows[0].id]
      );

      return res.json(updated.rows[0]);
    }

    const result = await db.query(
      `INSERT INTO cart (user_id, product_id, variant_id, quantity)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [user_id, product_id, variant_id, quantity]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ======================================
   GET CART (FOR LOGGED USER)
====================================== */
export const getCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    const result = await db.query(
      `SELECT 
          c.id as cart_id,
          c.quantity,
          c.created_at,

          p.id as product_id,
          p.name,
          p.model,
          p.main_image,

          v.id as variant_id,
          v.watt,
          v.price,
          v.moq

       FROM cart c
       JOIN products p ON p.id = c.product_id
       JOIN product_variants v ON v.id = c.variant_id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ======================================
   UPDATE QTY
====================================== */
export const updateCartQty = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { cart_id, quantity } = req.body;

    const result = await db.query(
      `UPDATE cart
       SET quantity=$1,
           updated_at=NOW()
       WHERE id=$2 AND user_id=$3
       RETURNING *`,
      [quantity, cart_id, user_id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ======================================
   DELETE ITEM
====================================== */
export const deleteCartItem = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    await db.query(
      `DELETE FROM cart
       WHERE id=$1 AND user_id=$2`,
      [id, user_id]
    );

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ======================================
   CLEAR CART
====================================== */
export const clearCart = async (req, res) => {
  try {
    const user_id = req.user.id;

    await db.query(
      `DELETE FROM cart WHERE user_id=$1`,
      [user_id]
    );

    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};