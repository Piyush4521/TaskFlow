import mongoose from 'mongoose';
import dns from 'dns';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
  } catch (err) {
    if (process.env.NODE_ENV !== 'production' && err.message && err.message.includes('querySrv') && uri.startsWith('mongodb+srv://')) {
      try {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 10000,
        });
      } catch (retryErr) {
        throw retryErr;
      }
    } else {
      throw err;
    }
  }

  console.log('MongoDB connected successfully');
}
