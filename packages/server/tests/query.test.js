const { gql } = require('graphql-request');
const gqlTag = require('graphql-tag');
let nock = require('nock');
const { Request } = require('cross-fetch');
let { app } = require('../src/index');
const { print } = require('graphql');

let appJoint;
beforeEach(() => {
  appJoint = app('t');
});

describe('query', () => {
  it('should run a query', async () => {
    nock('https://appjoint.vercel.app')
      .get('/api/tenants/t/info')
      .reply(200, {
        tenantId: 't',
        graphql: {
          uri: 'https://t.appjoint.graphql/v1/graphql',
        },
      });

    let QUERY = gql`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://t.appjoint.graphql')
      .post('/v1/graphql', {
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

  it('should query as a user', async () => {
    nock('https://appjoint.vercel.app')
      .post('/api/tenants/t/verify-signature', { signature: 'xxx' })
      .reply(200, {
        uid: '123',
      });

    nock('https://appjoint.vercel.app')
      .get('/api/tenants/t/info')
      .reply(200, {
        tenantId: 't',
        graphql: {
          uri: 'https://t.appjoint.graphql/v1/graphql',
        },
      });

    let QUERY = gql`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://t.appjoint.graphql')
      .matchHeader('authorization', 'Signature xxx')
      .post('/v1/graphql', {
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
    nock('https://appjoint.vercel.app')
      .get('/api/tenants/t/info')
      .reply(200, {
        tenantId: 't',
        graphql: {
          uri: 'https://t.appjoint.graphql/v1/graphql',
        },
      });

    let QUERY = gql`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://t.appjoint.graphql')
      .matchHeader('x-hasura-admin-secret', 'ADMIN_SECRET')
      .post('/v1/graphql', {
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
    nock('https://appjoint.vercel.app')
      .get('/api/tenants/t/info')
      .reply(200, {
        tenantId: 't',
        graphql: {
          uri: 'https://t.appjoint.graphql/v1/graphql',
        },
      });

    let QUERY = gqlTag`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://t.appjoint.graphql')
      .post('/v1/graphql', {
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

afterAll(() => {
  nock.restore();
});
