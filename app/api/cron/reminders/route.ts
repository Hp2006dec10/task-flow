import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendAnniversaryReminderEmail } from '@/lib/email';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    // In production, enforce CRON_SECRET auth header check
    if (process.env.NODE_ENV === 'production' && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const hourParam = searchParams.get('hour'); // "0" or "8"

    const now = new Date();
    
    // Convert to IST (+5:30) to determine current date in Indian Standard Time
    const todayIST = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const targetMonth = todayIST.getUTCMonth(); // 0-11
    const targetDay = todayIST.getUTCDate(); // 1-31

    // Determine target reminder time
    let reminderTime = '8 AM';
    if (hourParam === '0') {
      reminderTime = '12 AM';
    } else if (hourParam === '8') {
      reminderTime = '8 AM';
    } else {
      // Fallback: Infer from current UTC hours
      // 18:30 UTC = 00:00 IST (12 AM IST)
      // 02:30 UTC = 08:00 IST (8 AM IST)
      const utcHours = now.getUTCHours();
      if (utcHours === 18) {
        reminderTime = '12 AM';
      } else {
        reminderTime = '8 AM';
      }
    }

    // Fetch anniversaries that have reminders enabled, matching the time preference, 
    // and whose owner has reminders enabled globally.
    const anniversaries = await prisma.anniversary.findMany({
      where: {
        isImportant: true,
        reminderTime,
        user: {
          emailRemindersEnabled: true,
        },
      },
      include: {
        user: true,
      },
    });

    // Filter for events occurring today (IST month & day match)
    const occurringToday = anniversaries.filter((ann) => {
      const annDate = new Date(ann.date);
      return annDate.getUTCMonth() === targetMonth && annDate.getUTCDate() === targetDay;
    });

    const sentReminders = [];
    for (const ann of occurringToday) {
      const result = await sendAnniversaryReminderEmail(
        ann.user.email,
        ann.user.name,
        ann.name,
        ann.description,
        ann.date
      );
      sentReminders.push({
        id: ann.id,
        name: ann.name,
        email: ann.user.email,
        result,
      });
    }

    return NextResponse.json({
      success: true,
      timeChecked: reminderTime,
      istDateChecked: `${targetMonth + 1}/${targetDay}`,
      processed: occurringToday.length,
      details: sentReminders,
    });
  } catch (error) {
    console.error('Cron reminders route error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
