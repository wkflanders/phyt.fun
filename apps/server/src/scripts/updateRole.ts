import { db, eq, users, runners } from '@phyt/database';

type UserRole = 'runner' | 'admin';

async function updateUserRole(userId: number, role: UserRole) {
    try {
        // Update user role
        const [updatedUser] = await db
            .update(users)
            .set({ role })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            throw new Error(`No user found with ID ${userId}`);
        }

        // If updating to runner role, handle runner-specific logic
        if (role === 'runner') {
            // Check if runner entry exists
            const existingRunner = await db
                .select()
                .from(runners)
                .where(eq(runners.user_id, userId))
                .limit(1);

            if (existingRunner.length === 0) {
                // Create runner entry
                const [newRunner] = await db
                    .insert(runners)
                    .values({
                        user_id: userId,
                        average_pace: null,
                        total_distance_m: 0,
                        total_runs: 0,
                        best_mile_time: null
                    })
                    .returning();

                console.log(`Created new runner entry with ID ${newRunner.id}`);
            }
        }

        console.log(`Successfully updated user ${updatedUser.username} (ID: ${updatedUser.id}) to ${role} role`);
        return updatedUser;
    } catch (error) {
        console.error(`Failed to update user ${userId} to ${role}:`, error);
        throw error;
    }
}

async function main() {
    if (process.argv.length < 4) {
        console.error('Usage: ts-node updateRole.ts <userId> <role>');
        console.error('Role must be either "runner" or "admin"');
        process.exit(1);
    }

    const userId = parseInt(process.argv[2]);
    const role = process.argv[3].toLowerCase();

    if (isNaN(userId)) {
        console.error('Please provide a valid numeric user ID');
        process.exit(1);
    }

    if (role !== 'runner' && role !== 'admin') {
        console.error('Role must be either "runner" or "admin"');
        process.exit(1);
    }

    try {
        await updateUserRole(userId, role as UserRole);
        console.log('Update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

main();