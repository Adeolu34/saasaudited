import { cache } from "react";
import dbConnect from "@/lib/mongodb";
import Review from "@/lib/models/Review";
import Tool from "@/lib/models/Tool";
import BlogPost from "@/lib/models/BlogPost";
import Category from "@/lib/models/Category";
import Comparison from "@/lib/models/Comparison";

export const getReviewAndTool = cache(async (slug: string) => {
  await dbConnect();
  const [review, tool] = await Promise.all([
    Review.findOne({ slug }).lean(),
    Tool.findOne({ slug }).lean(),
  ]);
  return { review, tool };
});

export const getBlogPost = cache(async (slug: string) => {
  await dbConnect();
  return BlogPost.findOne({ slug }).lean();
});

export const getCategory = cache(async (slug: string) => {
  await dbConnect();
  return Category.findOne({ slug }).lean();
});

export const getComparison = cache(async (slug: string) => {
  await dbConnect();
  return Comparison.findOne({ slug }).lean();
});

export const getToolBySlug = cache(async (slug: string) => {
  await dbConnect();
  return Tool.findOne({ slug }).lean();
});

export const getToolsByCategory = cache(async (category: string) => {
  await dbConnect();
  return Tool.find({ category }).sort({ overall_score: -1 }).lean();
});

export const findCuratedComparison = cache(
  async (slugA: string, slugB: string) => {
    await dbConnect();
    return Comparison.findOne({
      $or: [
        { tool_a_slug: slugA, tool_b_slug: slugB },
        { tool_a_slug: slugB, tool_b_slug: slugA },
      ],
    }).lean();
  }
);
