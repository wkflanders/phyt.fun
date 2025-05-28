// import { db, eq, users, runners } from '@phyt/database';

// type UserRole = 'runner' | 'admin';

// async function updateUserRole(userId: string, role: UserRole) {
//     try {
//         // Update user role
//         const results = await db
//             .update(users)
//             .set({ role })
//             .where(eq(users.id, userId))
//             .returning();

//         if (!results.length) {
//             throw new Error(`No user found with ID ${userId}`);
//         }

//         const updatedUser = results[0];

//         // If updating to runner role, handle runner-specific logic
//         if (role === 'runner') {
//             // Check if runner entry exists
//             const existingRunner = await db
//                 .select()
//                 .from(runners)
//                 .where(eq(runners.userId, userId))
//                 .limit(1);

//             if (existingRunner.length === 0) {
//                 // Create runner entry
//                 const [newRunner] = await db
//                     .insert(runners)
//                     .values({
//                         userId: userId,
//                         averagePace: null,
//                         totalDistance: 0,
//                         totalRuns: 0,
//                         bestMileTime: null,
//                         runnerWallet: updatedUser.walletAddress
//                     })
//                     .returning();

//                 console.log(
//                     `Created new runner entry with ID ${String(newRunner.id)}`
//                 );
//             }
//         }

//         console.log(
//             `Successfully updated user ${String(updatedUser.username)} (ID: ${String(updatedUser.id)}) to ${role} role`
//         );
//         return updatedUser;
//     } catch (error) {
//         console.error(
//             `Failed to update user ${String(userId)} to ${role}:`,
//             error
//         );
//         throw error;
//     }
// }

// async function main() {
//     if (process.argv.length < 4) {
//         console.error('Usage: ts-node updateRole.ts <userId> <role>');
//         console.error('Role must be either "runner" or "admin"');
//         process.exit(1);
//     }

//     const userId = process.argv[2];
//     const role = process.argv[3].toLowerCase();

//     if (!userId) {
//         console.error('Please provide a valid numeric user ID');
//         process.exit(1);
//     }

//     if (role !== 'runner' && role !== 'admin') {
//         console.error('Role must be either "runner" or "admin"');
//         process.exit(1);
//     }

//     try {
//         await updateUserRole(userId, role as UserRole);
//         console.log('Update completed successfully');
//         process.exit(0);
//     } catch (error) {
//         console.error('Script failed:', error);
//         process.exit(1);
//     }
// }

// void main().catch((error: unknown) => {
//     console.error('Unhandled error:', error);
//     process.exit(1);
// });
