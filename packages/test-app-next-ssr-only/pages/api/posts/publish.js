import { app } from '@appjoint/server';
import { gql } from 'graphql-tag';

let appJoint = app('Demo-app-hpdwq');

let PUBLISH_POST = gql`
  mutation($id: Int!, $data: posts_set_input!) {
    update_posts_by_pk(pk_columns: { id: $id }, _set: $data) {
      id
      post
      title
    }
  }
`;

export default async function handler(req, res) {
  let { update_posts_by_pk: post } = await appJoint
    .admin()
    .mutate(PUBLISH_POST, {
      id: req.body.id,
      data: {
        published: req.body.published,
      },
    });

  res.status(200).json({ post });
}
