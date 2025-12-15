# @egobot/webcore

Shared Astro components, layouts, and utilities for Odyssey Web sites.

**Version**: 1.1.2
**Last Updated**: December 15, 2025

## Installation

```bash
npm install github:EgoBot/webcore#v1.1.2
```

## Usage

```astro
---
import BaseLayout from '@egobot/webcore/layouts/BaseLayout.astro';
import TestimonialGrid from '@egobot/webcore/components/TestimonialGrid.astro';
import { getSortedPosts } from '@egobot/webcore/utils/content';
import { slugify, formatDate } from '@egobot/webcore/utils/presentation';
---

<BaseLayout title="Home" globalSettings={config} t={translations}>
  <TestimonialGrid layoutStyle="masonry" more={6} />
</BaseLayout>
```

## Project Structure

```
webcore/
├── src/
│   ├── components/       # 50+ Astro components
│   │   └── resources/    # Resource-specific components
│   ├── layouts/          # Page layouts (4)
│   ├── utils/            # Helper functions
│   ├── assets/icons/     # SVG icon components
│   └── scripts/          # Client-side utilities
└── package.json
```

## Components (50+)

### Layouts
| Component | Description |
|-----------|-------------|
| `BaseLayout` | Root page wrapper with navbar, SEO |
| `PostLayout` | Blog post with navigation, sharing |
| `PageLayout` | Generic page layout |
| `BaseHead` | Head section with SEO, fonts, scripts |

### Testimonials
| Component | Props | Description |
|-----------|-------|-------------|
| `TestimonialGrid` | `category`, `more`, `total`, `layoutStyle` | Masonry/grid testimonial display |
| `TestimonialCard` | `name`, `stars`, `reviewText`, `date` | Text review card |
| `TestimonialVideoCard` | `videoUrl`, `stars`, `name` | Video review card |
| `StarRating` | `rating`, `maxStars` | Star rating display |
| `DefaultAvatar` | `name`, `size` | Generated avatar with initials |

### Blog/Posts
| Component | Description |
|-----------|-------------|
| `PostCard` | Standard blog post card |
| `FeaturedPostCard` | Large featured post card |
| `FeaturedPosts` | Featured posts section |
| `CreativePostCard` | Minimal creative post card |
| `SliderPostCard` | Carousel slide card |
| `AllPostsCard` | Full-width archive card |
| `DefaultPostHeader` | Standard post header |
| `BackgroundMediaPostHeader` | Hero header with bg video/image |

### Navigation
| Component | Description |
|-----------|-------------|
| `Navbar` | Main navigation bar |
| `NavbarLink` | Navigation link |
| `NavbarDropdown` | Dropdown menu |

### Footer
| Component | Description |
|-----------|-------------|
| `FooterNormal` | Standard footer |
| `FooterCreative` | Animated creative footer |
| `FooterLink` | Footer navigation link |
| `FooterDropdown` | Footer dropdown section |
| `FooterBottom` | Copyright, socials |

### UI Components
| Component | Props | Description |
|-----------|-------|-------------|
| `Button` | `text`, `url`, `button_style` | CTA button with variants |
| `ButtonSimple` | `text`, `url` | Simple text link |
| `Callout` | `text`, `emoji`, `background_color` | Info callout box |
| `ToggleCards` | `toggle_cards` | FAQ accordion |
| `MembershipCard` | `tier`, `yearly` | Pricing card |
| `Logo` | `globalSettings` | Site logo |
| `Social` | `social` | Social media link |

### Media
| Component | Props | Description |
|-----------|-------|-------------|
| `ImageGallery` | `image_slugs`, `images_per_row` | Responsive image gallery |
| `ImageCard` | `image_slug`, `size` | Single image display |
| `MediaEmbed` | `media_iframe_src` | YouTube/Vimeo embed |
| `Slider` | `posts` | Flickity carousel |

### Authors & Topics
| Component | Description |
|-----------|-------------|
| `PostAuthor` | Single author avatar |
| `PostAuthors` | Multiple authors with metadata |
| `AuthorCard` | Author profile card |
| `TopicCard` | Topic/category card |
| `ArchiveTopics` | Topic filter |

### Resources
| Component | Description |
|-----------|-------------|
| `ResourceCard` | Downloadable resource card |
| `CategoryFilter` | Resource category filter |

### Specialized
| Component | Description |
|-----------|-------------|
| `Circles` | Infinite scrolling circles section |
| `CirclePair` | Individual circle element |
| `FormHero` | Form page header (signin, signup, subscribe) |

## Utilities

### Content (`utils/content.ts`)
```typescript
getSortedPosts({ limit?, featured?, homepage_slider? })
getPostWithSiblings(posts, index)
getTopics()
getUniqueTopicsWithCount(topics)
getPostsByTopic({ topic?, limit? })
getAuthors()
getPostsByAuthor({ author?, limit? })
getUniqueAuthorsWithCount(authors)
```

### Presentation (`utils/presentation.ts`)
```typescript
slugify(text)        // "Hello World" → "hello-world"
formatDate(date)     // Date → "Dec 15, 2025"
```

### Assets (`utils/assets.ts`)
```typescript
getImage({ folder_name, image_name, glob })
resolveImagePath(imagePath)
```

### Reading Time (`utils/remark-reading-time.mjs`)
Remark plugin for calculating blog post reading time.

## Icons

SVG icon components in `assets/icons/`:
- `AvatarIcon`, `BigArrowIcon`, `CarretIcon`, `CheckIcon`
- `Placeholder`, `SaveArrowIcon`, `SmallArrowIcon`, `ToggleArrowIcon`

## External Dependencies (CDN)

Loaded at runtime:
- Masonry.js - Grid layout
- imagesLoaded - Image load detection
- Flickity - Carousel
- GSAP + ScrollTrigger - Animations
- Lenis - Smooth scrolling
- lightense-images - Image zoom
- Google Fonts

## Requirements

Consuming sites must provide:
- Astro content collections (blog, pages, testimonials)
- Global settings config object
- Translation strings object
- Config files (navbar, footer, authors, socials)
- Assets in `/src/assets/`

## Versioning

```bash
# Install specific version
npm install github:EgoBot/webcore#v1.1.2

# Update to new version
npm install github:EgoBot/webcore#v1.2.0
```

- **v1.x.x** - Minor updates, bug fixes
- **v2.0.0** - Breaking changes

## Sites Using This Package

- theodysseypath.com
- coachteilo.com
