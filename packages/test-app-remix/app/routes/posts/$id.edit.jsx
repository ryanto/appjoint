import { json, useLoaderData, Link, Form, redirect } from 'remix';
import { gql } from 'graphql-tag';
import { app } from '@appjoint/server';
import { Login } from '~/components/login';

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

export const loader = async ({ params, request }) => {
  let user = await appJoint.getUserFromRequest(request);
  let { posts_by_pk } = await appJoint.query(POST_QUERY, { id: params.id });

  return json({
    post: posts_by_pk,
    user,
  });
};

let UPDATE_POST = gql`
  mutation($id: Int!, $data: posts_set_input!) {
    update_posts_by_pk(pk_columns: { id: $id }, _set: $data) {
      id
      post
      title
    }
  }
`;

export async function action({ request }) {
  let user = await appJoint.getUserFromRequest(request);
  let body = await request.formData();

  let response = await appJoint.as(user).mutate(UPDATE_POST, {
    id: body.get('id'),
    data: {
      title: body.get('title'),
      post: body.get('post'),
    },
  });

  return redirect(`/posts/${response.update_posts_by_pk.id}`);
}

export default function EditPost() {
  let { post, user } = useLoaderData();

  return !user ? (
    <div>
      <h1>Login required</h1>
      <p>You must login to edit {post.title}.</p>
      <Login />
    </div>
  ) : (
    <div>
      <div>
        <Link to={`/posts/${post.id}`}>&lt; Back to {post.title}</Link>
      </div>

      <Form method="post">
        <input name="id" type="hidden" value={post.id} />
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
      </Form>
    </div>
  );
}
