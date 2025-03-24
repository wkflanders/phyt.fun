import { db, eq, and, gt, lt, competitions, runners, users, lineups, lineup_cards, cards } from '@phyt/database';
import { NotFoundError, DatabaseError } from '@phyt/types';

interface GetCompetitionsOptions {
    active?: boolean;
    type?: string;
}
export const competitionService = {
    getCompetitions: async (options: GetCompetitionsOptions = {}) => {
        try {
            let query = db.select().from(competitions);

            // Filter for active competitions
            if (options.active) {
                const now = new Date();
                query = query.where(
                    and(
                        lt(competitions.start_time, now),
                        gt(competitions.end_time, now)
                    )
                ) as typeof query;
            }

            // Filter by event type (e.g., "major")
            if (options.type) {
                query = query.where(eq(competitions.event_type, options.type)) as typeof query;
            }

            return await query.orderBy(competitions.start_time);
        } catch (error) {
            console.error('Error getting competitions:', error);
            throw new DatabaseError('Failed to get competitions');
        }
    },

    getCompetitionById: async (competitionId: number) => {
        try {
            const [competition] = await db
                .select()
                .from(competitions)
                .where(eq(competitions.id, competitionId))
                .limit(1);

            if (!competition) {
                throw new NotFoundError('Competition not found');
            }

            return competition;
        } catch (error) {
            console.error('Error getting competition by ID:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to get competition');
        }
    },

    submitLineup: async (competitionId: number, userId: number, cardIds: number[]) => {
        try {
            return await db.transaction(async (tx) => {
                // Ensure competition exists
                const [competition] = await tx
                    .select()
                    .from(competitions)
                    .where(eq(competitions.id, competitionId))
                    .limit(1);

                if (!competition) {
                    throw new NotFoundError('Competition not found');
                }

                // Ensure user exists
                const [user] = await tx
                    .select()
                    .from(users)
                    .where(eq(users.id, userId))
                    .limit(1);

                if (!user) {
                    throw new NotFoundError('User not found');
                }

                // Check if user has already submitted a lineup for this competition
                const existingLineup = await tx
                    .select()
                    .from(lineups)
                    .where(
                        and(
                            eq(lineups.competition_id, competitionId),
                            eq(lineups.manager_id, userId)
                        )
                    )
                    .limit(1);

                let lineup;
                if (existingLineup.length > 0) {
                    // Update existing lineup
                    lineup = existingLineup[0];

                    // First, delete existing lineup cards
                    await tx
                        .delete(lineup_cards)
                        .where(eq(lineup_cards.lineup_id, lineup.id));
                } else {
                    // Create new lineup
                    const [newLineup] = await tx
                        .insert(lineups)
                        .values({
                            competition_id: competitionId,
                            manager_id: userId
                        })
                        .returning();

                    lineup = newLineup;
                }

                // Verify card ownership and insert lineup cards
                for (let i = 0; i < cardIds.length; i++) {
                    const cardId = cardIds[i];

                    // Check card ownership
                    const [card] = await tx
                        .select()
                        .from(cards)
                        .where(
                            and(
                                eq(cards.id, cardId),
                                eq(cards.owner_id, userId)
                            )
                        )
                        .limit(1);

                    if (!card) {
                        throw new Error(`Card ${cardId} not owned by user or does not exist`);
                    }

                    // Insert lineup card
                    await tx
                        .insert(lineup_cards)
                        .values({
                            lineup_id: lineup.id,
                            card_id: cardId,
                            position: i + 1
                        });
                }

                return {
                    success: true,
                    message: 'Lineup submitted successfully',
                    lineup_id: lineup.id
                };
            });
        } catch (error) {
            console.error('Error submitting lineup:', error);
            if (error instanceof NotFoundError) throw error;
            throw new DatabaseError('Failed to submit lineup');
        }
    }
};