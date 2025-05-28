// import {
//     db,
//     eq,
//     and,
//     gt,
//     lt,
//     competitions,
//     users,
//     lineups,
//     lineupCards,
//     cards
// } from '@phyt/database';
// import {
//     UUIDv7,
//     NotFoundError,
//     DatabaseError,
//     Competition,
//     LineupSubmissionResponse
// } from '@phyt/types';

// interface GetCompetitionsOptions {
//     active?: boolean;
//     type?: string;
// }

// export const competitionService = {
//     getCompetitions: async (
//         options: GetCompetitionsOptions = {}
//     ): Promise<Competition[]> => {
//         try {
//             const now = new Date();
//             const conditions = [];

//             if (options.active) {
//                 conditions.push(
//                     and(
//                         lt(competitions.startTime, now),
//                         gt(competitions.endTime, now)
//                     )
//                 );
//             }

//             if (options.type) {
//                 conditions.push(eq(competitions.eventType, options.type));
//             }

//             let results;
//             if (conditions.length > 0) {
//                 results = await db
//                     .select()
//                     .from(competitions)
//                     .where(and(...conditions))
//                     .orderBy(competitions.startTime);
//             } else {
//                 results = await db
//                     .select()
//                     .from(competitions)
//                     .orderBy(competitions.startTime);
//             }

//             return results.map((result) => ({
//                 ...result,
//                 id: result.id as UUIDv7,
//                 startTime: new Date(result.startTime).toISOString(),
//                 endTime: new Date(result.endTime).toISOString(),
//                 updatedAt: new Date(result.updatedAt),
//                 createdAt: new Date(result.createdAt),
//                 jackpot: result.jackpot ?? '0'
//             }));
//         } catch (error) {
//             console.error('Error with getCompetitions ', error);
//             throw new DatabaseError('Failed to get competitions');
//         }
//     },

//     getCompetitionById: async (competitionId: UUIDv7): Promise<Competition> => {
//         try {
//             const competitionResults = await db
//                 .select()
//                 .from(competitions)
//                 .where(eq(competitions.id, competitionId))
//                 .limit(1);

//             if (competitionResults.length === 0) {
//                 throw new NotFoundError('Competition not found');
//             }

//             const competition = competitionResults[0];

//             return {
//                 ...competition,
//                 id: competition.id as UUIDv7,
//                 startTime: new Date(competition.startTime).toISOString(),
//                 endTime: new Date(competition.endTime).toISOString(),
//                 updatedAt: new Date(competition.updatedAt),
//                 createdAt: new Date(competition.createdAt),
//                 jackpot: competition.jackpot ?? '0'
//             };
//         } catch (error) {
//             console.error('Error with getCompetitionById ', error);
//             throw new DatabaseError('Failed to get competition');
//         }
//     },

//     submitLineup: async (
//         competitionId: UUIDv7,
//         userId: UUIDv7,
//         cardIds: UUIDv7[]
//     ): Promise<LineupSubmissionResponse> => {
//         try {
//             return await db.transaction(async (tx) => {
//                 // Ensure competition exists
//                 const compeitionResults = await tx
//                     .select()
//                     .from(competitions)
//                     .where(eq(competitions.id, competitionId))
//                     .limit(1);

//                 if (compeitionResults.length === 0) {
//                     throw new NotFoundError('Competition not found');
//                 }

//                 // Ensure user exists
//                 const userResults = await tx
//                     .select()
//                     .from(users)
//                     .where(eq(users.id, userId))
//                     .limit(1);

//                 if (userResults.length === 0) {
//                     throw new NotFoundError('User not found');
//                 }

//                 // Check if user has already submitted a lineup for this competition
//                 const existingLineup = await tx
//                     .select()
//                     .from(lineups)
//                     .where(
//                         and(
//                             eq(lineups.competitionId, competitionId),
//                             eq(lineups.managerId, userId)
//                         )
//                     )
//                     .limit(1);

//                 let lineup;
//                 if (existingLineup.length > 0) {
//                     // Update existing lineup
//                     lineup = existingLineup[0];

//                     // First, delete existing lineup cards
//                     await tx
//                         .delete(lineupCards)
//                         .where(eq(lineupCards.lineupId, lineup.id));
//                 } else {
//                     // Create new lineup
//                     const [newLineup] = await tx
//                         .insert(lineups)
//                         .values({
//                             competitionId: competitionId,
//                             managerId: userId
//                         })
//                         .returning();

//                     lineup = newLineup;
//                 }

//                 // Verify card ownership and insert lineup cards
//                 for (let i = 0; i < cardIds.length; i++) {
//                     const cardId = cardIds[i];

//                     // Check card ownership
//                     const cardResults = await tx
//                         .select()
//                         .from(cards)
//                         .where(
//                             and(eq(cards.id, cardId), eq(cards.ownerId, userId))
//                         )
//                         .limit(1);

//                     if (cardResults.length === 0) {
//                         throw new NotFoundError(
//                             `Card ${String(cardId)} not owned by user or does not exist`
//                         );
//                     }

//                     // Insert lineup card
//                     await tx.insert(lineupCards).values({
//                         lineupId: lineup.id,
//                         cardId: cardId,
//                         position: i + 1
//                     });
//                 }

//                 return {
//                     success: true,
//                     message: 'Lineup submitted successfully',
//                     lineupId: lineup.id as UUIDv7
//                 };
//             });
//         } catch (error) {
//             console.error('Error with submitLineup ', error);
//             throw new DatabaseError('Failed to submit lineup');
//         }
//     }
// };
