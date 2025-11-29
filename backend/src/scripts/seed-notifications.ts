import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedNotifications() {
  console.log('🌱 Seeding notifications...');

  try {
    // Get first user to add notifications to
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    console.log(`📧 Creating notifications for user: ${user.email}`);

    // Create sample notifications
    const notifications = [
      {
        userId: user.id,
        type: 'update',
        title: 'Bienvenue sur Skilli!',
        message: 'Découvrez les nouvelles fonctionnalités: notifications en temps réel, dashboard provider, et bien plus!',
      },
      {
        userId: user.id,
        type: 'reminder',
        title: 'Complétez votre profil',
        message: 'Ajoutez une photo de profil et complétez vos informations pour recevoir plus de réservations.',
      },
    ];

    for (const notification of notifications) {
      await prisma.notification.create({
        data: notification,
      });
      console.log(`✅ Created: ${notification.title}`);
    }

    console.log('✨ Notifications seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications();
