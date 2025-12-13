# Odyssey Web Core

Shared components, layouts, and utilities for Odyssey Web sites (theodysseypath.com, coachteilo.com).

## Installation

```bash
npm install github:EgoBot/webcore#v1.0.0
```

## Usage

```astro
---
import TestimonialGrid from '@egobot/webcore/components/TestimonialGrid.astro';
import BaseLayout from '@egobot/webcore/layouts/BaseLayout.astro';
---

<BaseLayout>
  <TestimonialGrid layoutStyle="masonry" more={6} />
</BaseLayout>
```

## Components

### Testimonial System
- **TestimonialGrid.astro** - Main testimonial grid with masonry/grid layouts
- **TestimonialCard.astro** - Individual text review card
- **TestimonialVideoCard.astro** - Video review card with playback
- **StarRating.astro** - Star rating display (1-5 stars)
- **DefaultAvatar.astro** - Generated avatar with initials

### Product/Membership System
- **MembershipCard.astro** - Pricing/membership card

### FAQ System
- **ToggleCards.astro** - FAQ accordion component

### Layouts
- **BaseLayout.astro** - Base page layout

### Utilities
- **remark-reading-time.mjs** - Reading time calculation for blog posts

## Versioning

This package uses semantic versioning:
- **v1.0.0** - Initial release with core components
- **v1.x.x** - Minor updates and bug fixes
- **v2.0.0** - Breaking changes

## Updating

To update to a new version in your site:

```bash
npm install github:EgoBot/webcore#v1.1.0
```

## Development

This is a shared package. Changes here affect all sites using it.

---

**Maintained by**: Odyssey Web Team
**Last Updated**: December 13, 2025
