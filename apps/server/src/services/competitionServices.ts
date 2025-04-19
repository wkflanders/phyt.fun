import {
    db,
    eq,
    and,
    gt,
    lt,
    competitions,
    users,
    lineups,
    lineup_cards,
    cards
} from '@phyt/database';
import {
    NotFoundError,
    Competition,
    HttpError,
    LineupSubmissionResponse
} from '@phyt/types';

interface GetCompetitionsOptions {
    active?: boolean;
    type?: string;
}

export const competitionService = {
    getCompetitions: async (
        options: GetCompetitionsOptions = {}
    ): Promise<Competition[]> => {
        try {
            const now = new Date();
            const conditions = [];

            if (options.active) {
                conditions.push(
                    and(
                        lt(competitions.start_time, now),
                        gt(competitions.end_time, now)
                    )
                );
            }

            if (options.type) {
                conditions.push(eq(competitions.event_type, options.type));
            }

            let results;
            if (conditions.length > 0) {
                results = await db
                    .select()
                    .from(competitions)
                    .where(and(...conditions))
                    .orderBy(competitions.start_time);
            } else {
                results = await db
                    .select()
                    .from(competitions)
                    .orderBy(competitions.start_time);
            }

            return results.map((result) => ({
                ...result,
                start_time: new Date(result.start_time).toISOString(),
                end_time: new Date(result.end_time).toISOString(),
                updated_at: new Date(result.updated_at),
                created_at: new Date(result.created_at),
                jackpot: result.jackpot ?? '0'
            }));
        } catch (error) {
            console.error('Error with getCompetitions ', error);
            throw new HttpError('Failed to get competitions');
        }
    },

    getCompetitionById: async (competitionId: number): Promise<Competition> => {
        try {
            const competitionResults = await db
                .select()
                .from(competitions)
                .where(eq(competitions.id, competitionId))
                .limit(1);

            if (competitionResults.length === 0) {
                throw new NotFoundError('Competition not found');
            }

            const competition = competitionResults[0];

            return {
                ...competition,
                start_time: new Date(competition.start_time).toISOString(),
                end_time: new Date(competition.end_time).toISOString(),
                updated_at: new Date(competition.updated_at),
                created_at: new Date(competition.created_at),
                jackpot: competition.jackpot ?? '0'
            };
        } catch (error) {
            console.error('Error with getCompetitionById ', error);
            throw new HttpError('Failed to get competition');
        }
    },

    submitLineup: async (
        competitionId: number,
        userId: number,
        cardIds: number[]
    ): Promise<LineupSubmissionResponse> => {
        try {
            return await db.transaction(async (tx) => {
                // Ensure competition exists
                const compeitionResults = await tx
                    .select()
                    .from(competitions)
                    .where(eq(competitions.id, competitionId))
                    .limit(1);

                if (compeitionResults.length === 0) {
                    throw new NotFoundError('Competition not found');
                }

                // Ensure user exists
                const userResults = await tx
                    .select()
                    .from(users)
                    .where(eq(users.id, userId))
                    .limit(1);

                if (userResults.length === 0) {
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
                    const cardResults = await tx
                        .select()
                        .from(cards)
                        .where(
                            and(
                                eq(cards.id, cardId),
                                eq(cards.owner_id, userId)
                            )
                        )
                        .limit(1);

                    if (cardResults.length === 0) {
                        throw new NotFoundError(
                            `Card ${String(cardId)} not owned by user or does not exist`
                        );
                    }

                    // Insert lineup card
                    await tx.insert(lineup_cards).values({
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
            console.error('Error with submitLineup ', error);
            throw new HttpError('Failed to submit lineup');
        }
    }
};
