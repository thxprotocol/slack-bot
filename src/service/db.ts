import mongoose from 'mongoose'

export default function setupDb() {
  mongoose.connect('mongodb://localhost/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
