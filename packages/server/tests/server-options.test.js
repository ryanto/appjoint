const { Response } = require('cross-fetch');
const { gql } = require('graphql-request');
let nock = require('nock');
let { app } = require('../src/index');

beforeEach(() => {
  nock.disableNetConnect();
});

afterEach(() => {
  nock.enableNetConnect();
});

describe('server options', () => {
  it('should let me provide a different graphql uri', async () => {
    let appJoint = app('t', {
      graphqlEndpoint: 'https://my-custom-graphql-server.com/graphql',
    });

    let QUERY = gql`
      query {
        posts {
          id
        }
      }
    `;

    nock('https://my-custom-graphql-server.com')
      .post('/graphql', {
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
});
