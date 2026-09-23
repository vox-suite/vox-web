import type { Pool, PoolClient } from "pg";
import type { VoxCoreHostClient } from "./core-host-client";

type ConsumerAccountRow = {
  id: string;
  account_state: string;
  core_user_context_id: string | null;
};

async function rollback(client: PoolClient) {
  try {
    await client.query("ROLLBACK");
  } catch {}
}

export class ConsumerAccountAuthority {
  constructor(
    private readonly pool: Pool,
    private readonly core: VoxCoreHostClient,
  ) {}

  async initialize(accountId: string) {
    return this.core.authenticateAccount(accountId);
  }

  async establish(accountId: string) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query<ConsumerAccountRow>(
        `SELECT id,
                "accountState" AS account_state,
                "coreUserContextId" AS core_user_context_id
           FROM vox_web_auth."user"
          WHERE id = $1
          FOR UPDATE`,
        [accountId],
      );
      const account = result.rows[0];
      if (!account || account.account_state !== "active") {
        throw new Error("Consumer account is unavailable");
      }

      const authentication = await this.core.authenticateAccount(
        account.id,
        account.core_user_context_id ?? undefined,
      );
      if (!account.core_user_context_id) {
        await client.query(
          `UPDATE vox_web_auth."user"
              SET "coreUserContextId" = $2, "updatedAt" = NOW()
            WHERE id = $1 AND "coreUserContextId" IS NULL`,
          [account.id, authentication.userContextId],
        );
      }
      await client.query("COMMIT");
      return authentication;
    } catch (error) {
      await rollback(client);
      throw error;
    } finally {
      client.release();
    }
  }

  async canUseEmailSignIn(email: string) {
    const result = await this.pool.query<{
      account_state: string;
      recovery_enabled_at: Date | null;
      has_google: boolean;
    }>(
      `SELECT u."accountState" AS account_state,
              u."recoveryEnabledAt" AS recovery_enabled_at,
              EXISTS (
                SELECT 1 FROM vox_web_auth.account a
                 WHERE a."userId" = u.id AND a."providerId" = 'google'
              ) AS has_google
         FROM vox_web_auth."user" u
        WHERE lower(u.email) = lower($1)`,
      [email.trim()],
    );
    const account = result.rows[0];
    if (!account) return true;
    if (account.account_state !== "active") return false;
    return !account.has_google || account.recovery_enabled_at !== null;
  }

  async enableRecovery(accountId: string, verifiedEmail: string) {
    const result = await this.pool.query(
      `UPDATE vox_web_auth."user"
          SET "recoveryEnabledAt" = NOW(), "updatedAt" = NOW()
        WHERE id = $1
          AND "accountState" = 'active'
          AND lower(email) = lower($2)`,
      [accountId, verifiedEmail.trim()],
    );
    if (result.rowCount !== 1) {
      throw new Error("Recovery method could not be enabled");
    }
  }
}
