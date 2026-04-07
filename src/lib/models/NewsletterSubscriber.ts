import mongoose, { Schema, Document } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  source: string;
  subscribed_at: Date;
  is_active: boolean;
}

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true },
    source: { type: String, default: "website" },
    subscribed_at: { type: Date, default: Date.now },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.NewsletterSubscriber ||
  mongoose.model<INewsletterSubscriber>(
    "NewsletterSubscriber",
    NewsletterSubscriberSchema
  );
