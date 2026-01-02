import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog - PMP Study Pro',
  description: 'Tips, guides, and insights for PMP exam preparation.',
};

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Understanding the New PMP Exam Content Outline',
    excerpt:
      'A comprehensive guide to the 2024 PMP exam changes and how to prepare effectively using the new domain structure.',
    date: 'Jan 15, 2025',
    readTime: '8 min read',
    category: 'Exam Guide',
  },
  {
    id: '2',
    title: 'Top 10 Study Tips for PMP Exam Success',
    excerpt:
      'Proven strategies from successful PMPs on how to structure your study plan and maximize retention.',
    date: 'Jan 10, 2025',
    readTime: '6 min read',
    category: 'Study Tips',
  },
  {
    id: '3',
    title: 'Agile vs Predictive: Which Methodology to Focus On?',
    excerpt:
      'With 50% of the new exam focused on Agile, here is what you need to know about Agile and Hybrid approaches.',
    date: 'Jan 5, 2025',
    readTime: '7 min read',
    category: 'Methodology',
  },
  {
    id: '4',
    title: 'How to Use Spaced Repetition for PMP Study',
    excerpt:
      'Learn how the science of spaced repetition can dramatically improve your memorization and retention of PM concepts.',
    date: 'Dec 28, 2024',
    readTime: '5 min read',
    category: 'Study Tips',
  },
  {
    id: '5',
    title: 'Understanding Earned Value Management (EVM)',
    excerpt:
      'Master EVM formulas and concepts that frequently appear on the PMP exam with our comprehensive guide.',
    date: 'Dec 20, 2024',
    readTime: '10 min read',
    category: 'Formulas',
  },
  {
    id: '6',
    title: 'Managing Exam Anxiety: A Candidate Guide',
    excerpt: 'Practical techniques to stay calm and perform your best on exam day.',
    date: 'Dec 15, 2024',
    readTime: '4 min read',
    category: 'Exam Day',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-md-surface">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Latest Articles</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Tips, guides, and insights to help you succeed on your PMP exam journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map(post => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-3 py-1 text-xs font-medium text-md-primary bg-md-primary-container dark:bg-md-primary-container rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{post.readTime}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{post.date}</span>
                  <span className="text-md-primary font-medium">Read more</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">
              More articles coming soon! Subscribe to our newsletter for updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
