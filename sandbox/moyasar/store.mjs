import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";

export const FIXTURE_ITEMS = Object.freeze([
  { name: "Smash Burger", quantity: 1, amount: 3000 },
  { name: "Fries", quantity: 1, amount: 1200 },
  { name: "Drink", quantity: 1, amount: 800 },
]);

export function openLabStore(path) {
  const db = new DatabaseSync(path, { timeout: 5000 });
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS lab_orders (
      id TEXT PRIMARY KEY,
      session_hash TEXT NOT NULL,
      payment_id TEXT NOT NULL UNIQUE,
      method TEXT NOT NULL CHECK(method IN ('creditcard','applepay')),
      amount INTEGER NOT NULL CHECK(amount >= 100),
      currency TEXT NOT NULL DEFAULT 'SAR' CHECK(currency = 'SAR'),
      items TEXT NOT NULL,
      description TEXT NOT NULL,
      callback_url TEXT NOT NULL,
      intent TEXT,
      payment_state TEXT NOT NULL DEFAULT 'pending' CHECK(payment_state IN ('pending','paid','failed','review')),
      created_at TEXT NOT NULL,
      verified_at TEXT
    ) STRICT;
    CREATE TABLE IF NOT EXISTS lab_kitchen (
      number INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL UNIQUE REFERENCES lab_orders(id),
      payment_id TEXT NOT NULL UNIQUE,
      method TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'paid' CHECK(status IN ('paid','preparing','ready')),
      updated_at TEXT NOT NULL
    ) STRICT;
  `);
  function order(id) {
    return db.prepare("SELECT * FROM lab_orders WHERE id = ?").get(id);
  }
  function kitchenOrder(id) {
    return db.prepare("SELECT * FROM lab_kitchen WHERE order_id = ?").get(id);
  }
  function publicOrder(row) {
    return {
      id: row.id,
      amount: row.amount,
      currency: row.currency,
      items: JSON.parse(row.items),
      paymentState: row.payment_state,
      method: row.method,
      createdAt: row.created_at,
      kitchen: kitchenOrder(row.id) || null,
    };
  }
  return {
    close: () => db.close(),
    order,
    publicOrder,
    create(sessionHash, method, amount, origin) {
      const id = randomUUID(),
        paymentId = randomUUID();
      const items = [...FIXTURE_ITEMS];
      if (amount !== 5000)
        items.push({
          name: "Apple Pay sandbox amount adjustment",
          quantity: 1,
          amount: amount - 5000,
        });
      const description = `Meatery SANDBOX ${id}`;
      const callbackUrl = `${origin}/lab/moyasar/result?order=${id}`;
      db.prepare(
        `INSERT INTO lab_orders
        (id,session_hash,payment_id,method,amount,items,description,callback_url,created_at)
        VALUES (?,?,?,?,?,?,?,?,?)`,
      ).run(
        id,
        sessionHash,
        paymentId,
        method,
        amount,
        JSON.stringify(items),
        description,
        callbackUrl,
        new Date().toISOString(),
      );
      return order(id);
    },
    saveIntent(id, intent) {
      db.prepare(
        "UPDATE lab_orders SET intent = ? WHERE id = ? AND payment_state = 'pending'",
      ).run(JSON.stringify(intent), id);
    },
    setState(id, state) {
      // Terminal paid/review states cannot be downgraded by stale callbacks.
      db.prepare(
        "UPDATE lab_orders SET payment_state = ? WHERE id = ? AND (payment_state IN ('pending','failed') OR ? = 'review')",
      ).run(state, id, state);
    },
    verified(row, method) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const latest = order(row.id);
        if (latest.payment_state === "review")
          throw new Error("Payment is held for review.");
        const now = new Date().toISOString();
        db.prepare(
          "UPDATE lab_orders SET payment_state = 'paid', verified_at = COALESCE(verified_at, ?) WHERE id = ?",
        ).run(now, row.id);
        db.prepare(
          "INSERT OR IGNORE INTO lab_kitchen (order_id,payment_id,method,updated_at) VALUES (?,?,?,?)",
        ).run(row.id, row.payment_id, method, now);
        db.exec("COMMIT");
        return publicOrder(order(row.id));
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    },
    pending() {
      return db
        .prepare(
          "SELECT * FROM lab_orders WHERE payment_state = 'pending' AND intent IS NOT NULL ORDER BY created_at DESC LIMIT 20",
        )
        .all();
    },
    listKitchen() {
      return db
        .prepare(
          `SELECT o.*, k.number, k.method AS payment_method, k.status, k.updated_at
        FROM lab_kitchen k JOIN lab_orders o ON o.id = k.order_id ORDER BY k.number DESC LIMIT 100`,
        )
        .all()
        .map((row) => ({
          id: row.id,
          number: row.number,
          items: JSON.parse(row.items),
          amount: row.amount,
          currency: row.currency,
          paymentState: row.payment_state,
          method: row.payment_method,
          status: row.status,
          updatedAt: row.updated_at,
        }));
    },
    transition(id, from, to) {
      if (
        ![
          ["paid", "preparing"],
          ["preparing", "ready"],
        ].some(([a, b]) => a === from && b === to)
      )
        return false;
      const result = db
        .prepare(
          `UPDATE lab_kitchen SET status = ?, updated_at = ? WHERE order_id = ? AND status = ?
        AND EXISTS (SELECT 1 FROM lab_orders WHERE id = ? AND payment_state = 'paid')`,
        )
        .run(to, new Date().toISOString(), id, from, id);
      return result.changes === 1;
    },
  };
}
