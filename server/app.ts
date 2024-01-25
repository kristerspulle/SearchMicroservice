import express, { Request, Response } from 'express';
import { z } from 'zod';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 3000;

type Product = {
  title: string;
  description: string;
  final_price: number;
}

app.use(cors({
  origin: '*',
}));

const userInputSchema = z.object({
  query: z
    .string()
    .min(1)
    .refine((data) => data !== undefined, {
      message: 'Search parameter must be provided.',
    }),
  page: z
    .number()
    .int()
    .positive()
    .refine((data) => data !== undefined, {
      message: 'Page number must be a positive integer',
    }),
});

app.use((req, res, next) => {
  const incomingLog = {
    type: 'messageIn',
    body: JSON.stringify(req.body),
    method: req.method,
    path: req.path,
    dateTime: new Date().toLocaleString(),
  };
  console.log(incomingLog);

  const originalSend = res.json.bind(res);
  res.json = (body: {code: number, message: string}) => {
    const outgoingLog = {
      type: 'messageOut',
      body: JSON.stringify(body),
      dateTime: new Date().toLocaleString(),
      fault: null as null | string,
    };

    console.log(outgoingLog);
    return originalSend(body);
  };

  const originalJson = res.json.bind(res);
  res.json = (body: {code: number, message: string}) => {
    if (body instanceof Error) {
      const errorResponse = {
        ...body,
        fault: body.stack ?? body.message,
      };
      console.error(JSON.stringify(errorResponse));

      return originalJson(errorResponse);
    }
    return originalJson(body);
  };

  next();
});

app.get('/', (req: Request, res: Response) => {
  try {
    const userInput = {
      query: req.query.query,
      page: Number(req.query.page),
    };

    userInputSchema.parse(userInput);

    axios
      .get('https://dummyjson.com/products/search', {
        params: {
          q: userInput.query,
          limit: 2,
          skip: 0,
          page: userInput.page,
        },
      })
      .then((response) => {
        const data = response.data.products;

        const userData = data.map(
          (product:
            { title: string;
              description: string;
              price: number;
              discountPercentage: number;
            }): Product => ({
            title: product.title,
            description: product.description,
            final_price:
            Number((product.price - (product.price * product.discountPercentage) / 100).toFixed(2)),
          }),
        );

        res.json(userData);
      });
  } catch (error) {
    console.error('Error:', (error as Error).message);
    console.log('this error is', error);

    res.status(400).json({ code: 400, message: 'Invalid input parameters' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
