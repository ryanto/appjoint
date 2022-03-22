import { app } from '@appjoint/server';
import { gql } from 'graphql-tag';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Login } from '../../../components/login';

let appJoint = app('Test-app-ssr-vxfdl');

export default function Edit({ post, user }) {
  let router = useRouter();

  let handleSubmit = async event => {
    event.preventDefault();
    let formData = new FormData(event.target);

    let response = await fetch('/api/edit-post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...{ id: post.id },
        ...Object.fromEntries(formData),
      }),
    });

    let result = await response.json();

    await router.push(`/posts/${result.post.id}`);
  };

  return !user ? (
    <div>
      <h1>Login required</h1>
      <p>You must login to edit {post.title}.</p>
      <Login />
    </div>
  ) : (
    <div>
      <div>
        <Link href={`/posts/${post.id}`}>
          <a>&lt; Back to {post.title}</a>
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <div>
            <label htmlFor="title">Title</label>
          </div>
          <input name="title" defaultValue={post.title} />
        </div>

        <div>
          <div>
            <label htmlFor="post">Post</label>
          </div>
          <textarea name="post" defaultValue={post.post} rows="45" cols="65" />
        </div>

        <div>
          <button type="submit">Save</button>
        </div>
      </form>
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

export async function getServerSideProps({ req, params }) {
  let { posts_by_pk } = await appJoint.query(POST_QUERY, { id: params.id });
  let user = await appJoint.getUserFromRequest(req);

  return {
    props: {
      post: posts_by_pk,
      user,
    },
  };
}
