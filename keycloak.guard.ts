import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import * as KeycloakConnect from 'keycloak-connect';

import { KEYCLOAK_CONNECT_TOKEN } from './constants';
import { Roles } from './decorators';

@Injectable()
export class KeycloakGuard implements CanActivate {
  constructor(
    @Inject(KEYCLOAK_CONNECT_TOKEN)
    private readonly keycloak: KeycloakConnect.Keycloak,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const keycloakMiddlewares = this.keycloak.middleware();

    const roles = this.reflector.getAllAndMerge(Roles, [context.getClass(), context.getHandler()]);

    for (const mw of keycloakMiddlewares) {
      const result = await new Promise((res) => {
        mw(http.getRequest(), http.getResponse(), (err: unknown) => {
          if (err) {
            res(false);
          } else {
            res(true);
          }
        })
      })

      if (!result) {
        return false;
      }
    }

    const protects = [this.keycloak.protect(), ...roles.map(r => this.keycloak.protect(r))];

    for (const protect of protects) {
      const result = await new Promise((res) => {
        protect(http.getRequest(), http.getResponse(), (err: unknown) => {
          if (err) {
            res(false);
          } else {
            res(true);
          }
        })
      })

      if (!result) {
        return false;
      }
    }

    return true;
  }
}
