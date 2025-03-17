import { config as dotenvConfig } from 'dotenv';
dotenvConfig();
const config = {
    port: process.env.PORT || 3000,
    environment: process.env.NODE_ENV || 'development',
};
export default config;
//# sourceMappingURL=index.js.map