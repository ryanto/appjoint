import { json, useLoaderData, Link } from 'remix';
import { gql } from 'graphql-tag';
import { app } from '@appjoint/server';

let appJoint = app('Test-app-ssr-vxfdl');

let POSTS_QUERY = gql`
  query {
    posts {
      id
      title
    }
  }
`;

export const loader = async () => {
  let { posts } = await appJoint.query(POSTS_QUERY);

  return json({ posts });
};

export default function Index() {
  const { posts } = useLoaderData();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Welcome to the SSR blog!</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link to={`/posts/${post.id}`}>{post.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
