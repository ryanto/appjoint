import { app } from '@appjoint/server';
import { gql } from 'graphql-tag';
import Link from 'next/link';
import { useRouter } from 'next/router';

let appJoint = app('Demo-app-hpdwq');

export default function Admin({ posts }) {
  let router = useRouter();

  let togglePublished = async post => {
    await fetch('/api/posts/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...{ id: post.id },
        published: !post.published,
      }),
    });

    await router.replace(router.asPath);
  };

  return (
    <div>
      <h1>A fake admin area</h1>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            {post.title}{' '}
            <button onClick={() => togglePublished(post)}>
              {post.published ? 'Unpublish' : 'Publish'}
            </button>
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
      published
    }
  }
`;

export async function getServerSideProps({ req }) {
  let user = await appJoint.getUserFromRequest(req);
  let { posts } = await appJoint.admin().query(POSTS_QUERY);

  return {
    props: {
      posts,
      user,
    },
  };
}
