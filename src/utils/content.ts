/**
 * Content Utilities
 * Functions for fetching and filtering blog posts from Astro Content Collections
 *
 * These functions integrate with TinaCMS and Astro's content layer
 */

import { getCollection, type CollectionEntry } from "astro:content";
import { slugify } from "./presentation";

/**
 * Get sorted blog posts with optional filtering
 * @param limit - Maximum number of posts to return
 * @param featured - Only return featured posts
 * @param homepage_slider - Only return posts marked for homepage slider
 * @returns Object with posts array and total count
 */
export async function getSortedPosts({
  limit,
  featured = false,
  homepage_slider = false
}: { limit?: number; featured?: boolean; homepage_slider?: boolean } = {}) {
  const posts = await getCollection("blog", ({ data }) => {
    if (data.draft) return false;

    if (featured && !data.featured) return false;

    if (homepage_slider && !data.add_to_homepage_slider) return false;

    return true;
  });

  posts.sort(
    (a, b) => new Date(b.data.pub_date).getTime() - new Date(a.data.pub_date).getTime()
  );

  const total_posts = posts.length;

  return {
    posts: limit ? posts.slice(0, limit) : posts,
    total_posts
  };
}

/**
 * Get previous and next posts relative to current post
 * @param posts - Array of all posts
 * @param index - Index of current post
 * @returns Object with previous_post and next_post (or null)
 */
export function getPostWithSiblings(posts: CollectionEntry<"blog">[], index: number) {
  const previous_post = posts[index + 1] || null;
  const next_post = posts[index - 1] || null;

  return { previous_post, next_post };
}

/**
 * Get all unique tags from posts
 * @returns Array of tag objects with original text and slug
 */
export async function getTags() {
  const { posts } = await getSortedPosts();

  const tags = posts.flatMap(post => post.data.tags ?? []).filter(tag => tag !== undefined && tag !== null);

  const tagData = [
    ...new Set(
      tags.map(tag => ({
        original: tag,
        slug: slugify(tag),
      }))
    ),
  ];

  return tagData;
}

/**
 * Count occurrences of each unique tag
 * @param tags - Array of tag objects
 * @returns Array of tags with count property, sorted alphabetically
 */
export function getUniqueTagsWithCount(tags: Array<{original: string; slug: string}>) {
  const tagMap = new Map();

  tags.forEach(({ original, slug }) => {
    if (tagMap.has(slug)) {
      tagMap.get(slug).count += 1;
    } else {
      tagMap.set(slug, { original, slug, count: 1 });
    }
  });

  return Array.from(tagMap.values()).sort((a, b) => a.original.localeCompare(b.original));
}

/**
 * Get posts filtered by tag
 * @param tag - Tag slug to filter by
 * @param limit - Maximum number of posts to return
 * @returns Object with filtered posts array and total count
 */
export async function getPostsByTag({
  tag,
  limit,
}: { tag?: string; limit?: number } = {}) {
  const posts = await getCollection("blog", ({ data }) => {
    const normalizedTag = tag ? tag.toLowerCase() : null;

    return !data.draft && (
      !normalizedTag || (data.tags && data.tags.some(postTag => postTag.toLowerCase() === normalizedTag))
    );
  });

  posts.sort((a, b) => new Date(b.data.pub_date).getTime() - new Date(a.data.pub_date).getTime());

  const total_posts = posts.length;

  return {
    posts: limit ? posts.slice(0, limit) : posts,
    total_posts,
  };
}

/**
 * Get all unique authors from posts
 * @returns Array of author objects with original text and slug
 */
export async function getAuthors() {
  const { posts } = await getSortedPosts();

  const authors = posts.flatMap(post => post.data.authors ?? []).filter(author => author !== undefined && author !== null);

  const tagData = [
    ...new Set(
      authors.map(author => ({
        original: author,
        slug: slugify(author),
      }))
    ),
  ];

  return tagData;
}

/**
 * Get posts filtered by author
 * @param author - Author slug to filter by
 * @param limit - Maximum number of posts to return
 * @returns Object with filtered posts array and total count
 */
export async function getPostsByAuthor({
  author,
  limit,
}: { author?: string; limit?: number } = {}) {
  const posts = await getCollection("blog", ({ data }) => {
    const normalizedAuthor = author ? author.toLowerCase() : null;

    return !data.draft && (
      !normalizedAuthor || (data.authors && data.authors.some(postAuthor => postAuthor.toLowerCase() === normalizedAuthor))
    );
  });

  posts.sort((a, b) => new Date(b.data.pub_date).getTime() - new Date(a.data.pub_date).getTime());

  const total_posts = posts.length;

  return {
    posts: limit ? posts.slice(0, limit) : posts,
    total_posts,
  };
}

/**
 * Count occurrences of each unique author
 * @param authors - Array of author objects
 * @returns Array of authors with count property
 */
export function getUniqueAuthorsWithCount(authors: Array<{original: string; slug: string}>) {
  const authorMap = new Map();

  authors.forEach(({ original, slug }) => {
    if (authorMap.has(slug)) {
      authorMap.get(slug).count += 1;
    } else {
      authorMap.set(slug, { original, slug, count: 1 });
    }
  });

  return Array.from(authorMap.values());
}
