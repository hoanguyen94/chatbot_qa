import { PromptTemplate } from "langchain/prompts";
import { loadSummarizationChain } from "langchain/chains";
import { Document } from "langchain/document";
import { OpenAI } from "langchain/llms/openai";
import BadRequestError from "../error/bad-request-error.js";

export default class Summarizer {
  constructor(private log: any, private model: OpenAI) {}

  private createChain(returnImmediateStep = false) {
    const combine_prompt = `
    Write a concise summary of the following text delimited by triple doublequotes.
    Return your response in bullet points which covers the key points of the text.
    """{text}"""
    BULLET POINT SUMMARY:
    `;
    const combined_prompt_template =
      PromptTemplate.fromTemplate(combine_prompt);

    return loadSummarizationChain(this.model, {
      type: "map_reduce",
      combineMapPrompt: combined_prompt_template,
      combinePrompt: combined_prompt_template,
      returnIntermediateSteps: returnImmediateStep,
    });
  }

  async summarize(
    docs: Document<Record<string, any>>[],
    returnImmediateStep = false
  ) {
    try {
      const chain = this.createChain(returnImmediateStep);
      const response = await chain.call({
        input_documents: docs,
      });
      return response;
    } catch (error) {
      this.log.error("Error when summarizing %s", (error as Error).message);
      throw new BadRequestError((error as Error).message);
    }
  }
}
