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

describe('customize fetch', () => {
  it('should let me customize fetch for api requests', async () => {
    let fetch = jest.fn(
      () =>
        new Response(JSON.stringify({ uid: '123', signature: 'signature' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
    );

    let appJoint = app('t', { fetch });
    let user = await appJoint.getUserFromToken('asdf');

    expect(fetch).toHaveBeenCalled();
    expect(user.uid).toBe('123');
  });

  it('should let me customize fetch for graphql requests', async () => {
    let fakeUsers = [{ id: '123', email: 'bob@example.com' }];

    let fetch = jest.fn(
      () =>
        new Response(JSON.stringify({ data: { users: fakeUsers } }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        })
    );

    let appJoint = app('t', { fetch });
    let query = gql`
      query Users {
        users {
          id
          email
        }
      }
    `;
    let { users } = await appJoint.query(query);

    expect(fetch).toHaveBeenCalled();
    expect(users).toHaveLength(1);
    expect(users[0].email).toBe('bob@example.com');
  });
});
