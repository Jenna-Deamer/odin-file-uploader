const { prisma } = require('./lib/prisma');

async function main() {
    const user = await prisma.user.create({
        data: {
            email: 'alice@example.com',
            password: 'hashed-password-here',
            files: {
                create: {
                    name: 'example.txt',
                    url: 'uploads/example-123.txt',
                    size: 1024,
                },
            },
        },
        include: {
            files: true,
        },
    });

    console.log('Created user:', user);

    // Fetch all users with their files
    const allUsers = await prisma.user.findMany({
        include: {
            files: true,
        },
    });

    console.log('All users:', JSON.stringify(allUsers, null, 2));
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });