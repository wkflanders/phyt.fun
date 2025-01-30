import { db } from './drizzle';
import {
    users, runners, runs, cards, card_metadata, competitions, lineups, lineup_cards,
    runner_results, gambler_results, pack_purchases, listings, transactions,
} from './schema';
import { faker } from '@faker-js/faker';

async function seed() {
    console.log('🌱 Starting database seeding...');

    // Create users with different roles
    const userIds: number[] = [];
    const runnerUserIds: number[] = [];

    console.log('Creating users...');
    for (let i = 0; i < 50; i++) {
        const role = i < 2 ? 'admin' : i < 15 ? 'runner' : 'user';
        const userInsert = {
            email: faker.internet.email(),
            username: faker.internet.userName(),
            role: role,
            wallet_address: faker.string.hexadecimal({ length: 40, prefix: '0x' }),
            privy_id: faker.string.uuid(),
            avatar_url: faker.image.avatar()
        };

        const [user] = await db.insert(users).values(userInsert).returning();
        userIds.push(user.id);
        if (role === 'runner') {
            runnerUserIds.push(user.id);
        }
    }

    // Create runner profiles for runner users
    console.log('Creating runner profiles...');
    const runnerIds: number[] = [];
    for (const userId of runnerUserIds) {
        const runnerInsert = {
            user_id: userId,
            average_pace: faker.number.float({ min: 240, max: 600 }),
            total_distance_m: faker.number.float({ min: 1000, max: 100000 }),
            total_runs: faker.number.int({ min: 5, max: 50 }),
            best_mile_time: faker.number.float({ min: 240, max: 480 })
        };

        const [runner] = await db.insert(runners).values(runnerInsert).returning();
        runnerIds.push(runner.id);
    }

    // Create running sessions for runners
    console.log('Creating running sessions...');
    const runIds: number[] = [];
    for (const runnerId of runnerIds) {
        const numRuns = faker.number.int({ min: 3, max: 10 });
        for (let i = 0; i < numRuns; i++) {
            const duration = faker.number.int({ min: 900, max: 3600 });
            const distance = faker.number.int({ min: 2000, max: 10000 });
            const runInsert = {
                runner_id: runnerId,
                start_time: faker.date.past(),
                end_time: faker.date.past(),
                duration_seconds: duration,
                distance_m: distance,
                average_pace_sec: duration / (distance / 1000),
                calories_burned: faker.number.int({ min: 100, max: 800 }),
                step_count: faker.number.int({ min: 2000, max: 10000 }),
                elevation_gain_m: faker.number.float({ min: 0, max: 200 }),
                average_heart_rate: faker.number.int({ min: 120, max: 180 }),
                max_heart_rate: faker.number.int({ min: 160, max: 200 }),
                verification_status: faker.helpers.arrayElement(['pending', 'verified', 'flagged'])
            };

            const [run] = await db.insert(runs).values(runInsert).returning();
            runIds.push(run.id);
        }
    }

    // Create pack purchases
    console.log('Creating pack purchases...');
    const packPurchaseIds: number[] = [];
    for (let i = 0; i < 30; i++) {
        const purchaseInsert = {
            buyer_id: faker.helpers.arrayElement(userIds),
            purchase_price: faker.number.float({ min: 10, max: 100 })
        };

        const [purchase] = await db.insert(pack_purchases).values(purchaseInsert).returning();
        packPurchaseIds.push(purchase.id);
    }

    // Create cards and their metadata
    console.log('Creating cards and metadata...');
    const cardIds: number[] = [];
    for (let i = 0; i < 100; i++) {
        const cardInsert = {
            owner_id: faker.helpers.arrayElement(userIds),
            pack_purchase_id: faker.helpers.arrayElement(packPurchaseIds),
            acquisition_type: faker.helpers.arrayElement(['mint', 'transfer', 'marketplace']),
            is_burned: faker.datatype.boolean({ probability: 0.1 })
        };

        const [card] = await db.insert(cards).values(cardInsert).returning();

        const metadataInsert = {
            token_id: card.id,
            runner_id: faker.helpers.arrayElement(runnerIds),
            runner_name: faker.person.fullName(),
            rarity: faker.helpers.arrayElement(['bronze', 'silver', 'gold', 'sapphire', 'ruby', 'opal']),
            multiplier: faker.number.float({ min: 1, max: 3 }),
            image_url: faker.image.url()
        };

        await db.insert(card_metadata).values(metadataInsert);
        cardIds.push(card.id);
    }

    // Create competitions
    console.log('Creating competitions...');
    const competitionIds: number[] = [];
    for (let i = 0; i < 10; i++) {
        const startTime = faker.date.future();
        const competitionInsert = {
            event_name: "Marathon Qualifier",
            start_time: startTime, // ✔ Pass the actual Date
            end_time: new Date(startTime.getTime() + 24 * 60 * 60 * 1000),
            distance_m: faker.helpers.arrayElement([5000, 10000, 21097, 42195]),
            event_type: faker.helpers.arrayElement(['race', 'time_trial', 'challenge'])
        };

        const [competition] = await db.insert(competitions).values(competitionInsert).returning();
        competitionIds.push(competition.id);
    }

    // Create lineups and lineup cards
    console.log('Creating lineups...');
    const lineupIds: number[] = [];
    for (const competitionId of competitionIds) {
        for (let i = 0; i < faker.number.int({ min: 5, max: 15 }); i++) {
            const lineupInsert = {
                competition_id: competitionId,
                gambler_id: faker.helpers.arrayElement(userIds)
            };

            const [lineup] = await db.insert(lineups).values(lineupInsert).returning();

            // Add 3-5 cards to each lineup
            const numCards = faker.number.int({ min: 3, max: 5 });
            for (let pos = 0; pos < numCards; pos++) {
                const lineupCardInsert = {
                    lineup_id: lineup.id,
                    card_id: faker.helpers.arrayElement(cardIds),
                    position: pos + 1
                };

                await db.insert(lineup_cards).values(lineupCardInsert);
            }

            lineupIds.push(lineup.id);
        }
    }

    // Create runner results
    console.log('Creating runner results...');
    for (const competitionId of competitionIds) {
        const participants = faker.helpers.arrayElements(runnerIds, faker.number.int({ min: 5, max: 15 }));
        let ranking = 1;

        for (const runnerId of participants) {
            const resultInsert = {
                competition_id: competitionId,
                runner_id: runnerId,
                session_id: faker.helpers.arrayElement(runIds),
                best_time_sec: faker.number.float({ min: 1200, max: 3600 }),
                ranking: ranking++
            };

            await db.insert(runner_results).values(resultInsert);
        }
    }

    // Create gambler results
    console.log('Creating gambler results...');
    for (const lineupId of lineupIds) {
        const gamblerResultInsert = {
            lineup_id: lineupId,
            total_score: faker.number.float({ min: 0, max: 1000 }),
            final_placement: faker.number.int({ min: 1, max: 100 }),
            reward_amount_p_h_y_t: faker.number.float({ min: 0, max: 1000 })
        };

        await db.insert(gambler_results).values(gamblerResultInsert);
    }

    // Create marketplace listings
    console.log('Creating marketplace listings...');
    for (let i = 0; i < 20; i++) {
        const listingInsert = {
            card_id: faker.helpers.arrayElement(cardIds),
            seller_id: faker.helpers.arrayElement(userIds),
            listed_price: faker.number.float({ min: 10, max: 1000 }),
            is_active: faker.datatype.boolean({ probability: 0.8 })
        };

        await db.insert(listings).values(listingInsert);
    }

    // Create transactions
    console.log('Creating transactions...');
    for (let i = 0; i < 50; i++) {
        const transactionInsert = {
            from_user_id: faker.helpers.arrayElement(userIds),
            to_user_id: faker.helpers.arrayElement(userIds),
            card_id: faker.helpers.arrayElement(cardIds),
            competition_id: faker.helpers.arrayElement(competitionIds),
            token_amount: faker.number.float({ min: 1, max: 1000 }),
            transaction_type: faker.helpers.arrayElement(['packPurchase', 'marketplaceSale', 'rewardPayout'])
        };

        await db.insert(transactions).values(transactionInsert);
    }

    console.log('✅ Database seeding completed!');
}

// Execute the seed function
seed().catch(console.error);