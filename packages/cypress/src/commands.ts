/// <reference types="cypress" />

import { TestUserAccount, TestCurrentUserAccount } from '@appjoint/react';

type LoginAsUser = { uid?: string; email: string; role?: string };
type AddUser = { uid?: string; email: string; password: string; role?: string };

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Login as a user
       * @example cy.loginAs({ email: 'ryanto@gmail.com', role: 'admin' })
       */
      loginAs(value: LoginAsUser | null): Chainable<Element>;

      /**
       * Add a user so you can test your login form
       * @example cy.addUser({ email: 'ryanto@gmail.com', password: 'hello' })
       */
      addUser(value: AddUser): Chainable<Element>;

      /**
       * Reset test users created during test
       * @example cy.resetAppjointUsers()
       */
      resetAppJointUsers(): Chainable<Element>;
    }
  }
}

export const setupAppJoint = () => {
  let loginAsUser: TestCurrentUserAccount | null;
  let users: TestUserAccount[] = [];
  let id = 0;

  let makeUid = () => {
    id = id + 1;
    return `uid.test.${id}`;
  };

  beforeEach(() => {
    cy.resetAppJointUsers();
  });

  Cypress.Commands.add('loginAs', user => {
    if (user) {
      loginAsUser = {
        uid: user.uid ?? makeUid(),
        ...user,
      };
    } else {
      loginAsUser = null;
    }
  });

  Cypress.on('window:before:load', (win: any) => {
    win.APPJOINT_USER_ACCOUNTS = [...users];
    win.APPJOINT_GET_CURRENT_USER = () => {
      return loginAsUser;
    };
  });

  Cypress.Commands.add('addUser', user => {
    let toAdd = {
      uid: user.uid ?? makeUid(),
      ...user,
    };
    users = [...users, toAdd];
  });

  Cypress.Commands.add('resetAppJointUsers', () => {
    cy.loginAs(null);
    users = [];
  });
};
