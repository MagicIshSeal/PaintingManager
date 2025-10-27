import bcrypt from "bcrypt";

export class User {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  static async create(db, username, password) {
    const hashedPassword = await this.hashPassword(password);
    const result = await db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hashedPassword]
    );
    return { id: result.lastID, username };
  }

  static async findByUsername(db, username) {
    return await db.get("SELECT * FROM users WHERE username = ?", [username]);
  }

  static async findById(db, id) {
    return await db.get("SELECT * FROM users WHERE id = ?", [id]);
  }
}
