import { app } from '@appjoint/server';
import { gql } from 'graphql-tag';
import Link from 'next/link';

let appJoint = app('Test-app-ssr-vxfdl');

export default function Home({ posts }) {
  return (
    <div>
      <h1>Welcome to the SSR blog!</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <Link href={`/posts/${post.id}`}>
              <a>{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

let POSTS_QUERY = gql`
  query {
    posts {
      id
      title
    }
  }
`;

export async function getServerSideProps({ req }) {
  let { posts } = await appJoint.query(POSTS_QUERY);
  let user = await appJoint.getUserFromRequest(req);

  return {
    props: {
      posts,
      user,
    },
  };
}
