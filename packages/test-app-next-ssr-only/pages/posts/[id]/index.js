import { app } from '@appjoint/server';
import { gql } from 'graphql-tag';
import Link from 'next/link';

let appJoint = app('Test-app-ssr-vxfdl');

export default function Home({ post }) {
  return (
    <div>
      <div>
        <Link href="/">
          <a>&lt; All posts</a>
        </Link>
      </div>
      <h1>{post.title}</h1>
      <div>
        {post.post.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div>
        <Link href={`/posts/${post.id}/edit`}>
          <a>Edit</a>
        </Link>
      </div>
    </div>
  );
}

let POST_QUERY = gql`
  query($id: Int!) {
    posts_by_pk(id: $id) {
      id
      post
      title
      created_at
    }
  }
`;

export async function getServerSideProps({ params, req }) {
  let { posts_by_pk } = await appJoint.query(POST_QUERY, { id: params.id });
  let user = await appJoint.getUserFromRequest(req);

  return {
    props: {
      post: posts_by_pk,
      user,
    },
  };
}
