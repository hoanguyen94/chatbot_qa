import { afterEach, beforeEach, describe } from "node:test";
import sinon, { SinonStubbedInstance } from "sinon";
import DocumentLoader from "../../src/chat/documentLoader.js";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { VectorOperationsApi } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/apis/VectorOperationsApi.js";
import log from "../../src/util/logger.js";
import assert from "assert";
import path from "path";
import { PineconeStore } from "langchain/vectorstores/pinecone";

describe("document-loader", () => {
  let embeddingStub: SinonStubbedInstance<OpenAIEmbeddings>;
  let pineconeIndexStub: SinonStubbedInstance<VectorOperationsApi>;
  let logStub: sinon.SinonStubbedInstance<typeof log>;
  let documentLoader: DocumentLoader;
  // let pineconeStoreStub: sinon.SinonStubbedInstance<typeof PineconeStore>;

  const sandbox = sinon.createSandbox();

  beforeEach(async () => {
    logStub = sandbox.stub(log);
    embeddingStub = sandbox.createStubInstance(OpenAIEmbeddings);
    pineconeIndexStub = sandbox.createStubInstance(VectorOperationsApi);

    documentLoader = new DocumentLoader(
      logStub,
      embeddingStub,
      pineconeIndexStub
    );
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("split data", () => {
    it("split data ok", async () => {
      const dirName = path.resolve();
      const docPath = path.join(
        dirName,
        "/test/test-data/Iterative-fine-tuning.pdf"
      );
      const result = await documentLoader.splitPDFData(docPath);
      assert.ok(result.length >= 1);
    });

    it("no file exist", async () => {
      const docPath = "/test/test-data/Iterative-fine-tuning.pdf";
      const expMessage = `ENOENT: no such file or directory, open '${docPath}'`;

      await assert.rejects(documentLoader.splitPDFData(docPath), {
        message: expMessage,
      });
    });
  });

  describe("upload-document", () => {
    const pineconeStoreStub = sinon.stub(PineconeStore);
    it("upload document ok", async () => {
      const dirName = path.resolve();
      const docPath = path.join(
        dirName,
        "/test/test-data/Iterative-fine-tuning.pdf"
      );
      const docs = await documentLoader.splitPDFData(docPath);

      const pineconeStoreInstance = sinon.createStubInstance(PineconeStore);
      // const pineconeStoreStub = sinon.stub(PineconeStore);
      pineconeStoreStub.fromDocuments.resolves(pineconeStoreInstance);

      const result = await documentLoader.uploadDoc(docs, pineconeStoreStub);
      assert.deepEqual(result, pineconeStoreInstance);
    });

    it("connection failed", async () => {
      const dirName = path.resolve();
      const docPath = path.join(
        dirName,
        "/test/test-data/Iterative-fine-tuning.pdf"
      );
      const docs = await documentLoader.splitPDFData(docPath);
      const expMessage = "error when uploading docs to vector database";
      pineconeStoreStub.fromDocuments.rejects(new Error(expMessage));
      await assert.rejects(documentLoader.uploadDoc(docs, pineconeStoreStub), {
        message: expMessage,
      });
    });
  });
});
