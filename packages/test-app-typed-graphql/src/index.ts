import { app } from '@appjoint/server';
import { graphql } from './gql/gql';

let appJoint = app('Demo-app-hpdwq');

let POSTS_QUERY = graphql(`
  query AllPosts {
    posts {
      id
      title
    }
  }
`);

async function main() {
  let { posts } = await appJoint.query(POSTS_QUERY);
  console.log({ posts });
}

main();
