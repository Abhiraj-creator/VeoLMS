export interface SeedLesson {
  title: string
  content: string
  videoUrl: string
  cloudinaryPublicId: string
  duration: number
  order: number
  isPreview: boolean
}

export interface SeedSection {
  title: string
  order: number
  lessons: SeedLesson[]
}

export interface SeedCourse {
  title: string
  slug: string
  category: 'Frontend' | 'Backend' | 'Fullstack' | 'Other'
  shortDescription: string
  description: string
  thumbnailUrl: string
  price: number
  tags: string[]
  sections: SeedSection[]
}

const thumbnail = 'https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg'
const video = 'https://www.youtube.com/watch?v=1dWQssiqKvQ'

function lesson(title: string, order: number, isPreview = false): SeedLesson {
  return {
    title,
    content: `This lesson covers ${title.toLowerCase()} with practical examples and guided notes.`,
    videoUrl: video,
    cloudinaryPublicId: `seed/${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    duration: 600 + order * 75,
    order,
    isPreview,
  }
}

export const coursesData: SeedCourse[] = [
  {
    title: 'HTML Fundamentals',
    slug: 'html-fundamentals',
    category: 'Frontend',
    shortDescription: 'Build strong foundations in semantic HTML.',
    description: '<p>Learn the structure of the web with semantic HTML, forms, media, and accessible markup.</p>',
    thumbnailUrl: thumbnail,
    price: 499,
    tags: ['html', 'frontend', 'web'],
    sections: [
      { title: 'Getting Started', order: 1, lessons: [lesson('HTML document structure', 1, true), lesson('Text and headings', 2)] },
      { title: 'Semantic HTML', order: 2, lessons: [lesson('Semantic layout tags', 3), lesson('Links and navigation', 4)] },
      { title: 'Forms and Media', order: 3, lessons: [lesson('HTML forms', 5), lesson('Images audio and video', 6)] },
    ],
  },
  {
    title: 'CSS Mastery',
    slug: 'css-mastery',
    category: 'Frontend',
    shortDescription: 'Style responsive layouts with confidence.',
    description: '<p>Master selectors, cascade, flexbox, grid, responsive design, and modern CSS workflows.</p>',
    thumbnailUrl: thumbnail,
    price: 699,
    tags: ['css', 'frontend', 'layout'],
    sections: [
      { title: 'CSS Basics', order: 1, lessons: [lesson('Selectors and cascade', 1, true), lesson('Box model essentials', 2)] },
      { title: 'Layouts', order: 2, lessons: [lesson('Flexbox foundations', 3), lesson('CSS grid foundations', 4)] },
      { title: 'Responsive Design', order: 3, lessons: [lesson('Media queries', 5), lesson('Responsive project polish', 6)] },
    ],
  },
  {
    title: 'JavaScript Essentials',
    slug: 'javascript-essentials',
    category: 'Frontend',
    shortDescription: 'Learn the language of interactive web apps.',
    description: '<p>Understand variables, functions, objects, async code, DOM interactions, and modern JavaScript patterns.</p>',
    thumbnailUrl: thumbnail,
    price: 899,
    tags: ['javascript', 'frontend', 'programming'],
    sections: [
      { title: 'Language Basics', order: 1, lessons: [lesson('Variables and types', 1, true), lesson('Functions and scope', 2)] },
      { title: 'Working with Data', order: 2, lessons: [lesson('Arrays and objects', 3), lesson('Array methods', 4)] },
      { title: 'Browser JavaScript', order: 3, lessons: [lesson('DOM events', 5), lesson('Async JavaScript', 6)] },
    ],
  },
  {
    title: 'React Complete Guide',
    slug: 'react-complete-guide',
    category: 'Frontend',
    shortDescription: 'Create component-driven apps with React.',
    description: '<p>Build React applications with components, props, state, effects, routing, and clean data flow.</p>',
    thumbnailUrl: thumbnail,
    price: 1299,
    tags: ['react', 'frontend', 'components'],
    sections: [
      { title: 'React Core', order: 1, lessons: [lesson('Components and JSX', 1, true), lesson('Props and state', 2)] },
      { title: 'Hooks', order: 2, lessons: [lesson('useState and useEffect', 3), lesson('Custom hooks', 4)] },
      { title: 'App Patterns', order: 3, lessons: [lesson('React routing', 5), lesson('React project structure', 6)] },
    ],
  },
  {
    title: 'Redux Toolkit',
    slug: 'redux-toolkit',
    category: 'Frontend',
    shortDescription: 'Manage app state with Redux Toolkit.',
    description: '<p>Learn slices, async thunks, RTK Query basics, and practical state management for React apps.</p>',
    thumbnailUrl: thumbnail,
    price: 999,
    tags: ['redux', 'react', 'state-management'],
    sections: [
      { title: 'Redux Foundations', order: 1, lessons: [lesson('Store and slices', 1, true), lesson('Reducers and actions', 2)] },
      { title: 'Async State', order: 2, lessons: [lesson('createAsyncThunk', 3), lesson('Loading and error states', 4)] },
      { title: 'RTK Query', order: 3, lessons: [lesson('API slices', 5), lesson('Cache invalidation', 6)] },
    ],
  },
]
