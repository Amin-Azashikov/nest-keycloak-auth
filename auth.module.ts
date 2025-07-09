import { Module, DynamicModule } from "@nestjs/common";
import * as KeycloakConnect from "keycloak-connect";
import { KEYCLOAK_CONNECT_TOKEN } from "./constants";
import { Reflector } from "@nestjs/core";
import { KeycloakGuard } from "./keycloak.guard";

@Module({
  providers: [
    {
      provide: KEYCLOAK_CONNECT_TOKEN,
      useFactory: () => {
        const keycloak = new KeycloakConnect({});

        return keycloak;
      },
    },
    Reflector,
    KeycloakGuard,
  ],
  exports: [
    {
      provide: KEYCLOAK_CONNECT_TOKEN,
      useExisting: KEYCLOAK_CONNECT_TOKEN,
    },
    Reflector,
    KeycloakGuard,
  ]
})
export class AuthModule {
}