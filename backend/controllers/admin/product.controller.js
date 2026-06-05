import { db } from "../../db/db.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

/* ======================================================
   CREATE PRODUCT
====================================================== */
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      model,
      category,
      powerConsumption,
      colorTemperature,
      ratedVoltage,
      operatingVoltage,
      averageLife,
      warranty,
      variants,
    } = req.body;

    let mainImage = null;

    if (req.files?.mainImage?.[0]) {
      const uploaded = await uploadToCloudinary(
        req.files.mainImage[0].buffer,
        "products"
      );
      mainImage = uploaded?.secure_url || null;
    }

    const product = await db.query(
      `INSERT INTO products 
      (name, model, category, power_consumption, color_temperature, rated_voltage, operating_voltage, average_life, warranty, main_image)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        name,
        model,
        category,
        powerConsumption,
        colorTemperature,
        ratedVoltage,
        operatingVoltage,
        averageLife,
        warranty,
        mainImage,
      ]
    );

    const productId = product.rows[0].id;

    let parsedVariants = [];

    try {
      parsedVariants =
        typeof variants === "string"
          ? JSON.parse(variants)
          : variants || [];
    } catch {
      parsedVariants = [];
    }

    if (Array.isArray(parsedVariants)) {
      for (const v of parsedVariants) {
        await db.query(
          `INSERT INTO product_variants
          (product_id, watt, price, moq, stock)
          VALUES ($1,$2,$3,$4,$5)`,
          [productId, v.watt, v.price, v.moq, v.stock]
        );
      }
    }

    const galleryFiles = req.files?.galleryImages || [];

    for (const file of galleryFiles) {
      const uploaded = await uploadToCloudinary(file.buffer, "products");

      await db.query(
        `INSERT INTO product_images (product_id, image)
         VALUES ($1,$2)`,
        [productId, uploaded?.secure_url]
      );
    }

    res.json({
      success: true,
      product: product.rows[0],
    });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Create failed" });
  }
};

/* ======================================================
   GET ALL PRODUCTS
====================================================== */
export const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT 
        p.*,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category = c.id
      WHERE 1=1
    `;

    const values = [];

    if (search) {
      values.push(`%${search}%`);
      query += ` AND p.name ILIKE $${values.length}`;
    }

    if (category && category !== "All") {
      values.push(String(category));
      query += ` AND p.category = $${values.length}`;
    }

    query += ` ORDER BY p.id DESC`;

    const result = await db.query(query, values);
    const products = result.rows;

    const productIds = products.map((p) => p.id);

    if (productIds.length > 0) {
      const variantsRes = await db.query(
        `SELECT * FROM product_variants WHERE product_id = ANY($1)`,
        [productIds]
      );

      const imagesRes = await db.query(
        `SELECT * FROM product_images WHERE product_id = ANY($1)`,
        [productIds]
      );

      for (const p of products) {
        p.variants = variantsRes.rows.filter(
          (v) => v.product_id === p.id
        );

        p.images = imagesRes.rows
          .filter((i) => i.product_id === p.id)
          .map((i) => i.image);
      }
    }

    res.json(products);
  } catch (err) {
    console.error("GET ALL PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* ======================================================
   GET SINGLE PRODUCT
====================================================== */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await db.query(
      `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category = c.id
       WHERE p.id=$1`,
      [id]
    );

    if (!product.rows[0]) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variants = await db.query(
      `SELECT * FROM product_variants WHERE product_id=$1`,
      [id]
    );

    const images = await db.query(
      `SELECT image FROM product_images WHERE product_id=$1`,
      [id]
    );

    res.json({
      product: product.rows[0],
      variants: variants.rows,
      images: images.rows.map((i) => i.image),
    });
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
};

/* ======================================================
   UPDATE PRODUCT
====================================================== */
export const updateProduct = async (req, res) => {
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    const {
      name,
      model,
      category,
      powerConsumption,
      colorTemperature,
      ratedVoltage,
      operatingVoltage,
      averageLife,
      warranty,
      variants,
    } = req.body;

    const fields = [];
    const values = [];
    let index = 1;

    const add = (col, value) => {
      if (value !== undefined) {
        fields.push(`${col}=$${index}`);
        values.push(value);
        index++;
      }
    };

    add("name", name);
    add("model", model);
    add("category", category);
    add("power_consumption", powerConsumption);
    add("color_temperature", colorTemperature);
    add("rated_voltage", ratedVoltage);
    add("operating_voltage", operatingVoltage);
    add("average_life", averageLife);
    add("warranty", warranty);

    if (req.files?.mainImage?.[0]) {
      const uploaded = await uploadToCloudinary(
        req.files.mainImage[0].buffer,
        "products"
      );
      add("main_image", uploaded?.secure_url);
    }

    if (fields.length > 0) {
      values.push(id);

      await client.query(
        `UPDATE products SET ${fields.join(", ")} WHERE id=$${index}`,
        values
      );
    }

    /* ================= VARIANTS ================= */
    if (variants) {
      const parsed =
        typeof variants === "string"
          ? JSON.parse(variants)
          : variants;

      const incomingIds = [];

      if (Array.isArray(parsed)) {
        for (const v of parsed) {
          if (v.id) {
            incomingIds.push(v.id);

            await client.query(
              `UPDATE product_variants
               SET watt=$1, price=$2, moq=$3, stock=$4
               WHERE id=$5 AND product_id=$6`,
              [v.watt, v.price, v.moq, v.stock, v.id, id]
            );
          } else {
            const result = await client.query(
              `INSERT INTO product_variants
               (product_id, watt, price, moq, stock)
               VALUES ($1,$2,$3,$4,$5)
               RETURNING id`,
              [id, v.watt, v.price, v.moq, v.stock]
            );

            incomingIds.push(result.rows[0].id);
          }
        }

        if (incomingIds.length > 0) {
          await client.query(
            `DELETE FROM product_variants
             WHERE product_id=$1
             AND id <> ALL($2::int[])`,
            [id, incomingIds]
          );
        } else {
          await client.query(
            `DELETE FROM product_variants WHERE product_id=$1`,
            [id]
          );
        }
      }
    }

    /* ================= GALLERY ================= */
    if (req.files?.galleryImages?.length) {
      await client.query(
        `DELETE FROM product_images WHERE product_id=$1`,
        [id]
      );

      for (const file of req.files.galleryImages) {
        const uploaded = await uploadToCloudinary(file.buffer, "products");

        await client.query(
          `INSERT INTO product_images (product_id, image)
           VALUES ($1,$2)`,
          [id, uploaded?.secure_url]
        );
      }
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Product updated successfully",
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Update failed" });
  } finally {
    client.release();
  }
};

/* ======================================================
   DELETE PRODUCT
====================================================== */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM product_variants WHERE product_id=$1", [id]);
    await db.query("DELETE FROM product_images WHERE product_id=$1", [id]);
    await db.query("DELETE FROM products WHERE id=$1", [id]);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

export const getNewArrivals = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        p.id,
        p.name,
        p.main_image AS image,
        p.model
      FROM products p
      ORDER BY p.id DESC
      LIMIT 12
    `);

    const products = result.rows;

    if (products.length === 0) {
      return res.json([]);
    }

    const productIds = products.map((p) => p.id);

    // get variants
    const variantRes = await db.query(
      `
      SELECT *
      FROM product_variants
      WHERE product_id = ANY($1)
      `,
      [productIds]
    );

    const variants = variantRes.rows;

    // attach variant data
    const final = products.map((p) => {
      const v = variants.filter((x) => x.product_id === p.id);

      // pick cheapest price
      const minPrice =
        v.length > 0
          ? Math.min(...v.map((i) => Number(i.price || 0)))
          : 0;

      // MOQ (smallest)
      const minMoq =
        v.length > 0
          ? Math.min(...v.map((i) => Number(i.moq || 0)))
          : 0;

      // stock check
      const totalStock = v.reduce(
        (sum, i) => sum + Number(i.stock || 0),
        0
      );

      return {
        id: p.id,
        name: p.name,
        image: p.image,
        price: minPrice,
        moq: minMoq,
        stock: totalStock,
        inStock: totalStock > 0,
      };
    });

    return res.json(final);
  } catch (err) {
    console.error("NEW ARRIVALS ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};