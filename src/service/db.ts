import mongoose from 'mongoose';

export default function setupDb() {
  mongoose
    .connect(process.env.DB_URI || '', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
