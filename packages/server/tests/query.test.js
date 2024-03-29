const { gql } = require('graphql-request');
const gqlTag = require('graphql-tag');
let nock = require('nock');
const { Request } = require('cross-fetch');
let { app } = require('../src/index');
const { print } = require('graphql');

let appJoint;
beforeEach(() => {
  nock.disableNetConnect();
  appJoint = app('t');
});

afterEach(() => {
  nock.enableNetConnect();
});

describe('query', () => {
  it('should run a query', async () => {
    let QUERY = gql`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://appjoint.app')
      .post('/t/v1/graphql', {
        query: QUERY,
      })
      .reply(200, {
        data: {
          posts: [{ id: 1 }, { id: 2 }],
        },
      });

    let response = await appJoint.query(QUERY);

    expect(response.posts).toHaveLength(2);
    expect(response.posts.map(post => post.id)).toEqual([1, 2]);
  });

  it('should be able to customize headers', async () => {
    let QUERY = gql`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://appjoint.app')
      .matchHeader('x-custom', 'yes')
      .post('/t/v1/graphql', {
        query: QUERY,
        variables: {},
      })
      .reply(200, {
        data: {
          posts: [{ id: 1 }, { id: 2 }],
        },
      });

    let response = await appJoint.query(
      QUERY,
      {},
      {
        'x-custom': 'yes',
      }
    );

    expect(response.posts).toHaveLength(2);
    expect(response.posts.map(post => post.id)).toEqual([1, 2]);
  });

  it('should query as a user', async () => {
    nock('https://appjoint.app')
      .post('/api/apps/t/verify-signature', { signature: 'xxx' })
      .reply(200, {
        uid: '123',
      });

    let QUERY = gql`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://appjoint.app')
      .matchHeader('authorization', 'Signature xxx')
      .post('/t/v1/graphql', {
        query: QUERY,
      })
      .reply(200, {
        data: {
          posts: [{ id: 1 }, { id: 2 }],
        },
      });

    let headers = new Headers({
      cookie: appJoint.sessionCookie({ __signature: 'xxx' }),
    });

    let request = new Request('', { headers });

    let user = await appJoint.getUserFromRequest(request);
    let response = await appJoint.as(user).query(QUERY);

    expect(response.posts).toHaveLength(2);
    expect(response.posts.map(post => post.id)).toEqual([1, 2]);
  });

  it('should query as an admin', async () => {
    let QUERY = gql`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://appjoint.app')
      .matchHeader('x-hasura-admin-secret', 'ADMIN_SECRET')
      .post('/t/v1/graphql', {
        query: QUERY,
      })
      .reply(200, {
        data: {
          posts: [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
      });

    let response = await appJoint.admin('ADMIN_SECRET').query(QUERY);

    expect(response.posts).toHaveLength(3);
    expect(response.posts.map(post => post.id)).toEqual([1, 2, 3]);
  });

  it('should be able to use graphql-tag', async () => {
    let QUERY = gqlTag`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://appjoint.app')
      .post('/t/v1/graphql', {
        query: print(QUERY),
      })
      .reply(200, {
        data: {
          posts: [{ id: 1 }, { id: 2 }],
        },
      });

    let response = await appJoint.query(QUERY);

    expect(response.posts).toHaveLength(2);
    expect(response.posts.map(post => post.id)).toEqual([1, 2]);
  });
});
