import { afterEach, beforeEach, describe } from "node:test";
import sinon from "sinon";
import log from "../../src/util/logger.js";
import assert from "assert";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import QABot from "../../src/chat/bot.js";
import { Redis } from "ioredis";
import { ChatOpenAI } from "langchain/chat_models";

describe("bot", () => {
  let logStub: sinon.SinonStubbedInstance<typeof log>;
  let pineconeStoreStub: sinon.SinonStubbedInstance<PineconeStore>;
  let bot: QABot;
  // let conversationalRetrievalQAChain: sinon.SinonStubbedInstance<
  //   typeof ConversationalRetrievalQAChain
  // >;
  // let chain: sinon.SinonStubbedInstance<ConversationalRetrievalQAChain>;
  // let redisClient: sinon.SinonStubbedInstance<Redis>
  // let chatMdel: sinon.SinonStubbedInstance<ChatOpenAI>

  const sandbox = sinon.createSandbox();

  // create fake conversational chain
  const conversationalRetrievalQAChain = sandbox.stub(ConversationalRetrievalQAChain);
  const chain = sinon.createStubInstance(ConversationalRetrievalQAChain);
  const redisClient = sinon.createStubInstance(Redis);
  const chatMdel = sinon.createStubInstance(ChatOpenAI)
  conversationalRetrievalQAChain.fromLLM.returns(chain);

  beforeEach(async () => {
    logStub = sandbox.stub(log);
    pineconeStoreStub = sandbox.createStubInstance(PineconeStore);

    bot = new QABot(logStub, pineconeStoreStub, redisClient, chatMdel, conversationalRetrievalQAChain);
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
