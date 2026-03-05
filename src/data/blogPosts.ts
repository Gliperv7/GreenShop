export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "cactus-care",
    title: "Cactus & Succulent Care Tips",
    excerpt: "Cacti are succulents are easy care plants for any home or patio.",
    date: "September 12",
    image: "/assets/figma-all/images/01-5-86.png",
  },
  {
    slug: "top-succulents",
    title: "Top 10 Succulents for Your Home",
    excerpt: "Best in hanging baskets. Prefers medium to high light.",
    date: "September 13",
    image: "/assets/figma-all/images/02-5-87.png",
  },
  {
    slug: "container-garden",
    title: "Cacti & Succulent Care Tips",
    excerpt: "Cacti and succulents thrive in containers and because most are resilient.",
    date: "September 15",
    image: "/assets/figma-all/images/03-5-88.png",
  },
  {
    slug: "room-by-room",
    title: "Best Houseplants Room By Room",
    excerpt: "The benefits of houseplants are endless. In addition to style and color.",
    date: "September 15",
    image: "/assets/figma-all/images/04-5-89.png",
  },
];
