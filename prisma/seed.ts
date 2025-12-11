import { PrismaClient } from '@prisma/client'

// @ts-ignore
const prisma = new PrismaClient()

async function main() {
    // Categories
    const catPizza = await prisma.category.create({
        data: {
            slug: 'pizza',
            translations: {
                create: [
                    { language: 'sv', name: 'Pizzor' },
                    { language: 'en', name: 'Pizzas' },
                    { language: 'de', name: 'Pizzen' },
                    { language: 'fa', name: 'پیتزاها' },
                ],
            },
        },
    })

    // Extras
    const extraCheese = await prisma.extra.create({
        data: {
            price: 15,
            translations: {
                create: [
                    { language: 'sv', name: 'Extra Ost' },
                    { language: 'en', name: 'Extra Cheese' },
                    { language: 'fa', name: 'پنیر اضافه' },
                ]
            }
        }
    })

    const extraGarlic = await prisma.extra.create({
        data: {
            price: 10,
            translations: {
                create: [
                    { language: 'sv', name: 'Vitlökssås' },
                    { language: 'en', name: 'Garlic Sauce' },
                    { language: 'fa', name: 'سس سیر' },
                ]
            }
        }
    })

    // Pizza Margarita
    await prisma.product.create({
        data: {
            slug: 'margarita',
            price: 95,
            categoryId: catPizza.id,
            translations: {
                create: [
                    { language: 'sv', name: 'Margarita', description: 'Tomatsås, Ost' },
                    { language: 'en', name: 'Margarita', description: 'Tomato sauce, Cheese' },
                    { language: 'de', name: 'Margarita', description: 'Tomatensauce, Käse' },
                    { language: 'fa', name: 'مارگاریتا', description: 'سس گوجه، پنیر' },
                ],
            },
            sizes: {
                create: [
                    { priceModifier: 0, translations: { create: [{ language: 'sv', name: 'Standard' }] } },
                    { priceModifier: 100, translations: { create: [{ language: 'sv', name: 'Familj' }] } },
                ]
            },
            extras: {
                create: [
                    { extraId: extraCheese.id },
                    { extraId: extraGarlic.id }
                ]
            }
        },
    })

    // Vesuvio
    await prisma.product.create({
        data: {
            slug: 'vesuvio',
            price: 105,
            categoryId: catPizza.id,
            translations: {
                create: [
                    { language: 'sv', name: 'Vesuvio', description: 'Tomatsås, Ost, Skinka' },
                    { language: 'en', name: 'Vesuvio', description: 'Tomato sauce, Cheese, Ham' },
                    { language: 'fa', name: 'وسویو', description: 'سس گوجه، پنیر، ژامبون' },
                ],
            },
            extras: {
                create: [
                    { extraId: extraCheese.id }
                ]
            }
        },
    })

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
