import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        // @ts-ignore
        let about = await prisma.aboutPage.findFirst();
        if (!about) {
            // @ts-ignore
            about = await prisma.aboutPage.create({
                data: {
                    title: 'About Us',
                    titleSv: 'Om Oss',
                    titleDe: 'Über Uns',
                    content: `Welcome to PizzaShop – your destination for authentic Italian cuisine!

Founded in 2010, we started with a simple dream: to bring the true taste of Italy to your neighborhood. Our journey began in a small kitchen with big ambitions, and today we're proud to serve thousands of satisfied customers.

🍕 Our Story

What makes us special? It's our unwavering commitment to quality. Every pizza we make starts with hand-stretched dough prepared fresh daily, topped with premium mozzarella, and baked in our traditional stone oven at the perfect temperature.

Our recipes have been passed down through generations, preserving the authentic flavors that made Italian cuisine famous worldwide. We source our tomatoes from San Marzano, our olive oil from Tuscany, and our herbs from local organic farms.

🌟 Why Choose Us?

• Fresh ingredients delivered daily
• Traditional recipes with a modern twist  
• Fast delivery to your doorstep
• Friendly service with a smile
• Commitment to sustainability

We believe great food brings people together. Whether it's a family dinner, a party with friends, or a cozy night in, we're here to make every moment delicious.`,
                    contentSv: `Välkommen till PizzaShop – din destination för autentisk italiensk mat!

Grundat 2010 började vi med en enkel dröm: att föra den äkta smaken av Italien till ditt kvarter. Vår resa började i ett litet kök med stora ambitioner, och idag är vi stolta över att servera tusentals nöjda kunder.

🍕 Vår Historia

Vad gör oss speciella? Det är vårt orubbliga engagemang för kvalitet. Varje pizza vi gör börjar med handsträckt deg som förbereds dagligen, toppad med premium mozzarella och bakad i vår traditionella stenugn vid perfekt temperatur.

Våra recept har gått i arv genom generationer och bevarar de autentiska smakerna som gjort italiensk mat berömd över hela världen.

🌟 Varför Välja Oss?

• Färska ingredienser levereras dagligen
• Traditionella recept med en modern twist
• Snabb leverans till din dörr
• Vänlig service med ett leende
• Engagemang för hållbarhet`,
                    contentDe: `Willkommen bei PizzaShop – Ihr Ziel für authentische italienische Küche!

Gegründet im Jahr 2010, begannen wir mit einem einfachen Traum: den wahren Geschmack Italiens in Ihre Nachbarschaft zu bringen. Unsere Reise begann in einer kleinen Küche mit großen Ambitionen, und heute sind wir stolz darauf, Tausende zufriedener Kunden zu bedienen.

🍕 Unsere Geschichte

Was macht uns besonders? Es ist unser unerschütterliches Engagement für Qualität. Jede Pizza, die wir machen, beginnt mit handgestrecktem Teig, der täglich frisch zubereitet wird, belegt mit Premium-Mozzarella und in unserem traditionellen Steinofen bei perfekter Temperatur gebacken.

🌟 Warum Uns Wählen?

• Frische Zutaten täglich geliefert
• Traditionelle Rezepte mit modernem Touch
• Schnelle Lieferung bis zur Haustür
• Freundlicher Service mit einem Lächeln
• Engagement für Nachhaltigkeit`,
                    mission: 'To deliver authentic Italian flavors with passion, quality, and a commitment to making every meal a memorable experience for our customers.',
                    missionSv: 'Att leverera autentiska italienska smaker med passion, kvalitet och ett engagemang för att göra varje måltid till en minnesvärd upplevelse för våra kunder.',
                    missionDe: 'Authentische italienische Aromen mit Leidenschaft, Qualität und dem Engagement zu liefern, jede Mahlzeit zu einem unvergesslichen Erlebnis für unsere Kunden zu machen.',
                    teamMembers: JSON.stringify([
                        { name: 'Marco Rossi', role: 'Head Chef', image: '' },
                        { name: 'Sofia Bianchi', role: 'Pastry Chef', image: '' },
                        { name: 'Alessandro Conti', role: 'Restaurant Manager', image: '' }
                    ])
                }
            });
        }
        return NextResponse.json(about);
    } catch (error) {
        console.error('About API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch about page' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        // @ts-ignore
        const about = await prisma.aboutPage.findFirst();

        const data = {
            title: body.title,
            titleSv: body.titleSv,
            titleDe: body.titleDe,
            content: body.content,
            contentSv: body.contentSv,
            contentDe: body.contentDe,
            mission: body.mission,
            missionSv: body.missionSv,
            missionDe: body.missionDe,
            heroImage: body.heroImage,
            teamMembers: body.teamMembers
        };

        if (about) {
            // @ts-ignore
            const updated = await prisma.aboutPage.update({
                where: { id: about.id },
                data: data
            });
            revalidatePath('/about', 'layout');
            return NextResponse.json(updated);
        } else {
            // @ts-ignore
            const created = await prisma.aboutPage.create({
                data: data
            });
            revalidatePath('/about', 'layout');
            return NextResponse.json(created);
        }
    } catch (error) {
        console.error('About Update Error:', error);
        return NextResponse.json({ error: 'Failed to update about page' }, { status: 500 });
    }
}
