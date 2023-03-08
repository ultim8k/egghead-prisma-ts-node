import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
    res.send(`
        <p>
            Check <a href="/ping">/ping</a> or <a href="/products">/products</a>.
        </p>
    `);
});

app.get('/ping', (req: Request, res: Response) => {
    res.json({ message: 'hello' });
});

app.get('/products', async (req: Request, res: Response) => {
    const products = await prisma.product.findMany({
        include: {
            reviews: {
                select: {
                    text: true,
                    reting: true
                }
            }
        }
    });

    res.json(products);
});

app.post('/products', async (req: Request, res: Response) => {
    const { name, description, price } = req.body;

    if (!name || !price) {
        res.status(400);
        res.send('Please submit all mandatory fields');

        return;
    }

    const product = await prisma.product.create({
        data: {
            name,
            description,
            price,
        }
    });

    res.json(product);
});

app.post('/reviews', async (req: Request, res: Response) => {
    const { text, reting, productId } = req.body;

    if (!text || !reting || !productId) {
        res.status(400);
        res.send('Please submit all mandatory fields');

        return;
    }

    const review = await prisma.review.create({
        data: {
            text,
            reting,
            Product: {
                connect: {
                    id: productId
                }
            }
        }
    });

    res.json(review);
});

const PORT = 3001;
app.listen(PORT);
console.log(`Listening on http://localhost:${PORT}`);
