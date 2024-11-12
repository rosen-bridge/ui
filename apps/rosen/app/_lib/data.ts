// types
type POST = {
  id: string;
  title: string;
  desc: string;
};

// store
// post with default content
let posts: POST[] = [
  {
    id: '1713893708281',
    title: 'Default Post',
    desc: 'Default content',
  },
];

//handlers
export const getPosts = () => posts;

export const addPosts = (post: POST) => {
  posts.push(post);
};

export const deletePosts = (id: string) => {
  posts = posts.filter((post) => post.id !== id);
};

export const updatePosts = (id: string, title: string, desc: string) => {
  const post = posts.find((post) => post.id === id);
  if (post) {
    post.title = title;
    post.desc = desc;
  } else {
    throw new Error('NO POST FOUND');
  }
};

export const updatePostsByPatch = (
  id: string,
  updatedFields: Partial<POST>,
) => {
  const postIndex = posts.findIndex((post) => post.id === id);
  if (postIndex !== -1) {
    posts[postIndex] = { ...posts[postIndex], ...updatedFields };
  } else {
    throw new Error('NO POST FOUND');
  }
};

export const getById = (id: string) => {
  return posts.find((post) => post.id === id);
};
