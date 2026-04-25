import mongoose from 'mongoose';

// Cache the connection for serverless environments (Vercel)
let cached = global._mongooseConnection;
if (!cached) {
  cached = global._mongooseConnection = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, return cached connection
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {}).then((conn) => {
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      console.log(`📊 Database: ${conn.connection.name}`);

      mongoose.connection.on('error', (err) => {
        console.error(`❌ MongoDB connection error: ${err}`);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });

      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

export default connectDB;
