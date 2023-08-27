import { OpenAI } from "langchain";
import { SqlDatabaseChain } from "langchain/chains/sql_db";
import { SqlDatabase } from "langchain/sql_db";
import BadRequestError from "../error/bad-request-error.js";
import { SqlToolkit, createSqlAgent } from "langchain/agents/toolkits/sql";

export class SQLAgent {
  private chain
  private executor
  constructor(private readonly log: any, private readonly sqlDatabase: SqlDatabase, private readonly model: OpenAI) {
    this.chain = new SqlDatabaseChain({
      llm: this.model,
      database: sqlDatabase,
    })

    const toolkit = new SqlToolkit(this.sqlDatabase, this.model);
    this.executor = createSqlAgent(this.model, toolkit)
  }

  async chat(input: string) {
    try {
      // return await this.chain.run(input)
      return await this.executor.call({ input })
    } catch (error) {
      this.log.error(
        "Error when having a conversation %s",
        (error as Error).message
      );
      throw new BadRequestError((error as Error).message)
    }
  }
}