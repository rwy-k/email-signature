import 'reflect-metadata'; // Required by TypeORM
import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import { setRoutes } from './app/router.js';
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
setRoutes(app);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
