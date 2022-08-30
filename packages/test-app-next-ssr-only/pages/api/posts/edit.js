import { app } from '@appjoint/server';
import { gql } from 'graphql-tag';

let appJoint = app('Demo-app-hpdwq');

let UPDATE_POST = gql`
  mutation($id: Int!, $data: posts_set_input!) {
    update_posts_by_pk(pk_columns: { id: $id }, _set: $data) {
      id
      post
      title
    }
  }
`;

export default async function handler(req, res) {
  let user = await appJoint.getUserFromRequest(req);

  let { update_posts_by_pk: post } = await appJoint
    .as(user)
    .mutate(UPDATE_POST, {
      id: req.body.id,
      data: {
        title: req.body.title,
        post: req.body.post,
      },
    });

  res.status(200).json({ post });
}
