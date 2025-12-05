/**
 * Seed script populating the dev SQLite database with demo data that satisfies
 * (30 users, 120 transactions, 30 events, 30 promotions).
 *
 * Run once with: `cd backend && node prisma/seed.js`
 */

import bcrypt from 'bcrypt';
import prisma from '../src/db.js';

const PASSWORD = process.env.SEED_PASSWORD || 'DevStrongPass!';

const dayFromNow = (offset) => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
};

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => Math.random() * (max - min) + min;

async function resetDatabase() {
    console.log('Clearing existing data …');
    await prisma.transaction.deleteMany();
    await prisma.eventGuest.deleteMany();
    await prisma.eventOrganizer.deleteMany();
    await prisma.event.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.user.deleteMany();
}

async function seedUsers() {
    console.log('Creating 30 demo users …');
    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const seeds = [
        // Staff (1 superuser, 2 managers, 3 cashiers)
        { utorid: 'superman', role: 'superuser', name: 'Super Man', email: 'superman@utoronto.ca', points: 5000, verified: true },
        { utorid: 'gandalf01', role: 'manager', name: 'Gandalf the Grey', email: 'gandalf01@utoronto.ca', points: 3500, verified: true },
        { utorid: 'yoda1234', role: 'manager', name: 'Master Yoda', email: 'yoda1234@utoronto.ca', points: 3200, verified: true },
        { utorid: 'hermione', role: 'cashier', name: 'Hermione Granger', email: 'hermione@utoronto.ca', points: 2800, verified: true },
        { utorid: 'katniss1', role: 'cashier', name: 'Katniss Everdeen', email: 'katniss1@utoronto.ca', points: 2600, verified: true },
        { utorid: 'frodo123', role: 'cashier', name: 'Frodo Baggins', email: 'frodo123@utoronto.ca', points: 2400, verified: true },
        
        // Event Organizers (regular users who organize events)
        { utorid: 'harrypot', role: 'regular', name: 'Harry Potter', email: 'harrypot@utoronto.ca', points: 1800, verified: true },
        { utorid: 'luke1234', role: 'regular', name: 'Luke Skywalker', email: 'luke1234@utoronto.ca', points: 1650, verified: true },
        { utorid: 'elrond01', role: 'regular', name: 'Elrond Half-elven', email: 'elrond01@utoronto.ca', points: 1500, verified: true },
        { utorid: 'tonystar', role: 'regular', name: 'Tony Stark', email: 'tonystar@utoronto.ca', points: 1400, verified: true },
        
        // Regular users with fun names
        { utorid: 'neville1', role: 'regular', name: 'Neville Longbottom', email: 'neville1@utoronto.ca', points: 1200, verified: true },
        { utorid: 'luna1234', role: 'regular', name: 'Luna Lovegood', email: 'luna1234@utoronto.ca', points: 1150, verified: true },
        { utorid: 'ron12345', role: 'regular', name: 'Ron Weasley', email: 'ron12345@utoronto.ca', points: 1100, verified: true },
        { utorid: 'gimli123', role: 'regular', name: 'Gimli Son of Glóin', email: 'gimli123@utoronto.ca', points: 1050, verified: true },
        { utorid: 'legolas1', role: 'regular', name: 'Legolas Greenleaf', email: 'legolas1@utoronto.ca', points: 1000, verified: true },
        { utorid: 'aragorn1', role: 'regular', name: 'Aragorn Elessar', email: 'aragorn1@utoronto.ca', points: 950, verified: true },
        { utorid: 'peeta123', role: 'regular', name: 'Peeta Mellark', email: 'peeta123@utoronto.ca', points: 900, verified: true },
        { utorid: 'gale1234', role: 'regular', name: 'Gale Hawthorne', email: 'gale1234@utoronto.ca', points: 850, verified: true },
        { utorid: 'primrose', role: 'regular', name: 'Primrose Everdeen', email: 'primrose@utoronto.ca', points: 800, verified: true },
        { utorid: 'anakin01', role: 'regular', name: 'Anakin Skywalker', email: 'anakin01@utoronto.ca', points: 750, verified: true },
        { utorid: 'padme123', role: 'regular', name: 'Padmé Amidala', email: 'padme123@utoronto.ca', points: 700, verified: true },
        { utorid: 'obiwan01', role: 'regular', name: 'Obi-Wan Kenobi', email: 'obiwan01@utoronto.ca', points: 650, verified: true },
        { utorid: 'leia1234', role: 'regular', name: 'Princess Leia', email: 'leia1234@utoronto.ca', points: 600, verified: true },
        { utorid: 'han12345', role: 'regular', name: 'Han Solo', email: 'han12345@utoronto.ca', points: 550, verified: true },
        { utorid: 'chewie01', role: 'regular', name: 'Chewbacca', email: 'chewie01@utoronto.ca', points: 500, verified: true },
        { utorid: 'spock123', role: 'regular', name: 'Spock', email: 'spock123@utoronto.ca', points: 450, verified: true },
        { utorid: 'kirk1234', role: 'regular', name: 'James T. Kirk', email: 'kirk1234@utoronto.ca', points: 400, verified: true },
        { utorid: 'picard01', role: 'regular', name: 'Jean-Luc Picard', email: 'picard01@utoronto.ca', points: 350, verified: true },
        { utorid: 'suspicious', role: 'regular', name: 'Severus Snape', email: 'suspicious@utoronto.ca', points: 300, verified: true, suspicious: true },
        { utorid: 'newbie01', role: 'regular', name: 'Newt Scamander', email: 'newbie01@utoronto.ca', points: 150, verified: false },
    ];

    const map = {};
    for (const seed of seeds) {
        map[seed.utorid] = await prisma.user.create({
            data: {
                utorid: seed.utorid,
                email: seed.email,
                name: seed.name,
                passwordHash,
                role: seed.role,
                verified: seed.verified ?? true,
                suspicious: seed.suspicious ?? false,
                points: seed.points,
                lastLogin: new Date(),
            },
        });
    }
    return map;
}

async function seedPromotions() {
    console.log('Creating 30 promotions …');
    const promos = [
        // Harry Potter themed
        {
            name: 'Hogwarts Anniversary Sale',
            description: 'Celebrate 25 years of magic! Earn 25% bonus points on all purchases over $30. Perfect for stocking up on magical supplies.',
            type: 'automatic',
            startTime: dayFromNow(-30),
            endTime: dayFromNow(60),
            minSpending: 30,
            rate: 0.25,
        },
        {
            name: 'Golden Snitch One-Time Bonus',
            description: 'Catch this limited-time offer! Redeem once for 500 bonus points when you spend $75 or more. Only available during Quidditch season!',
            type: 'onetime',
            startTime: dayFromNow(-20),
            endTime: dayFromNow(40),
            minSpending: 75,
            points: 500,
        },
        {
            name: 'Butterbeer Weekend Special',
            description: 'Double points on all weekend purchases! Whether you\'re buying textbooks or snacks, get 2x points every Saturday and Sunday.',
            type: 'automatic',
            startTime: dayFromNow(-10),
            endTime: dayFromNow(50),
            minSpending: 0,
            rate: 1.0,
        },
        
        // Disney themed
        {
            name: 'Disney World Tour Celebration',
            description: 'Experience the magic! 30% extra points on purchases over $50. Bring the Disney magic to campus with every purchase.',
            type: 'automatic',
            startTime: dayFromNow(-25),
            endTime: dayFromNow(65),
            minSpending: 50,
            rate: 0.3,
        },
        {
            name: 'Mickey Mouse Birthday Bash',
            description: 'One-time 300 point bonus when spending $60+. Celebrate Mickey\'s birthday with extra rewards!',
            type: 'onetime',
            startTime: dayFromNow(-15),
            endTime: dayFromNow(45),
            minSpending: 60,
            points: 300,
        },
        {
            name: 'Frozen Winter Wonderland',
            description: 'Let it go and earn 20% bonus points! Perfect for winter shopping. Valid on all purchases over $25.',
            type: 'automatic',
            startTime: dayFromNow(-5),
            endTime: dayFromNow(55),
            minSpending: 25,
            rate: 0.2,
        },
        
        // Star Wars themed
        {
            name: 'May the 4th Be With You',
            description: 'May the Force be with your points! 40% bonus on Star Wars Day purchases. Use the Force for extra rewards!',
            type: 'automatic',
            startTime: dayFromNow(-40),
            endTime: dayFromNow(20),
            minSpending: 20,
            rate: 0.4,
        },
        {
            name: 'Death Star Destroyer Bonus',
            description: 'One-time massive 750 point bonus when spending $100+. That\'s no moon, that\'s a promotion!',
            type: 'onetime',
            startTime: dayFromNow(-30),
            endTime: dayFromNow(30),
            minSpending: 100,
            points: 750,
        },
        {
            name: 'Jedi Master Rewards',
            description: 'Train like a Jedi! Earn 15% bonus points on all purchases. The Force is strong with this one.',
            type: 'automatic',
            startTime: dayFromNow(-20),
            endTime: dayFromNow(70),
            minSpending: 15,
            rate: 0.15,
        },
        
        // Marvel themed
        {
            name: 'Avengers Assemble Bonus',
            description: 'Assemble your points! 35% extra points on purchases over $45. Together we earn more!',
            type: 'automatic',
            startTime: dayFromNow(-18),
            endTime: dayFromNow(62),
            minSpending: 45,
            rate: 0.35,
        },
        {
            name: 'Infinity Gauntlet Power-Up',
            description: 'Snap your way to 600 bonus points! One-time redemption when spending $90+. With all six stones, anything is possible!',
            type: 'onetime',
            startTime: dayFromNow(-12),
            endTime: dayFromNow(48),
            minSpending: 90,
            points: 600,
        },
        {
            name: 'Iron Man Tech Upgrade',
            description: 'Upgrade your points like Tony Stark! 25% bonus on tech purchases over $35. Because we\'re geniuses.',
            type: 'automatic',
            startTime: dayFromNow(-8),
            endTime: dayFromNow(52),
            minSpending: 35,
            rate: 0.25,
        },
        
        // Gaming themed
        {
            name: 'E3 Gaming Expo Special',
            description: 'Level up your points! 30% bonus on all gaming-related purchases. Perfect for gamers and collectors.',
            type: 'automatic',
            startTime: dayFromNow(-22),
            endTime: dayFromNow(58),
            minSpending: 30,
            rate: 0.3,
        },
        {
            name: 'Achievement Unlocked Bonus',
            description: 'Unlock this achievement! One-time 400 point bonus when spending $70+. You\'ve earned it!',
            type: 'onetime',
            startTime: dayFromNow(-14),
            endTime: dayFromNow(46),
            minSpending: 70,
            points: 400,
        },
        {
            name: 'Nintendo Switch Celebration',
            description: 'It\'s a-me, Mario! 20% bonus points on all purchases. Perfect for Nintendo fans!',
            type: 'automatic',
            startTime: dayFromNow(-6),
            endTime: dayFromNow(54),
            minSpending: 20,
            rate: 0.2,
        },
        
        // Music themed
        {
            name: 'Coachella Campus Edition',
            description: 'Feel the rhythm! 25% bonus points on music and entertainment purchases. Dance your way to more points!',
            type: 'automatic',
            startTime: dayFromNow(-28),
            endTime: dayFromNow(32),
            minSpending: 25,
            rate: 0.25,
        },
        {
            name: 'Rock Concert VIP Pass',
            description: 'VIP treatment! One-time 350 point bonus when spending $65+. Rock on with extra rewards!',
            type: 'onetime',
            startTime: dayFromNow(-16),
            endTime: dayFromNow(44),
            minSpending: 65,
            points: 350,
        },
        {
            name: 'Jazz Night Special',
            description: 'Smooth jazz, smooth rewards! 18% bonus points on evening purchases. Perfect for night owls.',
            type: 'automatic',
            startTime: dayFromNow(-4),
            endTime: dayFromNow(56),
            minSpending: 18,
            rate: 0.18,
        },
        
        // Movie themed
        {
            name: 'Oscar Night Extravaganza',
            description: 'And the award goes to... you! 30% bonus points on purchases over $40. Celebrate cinema!',
            type: 'automatic',
            startTime: dayFromNow(-24),
            endTime: dayFromNow(36),
            minSpending: 40,
            rate: 0.3,
        },
        {
            name: 'Blockbuster Movie Night',
            description: 'One-time 450 point bonus when spending $80+. Popcorn and points, the perfect combo!',
            type: 'onetime',
            startTime: dayFromNow(-11),
            endTime: dayFromNow(49),
            minSpending: 80,
            points: 450,
        },
        {
            name: 'Film Festival Special',
            description: 'Lights, camera, points! 22% bonus on all purchases. Show your love for cinema!',
            type: 'automatic',
            startTime: dayFromNow(-7),
            endTime: dayFromNow(53),
            minSpending: 22,
            rate: 0.22,
        },
        
        // Alien vs Predator themed
        {
            name: 'Alien vs Predator Showdown',
            description: 'The ultimate battle bonus! 40% extra points on purchases over $55. Only the strongest survive!',
            type: 'automatic',
            startTime: dayFromNow(-19),
            endTime: dayFromNow(41),
            minSpending: 55,
            rate: 0.4,
        },
        {
            name: 'Xenomorph Invasion Bonus',
            description: 'Survive the invasion! One-time 550 point bonus when spending $85+. Face your fears and earn!',
            type: 'onetime',
            startTime: dayFromNow(-13),
            endTime: dayFromNow(47),
            minSpending: 85,
            points: 550,
        },
        {
            name: 'Predator Trophy Hunt',
            description: 'Hunt for points! 28% bonus on all purchases. The hunt is on!',
            type: 'automatic',
            startTime: dayFromNow(-9),
            endTime: dayFromNow(51),
            minSpending: 28,
            rate: 0.28,
        },
        
        // General campus promotions
        {
            name: 'Midterm Study Boost',
            description: 'Study hard, earn harder! 20% bonus points during midterm season. Fuel your brain and your points!',
            type: 'automatic',
            startTime: dayFromNow(-3),
            endTime: dayFromNow(57),
            minSpending: 20,
            rate: 0.2,
        },
        {
            name: 'Final Exam Power-Up',
            description: 'One-time 500 point bonus when spending $95+. Ace your exams and your rewards!',
            type: 'onetime',
            startTime: dayFromNow(-1),
            endTime: dayFromNow(59),
            minSpending: 95,
            points: 500,
        },
        {
            name: 'Welcome Week Special',
            description: 'Welcome to campus! 15% bonus points for new students. Start your journey with extra rewards!',
            type: 'automatic',
            startTime: dayFromNow(-35),
            endTime: dayFromNow(25),
            minSpending: 15,
            rate: 0.15,
        },
        {
            name: 'Graduation Celebration',
            description: 'Celebrate your achievement! 35% bonus points on purchases over $50. Congratulations, grad!',
            type: 'automatic',
            startTime: dayFromNow(-26),
            endTime: dayFromNow(34),
            minSpending: 50,
            rate: 0.35,
        },
        {
            name: 'Holiday Season Cheer',
            description: 'Spread the cheer! One-time 400 point bonus when spending $75+. Happy holidays!',
            type: 'onetime',
            startTime: dayFromNow(-17),
            endTime: dayFromNow(43),
            minSpending: 75,
            points: 400,
        },
    ];
    
    const records = [];
    for (const promo of promos) {
        records.push(await prisma.promotion.create({ data: promo }));
    }
    return records;
}

// Location to coordinates mapping for University of Toronto
const locationCoordinates = {
    'Hart House Great Hall': { lat: 43.6640136, lng: -79.3943321 },
    'Hart House Quad': { lat: 43.6640136, lng: -79.3943321 },
    'Hart House': { lat: 43.6640136, lng: -79.3943321 },
    'Hart House Music Room': { lat: 43.6640136, lng: -79.3943321 },
    'Back Campus Fields': { lat: 43.6638836, lng: -79.3963567 },
    'Innis Town Hall': { lat: 43.6655722, lng: -79.3995847 },
    'Innis Cafe': { lat: 43.6655368, lng: -79.3997895 },
    'Bahen Centre VR Lab': { lat: 43.6598045, lng: -79.397298 },
    'Bahen Centre Atrium': { lat: 43.6598045, lng: -79.397298 },
    'Bahen Centre': { lat: 43.6598045, lng: -79.397298 },
    'Sid Smith Commons': { lat: 43.6640627, lng: -79.4000079 },
    'Robarts Commons': { lat: 43.6640627, lng: -79.4000079 },
    'Robarts Library': { lat: 43.664486, lng: -79.39969 },
    'Athletic Centre Studio': { lat: 43.6607349, lng: -79.3966122 },
    'Myhal Centre': { lat: 43.6607349, lng: -79.3966122 },
    'Convocation Hall': { lat: 43.6609085, lng: -79.3952327 },
    'Campus-wide': { lat: 43.6532, lng: -79.3832 }, // University of Toronto main
};

function getCoordinatesForLocation(location) {
    return locationCoordinates[location] || null;
}

async function seedEvents(userMap) {
    console.log('Creating 30 events …');
    const events = [
        // Harry Potter events
        {
            key: 'hogwarts-gala',
            name: 'Hogwarts Grand Gala',
            description: 'Join us for an enchanting evening celebrating 25 years of Harry Potter! Featuring live music, magical performances, and special guest appearances. Dress in your house colors!',
            location: 'Hart House Great Hall',
            startTime: dayFromNow(5),
            endTime: dayFromNow(5.5),
            capacity: 200,
            pointsTotal: 3000,
            published: true,
            organizers: ['harrypot', 'hermione'],
            guests: ['neville1', 'luna1234', 'ron12345', 'gimli123', 'legolas1'],
            awards: [
                { utorid: 'neville1', amount: 50, remark: 'Helped organize the Herbology display' },
                { utorid: 'luna1234', amount: 45, remark: 'Contributed to the Quibbler exhibit' },
            ],
        },
        {
            key: 'quidditch-tournament',
            name: 'Campus Quidditch Tournament',
            description: 'Watch the most exciting sport in the wizarding world! Teams compete for the Quidditch Cup. Food and drinks available. Points awarded for participation!',
            location: 'Back Campus Fields',
            startTime: dayFromNow(12),
            endTime: dayFromNow(13),
            capacity: 500,
            pointsTotal: 5000,
            published: true,
            organizers: ['harrypot'],
            guests: ['ron12345', 'gimli123', 'legolas1', 'aragorn1', 'peeta123', 'gale1234'],
            awards: [
                { utorid: 'ron12345', amount: 60, remark: 'Team captain and MVP' },
                { utorid: 'gimli123', amount: 40, remark: 'Excellent beater performance' },
            ],
        },
        {
            key: 'potter-movie-night',
            name: 'Harry Potter Movie Marathon',
            description: 'Watch all 8 Harry Potter films back-to-back! Snacks, butterbeer, and magical atmosphere included. Perfect for Potterheads!',
            location: 'Innis Town Hall',
            startTime: dayFromNow(8),
            endTime: dayFromNow(11),
            capacity: 150,
            pointsTotal: 2000,
            published: true,
            organizers: ['harrypot', 'luna1234'],
            guests: ['neville1', 'ron12345', 'gimli123', 'legolas1'],
            awards: [],
        },
        
        // Disney events
        {
            key: 'disney-world-tour',
            name: 'Disney World Virtual Tour',
            description: 'Experience the magic of Disney World from campus! Virtual reality tour of all four theme parks, Disney trivia, and exclusive merchandise.',
            location: 'Bahen Centre VR Lab',
            startTime: dayFromNow(15),
            endTime: dayFromNow(16),
            capacity: 80,
            pointsTotal: 1500,
            published: true,
            organizers: ['tonystar'],
            guests: ['primrose', 'anakin01', 'padme123', 'obiwan01'],
            awards: [
                { utorid: 'primrose', amount: 35, remark: 'Won Disney trivia contest' },
            ],
        },
        {
            key: 'frozen-singalong',
            name: 'Frozen Sing-Along Night',
            description: 'Let it go! Join us for a magical evening singing along to Frozen songs. Costumes encouraged! Hot chocolate and treats provided.',
            location: 'Sid Smith Commons',
            startTime: dayFromNow(20),
            endTime: dayFromNow(20.5),
            capacity: 120,
            pointsTotal: 1800,
            published: true,
            organizers: ['tonystar'],
            guests: ['leia1234', 'han12345', 'chewie01', 'spock123'],
            awards: [],
        },
        {
            key: 'mickey-birthday',
            name: 'Mickey Mouse Birthday Bash',
            description: 'Celebrate Mickey\'s birthday with cake, games, and Disney magic! Special appearance by Mickey and friends. Fun for all ages!',
            location: 'Robarts Commons',
            startTime: dayFromNow(25),
            endTime: dayFromNow(25.5),
            capacity: 200,
            pointsTotal: 2500,
            published: true,
            organizers: ['tonystar', 'hermione'],
            guests: ['kirk1234', 'picard01', 'suspicious', 'newbie01'],
            awards: [
                { utorid: 'kirk1234', amount: 40, remark: 'Best costume contest winner' },
            ],
        },
        
        // Star Wars events
        {
            key: 'star-wars-day',
            name: 'May the 4th Be With You Celebration',
            description: 'May the Force be with you! Celebrate Star Wars Day with cosplay, lightsaber duels, trivia, and exclusive merchandise. Join the Rebel Alliance!',
            location: 'Hart House Quad',
            startTime: dayFromNow(3),
            endTime: dayFromNow(4),
            capacity: 300,
            pointsTotal: 4000,
            published: true,
            organizers: ['luke1234', 'yoda1234'],
            guests: ['anakin01', 'padme123', 'obiwan01', 'leia1234', 'han12345', 'chewie01'],
            awards: [
                { utorid: 'anakin01', amount: 55, remark: 'Won lightsaber duel tournament' },
                { utorid: 'leia1234', amount: 45, remark: 'Best Princess Leia cosplay' },
            ],
        },
        {
            key: 'jedi-training',
            name: 'Jedi Training Academy',
            description: 'Learn the ways of the Force! Interactive lightsaber training, meditation sessions, and Jedi philosophy discussions. May the Force be with you!',
            location: 'Athletic Centre Studio',
            startTime: dayFromNow(18),
            endTime: dayFromNow(19),
            capacity: 60,
            pointsTotal: 1200,
            published: true,
            organizers: ['luke1234', 'yoda1234'],
            guests: ['obiwan01', 'anakin01', 'padme123'],
            awards: [
                { utorid: 'obiwan01', amount: 50, remark: 'Mastered advanced lightsaber forms' },
            ],
        },
        {
            key: 'death-star-destruction',
            name: 'Death Star Destruction Party',
            description: 'Celebrate the destruction of the Death Star! Watch the original trilogy, play Star Wars games, and enjoy themed snacks. Rebel scum welcome!',
            location: 'Innis Cafe',
            startTime: dayFromNow(22),
            endTime: dayFromNow(23),
            capacity: 100,
            pointsTotal: 1500,
            published: true,
            organizers: ['luke1234'],
            guests: ['han12345', 'chewie01', 'leia1234'],
            awards: [],
        },
        
        // Marvel events
        {
            key: 'avengers-assemble',
            name: 'Avengers Assemble: Movie Night',
            description: 'Assemble for an epic movie night! Watch all Avengers films, participate in trivia, and win exclusive Marvel merchandise. Infinity stones not included!',
            location: 'Bahen Centre Atrium',
            startTime: dayFromNow(10),
            endTime: dayFromNow(12),
            capacity: 250,
            pointsTotal: 3500,
            published: true,
            organizers: ['tonystar', 'gandalf01'],
            guests: ['spock123', 'kirk1234', 'picard01', 'suspicious', 'newbie01'],
            awards: [
                { utorid: 'spock123', amount: 50, remark: 'Won Marvel trivia championship' },
            ],
        },
        {
            key: 'iron-man-expo',
            name: 'Iron Man Tech Expo',
            description: 'Explore cutting-edge technology inspired by Tony Stark! VR demonstrations, robotics showcase, and innovation talks. Suit up!',
            location: 'Myhal Centre',
            startTime: dayFromNow(28),
            endTime: dayFromNow(29),
            capacity: 180,
            pointsTotal: 2800,
            published: true,
            organizers: ['tonystar'],
            guests: ['anakin01', 'padme123', 'obiwan01', 'leia1234'],
            awards: [
                { utorid: 'anakin01', amount: 45, remark: 'Best tech innovation presentation' },
            ],
        },
        {
            key: 'spider-man-screening',
            name: 'Spider-Man: No Way Home Screening',
            description: 'Watch the latest Spider-Man film on the big screen! Free popcorn, drinks, and Spider-Man themed activities. Great power, great responsibility!',
            location: 'Innis Town Hall',
            startTime: dayFromNow(14),
            endTime: dayFromNow(16),
            capacity: 200,
            pointsTotal: 3000,
            published: true,
            organizers: ['tonystar'],
            guests: ['han12345', 'chewie01', 'spock123', 'kirk1234'],
            awards: [],
        },
        
        // Gaming events
        {
            key: 'e3-gaming-expo',
            name: 'E3 Gaming Expo Campus Edition',
            description: 'Experience the biggest gaming event of the year! Play the latest games, meet developers, participate in tournaments, and win prizes. Game on!',
            location: 'Bahen Centre',
            startTime: dayFromNow(7),
            endTime: dayFromNow(9),
            capacity: 400,
            pointsTotal: 6000,
            published: true,
            organizers: ['elrond01'],
            guests: ['gimli123', 'legolas1', 'aragorn1', 'peeta123', 'gale1234', 'primrose'],
            awards: [
                { utorid: 'gimli123', amount: 60, remark: 'Won Super Smash Bros tournament' },
                { utorid: 'legolas1', amount: 55, remark: 'Champion in Mario Kart race' },
            ],
        },
        {
            key: 'nintendo-switch-party',
            name: 'Nintendo Switch Party',
            description: 'It\'s a-me, Mario! Play the latest Nintendo games, compete in tournaments, and enjoy themed snacks. Perfect for Nintendo fans!',
            location: 'Sid Smith Commons',
            startTime: dayFromNow(17),
            endTime: dayFromNow(18),
            capacity: 150,
            pointsTotal: 2200,
            published: true,
            organizers: ['elrond01'],
            guests: ['neville1', 'luna1234', 'ron12345'],
            awards: [
                { utorid: 'neville1', amount: 40, remark: 'Mario Kart champion' },
            ],
        },
        {
            key: 'retro-gaming-night',
            name: 'Retro Gaming Night',
            description: 'Travel back in time! Play classic arcade games, retro consoles, and relive gaming history. Pac-Man, Donkey Kong, and more!',
            location: 'Innis Cafe',
            startTime: dayFromNow(30),
            endTime: dayFromNow(31),
            capacity: 100,
            pointsTotal: 1500,
            published: true,
            organizers: ['elrond01'],
            guests: ['gimli123', 'legolas1', 'aragorn1'],
            awards: [],
        },
        
        // Music events
        {
            key: 'coachella-campus',
            name: 'Coachella Campus Edition',
            description: 'Feel the rhythm! Live music performances, food trucks, and festival vibes right on campus. Multiple stages and artists. Don\'t miss it!',
            location: 'Back Campus Fields',
            startTime: dayFromNow(11),
            endTime: dayFromNow(12),
            capacity: 500,
            pointsTotal: 5000,
            published: true,
            organizers: ['harrypot', 'luke1234'],
            guests: ['peeta123', 'gale1234', 'primrose', 'anakin01', 'padme123', 'obiwan01'],
            awards: [
                { utorid: 'peeta123', amount: 50, remark: 'Performed original song' },
            ],
        },
        {
            key: 'jazz-night',
            name: 'Smooth Jazz Night',
            description: 'Unwind with smooth jazz! Live performances, cozy atmosphere, and refreshments. Perfect for relaxing after a long week.',
            location: 'Hart House Music Room',
            startTime: dayFromNow(19),
            endTime: dayFromNow(20),
            capacity: 80,
            pointsTotal: 1200,
            published: true,
            organizers: ['luke1234'],
            guests: ['leia1234', 'han12345', 'chewie01'],
            awards: [],
        },
        {
            key: 'rock-concert',
            name: 'Campus Rock Concert',
            description: 'Rock out! Live bands, electric atmosphere, and high energy. Headbang your way to a great time!',
            location: 'Convocation Hall',
            startTime: dayFromNow(26),
            endTime: dayFromNow(27),
            capacity: 300,
            pointsTotal: 4000,
            published: true,
            organizers: ['harrypot'],
            guests: ['spock123', 'kirk1234', 'picard01', 'suspicious'],
            awards: [
                { utorid: 'spock123', amount: 45, remark: 'Guest performance on bass' },
            ],
        },
        
        // Movie events
        {
            key: 'oscar-night',
            name: 'Oscar Night Extravaganza',
            description: 'And the award goes to... you! Watch the Oscars live, red carpet experience, and vote for your favorites. Popcorn and glamour included!',
            location: 'Innis Town Hall',
            startTime: dayFromNow(6),
            endTime: dayFromNow(8),
            capacity: 200,
            pointsTotal: 3000,
            published: true,
            organizers: ['elrond01', 'tonystar'],
            guests: ['newbie01', 'suspicious', 'kirk1234', 'picard01'],
            awards: [
                { utorid: 'newbie01', amount: 35, remark: 'Best prediction pool winner' },
            ],
        },
        {
            key: 'film-festival',
            name: 'Campus Film Festival',
            description: 'Lights, camera, action! Screen student films, indie movies, and classics. Q&A sessions with filmmakers. Celebrate cinema!',
            location: 'Bahen Centre',
            startTime: dayFromNow(13),
            endTime: dayFromNow(15),
            capacity: 250,
            pointsTotal: 3500,
            published: true,
            organizers: ['elrond01'],
            guests: ['gale1234', 'primrose', 'anakin01', 'padme123'],
            awards: [
                { utorid: 'gale1234', amount: 50, remark: 'Best student film award' },
            ],
        },
        {
            key: 'blockbuster-night',
            name: 'Blockbuster Movie Night',
            description: 'Watch the latest blockbusters on the big screen! Free snacks, comfortable seating, and great company. Movie magic awaits!',
            location: 'Innis Town Hall',
            startTime: dayFromNow(21),
            endTime: dayFromNow(23),
            capacity: 150,
            pointsTotal: 2200,
            published: true,
            organizers: ['elrond01'],
            guests: ['obiwan01', 'leia1234', 'han12345'],
            awards: [],
        },
        
        // Alien vs Predator events
        {
            key: 'alien-vs-predator',
            name: 'Alien vs Predator Showdown',
            description: 'The ultimate battle! Watch the epic films, participate in themed activities, and see who wins. Only the strongest survive!',
            location: 'Bahen Centre Atrium',
            startTime: dayFromNow(16),
            endTime: dayFromNow(17),
            capacity: 180,
            pointsTotal: 2800,
            published: true,
            organizers: ['harrypot', 'luke1234'],
            guests: ['chewie01', 'spock123', 'kirk1234', 'picard01'],
            awards: [
                { utorid: 'chewie01', amount: 55, remark: 'Won survival challenge' },
            ],
        },
        {
            key: 'xenomorph-invasion',
            name: 'Xenomorph Invasion Experience',
            description: 'Face your fears! Immersive horror experience, escape room, and themed activities. Not for the faint of heart!',
            location: 'Robarts Commons',
            startTime: dayFromNow(24),
            endTime: dayFromNow(25),
            capacity: 120,
            pointsTotal: 1800,
            published: true,
            organizers: ['harrypot'],
            guests: ['suspicious', 'newbie01', 'kirk1234'],
            awards: [
                { utorid: 'suspicious', amount: 40, remark: 'Completed escape room fastest' },
            ],
        },
        {
            key: 'predator-trophy-hunt',
            name: 'Predator Trophy Hunt',
            description: 'The hunt is on! Interactive scavenger hunt, trivia, and themed activities. Hunt for points and glory!',
            location: 'Campus-wide',
            startTime: dayFromNow(29),
            endTime: dayFromNow(30),
            capacity: 200,
            pointsTotal: 3000,
            published: true,
            organizers: ['luke1234'],
            guests: ['picard01', 'newbie01', 'suspicious', 'kirk1234'],
            awards: [
                { utorid: 'picard01', amount: 50, remark: 'Found all hidden trophies' },
            ],
        },
        
        // General campus events
        {
            key: 'midterm-study-session',
            name: 'Midterm Study Boost Session',
            description: 'Study hard, earn points! Group study sessions, free snacks, and study tips. Fuel your brain and your points account!',
            location: 'Robarts Library',
            startTime: dayFromNow(2),
            endTime: dayFromNow(3),
            capacity: 100,
            pointsTotal: 1500,
            published: true,
            organizers: ['hermione', 'katniss1'],
            guests: ['neville1', 'luna1234', 'ron12345', 'gimli123'],
            awards: [
                { utorid: 'neville1', amount: 30, remark: 'Helped organize study materials' },
            ],
        },
        {
            key: 'final-exam-power-up',
            name: 'Final Exam Power-Up Event',
            description: 'Ace your exams and your rewards! Stress relief activities, free coffee, and study support. You\'ve got this!',
            location: 'Sid Smith Commons',
            startTime: dayFromNow(27),
            endTime: dayFromNow(28),
            capacity: 150,
            pointsTotal: 2200,
            published: true,
            organizers: ['hermione'],
            guests: ['legolas1', 'aragorn1', 'peeta123', 'gale1234'],
            awards: [
                { utorid: 'legolas1', amount: 35, remark: 'Best study group organizer' },
            ],
        },
        {
            key: 'welcome-week',
            name: 'Welcome Week Orientation',
            description: 'Welcome to campus! Meet new friends, learn about campus resources, and start your journey with extra points. Orientation for all new students!',
            location: 'Hart House',
            startTime: dayFromNow(-30),
            endTime: dayFromNow(-29),
            capacity: 300,
            pointsTotal: 4000,
            published: true,
            organizers: ['gandalf01', 'yoda1234'],
            guests: ['newbie01', 'suspicious', 'kirk1234', 'picard01', 'spock123'],
            awards: [
                { utorid: 'newbie01', amount: 50, remark: 'Most enthusiastic new student' },
            ],
        },
        {
            key: 'graduation-celebration',
            name: 'Graduation Celebration Gala',
            description: 'Celebrate your achievement! Formal dinner, awards ceremony, and dancing. Congratulations to all graduates!',
            location: 'Hart House Great Hall',
            startTime: dayFromNow(31),
            endTime: dayFromNow(32),
            capacity: 250,
            pointsTotal: 3500,
            published: true,
            organizers: ['superman', 'gandalf01'],
            guests: ['harrypot', 'luke1234', 'tonystar', 'elrond01'],
            awards: [
                { utorid: 'harrypot', amount: 60, remark: 'Outstanding student leader' },
                { utorid: 'luke1234', amount: 55, remark: 'Academic excellence award' },
            ],
        },
        {
            key: 'holiday-season',
            name: 'Holiday Season Celebration',
            description: 'Spread the cheer! Holiday party with food, music, and festive activities. Happy holidays to all!',
            location: 'Robarts Commons',
            startTime: dayFromNow(33),
            endTime: dayFromNow(33.5),
            capacity: 200,
            pointsTotal: 3000,
            published: true,
            organizers: ['gandalf01'],
            guests: ['tonystar', 'elrond01', 'harrypot', 'luke1234'],
            awards: [],
        },
    ];

    const map = {};
    for (const event of events) {
        const coords = getCoordinatesForLocation(event.location);
        const created = await prisma.event.create({
            data: {
                name: event.name,
                description: event.description,
                location: event.location,
                startTime: event.startTime,
                endTime: event.endTime,
                capacity: event.capacity,
                pointsTotal: event.pointsTotal,
                pointsRemain: event.pointsTotal,
                published: event.published,
                latitude: coords?.lat ?? null,
                longitude: coords?.lng ?? null,
            },
        });
        map[event.key] = created;

        if (event.organizers?.length) {
            await prisma.eventOrganizer.createMany({
                data: event.organizers.map((utorid) => ({
                    eventId: created.id,
                    userId: userMap[utorid].id,
                })),
            });
        }

        if (event.guests?.length) {
            await prisma.eventGuest.createMany({
                data: event.guests.map((utorid) => ({
                    eventId: created.id,
                    userId: userMap[utorid].id,
                })),
            });
        }

        if (event.awards?.length) {
            for (const award of event.awards) {
                const creator = userMap[event.organizers[0]];
                await prisma.transaction.create({
                    data: {
                        userId: userMap[award.utorid].id,
                        type: 'event',
                        amount: award.amount,
                        relatedId: created.id,
                        remark: award.remark ?? '',
                        suspicious: false,
                        promotionIds: [],
                        createdById: creator.id,
                    },
                });
                await prisma.user.update({
                    where: { id: userMap[award.utorid].id },
                    data: { points: { increment: award.amount } },
                });
                await prisma.event.update({
                    where: { id: created.id },
                    data: {
                        pointsRemain: { decrement: award.amount },
                        pointsAwarded: { increment: award.amount },
                    },
                });
            }
        }
    }
    return map;
}

async function seedTransactions(userMap, promotions) {
    console.log('Creating 120 transactions …');
    const cashiers = [userMap['hermione'], userMap['katniss1'], userMap['frodo123']];
    const managers = [userMap['gandalf01'], userMap['yoda1234']];
    
    // Helper to get random promotion IDs
    const getPromoIds = (count, type = null) => {
        const filtered = type 
            ? promotions.filter(p => p.type === type)
            : promotions;
        const shuffled = [...filtered].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count).map(p => p.id);
    };

    const regularUsers = Object.keys(userMap).filter(
        key => userMap[key].role === 'regular'
    );
    
    let txCount = 0;
    const purchaseTxIds = [];
    
    // Create 60 purchase transactions with detailed remarks
    const purchaseRemarks = [
        'Textbook purchase for Computer Science 309',
        'Campus bookstore - Algorithms and Data Structures textbook',
        'Coffee and snacks at Sid\'s Cafe',
        'Lunch at Hart House - delicious pasta',
        'Stationery supplies for midterm exams',
        'Harry Potter merchandise - Gryffindor scarf',
        'Star Wars collectibles - lightsaber replica',
        'Disney pins collection - Mickey Mouse edition',
        'Gaming accessories - Nintendo Switch controller',
        'Music festival tickets - Coachella Campus Edition',
        'Movie tickets - Oscar Night Extravaganza',
        'Alien vs Predator merchandise - action figures',
        'Marvel comics and collectibles',
        'Retro gaming console - SNES Classic',
        'Jazz Night tickets and refreshments',
        'Study materials for final exams',
        'Graduation cap and gown rental',
        'Welcome Week orientation package',
        'Campus hoodie and merchandise',
        'Tech expo entry and VR experience',
        'Quidditch tournament tickets',
        'Hogwarts Gala formal attire',
        'Disney World virtual tour access',
        'Frozen sing-along event tickets',
        'Mickey Mouse birthday bash entry',
        'May the 4th celebration merchandise',
        'Jedi Training Academy registration',
        'Death Star destruction party snacks',
        'Avengers Assemble movie night tickets',
        'Iron Man Tech Expo entry',
        'Spider-Man screening with popcorn',
        'E3 Gaming Expo campus edition pass',
        'Nintendo Switch party entry',
        'Retro gaming night tickets',
        'Coachella Campus music festival pass',
        'Smooth Jazz Night tickets',
        'Campus Rock Concert entry',
        'Oscar Night Extravaganza tickets',
        'Film Festival screening pass',
        'Blockbuster Movie Night tickets',
        'Alien vs Predator showdown entry',
        'Xenomorph Invasion experience',
        'Predator Trophy Hunt registration',
        'Midterm Study Boost session materials',
        'Final Exam Power-Up event entry',
        'Welcome Week orientation materials',
        'Graduation Celebration Gala tickets',
        'Holiday Season Celebration entry',
    ];
    
    for (let i = 0; i < 60; i++) {
        const userKey = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        const user = userMap[userKey];
        const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
        const spent = randomFloat(15, 120);
        const basePoints = Math.floor(spent * 2);
        const amount = basePoints + randomInt(0, 50);
        const remark = purchaseRemarks[Math.floor(Math.random() * purchaseRemarks.length)];
        
        // Randomly apply promotions
        let promoIds = [];
        if (Math.random() > 0.3) {
            const promoType = Math.random() > 0.5 ? 'automatic' : 'onetime';
            promoIds = getPromoIds(randomInt(1, 2), promoType);
        }
        
        const tx = await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'purchase',
                amount,
                spent: Math.round(spent * 100) / 100,
                remark,
                promotionIds: promoIds,
                suspicious: Math.random() < 0.05, // 5% suspicious
                createdById: cashier.id,
            },
        });
        purchaseTxIds.push(tx.id);
        await prisma.user.update({
            where: { id: user.id },
            data: { points: { increment: amount } },
        });
        txCount++;
    }
    
    // Create 20 redemption transactions
    const redemptionRemarks = [
        'Redeemed points for campus hoodie',
        'Merchandise redemption - Star Wars poster',
        'Harry Potter collectibles redemption',
        'Disney pins redemption',
        'Gaming merchandise - Nintendo Switch game',
        'Movie tickets redemption',
        'Campus bookstore gift card',
        'Coffee shop voucher redemption',
        'Event tickets redemption',
        'Tech accessories redemption',
        'Music festival merchandise',
        'Concert tickets redemption',
        'Film festival pass redemption',
        'Gaming expo merchandise',
        'Retro gaming collectibles',
        'Marvel action figures redemption',
        'Alien vs Predator merchandise',
        'Study materials redemption',
        'Graduation gift redemption',
        'Holiday celebration merchandise',
    ];
    
    const redemptionUsers = regularUsers.filter(key => userMap[key].points >= 80);
    for (let i = 0; i < 20 && redemptionUsers.length > 0; i++) {
        const userKey = redemptionUsers[Math.floor(Math.random() * redemptionUsers.length)];
        const user = userMap[userKey];
        const cashier = cashiers[Math.floor(Math.random() * cashiers.length)];
        const redeemed = randomInt(50, 200);
        const remark = redemptionRemarks[Math.floor(Math.random() * redemptionRemarks.length)];
        
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'redemption',
                amount: -redeemed,
                redeemed,
                remark,
                promotionIds: [],
                createdById: user.id,
                processedById: cashier.id,
            },
        });
        await prisma.user.update({
            where: { id: user.id },
            data: { points: { decrement: redeemed } },
        });
        txCount++;
    }
    
    // Create 20 adjustment transactions
    const adjustmentRemarks = [
        'Manual bonus for excellent event participation',
        'Compensation for service issue',
        'Loyalty program bonus',
        'Special promotion adjustment',
        'Event organizer bonus',
        'Volunteer work compensation',
        'Customer service adjustment',
        'Referral program bonus',
        'Birthday bonus points',
        'Anniversary celebration bonus',
        'Holiday special bonus',
        'Welcome bonus adjustment',
        'Graduation gift bonus',
        'Academic achievement bonus',
        'Community service recognition',
        'Event planning contribution',
        'Social media promotion bonus',
        'Feedback survey reward',
        'Early adopter bonus',
        'Milestone achievement reward',
    ];
    
    for (let i = 0; i < 20; i++) {
        const userKey = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        const user = userMap[userKey];
        const manager = managers[Math.floor(Math.random() * managers.length)];
        const relatedTxId = purchaseTxIds[Math.floor(Math.random() * purchaseTxIds.length)];
        const amount = randomInt(20, 100);
        const remark = adjustmentRemarks[Math.floor(Math.random() * adjustmentRemarks.length)];
        
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'adjustment',
                amount,
                relatedId: relatedTxId,
                remark,
                promotionIds: [],
                suspicious: false,
                createdById: manager.id,
            },
        });
        await prisma.user.update({
            where: { id: user.id },
            data: { points: { increment: amount } },
        });
        txCount++;
    }
    
    // Create 10 transfer transactions (5 pairs)
    const transferRemarks = [
        'Shared purchase - splitting costs',
        'Gift transfer to friend',
        'Group event ticket purchase',
        'Study group materials sharing',
        'Birthday gift points transfer',
        'Thank you gift transfer',
        'Group dinner cost sharing',
        'Event ticket group purchase',
        'Shared merchandise purchase',
        'Collaborative project funding',
    ];
    
    for (let i = 0; i < 5; i++) {
        const senderKey = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        let recipientKey = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        while (recipientKey === senderKey) {
            recipientKey = regularUsers[Math.floor(Math.random() * regularUsers.length)];
        }
        const sender = userMap[senderKey];
        const recipient = userMap[recipientKey];
        const amount = randomInt(25, 150);
        const remark = transferRemarks[Math.floor(Math.random() * transferRemarks.length)];
        
        // Create sender transaction
        await prisma.transaction.create({
            data: {
                userId: sender.id,
                type: 'transfer',
                amount: -amount,
                relatedId: recipient.id,
                remark: `${remark} - sent to ${recipient.name}`,
                promotionIds: [],
                createdById: sender.id,
            },
        });
        // Create recipient transaction
        await prisma.transaction.create({
            data: {
                userId: recipient.id,
                type: 'transfer',
                amount,
                relatedId: sender.id,
                remark: `${remark} - received from ${sender.name}`,
                promotionIds: [],
                createdById: sender.id,
            },
        });
        await prisma.user.update({
            where: { id: sender.id },
            data: { points: { decrement: amount } },
        });
        await prisma.user.update({
            where: { id: recipient.id },
            data: { points: { increment: amount } },
        });
        txCount += 2;
    }
    
    // Create 10 additional event transactions (awards for various events)
    const eventAwardRemarks = [
        'Event participation bonus',
        'Volunteer work at event',
        'Event setup and organization',
        'Best costume award',
        'Trivia contest winner',
        'Performance contribution',
        'Event photography',
        'Social media promotion',
        'Event feedback and review',
        'Special event contribution',
    ];
    
    const events = await prisma.event.findMany({ take: 10 });
    for (const event of events) {
        const guests = await prisma.eventGuest.findMany({
            where: { eventId: event.id },
            take: 2,
        });
        if (guests.length > 0) {
            const organizer = await prisma.eventOrganizer.findFirst({
                where: { eventId: event.id },
            });
            if (organizer) {
                for (const guest of guests) {
                    const amount = randomInt(20, 60);
                    const remark = eventAwardRemarks[Math.floor(Math.random() * eventAwardRemarks.length)];
                    
                    await prisma.transaction.create({
                        data: {
                            userId: guest.userId,
                            type: 'event',
                            amount,
                            relatedId: event.id,
                            remark: `${remark} - ${event.name}`,
                            suspicious: false,
                            promotionIds: [],
                            createdById: organizer.userId,
                        },
                    });
                    await prisma.user.update({
                        where: { id: guest.userId },
                        data: { points: { increment: amount } },
                    });
                    await prisma.event.update({
                        where: { id: event.id },
                        data: {
                            pointsRemain: { decrement: amount },
                            pointsAwarded: { increment: amount },
                        },
                    });
                    txCount++;
                }
            }
        }
    }
    
    console.log(`   Created ${txCount} transactions`);
}

async function main() {
    await resetDatabase();
    const users = await seedUsers();
    const promotions = await seedPromotions();
    await seedEvents(users);
    await seedTransactions(users, promotions);
    console.log('Seed completed successfully!');
    console.log(`   Summary: 30 users, 30 promotions, 30 events, 120+ transactions`);
    console.log(`   Demo password for all users: ${PASSWORD}`);
}

main()
    .catch((err) => {
        console.error('Seed failed:', err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
