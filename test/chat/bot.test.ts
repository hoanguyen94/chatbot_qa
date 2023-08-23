import { afterEach, beforeEach, describe } from "node:test";
import sinon from "sinon";
import log from "../../src/util/logger.js";
import assert from "assert";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import Bot from "../../src/chat/bot.js";
import { ConversationalRetrievalQAChain } from "langchain/chains";

describe("bot", () => {
  let logStub: sinon.SinonStubbedInstance<typeof log>;
  let pineconeStoreStub: sinon.SinonStubbedInstance<PineconeStore>;
  let bot: Bot;
  let conversationalRetrievalQAChain: sinon.SinonStubbedInstance<
    typeof ConversationalRetrievalQAChain
  >;
  let chain: sinon.SinonStubbedInstance<ConversationalRetrievalQAChain>;

  const sandbox = sinon.createSandbox();

  // create fake conversational chain
  conversationalRetrievalQAChain = sandbox.stub(ConversationalRetrievalQAChain);
  chain = sinon.createStubInstance(ConversationalRetrievalQAChain);
  conversationalRetrievalQAChain.fromLLM.returns(chain);

  beforeEach(async () => {
    logStub = sandbox.stub(log);
    pineconeStoreStub = sandbox.createStubInstance(PineconeStore);

    bot = new Bot(logStub, pineconeStoreStub, conversationalRetrievalQAChain);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("chat", () => {
    it("chat ok", async () => {
      const expResult = { text: "Hello" };
      chain.call.resolves(expResult);
      const result = await bot.chat("Hi");
      assert.deepEqual(result, expResult);
    });

    it("char not okay", async () => {
      const expMsg = { message: "Broken chain" };
      chain.call.rejects(new Error(expMsg.message));
      await assert.rejects(bot.chat("Hi"), expMsg);
    });
  });
});
