import { app } from '@appjoint/server';
import { gql } from 'graphql-tag';
import Link from 'next/link';

export default function Home({ posts }) {
  return (
    <div>
      <h1>Posts on the edge!</h1>
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
  let appJoint = app('Demo-app-hpdwq', { fetch });
  let { posts } = await appJoint.query(POSTS_QUERY);
  let user = await appJoint.getUserFromRequest(req);

  return {
    props: {
      posts,
      user,
    },
  };
}

export const config = {
  runtime: 'experimental-edge',
};
