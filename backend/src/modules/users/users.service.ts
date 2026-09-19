import { eq } from 'drizzle-orm';
import { db } from '@/db/index';
import { files, users } from '@/db/schema';

export class UsersService {
  async get_profile(user: { id: string; email: string; name: string }) {
    await db
      .insert(users)
      .values({ id: user.id, email: user.email, name: user.name })
      .onConflictDoUpdate({
        target: users.id,
        set: { email: user.email, name: user.name },
      })
      .execute();

    const [profile] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        role: users.role,
        created_at: users.created_at,
        avatar: files.url,
      })
      .from(users)
      .leftJoin(files, eq(files.id, users.avatar_id))
      .where(eq(users.id, user.id));

    return { ...profile, addresses: [] };
  }
}