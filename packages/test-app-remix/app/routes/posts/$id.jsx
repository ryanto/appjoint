import { json, useLoaderData, Link } from 'remix';
import { gql } from 'graphql-tag';
import { app } from '@appjoint/server';

let appJoint = app('Test-app-ssr-vxfdl');

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

export async function loader({ params }) {
  let { posts_by_pk } = await appJoint.query(POST_QUERY, { id: params.id });

  return json({ post: posts_by_pk });
}

export default function Post() {
  const { post } = useLoaderData();

  return (
    <div>
      <div>
        <Link to="/">&lt; All posts</Link>
      </div>
      <h1>{post.title}</h1>
      <div>
        {post.post.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
      <div>
        <Link to={`/posts/${post.id}/edit`}>Edit</Link>
      </div>
    </div>
  );
}
