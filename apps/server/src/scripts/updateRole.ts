import { db, eq, users, runners } from '@phyt/database';

async function updateUserToRunner(userId: number) {
    try {
        // Update user role
        const [updatedUser] = await db
            .update(users)
            .set({ role: 'runner' })
            .where(eq(users.id, userId))
            .returning();

        if (!updatedUser) {
            throw new Error(`No user found with ID ${userId}`);
        }

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

        console.log(`Successfully updated user ${updatedUser.username} (ID: ${updatedUser.id}) to runner role`);
        return updatedUser;
    } catch (error) {
        console.error(`Failed to update user ${userId} to runner:`, error);
        throw error;
    }
}

async function main() {
    if (process.argv.length < 3) {
        console.error('Please provide a user ID');
        process.exit(1);
    }

    const userId = parseInt(process.argv[2]);
    if (isNaN(userId)) {
        console.error('Please provide a valid numeric user ID');
        process.exit(1);
    }

    try {
        await updateUserToRunner(userId);
        console.log('Update completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
}

main();