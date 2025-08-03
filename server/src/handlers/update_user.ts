
import { db } from '../db';
import { usersTable } from '../db/schema';
import { type UpdateUserInput, type User } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateUser(input: UpdateUserInput): Promise<User | null> {
  try {
    // Build update object only with provided fields
    const updateData: any = {};
    
    if (input.username !== undefined) {
      updateData.username = input.username;
    }
    
    if (input.email !== undefined) {
      updateData.email = input.email;
    }
    
    if (input.avatar_url !== undefined) {
      updateData.avatar_url = input.avatar_url;
    }
    
    if (input.bio !== undefined) {
      updateData.bio = input.bio;
    }
    
    if (input.role !== undefined) {
      updateData.role = input.role;
    }
    
    if (input.is_active !== undefined) {
      updateData.is_active = input.is_active;
    }
    
    if (input.two_factor_enabled !== undefined) {
      updateData.two_factor_enabled = input.two_factor_enabled;
    }

    // Always update the updated_at timestamp
    updateData.updated_at = new Date();

    // Update the user
    const result = await db.update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, input.id))
      .returning()
      .execute();

    if (result.length === 0) {
      return null;
    }

    // Convert numeric fields back to numbers before returning
    const user = result[0];
    return {
      ...user,
      coins_balance: parseFloat(user.coins_balance)
    };
  } catch (error) {
    console.error('User update failed:', error);
    throw error;
  }
}
